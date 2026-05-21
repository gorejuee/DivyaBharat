import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { VDateInput } from 'vuetify/labs/VDateInput';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components: { ...components, VDateInput },
  directives,
  theme: {
    defaultTheme: 'divyaBharatTheme',
    themes: {
      divyaBharatTheme: {
        dark: false,
        colors: {
          primary: '#B45309',
          secondary: '#D97706',
          accent: '#F59E0B',
          background: '#FDF8F0',
          surface: '#FFF8ED',
          error: '#DC2626',
          success: '#15803D',
          warning: '#D97706',
          info: '#1D4ED8',
          'on-primary': '#FFFFFF',
          'on-background': '#2C1810',
          'on-surface': '#2C1810',
        }
      }
    }
  }
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vuetify);
app.mount('#app');