<template>
  <div class="sp-root">
    <div class="sp-inner">

    <!-- Header -->
    <div class="page-hd">
      <p class="text-eyebrow">Contribute</p>
      <h1 class="page-hd-title">Submit a Sacred Place</h1>
      <p class="text-page-sub">
        India's spiritual and heritage legacy lives through the people who know it.
        If you've visited a place that deserves to be on this map, share it here.
        Every approved place becomes part of DivyaBharat's living guide.
      </p>
    </div>

    <MandalaLine />

    <v-form @submit.prevent="handleSubmit" class="sp-form">

      <!-- Section 1: Identity -->
      <div class="sp-section">
        <div class="sp-section-head">
          <span class="sp-num font-label">01</span>
          <div>
            <p class="sp-section-label text-eyebrow">Identity</p>
            <p class="sp-section-hint font-body">Name and classify the place</p>
          </div>
        </div>

        <div class="sp-fields">
          <div class="sp-field-wrap">
            <label class="sp-label font-label">Place Name <span class="sp-req">*</span></label>
            <input
              v-model="form.name"
              class="sp-input font-body"
              placeholder="e.g. Kedarnath Temple"
              autocomplete="off"
            />
            <p v-if="errors.name" class="sp-field-err font-body">{{ errors.name }}</p>
          </div>

          <div class="sp-field-wrap">
            <label class="sp-label font-label">Category <span class="sp-req">*</span></label>
            <v-select
              v-model="form.category"
              :items="CATEGORIES"
              item-title="title"
              item-value="value"
              placeholder="Select a category"
              variant="outlined"
              density="comfortable"
              color="primary"
              class="sp-vselect"
              hide-details
            />
            <p v-if="errors.category" class="sp-field-err font-body">{{ errors.category }}</p>
          </div>

          <div class="sp-row">
            <div class="sp-field-wrap">
              <label class="sp-label font-label">State <span class="sp-req">*</span></label>
              <input v-model="form.state" class="sp-input font-body" placeholder="e.g. Uttarakhand" />
              <p v-if="errors.state" class="sp-field-err font-body">{{ errors.state }}</p>
            </div>
            <div class="sp-field-wrap">
              <label class="sp-label font-label">City / District</label>
              <input v-model="form.city" class="sp-input font-body" placeholder="e.g. Rudraprayag" />
            </div>
          </div>
        </div>
      </div>

      <MandalaLine />

      <!-- Section 2: Story -->
      <div class="sp-section">
        <div class="sp-section-head">
          <span class="sp-num font-label">02</span>
          <div>
            <p class="sp-section-label text-eyebrow">Story</p>
            <p class="sp-section-hint font-body">Help others understand its significance</p>
          </div>
        </div>

        <div class="sp-fields">
          <div class="sp-field-wrap">
            <label class="sp-label font-label">Description</label>
            <textarea
              v-model="form.description"
              class="sp-textarea font-body"
              rows="3"
              placeholder="A brief overview of the place and why it matters"
            />
          </div>

          <div class="sp-field-wrap">
            <label class="sp-label font-label">History</label>
            <textarea
              v-model="form.history"
              class="sp-textarea font-body"
              rows="4"
              placeholder="Historical or mythological background, legends, era of origin"
            />
          </div>
        </div>
      </div>

      <MandalaLine />

      <!-- Section 3: Location -->
      <div class="sp-section">
        <div class="sp-section-head">
          <span class="sp-num font-label">03</span>
          <div>
            <p class="sp-section-label text-eyebrow">Location</p>
            <p class="sp-section-hint font-body">Search by name or click the map to pin the spot</p>
          </div>
        </div>

        <div class="sp-fields">
          <div class="sp-field-wrap sp-search-wrap">
            <label class="sp-label font-label">Search on map</label>
            <div class="sp-search-row">
              <v-icon class="sp-search-icon" size="18">mdi-map-search</v-icon>
              <input
                v-model="locationSearch"
                class="sp-input sp-search-input font-body"
                placeholder="Type a place name to locate it"
                autocomplete="off"
                @input="debouncedLocationSearch(locationSearch)"
              />
              <button v-if="locationSearch" type="button" class="sp-search-clear" @click="locationSearch = ''; locationSuggestions = []">
                <v-icon size="15">mdi-close</v-icon>
              </button>
            </div>

            <div v-if="locationSuggestions.length" class="sp-suggestions">
              <button
                v-for="(s, i) in locationSuggestions"
                :key="i"
                type="button"
                class="sp-suggestion font-body"
                @click="selectSuggestion(s)"
              >
                <v-icon size="13" style="color:var(--db-gold);margin-right:8px;flex-shrink:0;">mdi-map-marker-outline</v-icon>
                {{ s.display_name }}
              </button>
            </div>
          </div>

          <div ref="locationMapRef" class="sp-map" />

          <div class="sp-row">
            <div class="sp-field-wrap">
              <label class="sp-label font-label">Latitude</label>
              <input v-model="form.latitude" class="sp-input font-body" type="number" placeholder="e.g. 30.7352" />
            </div>
            <div class="sp-field-wrap">
              <label class="sp-label font-label">Longitude</label>
              <input v-model="form.longitude" class="sp-input font-body" type="number" placeholder="e.g. 79.0669" />
            </div>
          </div>
        </div>
      </div>

      <MandalaLine />

      <!-- Section 4: Media -->
      <div class="sp-section">
        <div class="sp-section-head">
          <span class="sp-num font-label">04</span>
          <div>
            <p class="sp-section-label text-eyebrow">Media</p>
            <p class="sp-section-hint font-body">A good photo helps bring the place to life</p>
          </div>
        </div>

        <div class="sp-fields">
          <div class="sp-field-wrap">
            <label class="sp-label font-label">Image URL</label>
            <input
              v-model="form.image_url"
              class="sp-input font-body"
              placeholder="Paste a direct image link (Wikimedia Commons works great)"
            />
            <p class="sp-field-hint font-body">Optional. We'll use a category illustration if left blank.</p>
          </div>

          <div v-if="form.image_url" class="sp-img-preview">
            <img :src="form.image_url" alt="Preview" @error="previewFailed = true" @load="previewFailed = false" />
            <div v-if="previewFailed" class="sp-img-fail font-body">Could not load image. Check the URL.</div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="successMessage" class="sp-alert sp-alert--success font-body">
        <v-icon size="18" style="margin-right:10px;flex-shrink:0;">mdi-check-circle-outline</v-icon>
        <span style="flex:1;">{{ successMessage }}</span>
        <button type="button" class="sp-alert-close" @click="successMessage = ''">
          <v-icon size="16">mdi-close</v-icon>
        </button>
      </div>
      <div v-if="errorMessage" class="sp-alert sp-alert--error font-body">
        <v-icon size="18" style="margin-right:10px;flex-shrink:0;">mdi-alert-circle-outline</v-icon>
        {{ errorMessage }}
      </div>
      <div v-if="validationError" class="sp-alert sp-alert--error font-body">
        <v-icon size="18" style="margin-right:10px;flex-shrink:0;">mdi-alert-circle-outline</v-icon>
        <span style="flex:1;">{{ validationError }}</span>
        <button type="button" class="sp-alert-close" @click="validationError = ''">
          <v-icon size="16">mdi-close</v-icon>
        </button>
      </div>

      <!-- Submit -->
      <button type="submit" class="sp-submit font-label" :disabled="loading">
        <v-progress-circular v-if="loading" indeterminate size="16" width="2" color="white" style="margin-right:10px;" />
        <v-icon v-else size="16" style="margin-right:10px;">mdi-send-outline</v-icon>
        Submit for Review
      </button>

    </v-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { debounce } from 'lodash';
import api from '@/services/api';
import { CATEGORIES } from '@/utils/placeHelpers';
import MandalaLine from '@/components/MandalaLine.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EMPTY_FORM = {
  name: '', category: null, state: '', city: '',
  description: '', history: '', latitude: '', longitude: '', image_url: ''
};

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const validationError = ref('');
const errors = ref({});
const form = ref({ ...EMPTY_FORM });
const locationSearch = ref('');
const locationSuggestions = ref([]);
const searchLoading = ref(false);
const locationMapRef = ref(null);
const previewFailed = ref(false);

let map = null;
let marker = null;

const validate = () => {
  errors.value = {};
  if (!form.value.name) errors.value.name = 'Place name is required';
  if (!form.value.category) errors.value.category = 'Category is required';
  if (!form.value.state) errors.value.state = 'State is required';
  return Object.keys(errors.value).length === 0;
};

const initMap = () => {
  if (!locationMapRef.value || map) return;
  if (locationMapRef.value._leaflet_id) locationMapRef.value._leaflet_id = null;
  map = L.map(locationMapRef.value).setView([22.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'sp-map-tiles'
  }).addTo(map);
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    placeMarker(lat, lng);
    form.value.latitude  = parseFloat(lat.toFixed(7));
    form.value.longitude = parseFloat(lng.toFixed(7));
  });
};

const placeMarker = (lat, lng) => {
  if (marker) { marker.setLatLng([lat, lng]); return; }
  marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    form.value.latitude  = parseFloat(pos.lat.toFixed(7));
    form.value.longitude = parseFloat(pos.lng.toFixed(7));
  });
};

const searchLocation = async (query) => {
  if (!query || query.length < 3) { locationSuggestions.value = []; return; }
  searchLoading.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
      { headers: { 'Accept-Language': 'en' } }
    );
    locationSuggestions.value = await res.json();
  } catch (err) {
    console.error('Location search failed', err);
  } finally {
    searchLoading.value = false;
  }
};

const debouncedLocationSearch = debounce((val) => searchLocation(val), 400);

const selectSuggestion = (s) => {
  const lat = parseFloat(s.lat),
  lng = parseFloat(s.lon);
  form.value.latitude = parseFloat(lat.toFixed(7));
  form.value.longitude = parseFloat(lng.toFixed(7));
  placeMarker(lat, lng);
  map.setView([lat, lng], 14);
  locationSuggestions.value = [];
  locationSearch.value = s.display_name;
};

watch([() => form.value.latitude, () => form.value.longitude], ([lat, lng]) => {
  if (lat && lng && map) {
    placeMarker(parseFloat(lat), parseFloat(lng));
    map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom());
  }
});

// Clear field errors as user fills them in
watch(() => form.value.name, (v) => { if (v) { delete errors.value.name; checkClearValidationBanner(); } });
watch(() => form.value.category, (v) => { if (v) { delete errors.value.category; checkClearValidationBanner(); } });
watch(() => form.value.state, (v) => { if (v) { delete errors.value.state; checkClearValidationBanner(); } });

const checkClearValidationBanner = () => {
  if (Object.keys(errors.value).length === 0) validationError.value = '';
};

const handleSubmit = async () => {
  validationError.value = '';
  if (!validate()) {
    validationError.value = 'Please fill in all required fields above.';
    await nextTick();
    const firstErr = document.querySelector('.sp-field-err');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
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
    successMessage.value = 'Sacred place submitted! It will appear on the map after admin approval.';
    form.value = { ...EMPTY_FORM };
    errors.value = {};
    locationSearch.value = '';
    locationSuggestions.value = [];
    if (marker) {
      marker.remove();
      marker = null;
    }
    map.setView([22.5937, 78.9629], 5);
    setTimeout(() => {
      successMessage.value = '';
    }, 6000);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Submission failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});
</script>

<style scoped>
.sp-root {
  min-height: 100vh;
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
}

.sp-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px clamp(20px, 4vw, 60px) 100px;
}

.sp-form { margin-top: 0; }

/* Section layout */
.sp-section {
  margin-bottom: 48px;
}

.sp-section-head {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.sp-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(200,134,30,0.08);
  border: 1px solid rgba(200,134,30,0.28);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--db-gold-bright);
  margin-top: 2px;
}

.sp-section-label { margin: 0 0 4px; }
.sp-section-hint  { font-size: 0.92rem; color: var(--db-text-muted); margin: 0; line-height: 1.5; }

/* Fields */
.sp-fields { display: flex; flex-direction: column; gap: 20px; }

.sp-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sp-field-wrap { display: flex; flex-direction: column; gap: 8px; }

.sp-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-text-muted);
}

.sp-req { color: var(--db-gold); margin-left: 2px; }

.sp-input,
.sp-textarea {
  width: 100%;
  background: var(--db-surface-2);
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 10px;
  color: var(--db-text);
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: 13px 16px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  resize: none;
}

.sp-input:focus,
.sp-textarea:focus {
  border-color: rgba(200,134,30,0.6);
  background: var(--db-surface-3);
}

.sp-input::placeholder,
.sp-textarea::placeholder { color: var(--db-text-faint); }

/* Vuetify select — border and bg matched to custom inputs */
.sp-vselect :deep(.v-field) {
  background: var(--db-surface-2) !important;
  border-radius: 10px !important;
}
.sp-vselect :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: rgba(200,134,30,0.28) !important;
}
.sp-vselect :deep(.v-field--focused .v-field__outline) {
  color: rgba(200,134,30,0.6) !important;
}
.sp-vselect :deep(.v-field--focused) { background: var(--db-surface-3) !important; }
.sp-vselect :deep(input), .sp-vselect :deep(.v-select__selection-text) {
  color: var(--db-text) !important;
  font-size: 0.95rem !important;
  font-family: var(--font-body) !important;
}
.sp-vselect :deep(.v-label) { color: var(--db-text-faint) !important; font-size: 0.93rem !important; }
.sp-vselect :deep(.v-field__append-inner .v-icon) { color: var(--db-text-muted) !important; }

.sp-field-err  { font-size: 0.85rem; color: #F87171; margin: 0; }
.sp-field-hint { font-size: 0.85rem; color: var(--db-text-faint); margin: 0; }

/* Search */
.sp-search-row {
  position: relative;
  display: flex;
  align-items: center;
}

.sp-search-icon {
  position: absolute;
  left: 14px;
  color: var(--db-text-muted) !important;
  pointer-events: none;
}

.sp-search-input { padding-left: 44px; padding-right: 40px; }

.sp-search-clear {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--db-text-muted);
  display: flex;
  align-items: center;
  padding: 0;
}
.sp-search-clear:hover { color: var(--db-gold-bright); }

.sp-suggestions {
  background: var(--db-surface-2);
  border: 1px solid rgba(200,134,30,0.2);
  border-radius: 10px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sp-suggestion {
  display: flex;
  align-items: flex-start;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(200,134,30,0.08);
  padding: 11px 14px;
  color: var(--db-text-muted);
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.4;
}
.sp-suggestion:last-child { border-bottom: none; }
.sp-suggestion:hover { background: rgba(200,134,30,0.06); color: var(--db-text); }

/* Map */
.sp-map {
  height: 320px;
  border-radius: 12px;
  border: 1px solid rgba(200,134,30,0.2);
  overflow: hidden;
  z-index: 0;
}

:global(.sp-map-tiles) {
  filter: sepia(25%) brightness(0.78) contrast(1.05) saturate(0.85);
}

/* Image preview */
.sp-img-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(200,134,30,0.2);
  max-height: 260px;
}
.sp-img-preview img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
}
.sp-img-fail {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--db-surface);
  color: var(--db-text-muted);
  font-size: 0.9rem;
}

/* Alerts */
.sp-alert {
  display: flex;
  align-items: flex-start;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 0.92rem;
  line-height: 1.5;
  margin-bottom: 20px;
}
.sp-alert--success {
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.28);
  color: #4ade80;
}
.sp-alert--error {
  background: rgba(220,64,64,0.08);
  border: 1px solid rgba(220,64,64,0.28);
  color: #F87171;
}
.sp-alert-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  display: flex;
  align-items: center;
  padding: 0;
  margin-left: 10px;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.sp-alert-close:hover { opacity: 1; }

/* Submit */
.sp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 0;
  border-radius: 12px;
  background: var(--db-gold);
  border: none;
  color: var(--db-bg);
  font-size: 0.82rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  margin-top: 8px;
}
.sp-submit:hover:not(:disabled) { background: var(--db-gold-bright); }
.sp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Responsive */
@media (max-width: 600px) {
  .sp-row { grid-template-columns: 1fr; }
  .sp-section-head { gap: 14px; }
}
</style>
