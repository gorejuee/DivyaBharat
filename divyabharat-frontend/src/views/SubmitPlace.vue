<template>
  <v-container class="py-8" style="max-width: 700px">
    <h1 class="text-h5 font-weight-bold mb-2">Submit a Place</h1>
    <p class="text-grey text-body-2 mb-6">
      India's spiritual and heritage legacy lives through the people who know it.
      If you've visited a place that deserves to be on this map submit it here.
      Every approved place becomes part of DivyaBharat's living guide.
    </p>

    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.name"
        label="Place name *"
        variant="outlined"
        class="mb-4"
        :rules="[v => !!v || 'Name is required']"
      />

      <v-select
        v-model="form.category"
        :items="CATEGORIES"
        label="Category *"
        variant="outlined"
        class="mb-4"
        :rules="[v => !!v || 'Category is required']"
      />

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.state"
            label="State *"
            variant="outlined"
            :rules="[v => !!v || 'State is required']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.city"
            label="City"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-textarea
        v-model="form.description"
        label="Description"
        variant="outlined"
        rows="3"
        class="mb-4"
      />

      <v-textarea
        v-model="form.history"
        label="History"
        variant="outlined"
        rows="4"
        class="mb-4"
      />

      <div class="mb-2">
        <p class="text-body-2 font-weight-medium mb-1">Location</p>
        <p class="text-grey text-caption mb-3">
          Search by name to auto-fill coordinates, or click anywhere on the map to drop a pin.
        </p>

        <!-- Nominatim search -->
        <v-text-field
          v-model="locationSearch"
          label="Search location on map"
          variant="outlined"
          prepend-inner-icon="mdi-map-search"
          clearable
          hide-details
          class="mb-2"
          :loading="searchLoading"
          @update:modelValue="debouncedLocationSearch"
          @click:clear="locationSuggestions = []"
        />

        <v-list
          v-if="locationSuggestions.length"
          class="mb-3 rounded border"
          density="compact"
          style="max-height: 200px; overflow-y: auto;"
        >
          <v-list-item
            v-for="(suggestion, index) in locationSuggestions"
            :key="index"
            :title="suggestion.display_name"
            @click="selectSuggestion(suggestion)"
            style="cursor: pointer"
          />
        </v-list>

        <!-- Leaflet map -->
        <div id="location-map" style="height: 300px; border-radius: 8px; z-index: 0;" class="mb-3" />

        <!-- Coordinate fields -->
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.latitude"
              label="Latitude"
              variant="outlined"
              type="number"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.longitude"
              label="Longitude"
              variant="outlined"
              type="number"
              hide-details
            />
          </v-col>
        </v-row>
      </div>

      <v-text-field
        v-model="form.image_url"
        label="Image URL"
        variant="outlined"
        class="mt-4 mb-6"
        hint="Paste a direct image link (e.g. from Wikimedia Commons)"
        persistent-hint
      />

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        {{ successMessage }}
      </v-alert>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        type="submit"
        color="primary"
        size="large"
        :loading="loading"
        block
      >
        Submit for Review
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, queuePostFlushCb } from 'vue';
import { debounce } from 'lodash';
import api from '@/services/api';
import { CATEGORIES } from '@/utils/placeHelpers';

const EMPTY_FORM = {
  name: '',
  category: null,
  state: '',
  city: '',
  description: '',
  history: '',
  latitude: '',
  longitude: '',
  image_url: ''
};

const formRef = ref(null);
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const form = ref({ ...EMPTY_FORM });
const locationSearch = ref('');
const locationSuggestions = ref([]);
const searchLoading = ref(false);
let map = null;
let marker = null;

const initMap = () => {
  // default center: India
  map = L.map('location-map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    placeMarker(lat, lng);
    form.value.latitude = parseFloat(lat.toFixed(7));
    form.value.longitude = parseFloat(lng.toFixed(7));
  });
};

const placeMarker = (lat, lng) => {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragged', (e) => {
      const pos = e.target.getLatLng();
      form.value.latitude = parseFloat(pos.lat.toFixed(7));
      form.value.longitude = parseFloat(pos.lng.toFixed(7));
    });
  }
};

const searchLocation = async (query) => {
  if (!query || query.length < 3) {
    locationSuggestions.value = [];
    return;
  }
  searchLoading: true;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    locationSuggestions.value = data;
  } catch (err) {
    console.error('Location search failed', err);
  } finally {
    searchLoading.value = false;
  }
};

const debouncedLocationSearch = debounce((val) => searchLocation(val), 400);

const selectSuggestion = (suggestion) => {
  const lat = parseFloat(suggestion.lat);
  const lng = parseFloat(suggestion.lon);

  form.value.latitude = parseFloat(lat.toFixed(7));
  form.value.longitude = parseFloat(lng.toFixed(7));

  placeMarker(lat, lng);
  map.setView([lat, lng], 14);

  locationSuggestions.value = [];
  locationSearch.value = suggestion.display_name;
};

// keep marker in sync if manually edits the coordinate fields
watch([() => form.value.latitude, () => form.value.longitude], ([lat, lng]) => {
  if (lat && lng && map) {
    placeMarker(parseFloat(lat), parseFloat(lng));
    map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom());
  }
});

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await api.post('/places/submit', {
      ...form.value,
      latitude: form.value.latitude || null,
      longitude: form.value.longitude || null,
      image_url: form.value.image_url || null
    });

    successMessage.value = 'Place submitted successfully! It will appear after admin approval.';
    form.value = { ...EMPTY_FORM };
    formRef.value.resetValidation();
    locationSearch.value = '';
    locationSuggestions.value = '';

    // reset map
    if (marker) {
      marker.remove();
      marker = null;
    }
    map.setView([22.5937, 78.9629], 5);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Submission failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // load leaflet CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  // load leaflet JS then init map
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => initMap();
  document.head.appendChild(script);
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});
</script>