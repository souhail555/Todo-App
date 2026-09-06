/**
 * Todo App Backend — Auth + Stripe Subscriptions
 * ------------------------------------------------
 * Endpoints:
 *   POST /api/signup            { email, password }          -> { token }
 *   POST /api/login             { email, password }          -> { token }
 *   GET  /api/me                (Bearer token)               -> { email, isPro, plan, trialEndsAt }
 *   POST /api/create-checkout   (Bearer token) { plan }      -> { url }  (Stripe Checkout redirect)
 *   POST /webhook               (Stripe events, raw body)    -> activates/cancels subscriptions
 *
 * Data is stored in db.json (simple JSON file). Swap with a real DB later if needed.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const TRIAL_DAYS = 14;

const PRICE_IDS = {
  monthly: process.env.PRICE_MONTHLY,
  yearly: process.env.PRICE_YEARLY
};

// ---------------- Tiny JSON "database" ----------------
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users: [] };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function findUserByEmail(db, email) {
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// ---------------- Middleware ----------------
// IMPORTANT: Stripe webhook needs the RAW body, so mount it BEFORE express.json()
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const db = loadDB();

    // Subscription activated (checkout completed)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_email || session.metadata.email;
      const plan = session.metadata.plan || 'monthly';
      const user = findUserByEmail(db, email);
      if (user) {
        user.isPro = true;
        user.plan = plan;
        user.stripeCustomerId = session.customer;
        user.stripeSubscriptionId = session.subscription;
        saveDB(db);
        console.log(`✅ Subscription activated: ${email} (${plan})`);
      }
    }

    // Subscription cancelled / payment failed -> downgrade
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const user = db.users.find(u => u.stripeSubscriptionId === sub.id);
      if (user) {
        user.isPro = false;
        user.plan = null;
        user.stripeSubscriptionId = null;
        saveDB(db);
        console.log(`❌ Subscription cancelled: ${user.email}`);
      }
    }

    res.json({ received: true });
  }
);

app.use(cors());
app.use(express.json());

// ---------------- Auth helpers ----------------
function signToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = loadDB();
    const user = findUserByEmail(db, payload.email);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function publicUser(user) {
  return {
    email: user.email,
    isPro: !!user.isPro,
    plan: user.plan || null,
    trialEndsAt: user.trialEndsAt
  };
}

// ---------------- Routes ----------------

// Sign up
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (min 6 chars) required' });
  }

  const db = loadDB();
  if (findUserByEmail(db, email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    email,
    passwordHash,
    isPro: false,
    plan: null,
    createdAt: Date.now(),
    trialEndsAt: Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
    stripeCustomerId: null,
    stripeSubscriptionId: null
  };

  db.users.push(user);
  saveDB(db);

  res.json({ token: signToken(user), user: publicUser(user) });
});

// Log in
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const db = loadDB();
  const user = findUserByEmail(db, email || '');

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

// Current user status
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Create Stripe Checkout session
app.post('/api/create-checkout', authMiddleware, async (req, res) => {
  const plan = req.body && req.body.plan;
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan. Use "monthly" or "yearly".' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { email: req.user.email, plan },
      success_url: `${APP_URL}/?payment=success`,
      cancel_url: `${APP_URL}/?payment=cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 Todo App backend running on port ${PORT}`);
  console.log(`   App URL (redirects): ${APP_URL}`);
});
