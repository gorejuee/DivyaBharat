<template>
  <!-- Loading -->
  <div v-if="loading" class="td-loading">
    <v-progress-circular indeterminate color="primary" size="52" />
  </div>

  <!-- Not found -->
  <div v-else-if="!trip" class="td-notfound">
    <v-icon size="56" color="primary" style="opacity:0.25">mdi-map-off</v-icon>
    <p class="mt-3">Trip not found.</p>
    <v-btn color="primary" variant="tonal" class="mt-4" @click="router.push('/trips')">Back to My Trips</v-btn>
  </div>

  <!-- Main layout -->
  <div v-else class="td-root">

    <!-- ── FULL-HEIGHT MAP (background layer) ── -->
    <div class="td-map-layer">
      <div id="trip-map" ref="mapRef" class="td-map" />
    </div>

    <!-- ── FLOATING LEFT PANEL ── -->
    <div ref="panelRef" class="td-panel">

      <!-- Panel header -->
      <div class="td-panel-header">
        <button class="td-back" @click="router.push('/trips')">
          <v-icon size="16">mdi-arrow-left</v-icon>
          <span>My Trips</span>
        </button>

        <div class="td-trip-name-row">
          <h1 class="td-trip-name font-playfair">{{ trip.name }}</h1>
          <button class="td-icon-btn" @click="openEditTrip" title="Edit trip">
            <v-icon size="16">mdi-pencil-outline</v-icon>
          </button>
        </div>

        <p v-if="trip.description" class="td-trip-desc">{{ trip.description }}</p>

        <div class="td-meta-row">
          <span v-if="trip.total_days" class="td-meta-chip">
            <v-icon size="12">mdi-calendar-range</v-icon>
            {{ trip.total_days }} {{ trip.total_days === 1 ? 'day' : 'days' }}
          </span>
          <span class="td-meta-chip">
            <v-icon size="12">mdi-map-marker-multiple</v-icon>
            {{ trip.tripPlaces?.length ?? 0 }} stops
          </span>
          <span v-if="trip.start_date" class="td-meta-chip">
            <v-icon size="12">mdi-calendar</v-icon>
            {{ formatDate(trip.start_date) }}
          </span>
        </div>

        <button class="td-add-stop-btn" @click="addStopDialog = true">
          <v-icon size="16">mdi-plus</v-icon>
          Add Stop
        </button>
      </div>

      <!-- Panel scroll area: itinerary -->
      <div class="td-panel-scroll" ref="scrollRef">

        <div v-if="!groupedDays.length" class="td-empty">
          <v-icon size="40" color="primary" style="opacity:0.2">mdi-map-marker-plus-outline</v-icon>
          <p class="mt-2">No stops yet.</p>
        </div>

        <div v-for="day in groupedDays" :key="day.day_number" class="td-day">

          <!-- Day label -->
          <div class="td-day-label">
            <span class="td-day-badge">Day {{ day.day_number }}</span>
            <span class="td-day-city">{{ day.primaryCity }}</span>
          </div>

          <!-- Stops -->
          <div
            v-for="(stop, idx) in day.stops"
            :key="stop.id"
            class="td-stop"
            :class="{ 'td-stop--active': hoveredStop === stop.id }"
            @mouseenter="onStopHover(stop)"
            @mouseleave="hoveredStop = null"
          >
            <!-- Timeline spine -->
            <div class="td-stop-spine">
              <div class="td-stop-num">{{ globalIndex(day.day_number, idx) }}</div>
              <div v-if="idx < day.stops.length - 1" class="td-stop-line" />
            </div>

            <!-- Stop card -->
            <div class="td-stop-card">
              <div class="td-stop-top">
                <div class="td-stop-info">
                  <p class="td-stop-name">{{ stop.destination_name }}</p>
                  <p v-if="stop.destination_city || stop.destination_state" class="td-stop-loc">
                    {{ [stop.destination_city, stop.destination_state].filter(Boolean).join(', ') }}
                  </p>
                </div>
                <div class="td-stop-right">
                  <span v-if="stop.duration_hours" class="td-duration">{{ stop.duration_hours }}h</span>
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <button v-bind="props" class="td-icon-btn td-stop-menu-btn">
                        <v-icon size="15">mdi-dots-vertical</v-icon>
                      </button>
                    </template>
                    <v-list density="compact" rounded="lg" min-width="150" elevation="4">
                      <v-list-item v-if="idx > 0" prepend-icon="mdi-arrow-up" title="Move up" :disabled="reordering !== null" @click="moveStop(day, idx, -1)" />
                      <v-list-item v-if="idx < day.stops.length - 1" prepend-icon="mdi-arrow-down" title="Move down" :disabled="reordering !== null" @click="moveStop(day, idx, 1)" />
                      <v-list-item prepend-icon="mdi-pencil-outline" title="Edit" @click="openEditStop(stop)" />
                      <v-divider />
                      <v-list-item prepend-icon="mdi-delete-outline" title="Delete" base-color="error" @click="doRemoveStop(stop)" />
                    </v-list>
                  </v-menu>
                </div>
              </div>
              <p v-if="stop.notes" class="td-stop-notes">{{ stop.notes }}</p>
            </div>
          </div>

        </div>

        <!-- Bottom padding so last stop isn't hidden by panel shadow -->
        <div style="height: 32px;" />
      </div>
    </div>

    <!-- ── DIALOGS ── -->

    <!-- Edit Trip -->
    <v-dialog v-model="editTripDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 font-playfair" style="color:#2C1810;font-size:1.2rem;">Edit Trip</v-card-title>
        <v-card-text class="pa-6 pt-3">
          <v-text-field v-model="editTripForm.name" label="Trip name *" variant="outlined" color="primary" density="comfortable" :error-messages="editTripErrors.name" class="mb-3" />
          <v-textarea v-model="editTripForm.description" label="Description" variant="outlined" color="primary" density="comfortable" rows="2" auto-grow class="mb-3" />
          <v-row dense>
            <v-col cols="4">
              <v-text-field v-model.number="editTripForm.total_days" label="Days" type="number" min="1" variant="outlined" color="primary" density="comfortable" />
            </v-col>
            <v-col cols="4">
              <v-date-input :model-value="toDate(editTripForm.start_date)" label="Start" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" @update:model-value="(v) => editTripForm.start_date = toISO(v)" />
            </v-col>
            <v-col cols="4">
              <v-date-input :model-value="toDate(editTripForm.end_date)" label="End" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" @update:model-value="(v) => editTripForm.end_date = toISO(v)" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="editTripDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="editTripSaving" @click="saveEditTrip">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Stop -->
    <v-dialog v-model="addStopDialog" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 font-playfair" style="color:#2C1810;font-size:1.2rem;">Add Stop</v-card-title>
        <v-card-text class="pa-6 pt-3">
          <v-text-field
            v-model="stopForm.destination_name"
            label="Place name *"
            placeholder="e.g. Kashi Vishwanath Temple"
            prepend-inner-icon="mdi-map-marker-outline"
            variant="outlined"
            color="primary"
            density="comfortable"
            :loading="placeSearchLoading"
            :error-messages="stopErrors.destination_name"
            class="mb-1"
            @update:model-value="onNameInput"
          />
          <v-list v-if="placeSearchResults.length" class="search-suggestions mb-3" density="compact">
            <v-list-item v-for="p in placeSearchResults" :key="p.id" :title="p.name" :subtitle="[p.city, p.state].filter(Boolean).join(', ')" @click="selectFromDB(p)">
              <template #prepend><v-icon size="14" color="primary">mdi-map-marker</v-icon></template>
            </v-list-item>
          </v-list>
          <v-row dense class="mb-2">
            <v-col cols="4">
              <v-text-field v-model.number="stopForm.day_number" label="Day" type="number" min="1" variant="outlined" color="primary" density="comfortable" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number="stopForm.duration_hours" label="Hours" type="number" step="0.5" min="0.5" placeholder="2" variant="outlined" color="primary" density="comfortable" />
            </v-col>
            <v-col cols="4">
              <v-date-input :model-value="toDate(stopForm.visit_date)" label="Date" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" @update:model-value="(v) => stopForm.visit_date = toISO(v)" />
            </v-col>
          </v-row>
          <v-textarea v-model="stopForm.notes" label="Notes (optional)" placeholder="Best time to visit, what to see..." variant="outlined" color="primary" density="comfortable" rows="2" auto-grow />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="closeAddStop">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="stopSaving" @click="doAddStop">Add Stop</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Stop -->
    <v-dialog v-model="editStopDialog" max-width="440">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 font-playfair" style="color:#2C1810;font-size:1.2rem;">Edit Stop</v-card-title>
        <v-card-text class="pa-6 pt-3">
          <v-text-field v-model="editStopForm.destination_name" label="Place name *" variant="outlined" color="primary" density="comfortable" class="mb-3" />
          <v-row dense class="mb-1">
            <v-col cols="6"><v-text-field v-model="editStopForm.destination_city" label="City" variant="outlined" color="primary" density="comfortable" /></v-col>
            <v-col cols="6"><v-text-field v-model="editStopForm.destination_state" label="State" variant="outlined" color="primary" density="comfortable" /></v-col>
          </v-row>
          <v-row dense class="mb-3">
            <v-col cols="4"><v-text-field v-model.number="editStopForm.duration_hours" label="Hours" type="number" step="0.5" variant="outlined" color="primary" density="comfortable" /></v-col>
            <v-col cols="8">
              <v-date-input :model-value="toDate(editStopForm.visit_date)" label="Visit date" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" @update:model-value="(v) => editStopForm.visit_date = toISO(v)" />
            </v-col>
          </v-row>
          <v-textarea v-model="editStopForm.notes" label="Notes" variant="outlined" color="primary" density="comfortable" rows="2" auto-grow />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="editStopDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="editStopSaving" @click="saveEditStop">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const tripsStore = useTripsStore();

const loading = ref(true);
const hoveredStop = ref(null);
const scrollRef = ref(null);
const mapRef = ref(null);
const panelRef = ref(null);

const trip = computed(() => tripsStore.currentTrip);

// ── Grouped days ──────────────────────────────────────────────
const groupedDays = computed(() => {
  if (!trip.value?.tripPlaces?.length) return [];
  const map = {};
  for (const stop of trip.value.tripPlaces) {
    const d = stop.day_number || 1;
    if (!map[d]) map[d] = [];
    map[d].push(stop);
  }
  return Object.keys(map).map(Number).sort((a, b) => a - b).map(d => ({
    day_number: d,
    stops: map[d],
    primaryCity: map[d][0]?.destination_city || map[d][0]?.destination_state || ''
  }));
});

const toCoordNumber = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const getStopLatLng = (stop) => {
  const lat = toCoordNumber(stop.latitude);
  const lng = toCoordNumber(stop.longitude);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
};

const stopsWithCoords = computed(() =>
  (trip.value?.tripPlaces || []).filter((s) => !!getStopLatLng(s))
);

const globalIndex = (dayNum, idxInDay) => {
  let count = 0;
  for (const day of groupedDays.value) {
    if (day.day_number < dayNum) count += day.stops.length;
    else if (day.day_number === dayNum) return count + idxInDay + 1;
  }
  return idxInDay + 1;
};

const formatDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const toISO = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
};
const toDate = (iso) => iso ? new Date(iso + 'T00:00:00') : undefined;

// ── Stop hover → open popup on map ──────────────────────────
const onStopHover = (stop) => {
  hoveredStop.value = stop.id;
  if (!tripMap || !getStopLatLng(stop)) return;
  const marker = mapMarkers.find(m => m._stopId === stop.id);
  if (marker) marker.openPopup();
};

// ── Edit trip ────────────────────────────────────────────────
const editTripDialog = ref(false);
const editTripSaving = ref(false);
const editTripErrors = ref({ name: '' });
const editTripForm = ref({ name: '', description: '', total_days: null, start_date: null, end_date: null });

const openEditTrip = () => {
  editTripForm.value = {
    name: trip.value.name,
    description: trip.value.description || '',
    total_days: trip.value.total_days || null,
    start_date: trip.value.start_date || null,
    end_date: trip.value.end_date || null,
  };
  editTripErrors.value = { name: '' };
  editTripDialog.value = true;
};

const saveEditTrip = async () => {
  editTripErrors.value.name = '';
  if (!editTripForm.value.name.trim()) { editTripErrors.value.name = 'Trip name is required.'; return; }
  editTripSaving.value = true;
  try {
    await tripsStore.updateTrip(trip.value.id, {
      name: editTripForm.value.name.trim(),
      description: editTripForm.value.description?.trim() || null,
      total_days: editTripForm.value.total_days || null,
      start_date: editTripForm.value.start_date || null,
      end_date: editTripForm.value.end_date || null,
    });
    editTripDialog.value = false;
  } catch (err) {
    console.error('Failed to update trip', err);
  } finally {
    editTripSaving.value = false;
  }
};

// ── Add stop ────────────────────────────────────────────────
const addStopDialog = ref(false);
const stopSaving = ref(false);
const stopErrors = ref({ destination_name: '' });
const emptyStopForm = () => ({
  destination_name: '', destination_city: '', destination_state: '',
  latitude: null, longitude: null, place_id: null,
  day_number: 1, duration_hours: null, visit_date: null, notes: ''
});
const stopForm = ref(emptyStopForm());

const placeSearchResults = ref([]);
const placeSearchLoading = ref(false);
let nameDebounce = null;
let searchVer = 0;

const onNameInput = (q) => {
  clearTimeout(nameDebounce);
  placeSearchResults.value = [];
  if (!q || q.length < 2) return;
  const ver = ++searchVer;
  nameDebounce = setTimeout(async () => {
    placeSearchLoading.value = true;
    try {
      const res = await api.get('/places', { params: { search: q, limit: 6 } });
      if (ver === searchVer) placeSearchResults.value = res.data.places;
    } catch {
      if (ver === searchVer) placeSearchResults.value = [];
    } finally {
      if (ver === searchVer) placeSearchLoading.value = false;
    }
  }, 300);
};

const selectFromDB = (place) => {
  ++searchVer;
  clearTimeout(nameDebounce);
  placeSearchResults.value = [];
  placeSearchLoading.value = false;
  stopForm.value.destination_name = place.name;
  stopForm.value.destination_city = place.city || '';
  stopForm.value.destination_state = place.state || '';
  stopForm.value.latitude = place.latitude ? parseFloat(place.latitude) : null;
  stopForm.value.longitude = place.longitude ? parseFloat(place.longitude) : null;
  stopForm.value.place_id = place.id;
};

const closeAddStop = () => {
  ++searchVer;
  clearTimeout(nameDebounce);
  placeSearchLoading.value = false;
  placeSearchResults.value = [];
  addStopDialog.value = false;
  stopForm.value = emptyStopForm();
  stopErrors.value = { destination_name: '' };
};

const doAddStop = async () => {
  stopErrors.value.destination_name = '';
  if (!stopForm.value.destination_name.trim()) { stopErrors.value.destination_name = 'Place name is required.'; return; }
  stopSaving.value = true;
  try {
    await tripsStore.addStop(trip.value.id, {
      destination_name: stopForm.value.destination_name.trim(),
      destination_city: stopForm.value.destination_city?.trim() || null,
      destination_state: stopForm.value.destination_state?.trim() || null,
      latitude: stopForm.value.latitude || null,
      longitude: stopForm.value.longitude || null,
      place_id: stopForm.value.place_id || null,
      day_number: stopForm.value.day_number || 1,
      duration_hours: stopForm.value.duration_hours || null,
      visit_date: stopForm.value.visit_date || null,
      notes: stopForm.value.notes?.trim() || null,
    });
    closeAddStop();
    await nextTick();
    updateMap();
  } catch (err) {
    console.error('Failed to add stop', err);
  } finally {
    stopSaving.value = false;
  }
};

// ── Edit stop ────────────────────────────────────────────────
const editStopDialog = ref(false);
const editStopSaving = ref(false);
const editingStop = ref(null);
const editStopForm = ref({ destination_name: '', destination_city: '', destination_state: '', duration_hours: null, visit_date: null, notes: '' });

const openEditStop = (stop) => {
  editingStop.value = stop;
  editStopForm.value = {
    destination_name: stop.destination_name,
    destination_city: stop.destination_city || '',
    destination_state: stop.destination_state || '',
    duration_hours: stop.duration_hours || null,
    visit_date: stop.visit_date || null,
    notes: stop.notes || '',
  };
  editStopDialog.value = true;
};

const saveEditStop = async () => {
  editStopSaving.value = true;
  try {
    await tripsStore.updateStop(trip.value.id, editingStop.value.id, {
      destination_name: editStopForm.value.destination_name.trim(),
      destination_city: editStopForm.value.destination_city?.trim() || null,
      destination_state: editStopForm.value.destination_state?.trim() || null,
      duration_hours: editStopForm.value.duration_hours || null,
      visit_date: editStopForm.value.visit_date || null,
      notes: editStopForm.value.notes?.trim() || null,
    });
    editStopDialog.value = false;
    await nextTick();
    updateMap();
  } catch (err) {
    console.error('Failed to update stop', err);
  } finally {
    editStopSaving.value = false;
  }
};

// ── Remove stop ──────────────────────────────────────────────
const doRemoveStop = async (stop) => {
  try {
    await tripsStore.removeStop(trip.value.id, stop.id);
    await nextTick();
    updateMap();
  } catch (err) {
    console.error('Failed to remove stop', err);
  }
};

// ── Reorder ──────────────────────────────────────────────────
const reordering = ref(null);

const moveStop = async (day, idx, dir) => {
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= day.stops.length) return;
  const stopId = day.stops[idx].id;
  reordering.value = stopId + (dir === -1 ? '-up' : '-down');
  const newStops = [...day.stops];
  [newStops[idx], newStops[targetIdx]] = [newStops[targetIdx], newStops[idx]];
  const orderPayload = newStops.map((s, i) => ({ id: s.id, order: i, day_number: day.day_number }));
  try {
    await tripsStore.reorderStops(trip.value.id, orderPayload);
    await tripsStore.fetchTrip(trip.value.id);
  } catch (err) {
    console.error('Failed to reorder stops', err);
  } finally {
    reordering.value = null;
  }
};

// ── Leaflet map ──────────────────────────────────────────────
let tripMap = null;
let mapMarkers = [];
let mapPolyline = null;
let mapResizeObserver = null;
let mapStabilizeTimers = [];
let mapFitDone = false;
const ROUTE_ENTER_TRANSITION_MS = 280;

const DAY_COLOURS = ['#B45309', '#059669', '#7C3AED', '#0284C7', '#DC2626', '#D97706', '#0891B2'];
const dayColour = (dayNum) => DAY_COLOURS[(dayNum - 1) % DAY_COLOURS.length];

const loadLeaflet = () => new Promise((resolve) => {
  if (window.L) { resolve(); return; }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = resolve;
  document.head.appendChild(script);
});

const initMap = async () => {
  await loadLeaflet();
  const container = mapRef.value || document.getElementById('trip-map');
  if (!container || tripMap) return;

  tripMap = window.L.map(container, { zoomControl: false, scrollWheelZoom: true })
    .setView([22.5, 80], 5);

  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    updateWhenIdle: true,
    updateWhenZooming: false
  }).addTo(tripMap);

  window.L.control.zoom({ position: 'bottomright' }).addTo(tripMap);

  const ro = new ResizeObserver(() => {
    if (!tripMap) return;
    tripMap.invalidateSize({ animate: false, pan: false });
    if (!mapFitDone && container.clientHeight > 50) {
      mapFitDone = true;
      updateMap();
    }
  });
  ro.observe(container);
  mapResizeObserver = ro;
};

const clearMapStabilizeTimers = () => {
  mapStabilizeTimers.forEach(clearTimeout);
  mapStabilizeTimers = [];
};

const scheduleMapStabilization = () => {
  if (!tripMap) return;
  clearMapStabilizeTimers();
  [0, 120, 260, 420, 700].forEach((delay, idx) => {
    const t = setTimeout(() => {
      if (!tripMap) return;
      tripMap.invalidateSize({ animate: false, pan: false });
      if (!mapFitDone || idx === 4) {
        mapFitDone = true;
        updateMap();
      }
    }, delay);
    mapStabilizeTimers.push(t);
  });
};

const getFitPaddingTopLeft = () => {
  const panelRight = panelRef.value
    ? Math.ceil(panelRef.value.getBoundingClientRect().right + 24)
    : 420;
  const mapWidth = tripMap?.getSize()?.x || 0;
  if (!mapWidth) return [420, 60];
  const maxAllowed = Math.floor(mapWidth * 0.6);
  return [Math.max(60, Math.min(panelRight, maxAllowed)), 60];
};

const updateMap = () => {
  if (!tripMap || !window.L) return;
  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];
  if (mapPolyline) { mapPolyline.remove(); mapPolyline = null; }

  const stops = stopsWithCoords.value;
  if (!stops.length) return;

  const latlngs = [];
  let globalN = 0;

  for (const day of groupedDays.value) {
    const colour = dayColour(day.day_number);
    for (const stop of day.stops) {
      const ll = getStopLatLng(stop);
      if (!ll) continue;
      globalN++;
      latlngs.push(ll);

      const icon = window.L.divIcon({
        className: '',
        html: `<div style="
          width:30px;height:30px;border-radius:50%;
          background:${colour};border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:700;font-size:11px;
          box-shadow:0 3px 10px rgba(0,0,0,0.25);
          font-family:Inter,sans-serif;
          cursor:pointer;">${globalN}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const popup = `
        <div style="font-family:Inter,sans-serif;min-width:140px;">
          <strong style="color:#2C1810;font-size:13px;">${stop.destination_name}</strong>
          ${stop.destination_city || stop.destination_state
            ? `<p style="color:#78614A;font-size:11px;margin:3px 0 0;">${[stop.destination_city, stop.destination_state].filter(Boolean).join(', ')}</p>`
            : ''}
          ${stop.duration_hours ? `<p style="color:#B45309;font-size:11px;margin:3px 0 0;">${stop.duration_hours}h suggested</p>` : ''}
        </div>`;

      const marker = window.L.marker(ll, { icon })
        .addTo(tripMap)
        .bindPopup(popup, { offset: [0, -8], maxWidth: 200 });

      marker._stopId = stop.id;
      mapMarkers.push(marker);
    }
  }

  if (latlngs.length > 1) {
    mapPolyline = window.L.polyline(latlngs, {
      color: '#B45309', weight: 2, dashArray: '6 8', opacity: 0.55
    }).addTo(tripMap);
  }

  if (latlngs.length) {
    tripMap.fitBounds(window.L.latLngBounds(latlngs), {
      paddingTopLeft: getFitPaddingTopLeft(),
      paddingBottomRight: [60, 60],
      maxZoom: 12
    });
  }
};

watch(() => trip.value?.tripPlaces, () => {
  if (tripMap) {
    mapFitDone = false;
    scheduleMapStabilization();
  }
}, { deep: true });

onMounted(async () => {
  try {
    await tripsStore.fetchTrip(route.params.id);
  } catch (err) {
    console.error('Failed to fetch trip', err);
  } finally {
    loading.value = false;
  }
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, ROUTE_ENTER_TRANSITION_MS));
  requestAnimationFrame(() => {
    requestAnimationFrame(async () => {
      await initMap();
      scheduleMapStabilization();
    });
  });
});

onUnmounted(() => {
  if (mapResizeObserver) { mapResizeObserver.disconnect(); mapResizeObserver = null; }
  clearMapStabilizeTimers();
  mapMarkers = [];
  mapPolyline = null;
  mapFitDone = false;
  if (tripMap) {
    try { tripMap.remove(); } catch {}
    tripMap = null;
  }
});
</script>

<style scoped>
/* ── Root layout ──────────────────────────────────────────── */
.td-root {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
  background: #f0ebe3;
}

.td-loading,
.td-notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  font-family: 'Inter', sans-serif;
  color: #78614A;
  font-size: 0.9rem;
}

/* ── Map layer: full bleed behind everything ─────────────── */
.td-map-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.td-map {
  position: absolute;
  inset: 0;
}

/* ── Floating panel ──────────────────────────────────────── */
.td-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  width: 450px;
  z-index: 10;
  background: rgba(255, 252, 247, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(180, 83, 9, 0.12);
  box-shadow:
    0 4px 6px rgba(0,0,0,0.04),
    0 12px 40px rgba(44, 24, 16, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Panel header (fixed, doesn't scroll) ────────────────── */
.td-panel-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(180, 83, 9, 0.1);
  flex-shrink: 0;
}

.td-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: #B45309;
  padding: 0;
  margin-bottom: 12px;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.td-back:hover { opacity: 1; }

.td-trip-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.td-trip-name {
  font-size: 1.25rem;
  color: #2C1810;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
}

.td-trip-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #78614A;
  line-height: 1.5;
  margin-bottom: 10px;
}

.td-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.td-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: #78614A;
  background: rgba(180, 83, 9, 0.07);
  border-radius: 20px;
  padding: 3px 9px;
}

/* Add Stop button - full width, warm primary */
.td-add-stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px 0;
  border-radius: 10px;
  background: #B45309;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.td-add-stop-btn:hover { background: #92400E; }
.td-add-stop-btn:active { transform: scale(0.98); }

/* Small icon button used in header + stop rows */
.td-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #B45309;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.td-icon-btn:hover { background: rgba(180, 83, 9, 0.08); }

/* ── Panel scroll area ───────────────────────────────────── */
.td-panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 0;
  /* thin custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 83, 9, 0.2) transparent;
}
.td-panel-scroll::-webkit-scrollbar { width: 4px; }
.td-panel-scroll::-webkit-scrollbar-thumb { background: rgba(180, 83, 9, 0.2); border-radius: 4px; }

.td-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #78614A;
  text-align: center;
}

/* ── Day section ─────────────────────────────────────────── */
.td-day { margin-bottom: 20px; }

.td-day-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-left: 2px;
}

.td-day-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #fff;
  background: #2C1810;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
}

.td-day-city {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #78614A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Stop row ────────────────────────────────────────────── */
.td-stop {
  display: flex;
  gap: 10px;
  padding: 2px 0;
  border-radius: 10px;
  transition: background 0.15s;
}
.td-stop--active { background: rgba(180, 83, 9, 0.05); }

/* Left: number bubble + connector line */
.td-stop-spine {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}

.td-stop-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #B45309;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.td-stop-line {
  width: 1.5px;
  flex: 1;
  min-height: 16px;
  background: rgba(180, 83, 9, 0.18);
  margin: 4px 0;
}

/* Right: the actual card */
.td-stop-card {
  flex: 1;
  min-width: 0;
  padding: 4px 4px 12px 2px;
}

.td-stop-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.td-stop-info { flex: 1; min-width: 0; }

.td-stop-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2C1810;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.td-stop-loc {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #78614A;
  margin-top: 2px;
}

.td-stop-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.td-duration {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  color: #B45309;
  background: rgba(180, 83, 9, 0.1);
  border-radius: 6px;
  padding: 2px 6px;
}

.td-stop-menu-btn {
  width: 24px;
  height: 24px;
  color: #78614A;
}
.td-stop-menu-btn:hover { background: rgba(180, 83, 9, 0.08); color: #B45309; }

.td-stop-notes {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #78614A;
  line-height: 1.5;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── DB suggestions in Add Stop dialog ──────────────────── */
.search-suggestions {
  border: 1px solid rgba(180, 83, 9, 0.2);
  border-radius: 8px;
  background: #fff;
  max-height: 180px;
  overflow-y: auto;
  cursor: pointer;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .td-panel {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 55vh;
  }
  .td-root {
    height: calc(100vh - 56px);
  }
}
</style>
