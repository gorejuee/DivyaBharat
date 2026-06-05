<template>
  <div class="mp-root">
    <div class="mp-inner">

      <!-- Header: two-column -->
      <div class="mp-page-header">
        <div class="mp-header-left">
          <p class="text-eyebrow">Your Journey</p>
          <h1 class="page-hd-title">My Visited Places</h1>
          <p class="text-page-sub">
            Sacred places you've walked, seen and felt. Every visit remembered.
          </p>
        </div>
        <div v-if="places.length" class="mp-header-right">
          <div class="mp-stats">
            <div class="mp-stat">
              <span class="mp-stat-n font-display">{{ places.length }}</span>
              <span class="mp-stat-label font-label">Places</span>
            </div>
            <div class="mp-stat-sep" />
            <div class="mp-stat">
              <span class="mp-stat-n font-display">{{ uniqueStates }}</span>
              <span class="mp-stat-label font-label">States</span>
            </div>
            <div class="mp-stat-sep" />
            <div class="mp-stat">
              <span class="mp-stat-n font-display">{{ uniqueCategories }}</span>
              <span class="mp-stat-label font-label">Categories</span>
            </div>
          </div>
        </div>
      </div>

      <MandalaLine />

      <!-- Loading -->
      <div v-if="loading" class="mp-state-center">
        <v-progress-circular indeterminate color="primary" size="36" width="2" />
        <p class="text-meta" style="margin:0;">Loading your places</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!places.length" class="mp-state-center">
        <div class="mp-empty-icon">
          <v-icon size="28" style="color:var(--db-gold);">mdi-map-marker-check</v-icon>
        </div>
        <h3 class="mp-empty-title font-display">No visited places yet</h3>
        <p class="text-page-sub" style="max-width:340px;margin:0 auto 20px;text-align:center;">
          Mark places as visited while exploring DivyaBharat and they will appear here.
        </p>
        <router-link to="/places" class="mp-explore-btn font-label">
          <v-icon size="13" style="margin-right:6px;">mdi-compass-outline</v-icon>
          Explore Places
        </router-link>
      </div>

      <!-- Grid -->
      <transition-group v-else name="card-stagger" tag="div" class="mp-grid">
        <div
          v-for="(place, idx) in places"
          :key="place.id"
          class="mp-card-wrap"
          :style="{ transitionDelay: `${idx * 30}ms` }"
        >
          <PlaceCard
            :place="place"
            :show-visited="true"
            @click="router.push(`/places/${place.id}`)"
          />

          <!-- Gradient overlay inside the card bounds: moves with the hover lift -->
          <div class="mp-overlay" @click.stop>
            <span v-if="place.UserPlace?.visit_date" class="mp-date-chip font-label">
              <v-icon size="9" style="margin-right:3px;color:var(--db-gold);">mdi-calendar-check-outline</v-icon>
              {{ formatDate(place.UserPlace.visit_date) }}
            </span>
            <span v-else />
            <div class="mp-overlay-btns">
              <button
                v-if="place.UserPlace?.notes"
                class="mp-overlay-btn"
                data-tip="Read note"
                @click.stop="openNote(place)"
              >
                <v-icon size="13">mdi-note-text-outline</v-icon>
              </button>
              <button
                class="mp-overlay-btn"
                data-tip="Visit details"
                @click.stop="openEdit(place)"
              >
                <v-icon size="13">mdi-pencil-outline</v-icon>
              </button>
            </div>
          </div>
        </div>
      </transition-group>

    </div>

    <!-- Note view dialog -->
    <v-dialog v-model="noteDialog.show" max-width="480">
      <div class="mp-dialog">
        <div class="mp-dialog-hd">
          <div class="mp-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-note-text-outline</v-icon>
          </div>
          <div style="flex:1;min-width:0;">
            <h2 class="mp-dialog-title font-display">Visit Note</h2>
            <p class="text-eyebrow" style="margin:0;">{{ noteDialog.place?.name }}</p>
          </div>
          <button class="mp-dialog-close" @click="noteDialog.show = false">
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>
        <div class="mp-note-body">
          <p v-if="noteDialog.place?.UserPlace?.visit_date" class="mp-note-date font-label">
            <v-icon size="11" style="margin-right:4px;color:var(--db-gold);">mdi-calendar-check-outline</v-icon>
            Visited {{ formatDate(noteDialog.place.UserPlace.visit_date) }}
          </p>
          <p class="mp-note-content font-body">{{ noteDialog.place?.UserPlace?.notes }}</p>
        </div>
        <div class="mp-dialog-ft">
          <button class="mp-cancel font-label" @click="noteDialog.show = false">Close</button>
          <button class="mp-save font-label" @click="switchToEdit">Edit</button>
        </div>
      </div>
    </v-dialog>

    <!-- Edit visit dialog -->
    <v-dialog v-model="editDialog.show" max-width="480" persistent>
      <div class="mp-dialog">
        <div class="mp-dialog-hd">
          <div class="mp-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-map-marker-check-outline</v-icon>
          </div>
          <div>
            <h2 class="mp-dialog-title font-display">Visit Details</h2>
            <p class="text-eyebrow" style="margin:0;">{{ editDialog.place?.name }}</p>
          </div>
        </div>
        <div class="mp-dialog-body">
          <div class="mp-dfield">
            <label class="mp-dlabel font-label">When did you visit?</label>
            <input
              v-model="editForm.visit_date"
              class="mp-dinput font-body"
              type="date"
              :max="todayStr"
            />
          </div>
          <div class="mp-dfield">
            <label class="mp-dlabel font-label">Your notes</label>
            <textarea
              v-model="editForm.notes"
              class="mp-dtextarea font-body"
              rows="5"
              placeholder="What was special about this place? What did you feel?"
            />
          </div>
        </div>
        <div class="mp-dialog-ft">
          <button class="mp-cancel font-label" :disabled="saving" @click="editDialog.show = false">Cancel</button>
          <button class="mp-save font-label" :disabled="saving" @click="saveVisit">
            <v-progress-circular v-if="saving" indeterminate size="13" width="2" color="white" style="margin-right:6px;" />
            Save
          </button>
        </div>
      </div>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import PlaceCard from '@/components/PlaceCard.vue';
import MandalaLine from '@/components/MandalaLine.vue';

const router = useRouter();
const places = ref([]);
const loading = ref(false);
const saving = ref(false);

const noteDialog = ref({ show: false, place: null });
const editDialog = ref({ show: false, place: null });
const editForm = ref({ visit_date: '', notes: '' });

const todayStr = new Date().toISOString().slice(0, 10);

const uniqueStates = computed(() => new Set(places.value.map(p => p.state)).size);
const uniqueCategories = computed(() => new Set(places.value.map(p => p.category)).size);

const formatDate = (d) => {
  if (!d) return '';
  const p = new Date(d + 'T00:00:00');
  if (isNaN(p)) return '';
  return p.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fetchVisitedPlaces = async () => {
  loading.value = true;
  try {
    const res = await api.get('/visits');
    places.value = res.data.places;
  } catch (err) {
    console.error('Failed to fetch visited places', err);
  } finally {
    loading.value = false;
  }
};

const openNote = (place) => { noteDialog.value = { show: true, place }; };

const switchToEdit = () => {
  const place = noteDialog.value.place;
  noteDialog.value.show = false;
  openEdit(place);
};

const openEdit = (place) => {
  editDialog.value = { show: true, place };
  editForm.value = {
    visit_date: place.UserPlace?.visit_date || '',
    notes: place.UserPlace?.notes || '',
  };
};

const saveVisit = async () => {
  saving.value = true;
  try {
    await api.patch(`/visits/${editDialog.value.place.id}`, {
      visit_date: editForm.value.visit_date || null,
      notes: editForm.value.notes?.trim() || null,
    });
    const idx = places.value.findIndex(p => p.id === editDialog.value.place.id);
    if (idx !== -1) {
      places.value[idx] = {
        ...places.value[idx],
        UserPlace: {
          ...places.value[idx].UserPlace,
          visit_date: editForm.value.visit_date || null,
          notes: editForm.value.notes?.trim() || null,
        },
      };
      if (noteDialog.value.place?.id === editDialog.value.place.id) {
        noteDialog.value.place = places.value[idx];
      }
    }
    editDialog.value.show = false;
  } catch (err) {
    console.error('Failed to save visit', err);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchVisitedPlaces);
</script>

<style scoped>
/* ── Root ────────────────────────────────────────── */
.mp-root {
  min-height: 100vh;
  margin-top: -80px;
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
}
.mp-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px clamp(20px, 4vw, 60px) 100px;
}

/* ── Header ──────────────────────────────────────── */
.mp-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 44px;
  flex-wrap: wrap;
}
.mp-header-left { flex: 1; min-width: 260px; }
.mp-header-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 0;
  flex-shrink: 0; padding-bottom: 2px;
}
.mp-stats { display: flex; align-items: center; gap: 24px; }
.mp-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.mp-stat-n { font-size: 2rem; font-weight: 600; color: var(--db-gold); line-height: 1; }
.mp-stat-sep { width: 1px; height: 30px; background: var(--db-border); }
.mp-stat-label {
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--db-text-muted);
}

/* ── States ──────────────────────────────────────── */
.mp-state-center {
  display: flex; flex-direction: column;
  align-items: center; gap: 16px;
  padding: 80px 0;
}
.mp-empty-icon {
  width: 64px; height: 64px; border-radius: 18px;
  background: rgba(200,134,30,0.07); border: 1px solid var(--db-border);
  display: flex; align-items: center; justify-content: center;
}
.mp-empty-title { font-size: 1.7rem; color: var(--db-text); margin: 0; }
.mp-explore-btn {
  display: inline-flex; align-items: center;
  padding: 10px 22px; border-radius: 10px;
  background: var(--db-gold); border: none;
  color: var(--db-bg); font-size: 0.75rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none;
  transition: background 0.2s;
}
.mp-explore-btn:hover { background: var(--db-gold-bright); }

/* ── Grid ────────────────────────────────────────── */
.mp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
}

/* ── Card wrap: takes over the hover lift from PlaceCard ── */
.mp-card-wrap {
  position: relative;
  border-radius: 12px;
  transition: translate 0.12s ease, box-shadow 0.12s ease;
}
.mp-card-wrap:hover {
  translate: 0 -6px;
  box-shadow: 0 24px 56px rgba(0,0,0,0.55);
}
/* Disable PlaceCard's own lift so it doesn't double-move */
.mp-card-wrap :deep(.place-card) {
  transition: box-shadow 0.12s ease, border-color 0.12s ease, transform 0.38s ease !important;
}
.mp-card-wrap :deep(.place-card):hover {
  translate: 0 !important;
  box-shadow: none !important;
}
.mp-card-wrap:hover :deep(.place-card) {
  border-color: rgba(200,134,30,0.3);
}

/* ── Overlay inside the image area only (188px tall) ── */
.mp-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 188px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 28px 10px 10px;
  background: linear-gradient(to top, rgba(16,9,4,0.85) 0%, transparent 55%);
  border-radius: 12px 12px 0 0;
  pointer-events: none;
}
.mp-date-chip {
  display: inline-flex; align-items: center;
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  color: var(--db-gold);
}
.mp-overlay-btns {
  display: flex; gap: 5px;
  pointer-events: auto;
}
.mp-overlay-btn {
  position: relative;
  background: rgba(16,9,4,0.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 7px; cursor: pointer;
  color: rgba(237,227,206,0.8);
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  pointer-events: auto;
}
.mp-overlay-btn:hover {
  background: rgba(200,134,30,0.22);
  border-color: rgba(200,134,30,0.55);
  color: var(--db-gold-bright);
}
/* Tooltip matching nav style, appears above the button */
.mp-overlay-btn::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--db-surface-2);
  color: var(--db-text);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  padding: 5px 11px;
  border-radius: 7px;
  border: 1px solid var(--db-border-strong);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
  z-index: 10;
}
.mp-overlay-btn:hover::after { opacity: 1; }

/* ── Dialogs ─────────────────────────────────────── */
.mp-dialog {
  background: var(--db-surface);
  border: 1px solid var(--db-border-strong);
  border-radius: 18px; overflow: hidden;
}
.mp-dialog-hd {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 24px 16px;
  background: var(--db-surface-2);
  border-bottom: 1px solid var(--db-border);
}
.mp-dialog-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 10px;
  background: rgba(200,134,30,0.1); border: 1px solid rgba(200,134,30,0.28);
  display: flex; align-items: center; justify-content: center;
}
.mp-dialog-title { font-size: 1.2rem; color: var(--db-text); margin: 0 0 3px; }

.mp-dialog-close {
  background: none; border: none; cursor: pointer;
  color: var(--db-text-muted);
  width: 30px; height: 30px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 7px; margin-left: 8px;
  transition: background 0.15s, color 0.15s;
}
.mp-dialog-close:hover { background: rgba(200,134,30,0.08); color: var(--db-text); }

/* Scrollable note body */
.mp-note-body {
  padding: 20px 24px;
  max-height: 340px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 12px;
}
.mp-note-body::-webkit-scrollbar { width: 4px; }
.mp-note-body::-webkit-scrollbar-track { background: transparent; }
.mp-note-body::-webkit-scrollbar-thumb { background: rgba(200,134,30,0.25); border-radius: 2px; }

.mp-dialog-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

/* Note view */
.mp-note-date {
  display: inline-flex; align-items: center;
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase;
  color: var(--db-gold); margin: 0;
}
.mp-note-content {
  font-size: 0.95rem;
  color: var(--db-text);
  line-height: 1.8; margin: 0;
  white-space: pre-wrap;
}

/* Edit form */
.mp-dfield { display: flex; flex-direction: column; gap: 7px; }
.mp-dlabel {
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--db-text-muted);
}
.mp-dinput, .mp-dtextarea {
  background: var(--db-surface-2);
  border: 1px solid var(--db-border);
  border-radius: 9px; color: var(--db-text);
  font-family: var(--font-body); font-size: 0.93rem;
  padding: 11px 14px; outline: none; resize: none; width: 100%;
  transition: border-color 0.2s;
}
.mp-dinput:focus, .mp-dtextarea:focus { border-color: var(--db-border-strong); }
.mp-dtextarea::placeholder { color: var(--db-text-faint); }

.mp-dialog-ft {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px 20px;
}
.mp-cancel {
  background: none; border: 1px solid var(--db-border);
  border-radius: 9px; color: var(--db-text-muted);
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 9px 18px; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.mp-cancel:hover { border-color: var(--db-border-strong); color: var(--db-text); }
.mp-save {
  display: inline-flex; align-items: center;
  background: var(--db-gold); border: none; border-radius: 9px;
  color: var(--db-bg); font-size: 0.72rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 9px 20px; cursor: pointer; transition: background 0.2s;
}
.mp-save:hover:not(:disabled) { background: var(--db-gold-bright); }
.mp-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Card stagger ────────────────────────────────── */
.card-stagger-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.card-stagger-enter-from { opacity: 0; transform: translateY(16px); }
.card-stagger-leave-active { transition: opacity 0.2s ease; }
.card-stagger-leave-to { opacity: 0; }

/* ── Mobile ──────────────────────────────────────── */
@media (max-width: 600px) {
  .mp-grid { grid-template-columns: 1fr; }
  .mp-page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .mp-header-right { align-items: flex-start; }
}
</style>
