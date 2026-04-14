<template>
  <v-container v-if="loading" class="text-center py-16">
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-container>

  <v-container v-else-if="!place" class="text-center py-16">
    <v-icon size="64" color="grey">mdi-map-marker-off</v-icon>
    <h2 class="mt-4 text-grey">Place not found</h2>
    <v-btn class="mt-4" color="primary" @click="router.push('/places')">
      Back to Explore
    </v-btn>
  </v-container>

  <v-container v-else>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 px-0"
      @click="router.push('/places')"
    >
      Back to Explore
    </v-btn>

    <v-img
      :src="place.image_url || 'https://placehold.co/1200x400?text=DivyaBharat'"
      height="400"
      cover
      rounded="lg"
      class="mb-6"
    />

    <v-row class="mb-2" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold">{{ place.name }}</h1>
        <div class="mt-2 d-flex align-center ga-2">
          <v-chip
            :color="categoryColor(place.category)"
            variant="tonal"
            size="small"
          >
            {{ formatCategory(place.category) }}
          </v-chip>
          <v-icon size="16" color="grey" class="ml-2">mdi-map-marker</v-icon>
          <span class="text-grey text-body-2">{{ place.city }}, {{ place.state }}</span>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <section class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">About</h2>
      <p class="text-body-1">{{ place.description }}</p>
    </section>

    <section v-if="place.history" class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-book-open-variant</v-icon>
        History
      </h2>
      <v-card variant="tonal" color="primary" class="pa-4">
        <p class="text-body-1">{{ place.history }}</p>
      </v-card>
    </section>

    <section v-if="place.latitude && place.longitude" class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-map</v-icon>
        Location
      </h2>
      <v-card variant="outlined" class="pa-4">
        <p class="text-body-2 text-grey">
          Coordinates: {{ place.latitude }}, {{ place.longitude }}
        </p>
        <v-btn
          class="mt-3"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-google-maps"
          :href="`https://www.google.com/maps?q=${place.latitude},${place.longitude}`"
          target="_blank"
        >
          Open in Google Maps
        </v-btn>
      </v-card>
    </section>

    <section class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
        Ask AI Guide
      </h2>
      <v-card variant="outlined" class="pa-6 text-center">
        <v-icon size="48" color="grey">mdi-robot-outline</v-icon>
        <p class="mt-3 text-grey">AI Guide coming soon</p>
      </v-card>
    </section>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { categoryColor, formatCategory } from '@/utils/placeHelpers';

const route = useRoute();
const router = useRouter();
const place = ref(null);
const loading = ref(false);

const fetchPlace = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/places/${route.params.id}`);
    place.value = response.data.place;
  } catch (err) {
    console.error('Failed to fetch place', err);
    place.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPlace);
</script>