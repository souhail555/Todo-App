// State Management & Local Storage Keys
const STORAGE_KEY = 'todo_app_tasks';
const THEME_KEY = 'todo_app_theme';
const LANG_KEY = 'todo_app_lang';
const LICENSE_KEY = 'todo_app_license';

const TRIAL_DAYS = 14;

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';
let currentLang = 'en';
let license = JSON.parse(localStorage.getItem(LICENSE_KEY)) || null;

// ==================== TRANSLATIONS ====================
const translations = {
  en: {
    pageTitle: 'Task Manager',
    appTitle: 'Task Manager',
    inputPlaceholder: 'Add a new task...',
    addBtn: 'Add',
    filterAll: 'All',
    filterActive: 'Active',
    filterCompleted: 'Completed',
    clearCompleted: 'Clear Completed',
    clearAll: 'Clear All',
    emptyNoTasks: 'No tasks yet. Enjoy your day!',
    emptyNoActive: 'No active tasks left!',
    emptyNoCompleted: 'No completed tasks yet!',
    tasksLeft: (n) => `${n} ${n === 1 ? 'task' : 'tasks'} left`,
    totalCount: (n) => `(${n} total)`,
    progressLabel: (p) => `${p}% completed`,
    confirmClearAll: 'Are you sure you want to delete all tasks?',
    editTask: 'Edit task',
    deleteTask: 'Delete task',
    toggleStatus: 'Toggle task status',
    toggleThemeDark: 'Switch to Dark Mode',
    toggleThemeLight: 'Switch to Light Mode',
    langLabel: 'العربية',
    locale: 'en-US',
    upgradeBtn: 'Upgrade',
    trialDaysLeft: (n) => n === 1 ? 'Trial: 1 day left' : `Trial: ${n} days left`,
    trialLastDay: 'Trial ends today!',
    trialExpired: 'Your free trial has expired',
    proBadge: (plan) => plan === 'yearly' ? 'Pro · Yearly' : 'Pro · Monthly',
    upgradeTitle: 'Upgrade to Pro',
    upgradeSubtitle: 'Unlock unlimited tasks forever',
    planMonthly: 'Monthly',
    planYearly: 'Yearly',
    perMonth: '/month',
    perYear: '/year',
    bestValue: 'Best Value',
    payNow: 'Pay Now',
    demoNote: 'Demo only — no real payment is processed',
    paymentSuccess: 'Welcome to Pro!',
    proActive: 'Your subscription is now active.',
    summaryMonthly: 'Pro Monthly — $3/month',
    summaryYearly: 'Pro Yearly — $25/year',
    cardInvalid: 'Please fill in all card fields'
  },
  ar: {
    pageTitle: 'مدير المهام',
    appTitle: 'مدير المهام',
    inputPlaceholder: 'أضف مهمة جديدة...',
    addBtn: 'إضافة',
    filterAll: 'الكل',
    filterActive: 'النشطة',
    filterCompleted: 'المكتملة',
    clearCompleted: 'مسح المكتملة',
    clearAll: 'مسح الكل',
    emptyNoTasks: 'لا توجد مهام بعد. استمتع بيومك!',
    emptyNoActive: 'لا توجد مهام نشطة متبقية!',
    emptyNoCompleted: 'لا توجد مهام مكتملة بعد!',
    tasksLeft: (n) => n === 1 ? 'مهمة واحدة متبقية' : n === 2 ? 'مهمتان متبقيتان' : `${n} مهام متبقية`,
    totalCount: (n) => `(${n} إجمالي)`,
    progressLabel: (p) => `${p}٪ مكتمل`,
    confirmClearAll: 'هل أنت متأكد أنك تريد حذف جميع المهام؟',
    editTask: 'تعديل المهمة',
    deleteTask: 'حذف المهمة',
    toggleStatus: 'تبديل حالة المهمة',
    toggleThemeDark: 'التبديل إلى الوضع الداكن',
    toggleThemeLight: 'التبديل إلى الوضع الفاتح',
    langLabel: 'English',
    locale: 'ar-EG',
    upgradeBtn: 'الترقية',
    trialDaysLeft: (n) => n === 1 ? 'التجربة: يوم واحد متبقٍ' : n === 2 ? 'التجربة: يومان متبقيان' : n <= 10 ? `التجربة: ${n} أيام متبقية` : `التجربة: ${n} يوماً متبقياً`,
    trialLastDay: 'التجربة تنتهي اليوم!',
    trialExpired: 'انتهت فترة التجربة المجانية',
    proBadge: (plan) => plan === 'yearly' ? 'برو · سنوي' : 'برو · شهري',
    upgradeTitle: 'الترقية إلى برو',
    upgradeSubtitle: 'مهام غير محدودة للأبد',
    planMonthly: 'شهري',
    planYearly: 'سنوي',
    perMonth: '/شهر',
    perYear: '/سنة',
    bestValue: 'الأفضل قيمة',
    payNow: 'ادفع الآن',
    demoNote: 'عرض تجريبي فقط — لا يتم معالجة أي دفع حقيقي',
    paymentSuccess: 'مرحباً بك في برو!',
    proActive: 'اشتراكك الآن نشط.',
    summaryMonthly: 'برو شهري — 3$/شهر',
    summaryYearly: 'برو سنوي — 25$/سنة',
    cardInvalid: 'يرجى ملء جميع حقول البطاقة'
  }
};

// Translate helper
function t(key, ...args) {
  const entry = translations[currentLang][key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// DOM Elements
const htmlRoot = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const totalCounter = document.getElementById('totalCounter');
const emptyState = document.getElementById('emptyState');
const emptyStateText = document.getElementById('emptyStateText');
const clearAllBtn = document.getElementById('clearAllBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentDateEl = document.getElementById('currentDate');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const langToggleBtn = document.getElementById('langToggleBtn');
const langLabel = document.getElementById('langLabel');

// License / Subscription DOM Elements
const trialBanner = document.getElementById('trialBanner');
const trialText = document.getElementById('trialText');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradeModal = document.getElementById('upgradeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const plansStep = document.getElementById('plansStep');
const planCards = document.querySelectorAll('.plan-card');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');
const paymentSuccess = document.getElementById('paymentSuccess');
const appContainer = document.querySelector('.app-container');

// ==================== LICENSE / SUBSCRIPTION ====================
function initLicense() {
  if (!license) {
    license = { trialStart: Date.now(), isPro: false, plan: null };
    saveLicense();
  }
  updateLicenseUI();
}

function saveLicense() {
  localStorage.setItem(LICENSE_KEY, JSON.stringify(license));
}

function trialDaysRemaining() {
  const elapsed = Date.now() - license.trialStart;
  const daysLeft = TRIAL_DAYS - Math.floor(elapsed / (24 * 60 * 60 * 1000));
  return daysLeft;
}

function isTrialExpired() {
  return !license.isPro && trialDaysRemaining() <= 0;
}

function updateLicenseUI() {
  trialBanner.classList.remove('expired', 'pro');

  if (license.isPro) {
    trialBanner.classList.add('pro');
    trialText.textContent = t('proBadge', license.plan);
    upgradeBtn.hidden = true;
    appContainer.classList.remove('locked');
    return;
  }

  upgradeBtn.hidden = false;
  const daysLeft = trialDaysRemaining();

  if (daysLeft <= 0) {
    trialBanner.classList.add('expired');
    trialText.textContent = t('trialExpired');
    appContainer.classList.add('locked');
    openUpgradeModal();
  } else {
    trialText.textContent = daysLeft === 0 ? t('trialLastDay') : t('trialDaysLeft', daysLeft);
    appContainer.classList.remove('locked');
  }
}

function openUpgradeModal() {
  upgradeModal.hidden = false;
  plansStep.hidden = false;
  checkoutForm.hidden = true;
  paymentSuccess.hidden = true;
  // Only allow closing if not locked
  closeModalBtn.hidden = isTrialExpired();
}

function closeUpgradeModal() {
  if (isTrialExpired()) return; // force upgrade when expired
  upgradeModal.hidden = true;
}

function selectPlan(plan) {
  checkoutSummary.textContent = plan === 'yearly' ? t('summaryYearly') : t('summaryMonthly');
  checkoutForm.dataset.plan = plan;
  plansStep.hidden = true;
  checkoutForm.hidden = false;
}

function processPayment(e) {
  e.preventDefault();
  const name = document.getElementById('cardName').value.trim();
  const number = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiry = document.getElementById('cardExpiry').value.trim();
  const cvc = document.getElementById('cardCvc').value.trim();

  if (!name || number.length < 12 || !expiry || cvc.length < 3) {
    alert(t('cardInvalid'));
    return;
  }

  // Fake payment — demo only
  license.isPro = true;
  license.plan = checkoutForm.dataset.plan;
  saveLicense();

  checkoutForm.hidden = true;
  paymentSuccess.hidden = false;
  updateLicenseUI();

  setTimeout(() => {
    upgradeModal.hidden = true;
    checkoutForm.reset();
  }, 2200);
}

// ==================== LANGUAGE MANAGEMENT ====================
function initLanguage() {
  const savedLang = localStorage.getItem(LANG_KEY);
  setLanguage(savedLang === 'ar' ? 'ar' : 'en');
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  // Update html attributes for lang + direction
  htmlRoot.setAttribute('lang', lang);
  htmlRoot.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Static elements via data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Language toggle button shows the OTHER language name
  langLabel.textContent = t('langLabel');

  // Update theme button title in current language
  updateThemeButtonTitle();

  // Re-render dynamic content (dates, counters, tasks, license) in new language
  displayDate();
  renderTasks();
  if (license) updateLicenseUI();
}

function toggleLanguage() {
  setLanguage(currentLang === 'en' ? 'ar' : 'en');
}

function updateThemeButtonTitle() {
  const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
  themeToggleBtn.title = currentTheme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark');
}

// ==================== THEME MANAGEMENT ====================
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

function setTheme(theme) {
  htmlRoot.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-sun theme-icon';
  } else {
    themeIcon.className = 'fa-solid fa-moon theme-icon';
  }
  updateThemeButtonTitle();
}

function toggleTheme() {
  const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Format a task timestamp in the current language's locale
function formatDateTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(t('locale'), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// ==================== DATE DISPLAY ====================
function displayDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString(t('locale'), options);
}

// ==================== LOCAL STORAGE ====================
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

// ==================== TASK OPERATIONS ====================
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  taskInput.value = '';
  saveTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
}

function startEditTask(id, taskElement) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const textSpan = taskElement.querySelector('.task-text');
  const originalText = task.text;

  // Replace text with inline input
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task-edit-input';
  editInput.value = originalText;
  editInput.setAttribute('aria-label', 'Edit task text');

  textSpan.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let hasCommitted = false;

  const commitEdit = () => {
    if (hasCommitted) return;
    hasCommitted = true;

    const updatedText = editInput.value.trim();
    if (updatedText && updatedText !== originalText) {
      task.text = updatedText;
      saveTasks();
    } else {
      renderTasks();
    }
  };

  editInput.addEventListener('blur', commitEdit);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      hasCommitted = true;
      renderTasks();
    }
  });
}

function clearAll() {
  if (tasks.length === 0) return;
  if (confirm(t('confirmClearAll'))) {
    tasks = [];
    saveTasks();
  }
}

function clearCompleted() {
  const hasCompleted = tasks.some(task => task.completed);
  if (!hasCompleted) return;
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
}

// ==================== RENDERING ====================
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // Empty state handling
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'flex';
    if (tasks.length === 0) {
      emptyStateText.textContent = t('emptyNoTasks');
    } else if (currentFilter === 'active') {
      emptyStateText.textContent = t('emptyNoActive');
    } else if (currentFilter === 'completed') {
      emptyStateText.textContent = t('emptyNoCompleted');
    }
  } else {
    emptyState.style.display = 'none';
  }

  // Render individual task items
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const dateTimeHTML = task.createdAt
      ? `<span class="task-datetime"><i class="fa-regular fa-clock"></i> ${formatDateTime(task.createdAt)}</span>`
      : '';

    li.innerHTML = `
      <div class="task-left" role="button" tabindex="0" aria-label="${t('toggleStatus')}">
        <div class="checkbox-custom" aria-hidden="true">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-content">
          <span class="task-text">${escapeHTML(task.text)}</span>
          ${dateTimeHTML}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" title="${t('editTask')}" aria-label="${t('editTask')}">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="action-btn delete-btn" title="${t('deleteTask')}" aria-label="${t('deleteTask')}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    // Click or Enter/Space on task item to toggle completed
    const taskLeft = li.querySelector('.task-left');
    taskLeft.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        toggleTask(task.id);
      }
    });

    taskLeft.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTask(task.id);
      }
    });

    // Edit button
    const editBtn = li.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startEditTask(task.id, li);
    });

    // Delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    taskList.appendChild(li);
  });

  // Update Task Counters
  const activeCount = tasks.filter(t => !t.completed).length;
  const totalCount = tasks.length;
  taskCounter.textContent = t('tasksLeft', activeCount);
  totalCounter.textContent = t('totalCount', totalCount);

  // Update Progress Bar
  const completedCount = totalCount - activeCount;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  progressText.textContent = t('progressLabel', percent);
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute('aria-valuenow', percent);
}

// Prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==================== EVENT LISTENERS ====================
themeToggleBtn.addEventListener('click', toggleTheme);
langToggleBtn.addEventListener('click', toggleLanguage);

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearAllBtn.addEventListener('click', clearAll);
clearCompletedBtn.addEventListener('click', clearCompleted);

// License / Subscription events
upgradeBtn.addEventListener('click', openUpgradeModal);
closeModalBtn.addEventListener('click', closeUpgradeModal);
upgradeModal.addEventListener('click', (e) => {
  if (e.target === upgradeModal) closeUpgradeModal();
});
planCards.forEach(card => {
  card.addEventListener('click', () => selectPlan(card.dataset.plan));
});
checkoutForm.addEventListener('submit', processPayment);

// Card number formatting (groups of 4)
document.getElementById('cardNumber').addEventListener('input', (e) => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
});
document.getElementById('cardExpiry').addEventListener('input', (e) => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  e.target.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
});
document.getElementById('cardCvc').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// ==================== INITIALIZATION ====================
initTheme();
initLanguage();
initLicense();
