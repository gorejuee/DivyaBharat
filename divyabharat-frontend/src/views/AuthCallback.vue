<template>
  <v-container class="text-center py-16">
    <v-progress-circular indeterminate color="primary" size="64" />
    <p class="mt-4 text-grey">Signing you in...</p>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const user = params.get('user');

  if (token && user) {
    try {
      const parsedUser = JSON.parse(decodeURIComponent(user));
      userStore.setUser(parsedUser, token);
      router.push('/places');
    } catch {
      router.push('/login?error=oauth_failed');
    }
  } else {
    router.push('/login?error=oauth_failed');
  }
});
</script>