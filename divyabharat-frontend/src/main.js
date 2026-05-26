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
import './style.css';

const vuetify = createVuetify({
  components: { ...components, VDateInput },
  directives,
  theme: {
    defaultTheme: 'divyaBharatTheme',
    themes: {
      divyaBharatTheme: {
        dark: true,
        colors: {
          primary:        '#C8861E',
          secondary:      '#E8A020',
          accent:         '#F0B93A',
          background:     '#09060A',
          surface:        '#120D0A',
          error:          '#DC2626',
          success:        '#22C55E',
          warning:        '#E8A020',
          info:           '#60A5FA',
          'on-primary':   '#09060A',
          'on-background':'#EDE3CE',
          'on-surface':   '#EDE3CE',
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