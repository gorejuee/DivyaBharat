<template>
  <div class="ap-root">
    <div class="ap-inner">

      <!-- Header -->
      <div class="page-hd">
        <p class="text-eyebrow">Admin</p>
        <h1 class="page-hd-title">Place Submissions</h1>
        <p class="text-page-sub">Review community submissions and sync heritage data from Wikidata.</p>
      </div>

      <MandalaLine />

      <!-- Wikidata Import -->
      <div class="ap-import-card">
        <div class="ap-import-left">
          <div class="ap-import-icon-wrap">
            <v-icon size="20" style="color:var(--db-gold-bright);">mdi-cloud-sync-outline</v-icon>
          </div>
          <div>
            <p class="ap-import-title font-display">Import from Wikidata</p>
            <p class="ap-import-sub font-body">
              Fetch and sync Indian heritage places. New places are inserted, existing ones updated.
              Community submissions are never overwritten. A daily sync also runs at 2 AM IST.
            </p>
          </div>
        </div>
        <button class="ap-import-btn font-label" :disabled="importLoading" @click="triggerImport">
          <v-progress-circular v-if="importLoading" indeterminate size="14" width="2" color="white" style="margin-right:8px;" />
          <v-icon v-else size="15" style="margin-right:8px;">mdi-cloud-download-outline</v-icon>
          {{ importLoading ? 'Importing...' : 'Import Now' }}
        </button>
      </div>

      <div v-if="importResult" class="ap-alert ap-alert--success font-body">
        <v-icon size="16" style="margin-right:8px;flex-shrink:0;">mdi-check-circle-outline</v-icon>
        <span style="flex:1;">Import complete - {{ importResult.inserted }} inserted, {{ importResult.updated }} updated,
        {{ importResult.skipped }} skipped, {{ importResult.errors }} errors.</span>
        <button type="button" class="ap-alert-close" @click="importResult = null"><v-icon size="15">mdi-close</v-icon></button>
      </div>
      <div v-if="importError" class="ap-alert ap-alert--error font-body">
        <v-icon size="16" style="margin-right:8px;flex-shrink:0;">mdi-alert-circle-outline</v-icon>
        <span style="flex:1;">{{ importError }}</span>
        <button type="button" class="ap-alert-close" @click="importError = null"><v-icon size="15">mdi-close</v-icon></button>
      </div>

      <MandalaLine />

      <!-- Submissions -->
      <div class="ap-section-head">
        <h2 class="ap-section-title font-display">Pending Submissions</h2>
        <span v-if="places.length" class="ap-count font-label">{{ places.length }} awaiting review</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="ap-loading">
        <v-progress-circular indeterminate color="primary" size="40" width="2" />
        <p class="ap-loading-label font-label">Loading submissions</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!places.length" class="ap-empty">
        <v-icon size="48" style="color:var(--db-gold);opacity:0.25;">mdi-inbox-outline</v-icon>
        <p class="ap-empty-text font-body">No pending submissions right now.</p>
      </div>

      <!-- Cards -->
      <div v-else class="ap-list">
        <div v-for="place in places" :key="place.id" class="ap-card">

          <!-- Image banner -->
          <div v-if="place.image_url" class="ap-card-img-wrap">
            <img :src="place.image_url" :alt="place.name" class="ap-card-img" @error="e => e.target.parentElement.style.display='none'" />
          </div>

          <!-- Content -->
          <div class="ap-card-body">
            <div class="ap-card-name-row">
              <h3 class="ap-card-name font-display">{{ place.name }}</h3>
            </div>
            <p class="ap-card-meta text-meta">
              {{ formatCategory(place.category) }}
              &nbsp;&bull;&nbsp;
              {{ place.city ? place.city + ', ' : '' }}{{ place.state }}
              &nbsp;&bull;&nbsp;
              {{ formatDate(place.created_at) }}
            </p>

            <div v-if="place.description" class="ap-card-block">
              <p class="ap-block-label font-label">Description</p>
              <p class="ap-card-text font-body">{{ place.description }}</p>
            </div>

            <div v-if="place.history" class="ap-card-block">
              <p class="ap-block-label font-label">History</p>
              <p class="ap-card-text font-body">{{ place.history }}</p>
            </div>

            <p v-if="place.latitude && place.longitude" class="ap-card-coords font-label">
              <v-icon size="12" style="color:var(--db-gold);margin-right:4px;">mdi-map-marker-outline</v-icon>
              {{ place.latitude }}, {{ place.longitude }}
            </p>

            <!-- Actions inline at bottom -->
            <div class="ap-card-actions">
              <button
                class="ap-action-btn ap-action-btn--approve font-label"
                :disabled="!!actionLoadingId"
                @click="reviewPlace(place.id, 'approved')"
              >
                <v-progress-circular v-if="actionLoadingId === place.id + '_approve'" indeterminate size="12" width="2" color="white" style="margin-right:5px;" />
                <v-icon v-else size="13" style="margin-right:5px;">mdi-check</v-icon>
                Approve
              </button>
              <button
                class="ap-action-btn ap-action-btn--reject font-label"
                :disabled="!!actionLoadingId"
                @click="reviewPlace(place.id, 'rejected')"
              >
                <v-progress-circular v-if="actionLoadingId === place.id + '_reject'" indeterminate size="12" width="2" color="white" style="margin-right:5px;" />
                <v-icon v-else size="13" style="margin-right:5px;">mdi-close</v-icon>
                Reject
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Custom toast (replaces v-snackbar which breaks navigation) -->
      <transition name="toast">
        <div v-if="toast.show" class="ap-toast font-body" :class="`ap-toast--${toast.color}`">
          <v-icon size="16" style="margin-right:8px;flex-shrink:0;">
            {{ toast.color === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
          </v-icon>
          {{ toast.message }}
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { formatCategory } from '@/utils/placeHelpers';
import MandalaLine from '@/components/MandalaLine.vue';

const places = ref([]);
const loading = ref(false);
const actionLoadingId = ref(null);
const importLoading = ref(false);
const importResult = ref(null);
const importError = ref(null);

const toast = ref({
  show: false,
  message: '',
  color: 'success'
});
let toastTimer = null;

const showToast = (message, color = 'success') => {
  clearTimeout(toastTimer);
  toast.value = { show: true, message, color };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3000);
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const fetchPendingPlaces = async () => {
  loading.value = true;
  try {
    const res = await api.get('/places/admin/pending');
    places.value = res.data.places;
  } catch {
    showToast('Failed to load submissions.', 'error');
  } finally {
    loading.value = false;
  }
};

const reviewPlace = async (id, status) => {
  actionLoadingId.value = `${id}_${status === 'approved' ? 'approve' : 'reject'}`;
  try {
    await api.patch(`/places/${id}/review`, { status });
    places.value = places.value.filter(p => p.id !== id);
    showToast(status === 'approved' ? 'Place approved and now live.' : 'Place rejected.', status === 'approved' ? 'success' : 'error');
  } catch (err) {
    showToast(err.response?.data?.message || 'Action failed.', 'error');
  } finally {
    actionLoadingId.value = null;
  }
};

const triggerImport = async () => {
  importLoading.value = true;
  importResult.value = null;
  importError.value = null;
  try {
    const res = await api.post('/admin/import-wikidata');
    importResult.value = res.data.summary;
  } catch (err) {
    importError.value = err.response?.data?.message || 'Import failed. Please try again.';
  } finally {
    importLoading.value = false;
  }
};

onMounted(fetchPendingPlaces);
</script>

<style scoped>
.ap-root {
  min-height: 100vh;
  margin-top: -80px;
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
}
.ap-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 120px clamp(20px, 4vw, 60px) 100px;
}

/* Import card */
.ap-import-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.22);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 16px;
}
.ap-import-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}
.ap-import-icon-wrap {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.ap-import-title {
  font-size: 1.15rem;
  color: var(--db-text);
  margin: 0 0 6px;
}
.ap-import-sub {
  font-size: 0.88rem;
  color: var(--db-text-muted);
  margin: 0;
  line-height: 1.6;
}
.ap-import-btn {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 11px 20px;
  border-radius: 10px;
  background: var(--db-gold);
  border: none;
  color: var(--db-bg);
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
}
.ap-import-btn:hover:not(:disabled) { background: var(--db-gold-bright); }
.ap-import-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Alerts */
.ap-alert {
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
}
.ap-alert--success { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.28); color: #4ade80; }
.ap-alert--error   { background: rgba(220,64,64,0.08);  border: 1px solid rgba(220,64,64,0.28);  color: #F87171; }
.ap-alert-close {
  background: none; border: none; cursor: pointer; color: inherit;
  opacity: 0.7; display: flex; align-items: center; padding: 0; margin-left: 10px; flex-shrink: 0;
  transition: opacity 0.15s;
}
.ap-alert-close:hover { opacity: 1; }

/* Section head */
.ap-section-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
}
.ap-section-title {
  font-size: clamp(1.3rem, 2.5vw, 1.7rem);
  color: var(--db-text);
  margin: 0;
}
.ap-count {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold);
}

/* Loading / Empty */
.ap-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; }
.ap-loading-label { font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--db-gold); opacity: 0.7; margin: 0; }
.ap-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 0; }
.ap-empty-text { font-size: 0.95rem; color: var(--db-text-muted); margin: 0; }

/* Submission cards */
.ap-list { display: flex; flex-direction: column; gap: 20px; }

.ap-card {
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.18);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.ap-card:hover { border-color: rgba(200,134,30,0.35); }

.ap-card-img-wrap {
  width: 100%;
  height: 220px;
  overflow: hidden;
}
.ap-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ap-card-body { padding: 22px 24px 20px; }

.ap-card-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.ap-card-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--db-text);
  margin: 0;
  line-height: 1.2;
}
.ap-badge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.12);
  border: 1px solid rgba(200,134,30,0.3);
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.ap-card-meta { margin: 0 0 16px; line-height: 1.5; font-weight: 600; color: var(--db-text-muted); }

.ap-card-block {
  margin-bottom: 14px;
  padding: 14px 16px;
  background: var(--db-surface-2);
  border-radius: 10px;
  border-left: 2px solid rgba(200,134,30,0.3);
}
.ap-block-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 0 0 6px;
  display: block;
}
.ap-card-text {
  font-size: 0.93rem;
  font-weight: 450;
  color: var(--db-text);
  line-height: 1.7;
  margin: 0;
}
.ap-card-coords {
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  color: var(--db-text-muted);
  margin: 0 0 18px;
  display: flex;
  align-items: center;
}

/* Actions - compact row at card bottom */
.ap-card-actions {
  display: flex;
  gap: 10px;
  padding-top: 4px;
}
.ap-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.18s;
  white-space: nowrap;
}
.ap-action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ap-action-btn--approve { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.28); }
.ap-action-btn--approve:hover:not(:disabled) { background: rgba(74,222,128,0.2); }
.ap-action-btn--reject  { background: rgba(220,64,64,0.08); color: #F87171; border-color: rgba(220,64,64,0.25); }
.ap-action-btn--reject:hover:not(:disabled)  { background: rgba(220,64,64,0.18); }

/* Toast */
.ap-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 13px 22px;
  border-radius: 12px;
  font-size: 0.92rem;
  z-index: 9999;
  white-space: nowrap;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.ap-toast--success { background: rgba(22,38,22,0.97); border: 1px solid rgba(74,222,128,0.4); color: #4ade80; }
.ap-toast--error   { background: rgba(38,22,22,0.97); border: 1px solid rgba(220,64,64,0.4);  color: #F87171; }

.toast-enter-active, .toast-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* Responsive */
@media (max-width: 600px) {
  .ap-card-img-wrap { height: 160px; }
  .ap-import-card { flex-direction: column; align-items: flex-start; }
}
</style>
