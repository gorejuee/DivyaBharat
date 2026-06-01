<template>
  <div class="mv-root">

    <!-- Filter panel -->
    <div class="mv-panel">
      <div class="mv-panel-header">
        <p class="mv-panel-title font-display">Sacred Map</p>
        <p class="mv-panel-eyebrow font-label">Heritage of India</p>
      </div>

      <div class="mv-rule" />

      <p class="mv-section-label font-label">Filter by Category</p>

      <div class="mv-cats">
        <button
          class="mv-cat-item font-label"
          :class="{ 'mv-cat-item--active': !selectedCategory }"
          @click="selectedCategory = null; applyFilter()"
        >
          <span class="mv-cat-dot" style="background: var(--db-gold);" />
          All places
        </button>
        <button
          v-for="(color, cat) in MARKER_COLORS"
          :key="cat"
          class="mv-cat-item font-label"
          :class="{ 'mv-cat-item--active': selectedCategory === cat }"
          @click="selectedCategory = cat; applyFilter()"
        >
          <span class="mv-cat-dot" :style="{ background: color }" />
          {{ formatCategory(cat) }}
        </button>
      </div>

      <div class="mv-rule" />

      <div class="mv-count-block">
        <span class="mv-count-num font-display">{{ filteredCount.toLocaleString() }}</span>
        <span class="mv-count-label font-label">places shown</span>
      </div>
    </div>

    <!-- Stats badge (top-right) -->
    <div class="mv-stats">
      <span class="mv-stats-num font-display">{{ placesStore.places.length.toLocaleString() }}</span>
      <span class="mv-stats-label font-label">Heritage Sites</span>
    </div>

    <!-- Map container -->
    <div ref="mapRef" class="mv-map" />

    <!-- Loading overlay -->
    <div v-if="placesStore.loading" class="mv-loading">
      <svg class="mv-spinner" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="30" stroke="rgba(200,134,30,0.15)" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="30" stroke="var(--db-gold)" stroke-width="1.5"
          stroke-dasharray="48 144" stroke-linecap="round"/>
      </svg>
      <p class="mv-loading-label font-label">{{ placesStore.loadingMessage }}</p>
    </div>

    <!-- Error -->
    <div v-if="placesStore.error" class="mv-error font-body">{{ placesStore.error }}</div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { usePlacesStore } from '@/stores/places';
import { formatCategory } from '@/utils/placeHelpers';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const router = useRouter();
const placesStore = usePlacesStore();
const selectedCategory = ref(null);
const filteredCount = ref(0);
const mapRef = ref(null);

let map = null;
let markersLayer = null;
let isUnmounted = false;

const MARKER_COLORS = {
  temple:          '#FF6F00',
  fort:            '#8D6E63',
  cave:            '#90A4AE',
  ghat:            '#42A5F5',
  ashram:          '#66BB6A',
  gurudwara:       '#FFCA28',
  sacred_river:    '#26C6DA',
  ancient_site:    '#AB47BC',
  heritage_village:'#26A69A',
  museum:          '#5C6BC0',
  natural_sacred:  '#8BC34A',
  other:           '#78909C'
};

const createMarkerIcon = (category) => {
  const color = MARKER_COLORS[category] || '#78909C';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="22" height="33">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
      fill="${color}" stroke="rgba(200,134,30,0.75)" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5" fill="rgba(200,134,30,0.95)"/>
    <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [22, 33],
    iconAnchor: [11, 33],
    popupAnchor: [0, -35]
  });
};

const createPopup = (place) => {
  const el = document.createElement('div');
  el.style.minWidth = '170px';
  el.innerHTML = `
    <p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;color:#EDE3CE;margin:0 0 5px;line-height:1.2;">
      ${place.name}
    </p>
    <p style="font-family:'Rajdhani',sans-serif;font-size:0.62rem;letter-spacing:2px;text-transform:uppercase;color:#C8861E;margin:0 0 4px;">
      ${formatCategory(place.category)}
    </p>
    <p style="font-family:'Inter',sans-serif;font-size:0.82rem;color:#A08C72;margin:0 0 12px;">
      ${place.city ? place.city + ', ' : ''}${place.state}
    </p>
  `;
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'View details →';
  link.style.cssText = `
    font-family:'Rajdhani',sans-serif;
    font-size:0.68rem;
    letter-spacing:1.5px;
    text-transform:uppercase;
    color:#C8861E;
    text-decoration:none;
    border-bottom:1px solid rgba(200,134,30,0.4);
    padding-bottom:2px;
    transition:color 0.2s;
  `;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    router.push(`/places/${place.id}`);
  });
  el.appendChild(link);
  return el;
};

const renderMarkers = (filterCategory = null) => {
  if (!map || !markersLayer) return;
  markersLayer.clearLayers();
  const toRender = filterCategory
    ? placesStore.places.filter(p => p.category === filterCategory)
    : placesStore.places;
  filteredCount.value = 0;
  toRender.forEach((place) => {
    if (place.latitude == null || place.longitude == null) return;
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    const marker = L.marker([lat, lng], { icon: createMarkerIcon(place.category) });
    marker.bindPopup(createPopup(place), { className: 'db-popup', maxWidth: 240 });
    markersLayer.addLayer(marker);
    filteredCount.value++;
  });
};

const applyFilter = () => renderMarkers(selectedCategory.value || null);

const initMap = () => {
  if (!mapRef.value || map) return;
  if (mapRef.value._leaflet_id) mapRef.value._leaflet_id = null;

  map = L.map(mapRef.value, {
    center: [22.5937, 78.9629],
    zoom: 5,
    zoomControl: false,
    worldCopyJump: true
  });

  // Esri World Imagery - satellite aerial photography
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© <a href="https://www.esri.com" target="_blank">Esri</a>, Maxar, Earthstar Geographics',
    maxZoom: 18
  }).addTo(map);

  // Labels - full opacity
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: '',
    maxZoom: 18,
    opacity: 1
  }).addTo(map);

  // Zoom control - bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  if (typeof L.markerClusterGroup === 'function') {
    markersLayer = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 38 : count < 100 ? 46 : 54;
        const fontSize = count < 100 ? 15 : 12;
        return L.divIcon({
          html: `<div style="
            background: rgba(22,13,6,0.92);
            color: #C8861E;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 700;
            font-size: ${fontSize}px;
            border: 1.5px solid rgba(200,134,30,0.55);
            box-shadow: 0 0 0 5px rgba(200,134,30,0.1), 0 4px 20px rgba(0,0,0,0.5);
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });
      }
    });
  } else {
    markersLayer = L.layerGroup();
  }

  map.addLayer(markersLayer);
  renderMarkers();
};

onMounted(async () => {
  isUnmounted = false;
  try {
    const ok = await placesStore.fetchIfStale();
    if (!ok || isUnmounted) return;
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    initMap();
    if (!map || isUnmounted) return;
    map.invalidateSize({ animate: false, pan: false });
  } catch (err) {
    console.error('[MapView] Map init failed:', err);
  }
});

onUnmounted(() => {
  isUnmounted = true;
  if (map) { map.remove(); map = null; markersLayer = null; }
});
</script>

<style scoped>
/* ── Root - full screen, behind floating nav ── */
.mv-root {
  position: relative;
  height: 100vh;
  margin-top: -80px;
  background: var(--db-bg);
  overflow: hidden;
}

.mv-map {
  height: 100%;
  width: 100%;
}

/* ── Filter panel ── */
.mv-panel {
  position: absolute;
  top: 88px;
  left: 20px;
  z-index: 1000;
  width: 248px;
  background: rgba(9,6,10,0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(200,134,30,0.22);
  border-radius: 16px;
  padding: 18px 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
}
.mv-panel::-webkit-scrollbar { display: none; }

.mv-panel-header { margin-bottom: 2px; }
.mv-panel-title {
  font-size: 1.6rem;
  color: var(--db-text);
  margin: 0;
  line-height: 1.15;
}
.mv-panel-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 5px 0 0;
}

.mv-rule {
  height: 1px;
  background: rgba(200,134,30,0.18);
  margin: 14px 0;
}

.mv-section-label {
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-text);
  opacity: 0.65;
  margin: 0 0 10px;
}

.mv-cats {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.mv-cat-item {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
  color: rgba(237,227,206,0.78);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 8px;
  border-radius: 8px;
  text-align: left;
  width: 100%;
  transition: background 0.15s, color 0.15s;
}
.mv-cat-item:hover {
  background: rgba(200,134,30,0.08);
  color: var(--db-text);
}
.mv-cat-item--active {
  background: rgba(200,134,30,0.13);
  color: var(--db-gold);
}
.mv-cat-dot {
  display: block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mv-cat-count {
  margin-left: auto;
  font-size: 0.75rem;
  opacity: 0.55;
}

.mv-count-block {
  display: flex;
  flex-direction: column;
}
.mv-count-num {
  font-size: 1.8rem;
  color: var(--db-gold);
  line-height: 1.1;
}
.mv-count-label {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-text);
  opacity: 0.65;
  margin-top: 3px;
}

/* ── Stats badge ── */
.mv-stats {
  position: absolute;
  top: 88px;
  right: 20px;
  z-index: 1000;
  background: rgba(9,6,10,0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(200,134,30,0.22);
  border-radius: 14px;
  padding: 14px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.mv-stats-num {
  font-size: 2.1rem;
  color: var(--db-text);
  line-height: 1;
}
.mv-stats-label {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(237,227,206,0.72);
}

/* ── Loading ── */
.mv-loading {
  position: absolute;
  inset: 0;
  background: rgba(22,13,6,0.9);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  gap: 22px;
}
@keyframes mvSpin { to { transform: rotate(360deg); } }
.mv-spinner {
  width: 72px;
  height: 72px;
  animation: mvSpin 2.2s linear infinite;
}
.mv-loading-label {
  font-size: 0.78rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.85;
}

/* ── Error ── */
.mv-error {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(220,64,64,0.14);
  border: 1px solid rgba(220,64,64,0.35);
  color: #F87171;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  backdrop-filter: blur(12px);
  white-space: nowrap;
}
</style>

<!-- Non-scoped: override Leaflet popup to match dark theme -->
<style>
.db-popup .leaflet-popup-content-wrapper {
  background: #1A0E07;
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.6);
  padding: 0;
  color: #EDE3CE;
}
.db-popup .leaflet-popup-content {
  margin: 16px 18px;
  padding-right: 20px; /* keep title clear of the close button */
}
.db-popup .leaflet-popup-tip-container {
  display: none;
}
.db-popup .leaflet-popup-close-button {
  color: rgba(200,134,30,0.6) !important;
  font-size: 18px !important;
  top: 6px !important;
  right: 6px !important;
  width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 6px !important;
  line-height: 1 !important;
}
.db-popup .leaflet-popup-close-button:hover {
  color: #C8861E !important;
  background: rgba(200,134,30,0.1) !important;
}
/* Style Leaflet zoom control */
.leaflet-control-zoom a {
  background: rgba(9,6,10,0.88) !important;
  color: rgba(200,134,30,0.8) !important;
  border-color: rgba(200,134,30,0.2) !important;
  backdrop-filter: blur(12px);
}
.leaflet-control-zoom a:hover {
  background: rgba(200,134,30,0.15) !important;
  color: #C8861E !important;
}
/* Attribution bar */
.leaflet-control-attribution {
  background: rgba(9,6,10,0.7) !important;
  color: rgba(160,140,114,0.6) !important;
  font-size: 10px !important;
  backdrop-filter: blur(8px);
}
.leaflet-control-attribution a {
  color: rgba(200,134,30,0.6) !important;
}
</style>
