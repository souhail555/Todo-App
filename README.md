# Todo App — الدليل الكامل للتشغيل والنشر

## بنية المشروع

```
Todo-App/
├── index.html          ← الواجهة (منشورة على GitHub Pages)
├── style.css
├── script.js
└── server/             ← الخادم (Node.js + Stripe)
    ├── server.js       ← الكود الرئيسي
    ├── package.json
    ├── .env.example    ← انسخه إلى .env واملأ القيم
    └── db.json         ← قاعدة البيانات (تُنشأ تلقائياً)
```

---

## 1️⃣ إعداد Stripe (من لوحة التحكم)

1. **Products** → أنشئ منتجين:
   - `Pro Monthly` → سعر 3 USD → Recurring → Monthly
   - `Pro Yearly` → سعر 25 USD → Recurring → Yearly
   - انسخ **Price ID** لكل واحد (يبدأ بـ `price_...`)

2. **Developers → API keys** → انسخ **Secret key** (يبدأ بـ `sk_test_...`)

3. **Developers → Webhooks** → Add endpoint:
   - URL محلي (للاختبار): استخدم Stripe CLI — انظر الأسفل
   - الأحداث المطلوبة: `checkout.session.completed` و `customer.subscription.deleted`

---

## 2️⃣ التشغيل المحلي

```powershell
cd server
npm install
copy .env.example .env
# عدّل ملف .env واملأ القيم الحقيقية
npm start
```

الخادم يعمل على: `http://localhost:3000`

### اختبار الـ Webhook محلياً (Stripe CLI)

```powershell
# نزّل Stripe CLI من https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/webhook
# سيعطيك whsec_... — ضعه في .env كـ STRIPE_WEBHOOK_SECRET
```

---

## 3️⃣ النشر على Railway (مجاني)

1. أنشئ حساب في [railway.app](https://railway.app) بحساب GitHub
2. **New Project** → **Deploy from GitHub repo** → اختر `Todo-App`
3. في إعدادات الخدمة:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
4. **Variables** → أضف كل متغيرات `.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PRICE_MONTHLY`
   - `PRICE_YEARLY`
   - `JWT_SECRET` (نص عشوائي طويل)
   - `APP_URL` = `https://souhail555.github.io/Todo-App`
5. بعد النشر خذ رابط الخادم (مثل `https://xxx.up.railway.app`)
6. حدّث `API_URL` في `script.js` بهذا الرابط
7. في Stripe Webhooks: أضف endpoint حقيقي `https://xxx.up.railway.app/webhook`

---

## 4️⃣ كيف يعمل النظام؟

1. الزائر يسجّل حساب (Sign up) → يحصل على 14 يوم تجربة
2. يضغط Upgrade → يختار الخطة → يُحوَّل لصفحة **Stripe Checkout** الآمنة
3. يدفع → Stripe يرسل **Webhook** للخادم → الاشتراك يُفعَّل في قاعدة البيانات
4. يعود لموقعك → الواجهة تسأل الخادم → تظهر حالة Pro
5. إذا ألغى الاشتراك → Webhook آخر → الخادم يوقف Pro تلقائياً

---

## 5️⃣ بطاقة اختبار Stripe

```
الرقم:  4242 4242 4242 4242
التاريخ: أي تاريخ مستقبلي (مثلاً 12/28)
CVC:    أي 3 أرقام (مثلاً 123)
```

---

## ⚠️ ملاحظات أمنية

- **لا ترفع ملف `.env` على GitHub أبداً** — موجود في `.gitignore`
- **Secret key للخادم فقط** — لا تضعه في `script.js` أبداً
- `db.json` قاعدة بسيطة للبداية — عند النمو انتقل إلى PostgreSQL
