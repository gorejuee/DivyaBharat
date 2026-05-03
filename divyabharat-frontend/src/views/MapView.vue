<template>
  <v-container fluid class="pa-0" style="height: calc(100vh - 64px); position: relative;">

    <!-- Filters overlay -->
    <div style="position: absolute; top: 16px; left: 16px; z-index: 1000; min-width: 220px;">
      <v-card class="pa-3" elevation="3">
        <v-select
          v-model="selectedCategory"
          :items="CATEGORIES"
          :disabled="loading"
          label="Filter by category"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-2"
          @update:modelValue="filterPlaces"
        />
        <p class="text-caption text-grey mt-1">
          Showing {{ filteredPlaces.length }} of {{ places.length }} places
        </p>
      </v-card>
    </div>

    <!-- Map container -->
    <div id="map-view" style="height: 100%; width: 100%;" />

    <div
      v-if="loading"
      style="position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;"
    >
      <v-progress-circular indeterminate color="primary" size="64" />
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
const error = ref(null);
const selectedCategory = ref(null);

let map = null;
let markerLayer = null;

const filteredPlaces = computed(() => {
  if (!selectedCategory.value) return places.value;
  return places.value.filter(p => p.category === selectedCategory.value);
});

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
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

const renderMarkers = () => {
  if (!map) return;

  if (markerLayer) {
    markerLayer.clearLayers();
  } else {
    markerLayer = L.layerGroup().addTo(map);
  }

  filteredPlaces.value.forEach((place) => {
    if (place.latitude == null || place.longitude == null) return;

    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const marker = L.marker(
      [lat, lng],
      { icon: createMarkerIcon(place.category) }
    );

    const popupEl = document.createElement('div');
    popupEl.style.minWidth = '180px';
    popupEl.innerHTML = `
      <strong style="font-size:14px">${place.name}</strong><br>
      <span style="font-size:12px;color:#666">${formatCategory(place.category)}</span><br>
      <span style="font-size:12px;color:#666">${place.city ? place.city + ', ' : ''}${place.state}</span><br>
    `;

    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'View details →';
    link.style.cssText = 'font-size:12px;color:#1565C0;display:inline-block;margin-top:6px;';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(`/places/${place.id}`);
    });

    popupEl.appendChild(link);
    marker.bindPopup(popupEl);
    markerLayer.addLayer(marker);
  });
};

const filterPlaces = () => {
  renderMarkers();
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

  renderMarkers();
};

const fetchPlaces = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/places');
    places.value = response.data.places;
  } catch (err) {
    console.error('Failed to fetch places for map', err);
    error.value = 'Failed to load places. Please try again.';
  } finally {
    loading.value = false;
  }
};

const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet failed to load'));
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadLeaflet();
    await fetchPlaces();
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
    markerLayer = null;
  }
});
</script>