<template>
  <v-container>
    <h1 class="mb-6">Explore DivyaBharat</h1>

    <v-row class="mb-4">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          label="Search places"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
          @update:modelValue="debouncedFetch"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          label="Category"
          variant="outlined"
          clearable
          hide-details
          @update:modelValue="fetchPlaces"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="selectedState"
          label="State"
          variant="outlined"
          clearable
          hide-details
          @update:modelValue="debouncedFetch"
        />
      </v-col>

      <v-row v-if="loading">
        <v-col class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="48" />
        </v-col>
      </v-row>

      <v-row v-else-if="places.length === 0">
        <v-col class="text-center py-10">
          <v-icon size="64" color="grey">mdi-map-search</v-icon>
          <p class="mt-4 text-grey">No places found</p>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col
          v-for="place in places"
          :key="place.id"
          cols="12" sm="6" md="4"
        >
          <v-card
            class="h-100"
            hover
            @click="goToPlace(place.id)"
          >
            <v-img
              :src="place.image_url || 'https://placehold.co/400x200?text=DivyaBharat'"
              height="200"
              cover
            />
            <v-card-title class="text-wrap">{{ place.name }}</v-card-title>
            <v-card-subtitle>{{ place.city }}, {{ place.state }}</v-card-subtitle>
            <v-card-text>
              {{ place.description?.slice(0, 100) }}...
            </v-card-text>
            <v-card-actions>
              <v-chip
                :color="categoryColor(place.category)"
                size="small"
                variant="tonal"
              >
                {{ formatCategory(place.category) }}
              </v-chip>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash';
import api from '@/services/api';
import { categoryColor, formatCategory } from '@/utils/placeHelpers';

const router = useRouter();
const places = ref([]);
const loading = ref(false);
const search = ref('');
const selectedCategory = ref(null);
const selectedState = ref('');

const categories = [
  { title: 'Temple', value: 'temple' },
  { title: 'Fort', value: 'fort' },
  { title: 'Cave', value: 'cave' },
  { title: 'Ghat', value: 'ghat' },
  { title: 'Ashram', value: 'ashram' },
  { title: 'Gurudwara', value: 'gurudwara' },
  { title: 'Sacred River', value: 'sacred_river' },
  { title: 'Ancient Site', value: 'ancient_site' },
  { title: 'Heritage Village', value: 'heritage_village' },
  { title: 'Museum', value: 'museum' },
  { title: 'Natural Sacred', value: 'natural_sacred' },
  { title: 'Other', value: 'other' }
];

const fetchPlaces = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (selectedState.value) params.state = selectedState.value;

    const response = await api.get('/places', { params });
    places.value = response.data.places;
  } catch (err) {
    console.error('Failed to fetch places', err);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(fetchPlaces, 300);

const goToPlace = (id) => {
  router.push(`/places/${id}`);
};

onMounted(fetchPlaces);
</script>