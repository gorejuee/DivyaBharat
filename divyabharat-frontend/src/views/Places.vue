<template>
  <v-container class="py-8 page-container">

    <div class="mb-8">
      <p class="page-eyebrow">Browse and discover</p>
      <h1 class="font-playfair page-title">Explore DivyaBharat</h1>
    </div>

    <v-row class="mb-6" align="center">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          label="Search places"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
          base-color="primary"
          color="primary"
          @update:modelValue="debouncedFetch"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedCategory"
          :items="CATEGORIES"
          label="Category"
          variant="outlined"
          clearable
          hide-details
          base-color="primary"
          color="primary"
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
          base-color="primary"
          color="primary"
          @update:modelValue="debouncedFetch"
        />
      </v-col>
    </v-row>

    <!-- Region filter -->
    <div v-if="topStates.length" class="mb-5">
      <div class="d-flex align-center justify-space-between mb-3">
        <p class="page-eyebrow">Filter by region</p>
        <v-btn
          v-if="selectedState"
          variant="text"
          color="primary"
          size="small"
          @click="selectState('')"
        >
          Clear
        </v-btn>
      </div>

      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="item in visibleStates"
          :key="item.state"
          :variant="selectedState === item.state ? 'flat' : 'tonal'"
          :color="selectedState === item.state ? 'primary' : 'default'"
          size="small"
          class="cursor-pointer"
          @click="selectState(item.state)"
        >
          {{ item.state }}
        </v-chip>

        <v-chip
          v-if="!showAllStates && topStates.length > 15"
          variant="outlined"
          color="primary"
          size="small"
          class="cursor-pointer"
          @click="showAllStates = true"
        >
          +{{ topStates.length - 15 }} more
        </v-chip>

        <v-chip
          v-if="showAllStates"
          variant="outlined"
          color="primary"
          size="small"
          class="cursor-pointer"
          @click="showAllStates = false"
        >
          Show less
        </v-chip>
      </div>
    </div>

    <div v-if="!loading && places.length" class="mb-4 d-flex align-center justify-space-between">
      <p class="results-count">
        Showing {{ places.length }} of {{ total }} places
      </p>
      <p class="results-count">
        Page {{ page }} of {{ totalPages }}
      </p>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
        <v-card elevation="0" rounded="lg" class="skeleton-card">
          <v-skeleton-loader type="image, article" color="surface" />
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="places.length === 0">
      <v-col class="text-center py-16">
        <v-icon size="64" color="primary" class="empty-icon">mdi-map-search</v-icon>
        <h3 class="font-playfair mt-4 empty-title">No places found</h3>
        <p class="empty-sub mt-2">Try a different search or category</p>
        <v-btn
          variant="text"
          color="primary"
          class="mt-4"
          prepend-icon="mdi-refresh"
          @click="clearFilters"
        >
          Clear filters
        </v-btn>
      </v-col>
    </v-row>

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
        :style="{ transitionDelay: `${places.indexOf(place) * 40}ms` }"
        @click="goToPlace(place.id)"
      />
    </transition-group>

    <div v-if="totalPages > 1" class="d-flex justify-center mt-8">
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="7"
        color="primary"
        rounded="lg"
        @update:modelValue="goToPage"
      />
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'lodash';
import api from '@/services/api';
import { CATEGORIES } from '@/utils/placeHelpers';
import PlaceCard from '@/components/PlaceCard.vue';

const router = useRouter();
const route = useRoute();
const places = ref([]);
const loading = ref(false);
const search = ref('');
const selectedCategory = ref(null);
const selectedState = ref('');
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);
const topStates = ref([]);
const showAllStates = ref(false);

const fetchStates = async () => {
  try {
    const response = await api.get('/places/states');
    topStates.value = response.data.states;
  } catch (err) {
    console.error('Failed to fetch states', err);
  }
};

const selectState = (state) => {
  selectedState.value = selectedState.value === state ? '' : state;
  page.value = 1;
  fetchPlaces();
};

const visibleStates = computed(() => {
  if (showAllStates.value) return topStates.value;
  return topStates.value.slice(0, 15);
});

const fetchPlaces = async () => {
  loading.value = true;
  try {
    const params = {};
    if (search.value) params.search = search.value;
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (selectedState.value) params.state = selectedState.value;
    params.page = page.value;
    params.limit = 24;

    const response = await api.get('/places', { params });
    places.value = response.data.places;
    totalPages.value = response.data.pagination.totalPages;
    total.value = response.data.pagination.total;
  } catch (err) {
    console.error('Failed to fetch places', err);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(() => {
  page.value = 1;
  fetchPlaces();
}, 300);

const clearFilters = () => {
  search.value = '';
  selectedCategory.value = null;
  selectedState.value = '';
  page.value = 1;
  fetchPlaces();
};

const goToPage = (p) => {
  page.value = p;
  fetchPlaces();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goToPlace = (id) => {
  router.push(`/places/${id}`);
};

onMounted(() => {
  if (route.query.category) selectedCategory.value = route.query.category;
  if (route.query.state) selectedState.value = route.query.state;
  fetchStates();
  fetchPlaces();
});
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

.results-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #78614A;
}

.empty-icon {
  opacity: 0.4;
}

.empty-title {
  color: #2C1810;
}

.empty-sub {
  font-family: 'Inter', sans-serif;
  color: #78614A;
}

.skeleton-card {
  border: 1px solid rgba(180, 83, 9, 0.1);
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