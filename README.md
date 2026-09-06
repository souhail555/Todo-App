# 📋 Task Manager — Free & Open-Source To-Do Web App

A beautiful, fully functional task manager built with **pure HTML, CSS, and JavaScript** — no frameworks, no libraries, no payments, no sign-ups. 100% free and open-source.

**🔗 Live Demo:** https://souhail555.github.io/Todo-App/

---

## ✨ Features

### Core Functionality
- ➕ **Add tasks** — with Enter key support
- ✏️ **Edit tasks** — click the edit button, inline editing (Enter to save, Esc to cancel)
- 🗑️ **Delete individual tasks** — with smooth removal animation
- ✅ **Mark complete/incomplete** — click on any task
- 🔍 **Filter tasks** — All / Active / Completed
- 🔢 **Live task counter** — "X tasks left (X total)"
- 📊 **Progress bar** — shows completion percentage with smooth animation
- 🧹 **Clear Completed** / **Clear All** buttons
- 💾 **LocalStorage persistence** — your tasks survive page refresh

### Bilingual Support (Arabic / English)
- 🌐 **Language toggle button** at the top
- ⚡ **Instant switching** — all UI text changes without page refresh
- ↔️ **Full RTL/LTR support** — layout flips perfectly for Arabic
- 💾 **Language preference saved** in LocalStorage

### Extra Polish
- 🌙 **Dark Mode / Light Mode** toggle (respects system preference on first visit)
- ✨ **Task animations** — entrance slide, checkbox pop, smooth strikethrough
- 🎉 **Confetti celebration** when all tasks are completed
- 🔊 **Completion sound** — pleasant two-note "ding" via Web Audio API (no audio files needed)
- 📱 **Fully responsive** — works on mobile, tablet, and desktop
- 🎨 **Modern design** — purple/blue gradient background, clean card UI

---

## 🚀 Getting Started

No build tools, no installation, no dependencies. Just open the file.

### Option 1: Open directly
```
Simply open index.html in any web browser. That's it.
```

### Option 2: Run locally with a server (optional)
```powershell
# If you have Python installed:
python -m http.server 8000

# Or with Node.js:
npx serve

# Then visit http://localhost:8000
```

---

## 📁 Project Structure

```
Todo-App/
├── index.html      ← App structure & markup
├── style.css       ← Styling, themes, animations, RTL, responsive
└── script.js       ← All logic, translations, storage, sound, confetti
```

That's all — three files.

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure & semantics |
| CSS3 | Styling, CSS variables for theming, animations, flexbox |
| Vanilla JavaScript | All app logic — no frameworks |
| Web Audio API | Completion sound (generated in code) |
| localStorage API | Task & preference persistence |
| Google Fonts | Inter (English) + Tajawal (Arabic) |
| Font Awesome | Icons (CDN) |

---

## 🌍 How Bilingual Support Works

- All translatable strings live in a `translations` object in `script.js` (English + Arabic).
- HTML elements use `data-i18n` attributes; JavaScript swaps their text on toggle.
- Switching to Arabic sets `<html lang="ar" dir="rtl">`, which triggers RTL CSS rules.
- Dates, numbers, and counters are localized (`toLocaleString` with `en-US` / `ar-EG`).
- Arabic uses correct pluralization (singular / dual / plural forms).

---

## 💾 Data Storage

Everything is stored in the browser's `localStorage` — nothing leaves your device:

| Key | Contents |
|-----|----------|
| `todo_app_tasks` | Your tasks (text, completed state, timestamp) |
| `todo_app_theme` | Dark or Light mode preference |
| `todo_app_lang` | Language preference (`en` / `ar`) |

To reset the app completely, clear your browser's localStorage for this site.

---

## 🌐 Deployment

Hosted free on **GitHub Pages**. To deploy your own copy:

1. Fork or clone this repository
2. Go to **Settings → Pages**
3. Under **Branch**, select `main` and click **Save**
4. Your site goes live at `https://<your-username>.github.io/Todo-App/`

Any push to `main` auto-updates the live site within a minute.

---

## 📄 License

Free and open-source. Use it, modify it, learn from it, share it.

---

## 👤 Author

**souhail555**
- GitHub: [@souhail555](https://github.com/souhail555)
- Live App: https://souhail555.github.io/Todo-App/

---

⭐ If you find this project useful, consider giving it a star on GitHub!
