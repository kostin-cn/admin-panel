import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';

import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './assets/styles/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Ініціалізація теми з localStorage до монтування додатка
const savedTheme = localStorage.getItem('app-theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('app-dark');
} else {
  document.documentElement.classList.remove('app-dark');
}

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark', // Можливість перемикати темну тему
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(router)

// Директива для підказок при згорнутому сайдбарі
app.directive('tooltip', Tooltip);

app.mount('#app')
