<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title>
        <router-link to="/" style="color: white; text-decoration: none;">
          🛕 DivyaBharat
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <v-btn variant="text" color="white" to="/">Home</v-btn>
      <v-btn variant="text" color="white" to="/places">Explore</v-btn>

      <template v-if="!isLoggedIn">
        <v-btn variant="text" color="white" to="/login">Login</v-btn>
        <v-btn variant="outlined" color="white" to="/register" class="mr-2">Register</v-btn>
      </template>

      <template v-else>
        <span class="text-white text-body-2 mr-3">{{ userStore.user?.name }}</span>
        <v-btn variant="outlined" color="white" class="mr-2" @click="logout">Logout</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const isLoggedIn = computed(() => !!userStore.token);

const logout = () => {
  userStore.logout();
  router.push('/');
};
</script>