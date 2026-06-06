'use strict';

(function () {
  const STORAGE_KEY = 'site-theme';
  const root = document.documentElement;
  const body = document.body;
  let switchTimer = null;

  const getInitialTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme, withAnimation = false) => {
    if (withAnimation) {
      body.classList.add('theme-switching');
      if (switchTimer) clearTimeout(switchTimer);
      switchTimer = setTimeout(() => body.classList.remove('theme-switching'), 380);
    }

    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.innerHTML = theme === 'dark'
        ? '<ion-icon name="sunny-outline"></ion-icon>'
        : '<ion-icon name="moon-outline"></ion-icon>';
    }
  };

  const createToggle = () => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.title = 'Toggle theme';
    document.body.appendChild(btn);
    return btn;
  };

  const toggleBtn = createToggle();
  applyTheme(getInitialTheme());

  toggleBtn.addEventListener('click', function () {
    const current = root.getAttribute('data-theme') || 'light';
    toggleBtn.classList.add('theme-spinning');
    setTimeout(() => toggleBtn.classList.remove('theme-spinning'), 450);
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });
})();
