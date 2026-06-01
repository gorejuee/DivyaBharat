<template>
  <div class="yt-root">

    <!-- Page header -->
    <div class="yt-header">
      <p class="yt-eyebrow font-label">Sacred Journeys</p>
      <h1 class="yt-title font-display">My Yatra</h1>
      <p class="yt-sub font-body">Plan, record and relive your pilgrimages across India.</p>
    </div>

    <!-- AI Planner banner -->
    <div class="yt-ai-banner">
      <div class="yt-ai-content">

        <!-- Left: text + button -->
        <div class="yt-ai-left">
          <span class="yt-ai-badge font-label">
            <v-icon size="11" style="margin-right:5px;">mdi-creation</v-icon>
            AI Powered
          </span>
          <h2 class="yt-ai-title font-display">Plan with AI</h2>
          <p class="yt-ai-sub font-body">
            Tell our AI where you want to go and how many days you have. It builds a personalised day-by-day sacred itinerary just for you.
          </p>
          <button class="yt-ai-btn font-label" style="margin-top:16px;" @click="aiDialog = true">
            <v-icon size="15" style="margin-right:7px;">mdi-creation</v-icon>
            Generate Itinerary
          </button>
        </div>

        <!-- Right: Sacred Seal medallion -->
        <div class="yt-ai-seal" aria-hidden="true">
          <span class="yt-ai-seal-om">ॐ</span>
        </div>

      </div>
    </div>

    <!-- Stats strip (only when trips exist) -->
    <div v-if="trips.length" class="yt-stats-strip">
      <div class="yt-stat">
        <span class="yt-stat-num font-display">{{ trips.length }}</span>
        <span class="yt-stat-label font-label">Journeys</span>
      </div>
      <div class="yt-stat-divider" />
      <div class="yt-stat">
        <span class="yt-stat-num font-display">{{ totalDays }}</span>
        <span class="yt-stat-label font-label">Total Days</span>
      </div>
      <div class="yt-stat-divider" />
      <div class="yt-stat">
        <span class="yt-stat-num font-display">{{ totalStops }}</span>
        <span class="yt-stat-label font-label">Sacred Stops</span>
      </div>
    </div>

    <MandalaLine />

    <!-- Sacred Circuits -->
    <div class="yt-circuits">
      <div class="yt-section-head" style="margin-bottom:20px;">
        <h2 class="yt-section-title font-display">Sacred Circuits</h2>
        <p class="yt-circuits-sub font-body">Popular pilgrimage routes, click any to plan with AI</p>
      </div>
      <div class="yt-circuits-grid">
        <div
          v-for="route in FEATURED_ROUTES"
          :key="route.name"
          class="yt-route-card"
          :style="{ background: route.gradient }"
          @click="openAiWithRoute(route)"
        >
          <span class="yt-route-duration font-label">{{ route.duration }}</span>
          <h3 class="yt-route-name font-display">{{ route.name }}</h3>
          <p class="yt-route-tagline font-body">{{ route.tagline }}</p>
          <div class="yt-route-stops">
            <span v-for="stop in route.stops" :key="stop" class="yt-route-stop font-label">
              {{ stop }}
            </span>
          </div>
          <div class="yt-route-cta font-label">
            <v-icon size="13" style="margin-right:5px;">mdi-creation</v-icon>
            Plan with AI →
          </div>
        </div>
      </div>
    </div>

    <MandalaLine />

    <!-- Trips section -->
    <div class="yt-section">

      <div class="yt-section-head">
        <h2 class="yt-section-title font-display">Your Trips</h2>
        <button class="yt-new-btn font-label" @click="manualDialog = true">
          <v-icon size="13" style="margin-right:5px;">mdi-plus</v-icon>
          New Trip
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="yt-loading">
        <v-progress-circular indeterminate color="primary" size="40" width="2" />
        <p class="yt-loading-label font-label">Loading your journeys…</p>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="yt-empty">
        <v-icon size="48" style="color:var(--db-gold);opacity:0.3;">mdi-alert-circle-outline</v-icon>
        <p class="yt-empty-text font-body">Failed to load trips. Please refresh the page.</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!trips.length" class="yt-empty">
        <v-icon size="52" style="color:var(--db-gold);opacity:0.25;">mdi-map-marker-path</v-icon>
        <p class="yt-empty-text font-body">No journeys yet. Use the AI planner above to craft your first yatra.</p>
        <button class="yt-ai-btn font-label" style="margin-top:8px;" @click="aiDialog = true">
          <v-icon size="14" style="margin-right:6px;">mdi-creation</v-icon>
          Start Planning
        </button>
      </div>

      <!-- Trips grid -->
      <transition-group v-else name="card-stagger" tag="div" class="yt-grid">
        <div
          v-for="(trip, idx) in trips"
          :key="trip.id"
          class="yt-card"
          @click="router.push(`/trips/${trip.id}`)"
        >
          <!-- Accent bar per card -->
          <div class="yt-card-bar" :style="{ background: `linear-gradient(180deg, ${TRIP_ACCENTS[idx % TRIP_ACCENTS.length]} 0%, transparent 100%)` }" />
          <!-- Subtle card top-right glow from accent color -->
          <div class="yt-card-glow" :style="{ background: `radial-gradient(ellipse at top right, ${TRIP_ACCENTS[idx % TRIP_ACCENTS.length]}18 0%, transparent 65%)` }" />

          <div class="yt-card-body">
            <div class="yt-card-top">
              <h3 class="yt-card-name font-display">{{ trip.name }}</h3>
              <button
                class="yt-card-delete"
                @click.stop="confirmDelete(trip)"
                title="Delete trip"
              >
                <v-icon size="16">mdi-delete-outline</v-icon>
              </button>
            </div>

            <p v-if="trip.description" class="yt-card-desc font-body">{{ trip.description }}</p>

            <!-- Destination chips -->
            <div v-if="uniqueDestinations(trip).length" class="yt-card-dests">
              <span
                v-for="city in uniqueDestinations(trip)"
                :key="city"
                class="yt-dest-chip font-label"
                :style="{
                  color: TRIP_ACCENTS[idx % TRIP_ACCENTS.length],
                  borderColor: `${TRIP_ACCENTS[idx % TRIP_ACCENTS.length]}44`,
                  background: `${TRIP_ACCENTS[idx % TRIP_ACCENTS.length]}14`
                }"
              >{{ city }}</span>
            </div>

            <!-- Meta row -->
            <div class="yt-card-meta">
              <span v-if="trip.total_days" class="yt-meta-item font-label">
                <v-icon size="12" style="color:var(--db-gold);">mdi-calendar-range</v-icon>
                {{ trip.total_days }} day{{ trip.total_days !== 1 ? 's' : '' }}
              </span>
              <span class="yt-meta-item font-label">
                <v-icon size="12" style="color:var(--db-gold);">mdi-map-marker-multiple</v-icon>
                {{ trip.tripPlaces?.length ?? 0 }} stop{{ trip.tripPlaces?.length !== 1 ? 's' : '' }}
              </span>
              <span v-if="trip.start_date" class="yt-meta-item font-label">
                <v-icon size="12" style="color:var(--db-gold);">mdi-calendar</v-icon>
                {{ formatDate(trip.start_date) }}
              </span>
            </div>
          </div>

          <div class="yt-card-footer font-label">
            View journey &rarr;
          </div>
        </div>
      </transition-group>
    </div>

    <!-- AI Planner Dialog -->
    <v-dialog v-model="aiDialog" max-width="560" persistent>
      <div class="yt-dialog">
        <div class="yt-dialog-header">
          <div class="yt-dialog-icon">
            <v-icon size="20" style="color:var(--db-gold);">mdi-creation</v-icon>
          </div>
          <div>
            <h2 class="yt-dialog-title font-display">AI Trip Planner</h2>
            <p class="yt-dialog-sub font-label">Tell us where you want to go</p>
          </div>
        </div>

        <div class="yt-dialog-body">
          <v-text-field
            v-model="aiForm.destinations"
            label="Destinations *"
            placeholder="e.g. Varanasi, Prayagraj, Ayodhya"
            variant="outlined"
            color="primary"
            density="comfortable"
            hint="Enter one or more cities or regions"
            persistent-hint
            :error-messages="aiErrors.destinations"
            class="yt-field mb-4"
          />

          <div class="yt-field-row">
            <v-text-field
              v-model.number="aiForm.days"
              label="Number of days *"
              type="number"
              min="1"
              max="30"
              variant="outlined"
              color="primary"
              density="comfortable"
              :error-messages="aiErrors.days"
              class="yt-field"
            />
            <v-select
              v-model="aiForm.style"
              label="Travel style"
              :items="styleOptions"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="yt-field"
            />
          </div>

          <v-date-input
            :model-value="toDate(aiForm.start_date)"
            label="Start date (optional)"
            prepend-icon=""
            prepend-inner-icon="mdi-calendar-outline"
            hint="When do you plan to travel?"
            persistent-hint
            clearable
            variant="outlined"
            color="primary"
            density="comfortable"
            class="yt-field mb-3"
            @update:model-value="(v) => aiForm.start_date = toISO(v)"
          />

          <v-textarea
            v-model="aiForm.notes"
            label="Preferences (optional)"
            placeholder="e.g. focus on ghats and aarti ceremonies, avoid crowded places"
            variant="outlined"
            color="primary"
            density="comfortable"
            rows="2"
            auto-grow
            class="yt-field"
          />

          <div v-if="generating" class="yt-generating">
            <v-progress-linear indeterminate color="primary" rounded height="2" />
            <p class="yt-generating-label font-label">Crafting your personalised itinerary…</p>
          </div>
        </div>

        <div class="yt-dialog-footer">
          <button class="yt-dialog-cancel font-label" :disabled="generating" @click="closeAiDialog">
            Cancel
          </button>
          <button class="yt-dialog-confirm font-label" :disabled="generating" @click="doAiPlan">
            <v-icon v-if="!generating" size="14" style="margin-right:6px;">mdi-creation</v-icon>
            <v-progress-circular v-else indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Generate Itinerary
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Manual Trip Dialog -->
    <v-dialog v-model="manualDialog" max-width="480" persistent>
      <div class="yt-dialog">
        <div class="yt-dialog-header">
          <div class="yt-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-map-marker-path</v-icon>
          </div>
          <div>
            <h2 class="yt-dialog-title font-display">New Trip</h2>
            <p class="yt-dialog-sub font-label">Create a journey manually</p>
          </div>
        </div>

        <div class="yt-dialog-body">
          <v-text-field
            v-model="manualForm.name"
            label="Trip name *"
            variant="outlined"
            color="primary"
            density="comfortable"
            :error-messages="manualErrors.name"
            class="yt-field mb-3"
          />
          <v-textarea
            v-model="manualForm.description"
            label="Description (optional)"
            variant="outlined"
            color="primary"
            density="comfortable"
            rows="2"
            auto-grow
            class="yt-field mb-3"
          />
          <div class="yt-field-row">
            <v-text-field
              v-model.number="manualForm.total_days"
              label="Days"
              type="number"
              min="1"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="yt-field"
            />
            <v-date-input
              :model-value="toDate(manualForm.start_date)"
              label="Start date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-outline"
              clearable
              variant="outlined"
              color="primary"
              density="comfortable"
              class="yt-field"
              @update:model-value="(v) => manualForm.start_date = toISO(v)"
            />
          </div>
        </div>

        <div class="yt-dialog-footer">
          <button class="yt-dialog-cancel font-label" @click="manualDialog = false">Cancel</button>
          <button class="yt-dialog-confirm font-label" :disabled="manualSaving" @click="doManualCreate">
            <v-progress-circular v-if="manualSaving" indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Create Trip
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <div class="yt-dialog">
        <div class="yt-dialog-header">
          <div class="yt-dialog-icon" style="background:rgba(220,64,64,0.15);border-color:rgba(220,64,64,0.3);">
            <v-icon size="18" style="color:#F87171;">mdi-delete-outline</v-icon>
          </div>
          <div>
            <h2 class="yt-dialog-title font-display">Delete Trip</h2>
            <p class="yt-dialog-sub font-label">This cannot be undone</p>
          </div>
        </div>
        <div class="yt-dialog-body">
          <p class="font-body" style="color:var(--db-text-muted);margin:0;">
            Delete <strong style="color:var(--db-text);">{{ tripToDelete?.name }}</strong>?
            All stops and itinerary data will be permanently removed.
          </p>
        </div>
        <div class="yt-dialog-footer">
          <button class="yt-dialog-cancel font-label" @click="deleteDialog = false">Cancel</button>
          <button class="yt-dialog-danger font-label" :disabled="deleting" @click="doDelete">
            <v-progress-circular v-if="deleting" indeterminate size="14" width="2" color="white" style="margin-right:6px;" />
            Delete
          </button>
        </div>
      </div>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';

// Section divider (same as Home.vue MandalaLine)
const MandalaLine = defineComponent({
  render() {
    return h('div', { class: 'yt-mandala-row' }, [
      h('span', { class: 'yt-ml-rule yt-ml-rule--l' }),
      h('svg', { width: '36', height: '36', viewBox: '0 0 36 36', fill: 'none' }, [
        h('circle', { cx: '18', cy: '18', r: '16', stroke: 'rgba(200,134,30,0.32)', 'stroke-width': '0.6' }),
        h('circle', { cx: '18', cy: '18', r: '10', stroke: 'rgba(200,134,30,0.32)', 'stroke-width': '0.6' }),
        h('circle', { cx: '18', cy: '18', r: '4',  stroke: 'rgba(200,134,30,0.32)', 'stroke-width': '0.6' }),
        h('circle', { cx: '18', cy: '18', r: '1.8', fill: 'rgba(200,134,30,0.65)' }),
        h('line', { x1: '18', y1: '2',  x2: '18', y2: '34', stroke: 'rgba(200,134,30,0.18)', 'stroke-width': '0.5' }),
        h('line', { x1: '2',  y1: '18', x2: '34', y2: '18', stroke: 'rgba(200,134,30,0.18)', 'stroke-width': '0.5' }),
        h('line', { x1: '5',  y1: '5',  x2: '31', y2: '31', stroke: 'rgba(200,134,30,0.12)', 'stroke-width': '0.5' }),
        h('line', { x1: '31', y1: '5',  x2: '5',  y2: '31', stroke: 'rgba(200,134,30,0.12)', 'stroke-width': '0.5' }),
      ]),
      h('span', { class: 'yt-ml-rule yt-ml-rule--r' }),
    ]);
  }
});

const router = useRouter();
const tripsStore = useTripsStore();

const loading = ref(false);
const fetchError = ref(false);
const trips = computed(() => tripsStore.trips);

// Warm Indian palette, one per card
const TRIP_ACCENTS = ['#FF7043', '#C8861E', '#26A69A', '#5C6BC0', '#EC407A', '#66BB6A'];

const totalDays  = computed(() => trips.value.reduce((s, t) => s + (t.total_days || 0), 0));
const totalStops = computed(() => trips.value.reduce((s, t) => s + (t.tripPlaces?.length || 0), 0));

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

const aiDialog     = ref(false);
const generating   = ref(false);
const aiForm       = ref({ destinations: '', days: 5, style: 'Spiritual', notes: '', start_date: null });
const aiErrors     = ref({ destinations: '', days: '' });

const manualDialog  = ref(false);
const manualSaving  = ref(false);
const manualForm    = ref({ name: '', description: '', total_days: null, start_date: null });
const manualErrors  = ref({ name: '' });

const deleteDialog  = ref(false);
const deleting      = ref(false);
const tripToDelete  = ref(null);

const styleOptions = ['Spiritual', 'Heritage & History', 'Nature & Sacred', 'Mixed'];

const FEATURED_ROUTES = [
  {
    name: 'Char Dham Yatra',
    tagline: 'The four sacred abodes of the Himalayas',
    duration: '10–14 days',
    days: 12,
    style: 'Spiritual',
    destinations: 'Badrinath, Kedarnath, Gangotri, Yamunotri, Haridwar',
    stops: ['Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri'],
    gradient: 'linear-gradient(145deg, #7B2D00 0%, #C05A00 55%, #FF8C00 100%)'
  },
  {
    name: 'South India Circuit',
    tagline: 'Ancient temples of the sacred peninsula',
    duration: '8–12 days',
    days: 10,
    style: 'Spiritual',
    destinations: 'Tirupati, Madurai, Rameswaram, Kanyakumari, Chennai',
    stops: ['Tirupati', 'Madurai', 'Rameswaram', 'Kanyakumari'],
    gradient: 'linear-gradient(145deg, #0A3D2B 0%, #1A6B3C 55%, #27AE60 100%)'
  },
  {
    name: 'Rajasthan Heritage',
    tagline: 'Forts, palaces and desert temples',
    duration: '7–11 days',
    days: 9,
    style: 'Heritage & History',
    destinations: 'Jaipur, Jodhpur, Udaipur, Jaisalmer, Pushkar',
    stops: ['Jaipur', 'Jodhpur', 'Udaipur', 'Pushkar'],
    gradient: 'linear-gradient(145deg, #2D0A3A 0%, #5C1A7A 55%, #8E44AD 100%)'
  }
];

const openAiWithRoute = (route) => {
  aiForm.value.destinations = route.destinations;
  aiForm.value.days = route.days;
  aiForm.value.style = route.style;
  aiForm.value.notes = '';
  aiForm.value.start_date = null;
  aiDialog.value = true;
};

const formatDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const uniqueDestinations = (trip) => {
  if (!trip.tripPlaces?.length) return [];
  return [...new Set(trip.tripPlaces.map(s => s.destination_city).filter(Boolean))].slice(0, 4);
};

const closeAiDialog = () => {
  aiDialog.value = false;
  aiForm.value = { destinations: '', days: 5, style: 'Spiritual', notes: '', start_date: null };
  aiErrors.value = { destinations: '', days: '' };
};

const doAiPlan = async () => {
  aiErrors.value = { destinations: '', days: '' };
  if (!aiForm.value.destinations.trim()) {
    aiErrors.value.destinations = 'Please enter at least one destination.';
    return;
  }
  if (!aiForm.value.days || aiForm.value.days < 1 || aiForm.value.days > 30) {
    aiErrors.value.days = 'Enter a number between 1 and 30.';
    return;
  }
  generating.value = true;
  try {
    const result = await tripsStore.planWithAI({
      destinations: aiForm.value.destinations.trim(),
      days: aiForm.value.days,
      style: aiForm.value.style,
      notes: aiForm.value.notes.trim() || null,
      start_date: aiForm.value.start_date || null
    });
    closeAiDialog();
    router.push(`/trips/${result.tripId}`);
  } catch {
    aiErrors.value.destinations = 'AI generation failed. Please try again.';
  } finally {
    generating.value = false;
  }
};

const doManualCreate = async () => {
  manualErrors.value.name = '';
  if (!manualForm.value.name.trim()) {
    manualErrors.value.name = 'Trip name is required.';
    return;
  }
  manualSaving.value = true;
  try {
    const trip = await tripsStore.createTrip({
      name: manualForm.value.name.trim(),
      description: manualForm.value.description.trim() || null,
      total_days: manualForm.value.total_days || null,
      start_date: manualForm.value.start_date || null,
    });
    manualDialog.value = false;
    router.push(`/trips/${trip.id}`);
  } catch (err) {
    console.error('[MyTrips] Failed to create trip', err);
  } finally {
    manualSaving.value = false;
  }
};

const confirmDelete = (trip) => {
  tripToDelete.value = trip;
  deleteDialog.value = true;
};

const doDelete = async () => {
  deleting.value = true;
  try {
    await tripsStore.deleteTrip(tripToDelete.value.id);
    deleteDialog.value = false;
  } catch (err) {
    console.error('[MyTrips] Failed to delete trip', err);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await tripsStore.fetchTrips();
  } catch (err) {
    console.error('[MyTrips] Failed to fetch trips', err);
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Root */
.yt-root {
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
  color: var(--db-text);
  min-height: 100vh;
  padding: 40px clamp(20px, 5vw, 80px) 80px;
  max-width: 1120px;
  margin: 0 auto;
}

/* Page header */
.yt-header {
  margin-bottom: 40px;
}
.yt-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 0 0 10px;
}
.yt-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  color: var(--db-text);
  line-height: 1.1;
  margin: 0 0 10px;
}
.yt-sub {
  font-size: 1rem;
  color: var(--db-text-muted);
  margin: 0;
}

/* Stats strip */
.yt-stats-strip {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.18);
  border-radius: 14px;
  padding: 0;
  margin-bottom: 40px;
  overflow: hidden;
}
.yt-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
}
.yt-stat-num {
  font-size: 2rem;
  color: var(--db-gold);
  line-height: 1;
  margin-bottom: 5px;
}
.yt-stat-label {
  font-size: 0.62rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-text-muted);
}
.yt-stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(200,134,30,0.15);
  flex-shrink: 0;
}

/* AI Banner */
.yt-ai-banner {
  position: relative;
  background: linear-gradient(135deg, #1a0d04 0%, #271508 55%, #321c0a 100%);
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 18px;
  padding: 36px 40px;
  margin-bottom: 48px;
  overflow: hidden;
}

.yt-ai-content {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}
.yt-ai-left {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Sacred Seal medallion */
.yt-ai-seal {
  flex-shrink: 0;
  width: 162px;
  height: 162px;
  border-radius: 50%;
  border: 1px solid rgba(200,134,30,0.42);
  background: radial-gradient(circle, rgba(200,134,30,0.16) 0%, rgba(200,134,30,0.06) 55%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 0 6px rgba(200,134,30,0.05), 0 0 48px rgba(200,134,30,0.18);
}
.yt-ai-seal::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 1px solid rgba(200,134,30,0.22);
  pointer-events: none;
}
.yt-ai-seal-om {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 82px;
  line-height: 1;
  color: rgba(200,134,30,0.62);
  pointer-events: none;
  user-select: none;
}
.yt-ai-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.62rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-gold);
  border: 1px solid rgba(200,134,30,0.35);
  border-radius: 20px;
  padding: 4px 12px;
  margin-bottom: 10px;
}
.yt-ai-title {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: var(--db-text);
  margin: 0 0 8px;
  line-height: 1.1;
}
.yt-ai-sub {
  font-size: 0.92rem;
  color: rgba(237,227,206,0.7);
  line-height: 1.65;
  margin: 0;
}
.yt-ai-btn {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 12px 26px;
  border-radius: 24px;
  background: var(--db-gold);
  border: none;
  color: var(--db-bg);
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s, transform 0.15s;
}
.yt-ai-btn:hover {
  background: var(--db-gold-bright);
  transform: translateY(-1px);
}

/* MandalaLine divider - :deep() required so scoped styles reach inside the child component */
:deep(.yt-mandala-row) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 32px 0;
  width: 100%;
}
:deep(.yt-ml-rule) {
  flex: 1;
  max-width: 100px;
  height: 1px;
}
:deep(.yt-ml-rule--l) { background: linear-gradient(to right, transparent, rgba(200,134,30,0.32)); }
:deep(.yt-ml-rule--r) { background: linear-gradient(to left,  transparent, rgba(200,134,30,0.32)); }

/* Sacred Circuits */
.yt-circuits { margin-bottom: 48px; }
.yt-circuits-sub {
  font-size: 0.88rem;
  color: var(--db-text-muted);
  margin: 0;
}
.yt-circuits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.yt-route-card {
  border-radius: 16px;
  padding: 28px 24px 22px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.yt-route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 56px rgba(0,0,0,0.45);
}
.yt-route-duration {
  font-size: 0.6rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 12px;
  padding: 3px 10px;
  align-self: flex-start;
}
.yt-route-name {
  font-size: 1.5rem;
  color: #fff;
  line-height: 1.1;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.yt-route-tagline {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  margin: 0;
  line-height: 1.5;
}
.yt-route-stops {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.yt-route-stop {
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 3px 9px;
}
.yt-route-cta {
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
}

.yt-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.yt-section-title {
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  color: var(--db-text);
  margin: 0;
}
.yt-new-btn {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(200,134,30,0.35);
  color: var(--db-gold);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.yt-new-btn:hover {
  background: rgba(200,134,30,0.1);
  border-color: rgba(200,134,30,0.6);
}

/* Loading / empty */
.yt-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
}
.yt-loading-label {
  font-size: 0.68rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.65;
}
.yt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 64px 0;
  text-align: center;
}
.yt-empty-text {
  color: var(--db-text-muted);
  font-size: 0.95rem;
  max-width: 380px;
  margin: 0;
}

/* Trip grid */
.yt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

/* Trip card */
.yt-card {
  background: var(--db-surface);
  border: 1px solid var(--db-border);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: translate 0.12s ease, box-shadow 0.12s ease, border-color 0.2s ease;
}
.yt-card:hover {
  translate: 0 -4px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.45);
  border-color: rgba(200,134,30,0.35);
}
.yt-card-bar {
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 100%;
}
.yt-card-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 14px;
  z-index: 0;
}
.yt-card-body {
  padding: 20px 20px 14px 24px;
  flex: 1;
  position: relative;
  z-index: 1;
}
.yt-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.yt-card-name {
  font-size: 1.15rem;
  color: var(--db-text);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.yt-card-delete {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(248,113,113,0.45);
  flex-shrink: 0;
  padding: 2px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
}
.yt-card-delete:hover {
  color: #F87171;
  background: rgba(220,64,64,0.1);
}
.yt-card-desc {
  font-size: 0.85rem;
  color: var(--db-text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 12px;
}
.yt-card-dests {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.yt-dest-chip {
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.22);
  color: var(--db-gold);
}
.yt-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.yt-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: var(--db-text-muted);
}
.yt-card-footer {
  padding: 10px 20px 14px 24px;
  border-top: 1px solid var(--db-border);
  position: relative;
  z-index: 1;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  transition: color 0.2s;
}
.yt-card:hover .yt-card-footer { color: var(--db-text); }

/* Dialogs */
.yt-dialog {
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.2);
  border-radius: 18px;
  overflow: hidden;
}
.yt-dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px 20px;
  background: var(--db-surface-2);
  border-bottom: 1px solid rgba(200,134,30,0.12);
}
.yt-dialog-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.yt-dialog-title {
  font-size: 1.3rem;
  color: var(--db-text);
  margin: 0;
  line-height: 1.2;
}
.yt-dialog-sub {
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 4px 0 0;
}
.yt-dialog-body {
  padding: 24px 28px;
}
.yt-field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.yt-field-row .yt-field { flex: 1; min-width: 120px; }

/* Dark override for Vuetify fields inside dialogs */
.yt-field :deep(.v-field) {
  background: var(--db-surface-2) !important;
}
.yt-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}
.yt-field :deep(input),
.yt-field :deep(textarea) {
  color: var(--db-text) !important;
}
.yt-field :deep(.v-label) {
  color: var(--db-text-muted) !important;
}
.yt-field :deep(.v-messages__message) {
  color: rgba(248,113,113,0.9);
}

.yt-generating {
  background: rgba(200,134,30,0.06);
  border: 1px solid rgba(200,134,30,0.15);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}
.yt-generating-label {
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.7;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 0;
}

.yt-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px 22px;
  border-top: 1px solid rgba(200,134,30,0.1);
}
.yt-dialog-cancel {
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 9px 18px;
  border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(200,134,30,0.25);
  color: var(--db-text-muted);
  cursor: pointer;
  transition: background 0.2s;
}
.yt-dialog-cancel:hover:not(:disabled) { background: rgba(200,134,30,0.06); }
.yt-dialog-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

.yt-dialog-confirm {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 9px 22px;
  border-radius: 18px;
  background: var(--db-gold);
  border: none;
  color: var(--db-bg);
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}
.yt-dialog-confirm:hover:not(:disabled) { background: var(--db-gold-bright); }
.yt-dialog-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

.yt-dialog-danger {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 9px 22px;
  border-radius: 18px;
  background: rgba(220,64,64,0.85);
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}
.yt-dialog-danger:hover:not(:disabled) { background: #DC4040; }
.yt-dialog-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Transitions */
.card-stagger-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.card-stagger-enter-from   { opacity: 0; transform: translateY(12px); }
.card-stagger-leave-active { transition: opacity 0.2s ease; }
.card-stagger-leave-to     { opacity: 0; }
</style>
