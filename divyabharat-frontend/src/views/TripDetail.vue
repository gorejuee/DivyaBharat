<template>
  <div>

  <!-- Loading -->
  <div v-if="loading" class="td-loading">
    <svg class="td-spinner" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" stroke="rgba(200,134,30,0.15)" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="30" stroke="var(--db-gold)" stroke-width="1.5"
        stroke-dasharray="48 144" stroke-linecap="round"/>
    </svg>
    <p class="td-loading-label font-label">Loading your journey...</p>
  </div>

  <!-- Not found -->
  <div v-else-if="!trip" class="td-notfound">
    <v-icon size="56" style="color:var(--db-gold);opacity:0.25;">mdi-map-off</v-icon>
    <p class="td-notfound-text font-body">Journey not found.</p>
    <button class="td-btn-outline font-label" @click="router.push('/trips')">
      <v-icon size="14" style="margin-right:6px;">mdi-arrow-left</v-icon>
      Back to My Yatra
    </button>
  </div>

  <!-- Main layout -->
  <div v-else class="td-root">

    <!-- Full-screen map -->
    <div class="td-map-layer">
      <div ref="mapRef" class="td-map" />
    </div>

    <!-- Floating left panel -->
    <div ref="panelRef" class="td-panel">

      <!-- Panel header -->
      <div class="td-panel-header">
        <button class="td-back font-label" @click="router.push('/trips')">
          <v-icon size="14" style="margin-right:4px;">mdi-arrow-left</v-icon>
          My Yatra
        </button>

        <div class="td-trip-name-row">
          <h1 class="td-trip-name font-display">{{ trip.name }}</h1>
          <button class="td-icon-btn" @click="openEditTrip" title="Edit trip">
            <v-icon size="15">mdi-pencil-outline</v-icon>
          </button>
        </div>

        <p v-if="trip.description" class="td-trip-desc font-body">{{ trip.description }}</p>

        <div class="td-meta-row">
          <span v-if="trip.total_days" class="td-meta-chip font-label">
            <v-icon size="11" style="margin-right:3px;color:var(--db-gold-bright);">mdi-calendar-range</v-icon>
            {{ trip.total_days }} {{ trip.total_days === 1 ? 'day' : 'days' }}
          </span>
          <span class="td-meta-chip font-label">
            <v-icon size="11" style="margin-right:3px;color:var(--db-gold-bright);">mdi-map-marker-multiple</v-icon>
            {{ trip.tripPlaces?.length ?? 0 }} stops
          </span>
          <span v-if="trip.start_date" class="td-meta-chip font-label">
            <v-icon size="11" style="margin-right:3px;color:var(--db-gold-bright);">mdi-calendar</v-icon>
            {{ formatDate(trip.start_date) }}
          </span>
        </div>

        <button class="td-add-stop-btn font-label" @click="addStopDialog = true">
          <v-icon size="14" style="margin-right:6px;">mdi-plus</v-icon>
          Add Stop
        </button>
      </div>

      <!-- Scroll area: itinerary -->
      <div class="td-panel-scroll">

        <div v-if="!groupedDays.length" class="td-empty">
          <v-icon size="40" style="color:var(--db-gold);opacity:0.2;">mdi-map-marker-plus-outline</v-icon>
          <p class="font-body" style="color:var(--db-text-muted);font-size:0.875rem;margin:10px 0 0;text-align:center;">
            No stops yet. Add your first sacred site.
          </p>
        </div>

        <div v-for="day in groupedDays" :key="day.day_number" class="td-day">

          <div class="td-day-label">
            <span class="td-day-badge font-label">Day {{ day.day_number }}</span>
            <span v-if="day.primaryCity" class="td-day-city font-label">{{ day.primaryCity }}</span>
          </div>

          <div
            v-for="(stop, idx) in day.stops"
            :key="stop.id"
            class="td-stop"
            :class="{ 'td-stop--active': hoveredStop === stop.id }"
            @mouseenter="onStopHover(stop)"
            @mouseleave="hoveredStop = null"
          >
            <div class="td-stop-spine">
              <div class="td-stop-num font-label" :style="{ background: dayColour(day.day_number) }">
                {{ globalIndex(day.day_number, idx) }}
              </div>
              <div v-if="idx < day.stops.length - 1" class="td-stop-line" />
            </div>

            <div class="td-stop-card">
              <div class="td-stop-top">
                <div class="td-stop-info">
                  <p class="td-stop-name font-body">{{ stop.destination_name }}</p>
                  <p v-if="stop.destination_city || stop.destination_state" class="td-stop-loc font-label">
                    {{ [stop.destination_city, stop.destination_state].filter(Boolean).join(', ') }}
                  </p>
                </div>
                <div class="td-stop-right">
                  <span v-if="stop.duration_hours" class="td-duration font-label">{{ stop.duration_hours }}h</span>
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <button v-bind="props" class="td-icon-btn td-stop-menu-btn">
                        <v-icon size="14">mdi-dots-vertical</v-icon>
                      </button>
                    </template>
                    <v-list class="td-ctx-menu" density="compact" rounded="lg" min-width="150" elevation="4">
                      <v-list-item v-if="idx > 0" prepend-icon="mdi-arrow-up" title="Move up" :disabled="reordering !== null" @click="moveStop(day, idx, -1)" />
                      <v-list-item v-if="idx < day.stops.length - 1" prepend-icon="mdi-arrow-down" title="Move down" :disabled="reordering !== null" @click="moveStop(day, idx, 1)" />
                      <v-list-item prepend-icon="mdi-pencil-outline" title="Edit" @click="openEditStop(stop)" />
                      <v-divider />
                      <v-list-item prepend-icon="mdi-delete-outline" title="Delete" base-color="error" @click="doRemoveStop(stop)" />
                    </v-list>
                  </v-menu>
                </div>
              </div>
              <div v-if="stop.notes" class="td-notes-wrap">
                <p class="td-stop-notes font-body" :class="{ 'td-stop-notes--expanded': expandedNotes.has(stop.id) }">{{ stop.notes }}</p>
                <button v-if="stop.notes.length > 120" class="td-notes-toggle font-label" @click.stop="toggleNote(stop.id)">
                  {{ expandedNotes.has(stop.id) ? 'Show less' : 'Read more' }}
                </button>
              </div>
            </div>
          </div>

        </div>

        <div style="height:24px;" />
      </div>
    </div>

    <!-- ── DIALOGS ── -->

    <!-- Edit Trip -->
    <v-dialog v-model="editTripDialog" max-width="480" persistent>
      <div class="td-dialog">
        <div class="td-dialog-header">
          <div class="td-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-pencil-outline</v-icon>
          </div>
          <div>
            <h2 class="td-dialog-title font-display">Edit Trip</h2>
            <p class="td-dialog-sub font-label">Update journey details</p>
          </div>
        </div>
        <div class="td-dialog-body">
          <v-text-field v-model="editTripForm.name" label="Trip name *" variant="outlined" color="primary" density="comfortable" :error-messages="editTripErrors.name" class="td-field mb-3" />
          <v-textarea v-model="editTripForm.description" label="Description" variant="outlined" color="primary" density="comfortable" rows="2" auto-grow class="td-field mb-3" />
          <div class="td-field-row">
            <v-text-field v-model.number="editTripForm.total_days" label="Days" type="number" min="1" variant="outlined" color="primary" density="comfortable" class="td-field" />
            <v-date-input :model-value="toDate(editTripForm.start_date)" label="Start date" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" class="td-field" @update:model-value="(v) => editTripForm.start_date = toISO(v)" />
          </div>
        </div>
        <div class="td-dialog-footer">
          <button class="td-dialog-cancel font-label" :disabled="editTripSaving" @click="editTripDialog = false">Cancel</button>
          <button class="td-dialog-confirm font-label" :disabled="editTripSaving" @click="saveEditTrip">
            <v-progress-circular v-if="editTripSaving" indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Save Changes
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Add Stop -->
    <v-dialog v-model="addStopDialog" max-width="460" persistent>
      <div class="td-dialog">
        <div class="td-dialog-header">
          <div class="td-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-map-marker-plus-outline</v-icon>
          </div>
          <div>
            <h2 class="td-dialog-title font-display">Add Stop</h2>
            <p class="td-dialog-sub font-label">Add a sacred site to your journey</p>
          </div>
        </div>
        <div class="td-dialog-body">
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
            class="td-field mb-1"
            @update:model-value="onNameInput"
          />
          <v-list v-if="placeSearchResults.length" class="td-search-list mb-3" density="compact">
            <v-list-item
              v-for="p in placeSearchResults"
              :key="p.id"
              :title="p.name"
              :subtitle="[p.city, p.state].filter(Boolean).join(', ')"
              @click="selectFromDB(p)"
            >
              <template #prepend>
                <v-icon size="13" style="color:var(--db-gold);">mdi-map-marker</v-icon>
              </template>
            </v-list-item>
          </v-list>
          <div class="td-field-row mb-3">
            <v-text-field v-model.number="stopForm.day_number" label="Day" type="number" min="1" variant="outlined" color="primary" density="comfortable" class="td-field" />
            <v-text-field v-model.number="stopForm.duration_hours" label="Hours" type="number" step="0.5" min="0.5" placeholder="2" variant="outlined" color="primary" density="comfortable" class="td-field" />
            <v-date-input :model-value="toDate(stopForm.visit_date)" label="Date" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" class="td-field" @update:model-value="(v) => stopForm.visit_date = toISO(v)" />
          </div>
          <v-textarea v-model="stopForm.notes" label="Notes (optional)" placeholder="Best time to visit, what to see..." variant="outlined" color="primary" density="comfortable" rows="2" auto-grow class="td-field" />
        </div>
        <div class="td-dialog-footer">
          <button class="td-dialog-cancel font-label" :disabled="stopSaving" @click="closeAddStop">Cancel</button>
          <button class="td-dialog-confirm font-label" :disabled="stopSaving" @click="doAddStop">
            <v-progress-circular v-if="stopSaving" indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Add Stop
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Edit Stop -->
    <v-dialog v-model="editStopDialog" max-width="440" persistent>
      <div class="td-dialog">
        <div class="td-dialog-header">
          <div class="td-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-pencil-outline</v-icon>
          </div>
          <div>
            <h2 class="td-dialog-title font-display">Edit Stop</h2>
            <p class="td-dialog-sub font-label">Update this sacred site</p>
          </div>
        </div>
        <div class="td-dialog-body">
          <v-text-field v-model="editStopForm.destination_name" label="Place name *" variant="outlined" color="primary" density="comfortable" class="td-field mb-3" />
          <div class="td-field-row mb-3">
            <v-text-field v-model="editStopForm.destination_city" label="City" variant="outlined" color="primary" density="comfortable" class="td-field" />
            <v-text-field v-model="editStopForm.destination_state" label="State" variant="outlined" color="primary" density="comfortable" class="td-field" />
          </div>
          <div class="td-field-row mb-3">
            <v-text-field v-model.number="editStopForm.duration_hours" label="Hours" type="number" step="0.5" variant="outlined" color="primary" density="comfortable" class="td-field" />
            <v-date-input :model-value="toDate(editStopForm.visit_date)" label="Visit date" prepend-icon="" prepend-inner-icon="mdi-calendar-outline" clearable variant="outlined" color="primary" density="comfortable" class="td-field" @update:model-value="(v) => editStopForm.visit_date = toISO(v)" />
          </div>
          <v-textarea v-model="editStopForm.notes" label="Notes" variant="outlined" color="primary" density="comfortable" rows="2" auto-grow class="td-field" />
        </div>
        <div class="td-dialog-footer">
          <button class="td-dialog-cancel font-label" :disabled="editStopSaving" @click="editStopDialog = false">Cancel</button>
          <button class="td-dialog-confirm font-label" :disabled="editStopSaving" @click="saveEditStop">
            <v-progress-circular v-if="editStopSaving" indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Save
          </button>
        </div>
      </div>
    </v-dialog>

  </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';
import api from '@/services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const router = useRouter();
const tripsStore = useTripsStore();

const loading = ref(true);
const hoveredStop = ref(null);
const mapRef = ref(null);
const panelRef = ref(null);
const expandedNotes = ref(new Set());

const toggleNote = (stopId) => {
  const s = new Set(expandedNotes.value);
  s.has(stopId) ? s.delete(stopId) : s.add(stopId);
  expandedNotes.value = s;
};

const trip = computed(() => tripsStore.currentTrip);

// ── Grouped days ──────────────────────────────────────────────
const groupedDays = computed(() => {
  if (!trip.value?.tripPlaces?.length) return [];
  const groups = {};
  for (const stop of trip.value.tripPlaces) {
    const d = stop.day_number || 1;
    if (!groups[d]) groups[d] = [];
    groups[d].push(stop);
  }
  return Object.keys(groups).map(Number).sort((a, b) => a - b).map(d => ({
    day_number: d,
    stops: groups[d],
    primaryCity: groups[d][0]?.destination_city || groups[d][0]?.destination_state || ''
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

// ── Stop hover → open popup ──────────────────────────────────
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
  if (!stopForm.value.destination_name.trim()) {
    stopErrors.value.destination_name = 'Place name is required.';
    return;
  }
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

const DAY_COLOURS = ['#C8861E', '#26A69A', '#5C6BC0', '#EC407A', '#66BB6A', '#FF7043', '#AB47BC'];
const dayColour = (dayNum) => DAY_COLOURS[(dayNum - 1) % DAY_COLOURS.length];

const createStopIcon = (num, colour) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 30 42" width="30" height="42">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.8 13 25 13 25S26 22.8 26 13C26 5.8 20.2 0 13 0z"
      fill="${colour}" stroke="#fff" stroke-width="2"/>
    <circle cx="13" cy="13" r="5.5" fill="rgba(0,0,0,0.28)"/>
    <text x="13" y="17.5" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-weight="700" font-size="9.5">${num}</text>
  </svg>`;
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));">${svg}</div>`,
    className: '',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -44]
  });
};

const createPopupContent = (stop) => `
  <div style="min-width:200px;">
    <p style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:#EDE3CE;margin:0 0 6px;line-height:1.25;">${stop.destination_name}</p>
    ${stop.destination_city || stop.destination_state
      ? `<p style="font-family:'Rajdhani',sans-serif;font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;color:#EAA030;margin:0 0 5px;">${[stop.destination_city, stop.destination_state].filter(Boolean).join(', ')}</p>`
      : ''}
    ${stop.duration_hours ? `<p style="font-family:'Inter',sans-serif;font-size:0.84rem;color:rgba(218,205,182,0.95);margin:0;">${stop.duration_hours}h suggested visit</p>` : ''}
  </div>`;

const initMap = () => {
  const container = mapRef.value;
  if (!container || tripMap) return;

  tripMap = L.map(container, { zoomControl: false, scrollWheelZoom: true })
    .setView([22.5, 80], 5);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© <a href="https://www.esri.com" target="_blank">Esri</a>, Maxar',
    maxZoom: 18
  }).addTo(tripMap);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: '',
    maxZoom: 18,
    opacity: 1
  }).addTo(tripMap);

  L.control.zoom({ position: 'bottomright' }).addTo(tripMap);

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
  return [Math.max(60, Math.min(panelRight, Math.floor(mapWidth * 0.6))), 60];
};

const updateMap = () => {
  if (!tripMap) return;
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

      const marker = L.marker(ll, { icon: createStopIcon(globalN, colour) })
        .addTo(tripMap)
        .bindPopup(createPopupContent(stop), { className: 'db-popup', offset: [0, -4], maxWidth: 220 });

      marker._stopId = stop.id;
      mapMarkers.push(marker);
    }
  }

  if (latlngs.length > 1) {
    mapPolyline = L.polyline(latlngs, {
      color: '#EAA030',
      weight: 3,
      dashArray: '6 8',
      opacity: 1
    }).addTo(tripMap);
  }

  if (latlngs.length) {
    tripMap.fitBounds(L.latLngBounds(latlngs), {
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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initMap();
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
/* ── Root: full-screen behind nav (same as MapView) ── */
.td-root {
  position: relative;
  height: 100vh;
  margin-top: -80px;
  overflow: hidden;
  background: var(--db-bg);
}

/* ── Loading ── */
.td-loading {
  min-height: calc(100vh - 80px);
  background: var(--db-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
@keyframes tdSpin { to { transform: rotate(360deg); } }
.td-spinner {
  width: 64px;
  height: 64px;
  animation: tdSpin 2.2s linear infinite;
}
.td-loading-label {
  font-size: 0.72rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.8;
}

/* ── Not found ── */
.td-notfound {
  min-height: calc(100vh - 80px);
  background: var(--db-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.td-notfound-text {
  color: var(--db-text-muted);
  font-size: 0.95rem;
  margin: 0;
}
.td-btn-outline {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(200,134,30,0.35);
  color: var(--db-gold);
  cursor: pointer;
  transition: background 0.2s;
}
.td-btn-outline:hover { background: rgba(200,134,30,0.1); }

/* ── Map ── */
.td-map-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.td-map {
  position: absolute;
  inset: 0;
}

/* ── Floating panel ── */
.td-panel {
  position: absolute;
  top: 88px;
  left: 16px;
  bottom: 16px;
  width: 490px;
  z-index: 10;
  background: rgba(9,6,10,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Panel header ── */
.td-panel-header {
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(200,134,30,0.12);
  flex-shrink: 0;
}

.td-back {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  padding: 0;
  margin-bottom: 12px;
  transition: color 0.15s;
}
.td-back:hover { color: #fff; }

.td-trip-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.td-trip-name {
  font-size: 1.85rem;
  color: var(--db-text);
  line-height: 1.15;
  flex: 1;
  min-width: 0;
  margin: 0;
}

.td-trip-desc {
  font-size: 0.85rem;
  color: rgba(237,227,206,0.72);
  line-height: 1.6;
  margin: 0 0 12px;
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
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(237,227,206,0.9);
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.25);
  border-radius: 20px;
  padding: 4px 11px;
}

.td-add-stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 9px 0;
  border-radius: 10px;
  background: var(--db-gold);
  color: var(--db-bg);
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.td-add-stop-btn:hover { background: var(--db-gold-bright); }
.td-add-stop-btn:active { transform: scale(0.98); }

/* Icon button */
.td-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(200,134,30,0.55);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.td-icon-btn:hover { background: rgba(200,134,30,0.1); color: var(--db-gold); }

/* ── Scroll area ── */
.td-panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(200,134,30,0.22) transparent;
}
.td-panel-scroll::-webkit-scrollbar { width: 4px; }
.td-panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(200,134,30,0.22);
  border-radius: 4px;
}

/* Empty */
.td-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px;
}

/* ── Day group ── */
.td-day { margin-bottom: 18px; }

.td-day-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.td-day-badge {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-bg);
  background: var(--db-gold);
  padding: 4px 12px;
  border-radius: 20px;
  flex-shrink: 0;
}
.td-day-city {
  font-size: 0.78rem;
  letter-spacing: 0.3px;
  color: rgba(237,227,206,0.78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Stop row ── */
.td-stop {
  display: flex;
  gap: 10px;
  padding: 2px 0;
  border-radius: 10px;
  transition: background 0.15s;
}
.td-stop--active { background: rgba(200,134,30,0.06); }

.td-stop-spine {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
}
.td-stop-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.td-stop-line {
  width: 1.5px;
  flex: 1;
  min-height: 14px;
  background: rgba(200,134,30,0.2);
  margin: 4px 0;
}

.td-stop-card {
  flex: 1;
  min-width: 0;
  padding: 2px 4px 14px 2px;
}
.td-stop-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}
.td-stop-info { flex: 1; min-width: 0; }
.td-stop-name {
  font-size: 0.97rem;
  font-weight: 600;
  color: var(--db-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin: 0;
}
.td-stop-loc {
  font-size: 0.78rem;
  letter-spacing: 0.2px;
  color: rgba(237,227,206,0.72);
  margin-top: 3px;
}
.td-stop-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.td-duration {
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.14);
  border: 1px solid rgba(200,134,30,0.35);
  border-radius: 6px;
  padding: 3px 9px;
}
.td-stop-menu-btn {
  width: 26px;
  height: 26px;
  color: rgba(237,227,206,0.72);
}
.td-notes-wrap { margin: 5px 0 0; }

.td-stop-notes {
  font-size: 0.82rem;
  color: rgba(237,227,206,0.65);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.td-stop-notes--expanded {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.td-notes-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--db-gold);
  padding: 4px 0 0;
  display: block;
  transition: color 0.15s;
}
.td-notes-toggle:hover { color: var(--db-gold-bright); }

/* ── Dialogs ── */
.td-dialog {
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.2);
  border-radius: 18px;
  overflow: hidden;
}
.td-dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 26px 18px;
  background: var(--db-surface-2);
  border-bottom: 1px solid rgba(200,134,30,0.12);
}
.td-dialog-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.td-dialog-title {
  font-size: 1.25rem;
  color: var(--db-text);
  margin: 0;
  line-height: 1.2;
}
.td-dialog-sub {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  margin: 4px 0 0;
}
.td-dialog-body { padding: 22px 26px; }

.td-field-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.td-field-row .td-field { flex: 1; min-width: 100px; }

/* Vuetify dark field overrides */
.td-field :deep(.v-field) { background: var(--db-surface-2) !important; }
.td-field :deep(.v-field__outline) { --v-field-border-opacity: 0.3; }
.td-field :deep(input),
.td-field :deep(textarea) { color: var(--db-text) !important; }
.td-field :deep(.v-label) { color: var(--db-text-muted) !important; }
.td-field :deep(.v-messages__message) { color: rgba(248,113,113,0.9); }

.td-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 26px 20px;
  border-top: 1px solid rgba(200,134,30,0.1);
}
.td-dialog-cancel {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(200,134,30,0.25);
  color: var(--db-text-muted);
  cursor: pointer;
  transition: background 0.2s;
}
.td-dialog-cancel:hover:not(:disabled) { background: rgba(200,134,30,0.06); }
.td-dialog-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

.td-dialog-confirm {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 20px;
  border-radius: 18px;
  background: var(--db-gold);
  border: none;
  color: var(--db-bg);
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}
.td-dialog-confirm:hover:not(:disabled) { background: var(--db-gold-bright); }
.td-dialog-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* Search suggestions */
.td-search-list {
  background: var(--db-surface-2) !important;
  border: 1px solid rgba(200,134,30,0.2) !important;
  border-radius: 10px !important;
  max-height: 180px;
  overflow-y: auto;
}
.td-search-list :deep(.v-list-item) { color: var(--db-text); }
.td-search-list :deep(.v-list-item:hover) { background: rgba(200,134,30,0.08) !important; }
.td-search-list :deep(.v-list-item__content .v-list-item-subtitle) { color: var(--db-text-muted) !important; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .td-panel {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 55vh;
  }
}
</style>

<!-- Non-scoped: Leaflet popup dark theme + context menu -->
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
  margin: 16px 20px;
  padding-right: 22px;
}
.db-popup .leaflet-popup-tip-container { display: none; }
.db-popup .leaflet-popup-close-button {
  color: rgba(200,134,30,0.6) !important;
  font-size: 16px !important;
  top: 6px !important;
  right: 6px !important;
  width: 26px !important;
  height: 26px !important;
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

/* Dark context menu for stop actions */
.td-ctx-menu {
  background: rgba(22,13,6,0.98) !important;
  border: 1px solid rgba(200,134,30,0.22) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
}
.td-ctx-menu .v-list-item { color: rgba(237,227,206,0.82) !important; }
.td-ctx-menu .v-list-item:hover { background: rgba(200,134,30,0.1) !important; }
.td-ctx-menu .v-list-item .v-icon { color: rgba(200,134,30,0.7) !important; }
.td-ctx-menu .v-divider { border-color: rgba(200,134,30,0.15) !important; }
</style>
