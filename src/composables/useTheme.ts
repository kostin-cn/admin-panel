import { ref } from 'vue';

const isDark = ref(document.documentElement.classList.contains('app-dark'));

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;

    if (isDark.value) {
      document.documentElement.classList.add('app-dark');
      localStorage.setItem('app-theme', 'dark');
    } else {
      document.documentElement.classList.remove('app-dark');
      localStorage.setItem('app-theme', 'light');
    }
  };

  return {
    isDark,
    toggleTheme
  };
}
