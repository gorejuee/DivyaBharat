<template>
  <v-container class="py-8 page-container">
    <div class="mb-8">
      <p class="page-eyebrow">Your journey</p>
      <h1 class="font-playfair page-title">My Visited Places</h1>
      <p class="page-sub mt-2">Places you have marked as visited on DivyaBharat.</p>
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
  </v-container>
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
.page-container {
  max-width: 1200px;
}

.page-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #B45309;
  margin-bottom: 4px;
}

.page-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: #2C1810;
  line-height: 1.2;
}

.page-sub {
  font-family: 'Inter', sans-serif;
  color: #78614A;
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