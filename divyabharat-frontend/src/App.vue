<template>
  <v-app>
    <v-app-bar elevation="0" class="divya-navbar">
      <v-app-bar-title>
        <router-link to="/" class="navbar-brand">
          <span class="font-playfair navbar-title">DivyaBharat</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <v-btn variant="text" color="white" to="/">Home</v-btn>
      <v-btn variant="text" color="white" to="/places">Explore</v-btn>
      <v-btn variant="text" color="white" to="/map">Map</v-btn>

      <template v-if="!isLoggedIn">
        <v-btn variant="text" color="white" to="/login">Login</v-btn>
        <v-btn variant="outlined" color="secondary" to="/register" class="mr-2">
          Register
        </v-btn>
      </template>

      <template v-else>
        <v-btn variant="text" color="white" to="/places/submit">Submit</v-btn>
        <v-btn variant="text" color="white" to="/my-places">My Places</v-btn>
        <v-btn variant="text" color="white" to="/trips">My Trips</v-btn>
        <v-btn v-if="userStore.isAdmin" variant="text" color="secondary" to="/admin/places">
          Admin
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" color="white" class="mr-2">
              <v-avatar size="28" color="primary" class="mr-2">
                <span class="text-caption font-weight-bold text-white">
                  {{ userStore.user?.name?.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <span class="text-white">{{ userStore.user?.name }}</span>
              <v-icon end color="white">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              prepend-icon="mdi-logout"
              title="Logout"
              @click="logout"
            />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="page" @after-enter="onRouteEnter">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!userStore.token);

const logout = () => {
  userStore.logout();
  router.push('/');
};

const onRouteEnter = () => {
  // Dispatch a resize event after the route transition fully completes
  // so Leaflet (or any map on the new page) can measure the real container size
  window.dispatchEvent(new Event('resize'));
};
</script>

<style scoped>
.divya-navbar {
  background: linear-gradient(135deg, #1C1209 0%, #2C1810 100%) !important;
  border-bottom: 1px solid rgba(212, 163, 56, 0.2) !important;
}

.navbar-brand {
  text-decoration: none;
}

.navbar-title {
  color: #F59E0B;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>