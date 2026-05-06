<template>
  <v-container class="py-8" style="max-width: 700px;">

    <div class="mb-8">
      <p class="text-caption font-weight-bold text-uppercase mb-1"
         style="letter-spacing: 3px; color: #B45309;">
        Contribute
      </p>
      <h1 class="font-playfair text-h4 font-weight-bold" style="color: #2C1810;">
        Submit a Place
      </h1>
      <p class="text-body-2 mt-2" style="color: #78614A;">
        India's spiritual and heritage legacy lives through the people who know it.
        If you've visited a place that deserves to be on this map, submit it here.
        Every approved place becomes part of DivyaBharat's living guide.
      </p>
    </div>

    <v-form ref="formRef" @submit.prevent="handleSubmit">

      <v-text-field
        v-model="form.name"
        label="Place name *"
        variant="outlined"
        color="primary"
        base-color="primary"
        class="mb-4"
        :rules="[v => !!v || 'Name is required']"
      />

      <v-select
        v-model="form.category"
        :items="CATEGORIES"
        label="Category *"
        variant="outlined"
        color="primary"
        base-color="primary"
        class="mb-4"
        :rules="[v => !!v || 'Category is required']"
      />

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.state"
            label="State *"
            variant="outlined"
            color="primary"
            base-color="primary"
            :rules="[v => !!v || 'State is required']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.city"
            label="City"
            variant="outlined"
            color="primary"
            base-color="primary"
          />
        </v-col>
      </v-row>

      <v-textarea
        v-model="form.description"
        label="Description"
        variant="outlined"
        color="primary"
        base-color="primary"
        rows="3"
        class="mb-4"
      />

      <v-textarea
        v-model="form.history"
        label="History"
        variant="outlined"
        color="primary"
        base-color="primary"
        rows="4"
        class="mb-4"
      />

      <!-- Location section -->
      <div class="mb-4">
        <p class="text-body-2 font-weight-medium mb-1" style="color: #2C1810;">Location</p>
        <p class="text-caption mb-3" style="color: #78614A;">
          Search by name to auto-fill coordinates, or click anywhere on the map to drop a pin.
        </p>

        <v-text-field
          v-model="locationSearch"
          label="Search location on map"
          variant="outlined"
          color="primary"
          base-color="primary"
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
            class="cursor-pointer"
            @click="selectSuggestion(suggestion)"
          />
        </v-list>

        <div id="location-map" class="mb-3" style="height: 300px; border-radius: 8px; z-index: 0;" />

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.latitude"
              label="Latitude"
              variant="outlined"
              color="primary"
              base-color="primary"
              type="number"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.longitude"
              label="Longitude"
              variant="outlined"
              color="primary"
              base-color="primary"
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
        color="primary"
        base-color="primary"
        class="mt-4 mb-6"
        hint="Paste a direct image link (e.g. from Wikimedia Commons)"
        persistent-hint
      />

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        rounded="lg"
        closable
        class="mb-4"
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        rounded="lg"
        closable=""
        class="mb-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        type="submit"
        color="primary"
        variant="flat"
        size="large"
        rounded="lg"
        :loading="loading"
        block
      >
        Submit for Review
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
    marker.on('dragend', (e) => {
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
  searchLoading.value = true;
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

    await nextTick();
    formRef.value.resetValidation();

    locationSearch.value = '';
    locationSuggestions.value = [];

    if (marker) {
      marker.remove();
      marker = null;
    }
    map.setView([22.5937, 78.9629], 5);

    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Submission failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

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