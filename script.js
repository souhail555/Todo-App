// State Management & Local Storage Keys
const STORAGE_KEY = 'todo_app_tasks';
const THEME_KEY = 'todo_app_theme';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';

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
    themeToggleBtn.title = 'Switch to Light Mode';
  } else {
    themeIcon.className = 'fa-solid fa-moon theme-icon';
    themeToggleBtn.title = 'Switch to Dark Mode';
  }
}

function toggleTheme() {
  const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// ==================== DATE DISPLAY ====================
function displayDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
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
    completed: false
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
  if (confirm('Are you sure you want to delete all tasks?')) {
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
      emptyStateText.textContent = 'No tasks yet. Enjoy your day!';
    } else if (currentFilter === 'active') {
      emptyStateText.textContent = 'No active tasks left!';
    } else if (currentFilter === 'completed') {
      emptyStateText.textContent = 'No completed tasks yet!';
    }
  } else {
    emptyState.style.display = 'none';
  }

  // Render individual task items
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-left" role="button" tabindex="0" aria-label="Toggle task status">
        <div class="checkbox-custom" aria-hidden="true">
          <i class="fa-solid fa-check"></i>
        </div>
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" title="Edit task" aria-label="Edit task">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="action-btn delete-btn" title="Delete task" aria-label="Delete task">
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
  taskCounter.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
  totalCounter.textContent = `(${totalCount} total)`;
}

// Prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==================== EVENT LISTENERS ====================
themeToggleBtn.addEventListener('click', toggleTheme);

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
displayDate();
renderTasks();
