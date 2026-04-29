<template>
  <v-container class="py-8">
    <h1 class="text-h5 font-weight-bold mb-2">My Visited Places</h1>
    <p class="text-grey text-body-2 mb-6">Places you have marked as visited on DivyaBharat.</p>

    <v-progress-circular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-10" />

    <v-alert v-else-if="!places.length" type="info" variant="tonal">
      You haven't marked any places as visited yet.
      <v-btn variant="text" color="primary" to="/places" class="ml-2">Explore Places</v-btn>
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="place in places"
        :key="place.id"
        cols="12" sm="6" md="4"
      >
        <v-card class="h-100" hover @click="router.push(`/places/${place.id}`)">
          <v-img
            :src="place.image_url || 'https://placehold.co/400x200?text=DivyaBharat'"
            height="200"
            cover
          />
          <v-card-title class="text-wrap">{{ place.name }}</v-card-title>
          <v-card-subtitle>{{ place.city ? place.city + ', ' : '' }} {{ place.state }}</v-card-subtitle>
          <v-card-actions>
            <v-chip
              :color="categoryColor(place.category)"
              size="small"
              variant="tonal"
            >
              {{ formatCategory(place.category) }}
            </v-chip>
            <v-spacer />
            <v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-check-circle">
              Visited
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { categoryColor, formatCategory } from '@/utils/placeHelpers';

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