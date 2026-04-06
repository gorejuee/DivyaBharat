<template>
  <div>
    <h1>Welcome to SacredPath</h1>
    <p>Discover India's spiritual and heritage places</p>
    <p v-if="status">Backend status: {{ status }}</p>
    <p v-else>Connecting to backend...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const status = ref(null);

onMounted(async () => {
  try {
    const response = await api.get('/health');
    status.value = response.data.status;
  } catch (error) {
    console.error('Backend connection failed:', error);
    status.value = 'connection failed'
  }
})
</script>