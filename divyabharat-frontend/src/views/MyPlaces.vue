<template>
  <div class="myplaces-root">
    <div class="page-hd">
      <p class="text-eyebrow">Your Journey</p>
      <h1 class="page-hd-title">My Visited Places</h1>
      <p class="text-page-sub">Places you have marked as visited on DivyaBharat.</p>
    </div>

    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="d-block mx-auto my-10"
    />

    <v-alert v-else-if="!places.length" type="info" variant="tonal" color="primary">
      You haven't marked any places as visited yet.
      <v-btn variant="text" color="primary" to="/places" class="ml-2">Explore Places</v-btn>
    </v-alert>

    <transition-group
      v-else
      name="card-stagger"
      tag="div"
      class="places-grid"
    >
      <PlaceCard
        v-for="place in places"
        :key="place.id"
        :place="place"
        :show-visited="true"
        :style="{ transitionDelay: `${places.indexOf(place) * 40}ms` }"
        @click="router.push(`/places/${place.id}`)"
      />
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import PlaceCard from '@/components/PlaceCard.vue';

const router = useRouter();
const places = ref([]);
const loading = ref(false);

const fetchVisitedPlaces = async () => {
  loading.value = true;
  try {
    const response = await api.get('/visits');
    places.value = response.data.places;
  } catch (err) {
    console.error('Failed to fetch visited places', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchVisitedPlaces);
</script>

<style scoped>
.myplaces-root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px clamp(20px, 4vw, 60px) 80px;
  min-height: 100vh;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card-stagger-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.card-stagger-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.card-stagger-leave-active {
  transition: opacity 0.2s ease;
}

.card-stagger-leave-to {
  opacity: 0;
}
</style>