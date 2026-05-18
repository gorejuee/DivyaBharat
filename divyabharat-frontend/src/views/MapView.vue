<template>
  <v-container fluid class="pa-0" style="height: calc(100vh - 64px); position: relative;">

    <!-- Filter panel -->
    <div style="position: absolute; top: 16px; left: 16px; z-index: 1000; min-width: 260px;">
      <v-card
        elevation="3"
        rounded="lg"
        class="pa-3"
        style="background: #FFFBF4; border: 1px solid rgba(180,83,9,0.12); max-width: 280px;"
      >
        <p class="text-caption font-weight-bold text-uppercase mb-2"
           style="letter-spacing: 2px; color: #B45309;">
          Explore the map
        </p>

        <v-select
          v-model="selectedCategory"
          :items="CATEGORIES"
          :disabled="loading"
          label="Category"
          variant="outlined"
          color="primary"
          base-color="primary"
          density="compact"
          clearable
          hide-details
          class="mb-2"
          @update:modelValue="applyFilter"
        />

        <div class="d-flex align-center justify-space-between mt-2">
          <p class="text-caption" style="color: #78614A;">
            <span style="font-weight: 600; color: #B45309;">{{ filteredCount }}</span>
            of {{ places.length }} places
          </p>
          <v-btn
            v-if="selectedCategory"
            variant="text"
            color="primary"
            size="x-small"
            @click="selectedCategory = null; applyFilter()"
          >
            Clear
          </v-btn>
        </div>

        <!-- Category legend -->
        <v-divider class="my-2" style="opacity: 0.2;" />
        <p class="text-caption mb-2" style="color: #78614A; font-weight: 500;">Pin colors</p>
        <div class="d-flex flex-wrap ga-1">
          <div
            v-for="(color, cat) in MARKER_COLORS"
            :key="cat"
            class="d-flex align-center ga-1"
            style="width: 48%;"
          >
            <div
              :style="{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0
              }"
            />
            <span class="text-caption" style="color: #78614A; font-size: 0.65rem;">
              {{ formatCategory(cat) }}
            </span>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Stats badge -->
    <div style="position: absolute; top: 16px; right: 16px; z-index: 1000;">
      <v-card
        elevation="2"
        rounded="lg"
        class="px-3 py-2"
        style="background: #FFFBF4; border: 1px solid rgba(180,83,9,0.12);"
      >
        <p class="text-caption text-center" style="color: #78614A;">
          <span class="font-playfair" style="font-size: 1.2rem; color: #B45309; font-weight: 700;">
            {{ places.length.toLocaleString() }}
          </span>
          <br>heritage sites
        </p>
      </v-card>
    </div>

    <!-- Map container -->
    <div id="map-view" style="height: 100%; width: 100%;" />

    <div
      v-if="loading"
      style="position: absolute; inset: 0; background: rgba(255,248,240,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000;"
    >
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
      <p class="text-body-2" style="color: #78614A;">Loading {{ loadingMessage }}</p>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 1000; min-width: 300px;"
    >
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { CATEGORIES, formatCategory } from '@/utils/placeHelpers';

const router = useRouter();
const places = ref([]);
const loading = ref(false);
const loadingMessage = ref('places...');
const error = ref(null);
const selectedCategory = ref(null);
const filteredCount = ref(0);

let map = null;
let clusterGroup = null;

const MARKER_COLORS = {
  temple: '#FF6F00',
  fort: '#5D4037',
  cave: '#757575',
  ghat: '#1565C0',
  ashram: '#2E7D32',
  gurudwara: '#F9A825',
  sacred_river: '#00838F',
  ancient_site: '#6A1B9A',
  heritage_village: '#00695C',
  museum: '#283593',
  natural_sacred: '#558B2F',
  other: '#546E7A'
};

const createMarkerIcon = (category) => {
  const color = MARKER_COLORS[category] || '#546E7A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="20" height="30">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [20, 30],
    iconAnchor: [10, 30],
    popupAnchor: [0, -30]
  });
};

const createPopup = (place) => {
  const el = document.createElement('div');
  el.style.minWidth = '180px';
  el.innerHTML = `
    <strong style="font-size:14px;font-family:serif;">${place.name}</strong><br>
    <span style="font-size:12px;color:#B45309;">${formatCategory(place.category)}</span><br>
    <span style="font-size:12px;color:#666;">${place.city ? place.city + ', ' : ''}${place.state}</span><br>
  `;
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'View details →';
  link.style.cssText = 'font-size:12px;color:#B45309;display:inline-block;margin-top:6px;font-weight:500;';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    router.push(`/places/${place.id}`);
  });
  el.appendChild(link);
  return el;
};

const renderMarkers = (filterCategory = null) => {
  if (!map || !clusterGroup) return;

  clusterGroup.clearLayers();

  const toRender = filterCategory
    ? places.value.filter(p => p.category === filterCategory)
    : places.value;

  filteredCount.value = 0;

  toRender.forEach((place) => {
    if (place.latitude == null || place.longitude == null) return;
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const marker = L.marker([lat, lng], { icon: createMarkerIcon(place.category) });
    marker.bindPopup(createPopup(place));
    clusterGroup.addLayer(marker);
    filteredCount.value++;
  });
};

const applyFilter = () => {
  renderMarkers(selectedCategory.value || null);
};

const loadLeafletWithClustering = () => {
  return new Promise((resolve, reject) => {
    const loadScript = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

    const loadStyle = (href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    };

    if (window.L) {
      loadStyle('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
      loadStyle('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css');
      loadScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js')
        .then(resolve).catch(reject);
      return;
    }

    loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    loadStyle('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
    loadStyle('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css');

    loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
      .then(() => loadScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'))
      .then(resolve)
      .catch(reject);
  });
};

const initMap = () => {
  map = L.map('map-view', {
    center: [22.5937, 78.9629],
    zoom: 5,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // cluster group with custom styling matching our warm theme
  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      const size = count < 10 ? 36 : count < 100 ? 44 : 52;
      const color = count < 10 ? '#D97706' : count < 100 ? '#B45309' : '#92400E';
      return L.divIcon({
        html: `<div style="
          background: ${color};
          color: white;
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: ${count < 100 ? '14' : '12'}px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${count}</div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    }
  });

  map.addLayer(clusterGroup);
  renderMarkers();
};

const fetchAllPlaces = async () => {
  loading.value = true;
  loadingMessage.value = 'heritage sites...';
  error.value = null;

  try {
    // fetch all places in batches
    const firstResponse = await api.get('/places', { params: { limit: 500, page: 1 } });
    const { pagination } = firstResponse.data;
    places.value = firstResponse.data.places;

    loadingMessage.value = `${places.value.length} of ${pagination.total} places...`;

    // fetch remaining pages
    const totalPages = pagination.totalPages;
    for (let p = 2; p <= totalPages; p++) {
      const response = await api.get('/places', { params: { limit: 500, page: p } });
      places.value = [...places.value, ...response.data.places];
      loadingMessage.value = `${places.value.length} of ${pagination.total} places...`;
    }
  } catch (err) {
    console.error('Failed to fetch places for map', err);
    error.value = 'Failed to load places. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await loadLeafletWithClustering();
    await fetchAllPlaces();
    initMap();
  } catch (err) {
    console.error(err.message);
    error.value = 'Map failed to load. Please refresh the page.';
    loading.value = false;
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    clusterGroup = null;
  }
});
</script>