<template>
  <v-container class="py-8 page-container">

    <!-- Header -->
    <div class="mb-8">
      <p class="page-eyebrow">Your journeys</p>
      <h1 class="font-playfair page-title">My Trips</h1>
      <p class="page-sub mt-2">Plan and organise your sacred journeys across India.</p>
    </div>

    <!-- AI Planner CTA -->
    <v-card class="ai-cta-card mb-8" rounded="xl" elevation="0">
      <v-card-text class="pa-6">
        <div class="d-flex align-center flex-wrap ga-4">
          <div class="ai-cta-icon">
            <v-icon size="32" color="white">mdi-creation</v-icon>
          </div>
          <div class="flex-grow-1">
            <h2 class="font-playfair ai-cta-title">Plan with AI</h2>
            <p class="ai-cta-sub mt-1">
              Describe where you want to go and how many days you have. Our AI will craft a
              day-by-day spiritual itinerary across any city in India - temples, ghats, forts and more.
            </p>
          </div>
          <v-btn
            color="white"
            variant="flat"
            size="large"
            prepend-icon="mdi-creation"
            class="ai-cta-btn"
            @click="aiDialog = true"
          >
            Generate Itinerary
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Trips list -->
    <div class="d-flex align-center justify-space-between mb-5">
      <h2 class="font-playfair section-title">Your Trips</h2>
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="manualDialog = true"
      >
        New Trip
      </v-btn>
    </div>

    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="d-block mx-auto my-10"
    />

    <div v-else-if="fetchError" class="empty-state">
      <v-icon size="56" color="error" style="opacity: 0.4;">mdi-alert-circle-outline</v-icon>
      <p class="mt-3">Failed to load trips. Please refresh the page.</p>
    </div>

    <div v-else-if="!fetchError && !trips.length" class="empty-state">
      <v-icon size="56" color="primary" style="opacity: 0.25;">mdi-map-search-outline</v-icon>
      <p class="mt-3">No trips yet. Use the AI planner above to create your first journey.</p>
    </div>

    <transition-group v-else name="card-stagger" tag="div" class="trips-grid">
      <v-card
        v-for="trip in trips"
        :key="trip.id"
        class="trip-card"
        rounded="lg"
        elevation="0"
        @click="router.push(`/trips/${trip.id}`)"
      >
        <div class="trip-card-bar" />
        <v-card-text class="pa-5">
          <div class="d-flex align-start justify-space-between">
            <div style="min-width: 0; flex: 1;">
              <h3 class="trip-card-name font-playfair">{{ trip.name }}</h3>
              <p v-if="trip.description" class="trip-card-desc mt-1">{{ trip.description }}</p>
            </div>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              class="ml-2 flex-shrink-0"
              @click.stop="confirmDelete(trip)"
            />
          </div>

          <!-- Destination pills -->
          <div v-if="uniqueDestinations(trip).length" class="d-flex flex-wrap ga-1 mt-3">
            <v-chip
              v-for="city in uniqueDestinations(trip)"
              :key="city"
              size="x-small"
              variant="tonal"
              color="primary"
            >
              {{ city }}
            </v-chip>
          </div>

          <div class="d-flex align-center flex-wrap ga-3 mt-3">
            <span v-if="trip.total_days" class="trip-meta">
              <v-icon size="14" color="primary">mdi-calendar-range</v-icon>
              {{ trip.total_days }} day{{ trip.total_days !== 1 ? 's' : '' }}
            </span>
            <span class="trip-meta">
              <v-icon size="14" color="primary">mdi-map-marker-multiple</v-icon>
              {{ trip.tripPlaces?.length ?? 0 }} stop{{ trip.tripPlaces?.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="trip.start_date" class="trip-meta">
              <v-icon size="14" color="primary">mdi-calendar</v-icon>
              {{ formatDate(trip.start_date) }}
            </span>
          </div>
        </v-card-text>
      </v-card>
    </transition-group>

    <!-- AI Planner Dialog -->
    <v-dialog v-model="aiDialog" max-width="560" persistent>
      <v-card rounded="xl">
        <div class="ai-dialog-header pa-6 pb-4">
          <div class="d-flex align-center ga-3">
            <div class="ai-dialog-icon">
              <v-icon size="22" color="white">mdi-creation</v-icon>
            </div>
            <div>
              <h2 class="font-playfair ai-dialog-title">AI Trip Planner</h2>
              <p class="ai-dialog-sub">Tell us where you want to go</p>
            </div>
          </div>
        </div>

        <v-card-text class="pa-6 pt-4">
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
            class="mb-4"
          />

          <v-row dense class="mb-2">
            <v-col cols="6">
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
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="aiForm.style"
                label="Travel style"
                :items="styleOptions"
                variant="outlined"
                color="primary"
                density="comfortable"
              />
            </v-col>
          </v-row>

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
            class="mb-3"
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
          />

          <!-- Generating state -->
          <div v-if="generating" class="generating-state mt-4">
            <v-progress-linear indeterminate color="primary" rounded />
            <p class="mt-3 text-center text-body-2" style="color: #78614A;">
              Our AI is crafting your personalised itinerary...
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" :disabled="generating" @click="closeAiDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-creation"
            :loading="generating"
            @click="doAiPlan"
          >
            Generate Itinerary
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Manual Trip Dialog -->
    <v-dialog v-model="manualDialog" max-width="480" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-2 font-playfair" style="color: #2C1810;">New Trip</v-card-title>
        <v-card-text class="pa-6 pt-3">
          <v-text-field
            v-model="manualForm.name"
            label="Trip name *"
            variant="outlined"
            color="primary"
            density="comfortable"
            :error-messages="manualErrors.name"
            class="mb-3"
          />
          <v-textarea
            v-model="manualForm.description"
            label="Description (optional)"
            variant="outlined"
            color="primary"
            density="comfortable"
            rows="2"
            auto-grow
            class="mb-3"
          />
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="manualForm.total_days"
                label="Days"
                type="number"
                min="1"
                variant="outlined"
                color="primary"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-date-input
                :model-value="toDate(manualForm.start_date)"
                label="Start date"
                prepend-icon=""
                prepend-inner-icon="mdi-calendar-outline"
                clearable
                variant="outlined"
                color="primary"
                density="comfortable"
                @update:model-value="(v) => manualForm.start_date = toISO(v)"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-date-input
                :model-value="toDate(manualForm.end_date)"
                label="End date"
                prepend-icon=""
                prepend-inner-icon="mdi-calendar-outline"
                clearable
                variant="outlined"
                color="primary"
                density="comfortable"
                @update:model-value="(v) => manualForm.end_date = toISO(v)"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="manualDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="manualSaving" @click="doManualCreate">
            Create Trip
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-2 font-playfair" style="color: #2C1810;">Delete Trip</v-card-title>
        <v-card-text class="pa-6 pt-0">
          Delete <strong>{{ tripToDelete?.name }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';

const router = useRouter();
const tripsStore = useTripsStore();

const loading = ref(false);
const fetchError = ref(false);
const trips = computed(() => tripsStore.trips);

// --- Date helpers ---
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

const aiDialog = ref(false);
const generating = ref(false);
const aiForm = ref({ destinations: '', days: 5, style: 'Spiritual', notes: '', start_date: null });
const aiErrors = ref({ destinations: '', days: '' });

const manualDialog = ref(false);
const manualSaving = ref(false);
const manualForm = ref({ name: '', description: '', total_days: null, start_date: null, end_date: null });
const manualErrors = ref({ name: '' });

const deleteDialog = ref(false);
const deleting = ref(false);
const tripToDelete = ref(null);

const styleOptions = ['Spiritual', 'Heritage & History', 'Nature & Sacred', 'Mixed'];

const formatDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const uniqueDestinations = (trip) => {
  if (!trip.tripPlaces?.length) return [];
  const cities = [...new Set(
    trip.tripPlaces
      .map(s => s.destination_city)
      .filter(Boolean)
  )];
  return cities.slice(0, 4);
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
  } catch (err) {
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
      end_date: manualForm.value.end_date || null,
    });
    manualDialog.value = false;
    router.push(`/trips/${trip.id}`);
  } catch (err) {
    console.error('Failed to create trip', err);
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
    console.error('Failed to delete trip', err);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await tripsStore.fetchTrips();
  } catch (err) {
    console.error('Failed to fetch trips', err);
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-container { max-width: 1100px; }

.page-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #B45309;
  margin-bottom: 4px;
}

.page-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  color: #2C1810;
  line-height: 1.2;
}

.page-sub {
  font-family: 'Inter', sans-serif;
  color: #78614A;
}

/* AI CTA */
.ai-cta-card {
  background: linear-gradient(135deg, #1C1209 0%, #3D2812 60%, #B45309 100%);
  border: none;
}

.ai-cta-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-cta-title {
  font-size: 1.3rem;
  color: #F59E0B;
}

.ai-cta-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.75);
  max-width: 480px;
}

.ai-cta-btn {
  color: #B45309 !important;
  font-weight: 600;
  flex-shrink: 0;
}

/* Section */
.section-title {
  font-size: 1.2rem;
  color: #2C1810;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #78614A;
}

/* Trip grid */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.trip-card {
  border: 1px solid rgba(180, 83, 9, 0.15);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.trip-card:hover {
  box-shadow: 0 6px 24px rgba(44, 24, 16, 0.1);
  transform: translateY(-2px);
}

.trip-card-bar {
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: linear-gradient(180deg, #B45309, #F59E0B);
}

.trip-card-name {
  font-size: 1.05rem;
  color: #2C1810;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #78614A;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trip-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #78614A;
}

/* AI Dialog */
.ai-dialog-header {
  background: linear-gradient(135deg, #1C1209, #3D2812);
  border-radius: 24px 24px 0 0;
}

.ai-dialog-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-dialog-title {
  font-size: 1.2rem;
  color: #F59E0B;
}

.ai-dialog-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.generating-state {
  background: rgba(180, 83, 9, 0.04);
  border-radius: 8px;
  padding: 16px;
}

/* Transitions */
.card-stagger-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.card-stagger-enter-from { opacity: 0; transform: translateY(12px); }
.card-stagger-leave-active { transition: opacity 0.2s ease; }
.card-stagger-leave-to { opacity: 0; }
</style>
