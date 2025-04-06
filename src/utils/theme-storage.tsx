const THEME_KEY = 'theme';

export function saveTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme(): 'light' | 'dark' | null {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }
  return null;
}

export const getInitialTheme = (): 'light' | 'dark' => {
  const saved = loadTheme();
  if (saved) return saved;

  // fallback su preferenza di sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};
