<template>
  <v-container class="py-8 page-container">

    <div class="mb-8">
      <p class="page-eyebrow">Browse and discover</p>
      <h1 class="font-playfair page-title">Explore DivyaBharat</h1>
    </div>

    <v-row class="mb-4" align="center">
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
          @update:modelValue="() => { page = 1; fetchPlaces(); }"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn
          variant="outlined"
          color="primary"
          block
          height="56"
          rounded="lg"
          :class="selectedState ? 'font-weight-bold' : ''"
          prepend-icon="mdi-map-marker-multiple"
          append-icon="mdi-chevron-down"
          @click="regionPanel = true"
        >
          {{ selectedState || 'Filter by region' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Region panel -->
    <v-expand-transition>
      <v-card
        v-if="regionPanel"
        elevation="2"
        rounded="lg"
        class="mb-5 pa-4"
        style="border: 1px solid rgba(180,83,9,0.15);"
      >
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <p class="page-eyebrow mb-0">Filter by region</p>
            <p class="text-caption" style="color: #78614A;">
              {{ topStates.length }} regions available
            </p>
          </div>
          <div class="d-flex ga-2 align-center">
            <v-btn
              v-if="selectedState"
              variant="text"
              color="primary"
              size="small"
              prepend-icon="mdi-close"
              @click="selectState('')"
            >
              Clear
            </v-btn>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              icon="mdi-close"
              @click="regionPanel = false"
            />
          </div>
        </div>

        <v-text-field
          v-model="regionSearch"
          placeholder="Search regions..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          color="primary"
          base-color="primary"
          class="mb-3"
          @update:modelValue="val => regionSearch = val"
        />

        <div
          class="d-flex flex-wrap ga-2"
          style="max-height: 200px; overflow-y: auto;"
        >
          <v-chip
            v-for="item in filteredRegions"
            :key="item.state"
            :variant="selectedState === item.state ? 'flat' : 'tonal'"
            :color="selectedState === item.state ? 'primary' : 'default'"
            size="small"
            class="cursor-pointer"
            @click="selectState(item.state)"
          >
            {{ item.state }}
            <span class="ml-1 text-caption" style="opacity: 0.6;">
              {{ item.count }}
            </span>
          </v-chip>

          <p
            v-if="filteredRegions.length === 0"
            class="text-caption"
            style="color: #78614A;"
          >
            No regions match your search
          </p>
        </div>
      </v-card>
    </v-expand-transition>

    <!-- Active filter indicators -->
    <div v-if="selectedState || selectedCategory" class="d-flex flex-wrap ga-2 mb-4">
      <v-chip
        v-if="selectedState"
        color="primary"
        variant="tonal"
        size="small"
        closable
        @click:close="selectState('')"
      >
        {{ selectedState }}
      </v-chip>
      <v-chip
        v-if="selectedCategory"
        color="primary"
        variant="tonal"
        size="small"
        closable
        @click:close="() => { selectedCategory = null; page = 1; fetchPlaces(); }"
      >
        {{ CATEGORIES.find(c => c.value === selectedCategory)?.title }}
      </v-chip>
    </div>

    <div v-if="!loading && places.length" class="mb-4 d-flex align-center justify-space-between">
      <p class="results-count">
        {{ total.toLocaleString() }} places
        {{ selectedState ? `in ${selectedState}` : '' }}
        {{ selectedCategory ? `· ${CATEGORIES.find(c => c.value === selectedCategory)?.title}` : '' }}
      </p>
      <p class="results-count">Page {{ page }} of {{ totalPages }}</p>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 24" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-card elevation="0" rounded="lg" class="skeleton-card">
          <v-skeleton-loader type="image, article" color="surface" />
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="places.length === 0">
      <v-col class="text-center py-16">
        <v-icon size="64" color="primary" class="empty-icon">mdi-map-search</v-icon>
        <h3 class="font-playfair mt-4 empty-title">No places found</h3>
        <p class="empty-sub mt-2">Try a different search or region</p>
        <v-btn variant="text" color="primary" class="mt-4" prepend-icon="mdi-refresh" @click="clearFilters">
          Clear filters
        </v-btn>
      </v-col>
    </v-row>

    <transition-group v-else name="card-stagger" tag="div" class="places-grid">
      <PlaceCard
        v-for="place in places"
        :key="place.id"
        :place="place"
        :style="{ transitionDelay: `${places.indexOf(place) * 30}ms` }"
        @click="goToPlace(place.id)"
      />
    </transition-group>

    <!-- Pagination with jump to page -->
    <div v-if="totalPages > 1" class="mt-8">
      <div class="d-flex justify-center align-center flex-wrap ga-3">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          color="primary"
          rounded="lg"
          @update:modelValue="goToPage"
        />

        <div class="d-flex align-center ga-1">
          <v-text-field
            v-model="jumpPage"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            color="primary"
            base-color="primary"
            placeholder="Page"
            style="width: 90px;"
            :min="1"
            :max="totalPages"
            @keyup.enter="handleJump"
          />
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            @click="handleJump"
          >
            Go
          </v-btn>
        </div>
      </div>
    </div>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const regionPanel = ref(false);
const regionSearch = ref('');
const jumpPage = ref('');

const filteredRegions = computed(() => {
  if (!regionSearch.value) return topStates.value;
  return topStates.value.filter(s =>
    s.state.toLowerCase().includes(regionSearch.value.toLowerCase())
  );
});

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
  regionPanel.value = false;
  regionSearch.value = '';
  page.value = 1;
  fetchPlaces();
};

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
  regionSearch.value = '';
  page.value = 1;
  fetchPlaces();
};

const goToPage = (p) => {
  page.value = p;
  fetchPlaces();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleJump = () => {
  const p = parseInt(jumpPage.value);
  if (p >= 1 && p <= totalPages.value) {
    goToPage(p);
    jumpPage.value = '';
  }
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
.page-container { max-width: 1200px; }

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

.empty-icon { opacity: 0.4; }
.empty-title { color: #2C1810; }
.empty-sub { font-family: 'Inter', sans-serif; color: #78614A; }
.skeleton-card { border: 1px solid rgba(180, 83, 9, 0.1); }

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.card-stagger-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.card-stagger-enter-from { opacity: 0; transform: translateY(16px); }
.card-stagger-leave-active { transition: opacity 0.2s ease; }
.card-stagger-leave-to { opacity: 0; }
</style>