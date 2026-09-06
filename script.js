/* ============================================================
   Task Manager — script.js
   Free bilingual (EN/AR) todo app.
   Features: add/edit/delete/complete, filters, counter,
   animated progress bar, dark mode, RTL, localStorage,
   completion sound (Web Audio API) and confetti celebration.
   ============================================================ */

// ---------------- Storage Keys & State ----------------
const STORAGE_KEY = 'todo_app_tasks';
const THEME_KEY = 'todo_app_theme';
const LANG_KEY = 'todo_app_lang';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';
let currentLang = 'en';
let celebratedForCount = -1; // which total-count we already celebrated at 100%

// ---------------- Translations ----------------
const translations = {
  en: {
    pageTitle: '📋 Task Manager',
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
    confirmClearCompleted: 'Clear all completed tasks?',
    editTask: 'Edit task',
    deleteTask: 'Delete task',
    toggleStatus: 'Toggle task status',
    toggleThemeDark: 'Switch to Dark Mode',
    toggleThemeLight: 'Switch to Light Mode',
    langLabel: 'العربية',
    locale: 'en-US',
    allDone: '🎉 All tasks completed!',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    catPersonal: 'Personal',
    catWork: 'Work',
    catShopping: 'Shopping',
    catHealth: 'Health',
    catOther: 'Other',
    dueToday: 'Due today',
    overdue: 'Overdue',
    dueLabel: 'Due',
    dragHint: 'Tip: drag tasks to reorder them',
    dragToReorder: 'Drag to reorder'
  },
  ar: {
    pageTitle: '📋 مدير المهام',
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
    confirmClearCompleted: 'هل تريد مسح جميع المهام المكتملة؟',
    editTask: 'تعديل المهمة',
    deleteTask: 'حذف المهمة',
    toggleStatus: 'تبديل حالة المهمة',
    toggleThemeDark: 'التبديل إلى الوضع الداكن',
    toggleThemeLight: 'التبديل إلى الوضع الفاتح',
    langLabel: 'English',
    locale: 'ar-EG',
    allDone: '🎉 أُنجزت جميع المهام!',
    priorityHigh: 'عالية',
    priorityMedium: 'متوسطة',
    priorityLow: 'منخفضة',
    catPersonal: 'شخصي',
    catWork: 'عمل',
    catShopping: 'تسوق',
    catHealth: 'صحة',
    catOther: 'أخرى',
    dueToday: 'مستحقة اليوم',
    overdue: 'متأخرة',
    dueLabel: 'الاستحقاق',
    dragHint: 'نصيحة: اسحب المهام لإعادة ترتيبها',
    dragToReorder: 'اسحب لإعادة الترتيب'
  }
};

// Translate helper — supports function values (pluralization)
function t(key, ...args) {
  const entry = translations[currentLang][key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// ---------------- DOM Elements ----------------
const htmlRoot = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const langToggleBtn = document.getElementById('langToggleBtn');
const langLabel = document.getElementById('langLabel');
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
const confettiContainer = document.getElementById('confettiContainer');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');

// Priority + category metadata (icons & translation keys)
const PRIORITY_META = {
  high:   { icon: 'fa-solid fa-flag',        key: 'priorityHigh' },
  medium: { icon: 'fa-solid fa-flag',        key: 'priorityMedium' },
  low:    { icon: 'fa-solid fa-flag',        key: 'priorityLow' }
};
const CATEGORY_META = {
  personal: { icon: 'fa-solid fa-user',          key: 'catPersonal' },
  work:     { icon: 'fa-solid fa-briefcase',     key: 'catWork' },
  shopping: { icon: 'fa-solid fa-cart-shopping', key: 'catShopping' },
  health:   { icon: 'fa-solid fa-heart-pulse',   key: 'catHealth' },
  other:    { icon: 'fa-solid fa-tag',           key: 'catOther' }
};

// ==================== THEME MANAGEMENT ====================
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

function setTheme(theme) {
  htmlRoot.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-sun theme-icon';
    themeToggleBtn.title = t('toggleThemeLight');
  } else {
    themeIcon.className = 'fa-solid fa-moon theme-icon';
    themeToggleBtn.title = t('toggleThemeDark');
  }
}

function toggleTheme() {
  const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ==================== LANGUAGE MANAGEMENT ====================
function initLanguage() {
  const savedLang = localStorage.getItem(LANG_KEY);
  setLanguage(savedLang === 'ar' ? 'ar' : 'en');
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  htmlRoot.setAttribute('lang', lang);
  htmlRoot.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Static texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // The toggle shows the OTHER language name
  langLabel.textContent = t('langLabel');

  // Theme button title in current language
  const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
  themeToggleBtn.title = currentTheme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark');

  // Re-render dynamic content in the new language
  displayDate();
  renderTasks();
}

function toggleLanguage() {
  setLanguage(currentLang === 'en' ? 'ar' : 'en');
}

// ==================== DATE & TIME ====================
function displayDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString(t('locale'), options);
}

function formatDateTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(t('locale'), {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Compare a YYYY-MM-DD due date with today (local time)
function getDueStatus(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  if (isNaN(due)) return null;
  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'due-today';
  return 'upcoming';
}

function formatDueDate(dueDate) {
  const d = new Date(dueDate + 'T00:00:00');
  if (isNaN(d)) return '';
  return d.toLocaleDateString(t('locale'), { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==================== LOCAL STORAGE ====================
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

// ==================== SOUND (Web Audio API) ====================
let audioCtx = null;

function playCompleteSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // Pleasant two-note "ding"
    [523.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.45);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.5);
    });
  } catch {
    // Audio not available — fail silently
  }
}

// ==================== CONFETTI CELEBRATION ====================
function celebrate() {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f472b6'];
  const pieces = 90;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    piece.style.width = 6 + Math.random() * 8 + 'px';
    piece.style.height = 10 + Math.random() * 10 + 'px';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);

    piece.addEventListener('animationend', () => piece.remove());
  }

  // Safety cleanup
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 5000);
}

function maybeCelebrate() {
  const total = tasks.length;
  const allDone = total > 0 && tasks.every(task => task.completed);

  if (allDone && celebratedForCount !== total) {
    celebratedForCount = total;
    celebrate();
  }
  // Reset celebration when the set is no longer complete
  if (!allDone) celebratedForCount = -1;
}

// ==================== TASK OPERATIONS ====================
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: Date.now(),
    priority: prioritySelect.value || 'medium',
    category: categorySelect.value || 'personal',
    dueDate: dueDateInput.value || null
  });

  taskInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
  categorySelect.value = 'personal';
  taskInput.focus();
  saveTasks();
}

function toggleTask(id) {
  let justCompleted = false;
  tasks = tasks.map(task => {
    if (task.id === id) {
      if (!task.completed) justCompleted = true;
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  if (justCompleted) playCompleteSound();
  saveTasks();
  maybeCelebrate();
}

function deleteTask(id) {
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
    }, 220);
  } else {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
  }
}

function startEditTask(id, taskElement) {
  const task = tasks.find(taskItem => taskItem.id === id);
  if (!task) return;

  const textSpan = taskElement.querySelector('.task-text');
  if (!textSpan) return;
  const originalText = task.text;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task-edit-input';
  editInput.value = originalText;
  editInput.setAttribute('aria-label', t('editTask'));

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
  if (!tasks.some(task => task.completed)) return;
  if (confirm(t('confirmClearCompleted'))) {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
  }
}

// ==================== RENDERING ====================
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // Empty state
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'flex';
    if (tasks.length === 0) {
      emptyStateText.textContent = t('emptyNoTasks');
    } else if (currentFilter === 'active') {
      emptyStateText.textContent = t('emptyNoActive');
    } else {
      emptyStateText.textContent = t('emptyNoCompleted');
    }
  } else {
    emptyState.style.display = 'none';
  }

  // Render tasks
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    li.draggable = true;

    const dateTimeHTML = task.createdAt
      ? `<span class="task-datetime"><i class="fa-regular fa-clock"></i> ${formatDateTime(task.createdAt)}</span>`
      : '';

    // Priority badge
    const priority = PRIORITY_META[task.priority] ? task.priority : null;
    const priorityHTML = priority
      ? `<span class="badge badge-priority-${priority}"><i class="${PRIORITY_META[priority].icon}"></i> ${t(PRIORITY_META[priority].key)}</span>`
      : '';

    // Category badge
    const category = CATEGORY_META[task.category] ? task.category : null;
    const categoryHTML = category
      ? `<span class="badge badge-category"><i class="${CATEGORY_META[category].icon}"></i> ${t(CATEGORY_META[category].key)}</span>`
      : '';

    // Due date badge (with overdue / due-today states, hidden when completed)
    let dueHTML = '';
    if (task.dueDate) {
      const status = getDueStatus(task.dueDate);
      let cls = 'badge-due';
      let label = `${t('dueLabel')}: ${formatDueDate(task.dueDate)}`;
      if (!task.completed && status === 'overdue') {
        cls += ' overdue';
        label = `${t('overdue')} · ${formatDueDate(task.dueDate)}`;
      } else if (!task.completed && status === 'due-today') {
        cls += ' due-today';
        label = t('dueToday');
      }
      dueHTML = `<span class="badge ${cls}"><i class="fa-regular fa-calendar"></i> ${label}</span>`;
    }

    const metaHTML = (priorityHTML || categoryHTML || dueHTML)
      ? `<div class="task-meta">${priorityHTML}${categoryHTML}${dueHTML}</div>`
      : '';

    li.innerHTML = `
      <i class="fa-solid fa-grip-vertical drag-handle" title="${t('dragToReorder')}"></i>
      <div class="task-left" role="button" tabindex="0" aria-label="${t('toggleStatus')}">
        <div class="checkbox-custom" aria-hidden="true">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-content">
          <span class="task-text">${escapeHTML(task.text)}</span>
          ${dateTimeHTML}
          ${metaHTML}
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

    const taskLeft = li.querySelector('.task-left');
    taskLeft.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') toggleTask(task.id);
    });
    taskLeft.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTask(task.id);
      }
    });

    li.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startEditTask(task.id, li);
    });

    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    taskList.appendChild(li);
  });

  // Enable drag & drop reordering
  initDragAndDrop();

  // Counter
  const activeCount = tasks.filter(task => !task.completed).length;
  const totalCount = tasks.length;
  taskCounter.textContent = t('tasksLeft', activeCount);
  totalCounter.textContent = t('totalCount', totalCount);

  // Progress bar
  const completedCount = totalCount - activeCount;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  progressText.textContent = t('progressLabel', percent);
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute('aria-valuenow', percent);
  progressBar.classList.toggle('full', percent === 100);
}

// Prevent XSS — user task text is always escaped
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==================== DRAG & DROP REORDER ====================
let draggedId = null;

function initDragAndDrop() {
  const items = taskList.querySelectorAll('.task-item');

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedId = item.dataset.id;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', draggedId); } catch {}
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      items.forEach(i => i.classList.remove('drop-target', 'drop-target-bottom'));
      draggedId = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item.dataset.id === draggedId) return;
      e.dataTransfer.dropEffect = 'move';

      // Decide above/below based on cursor position within the item
      const rect = item.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > rect.height / 2;
      items.forEach(i => i.classList.remove('drop-target', 'drop-target-bottom'));
      item.classList.add(isAfter ? 'drop-target-bottom' : 'drop-target');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drop-target', 'drop-target-bottom');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedId || item.dataset.id === draggedId) return;

      const rect = item.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > rect.height / 2;
      reorderTasks(draggedId, item.dataset.id, isAfter);
    });
  });

  // Allow dropping at the end of the list
  taskList.addEventListener('dragover', (e) => e.preventDefault());
}

// Move draggedId to the position of targetId (before or after)
function reorderTasks(draggedIdValue, targetId, placeAfter) {
  const fromIndex = tasks.findIndex(task => task.id === draggedIdValue);
  const toIndex = tasks.findIndex(task => task.id === targetId);
  if (fromIndex === -1 || toIndex === -1) return;

  const [moved] = tasks.splice(fromIndex, 1);
  let insertIndex = tasks.findIndex(task => task.id === targetId);
  if (placeAfter) insertIndex += 1;
  tasks.splice(insertIndex, 0, moved);

  saveTasks();
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

// ==================== INITIALIZATION ====================
initTheme();
initLanguage();
