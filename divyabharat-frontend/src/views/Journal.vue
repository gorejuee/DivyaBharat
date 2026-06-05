<template>
  <div class="sm-root">
    <div class="sm-inner">

      <!-- Page header: two-column layout -->
      <div class="sm-page-header">
        <div class="sm-header-left">
          <p class="text-eyebrow">Your Sacred Memories</p>
          <h1 class="page-hd-title">Smriti</h1>
          <p class="text-page-sub">
            A living record of your pilgrimage. The places that moved you, the moments that stayed.
          </p>
        </div>
        <div class="sm-header-right">
          <div class="sm-stats">
            <div class="sm-stat">
              <span class="sm-stat-n font-display">{{ journalStore.totalEntries }}</span>
              <span class="sm-stat-label font-label">Memories</span>
            </div>
            <div class="sm-stat-sep" />
            <div class="sm-stat">
              <span class="sm-stat-n font-display">{{ journalStore.linkedTrips }}</span>
              <span class="sm-stat-label font-label">Trips</span>
            </div>
          </div>
          <button class="sm-cta font-label" @click="openCreate">
            <v-icon size="13" style="margin-right:6px;">mdi-feather</v-icon>
            New Memory
          </button>
        </div>
      </div>

      <MandalaLine />

      <!-- Loading -->
      <div v-if="loading" class="sm-state-center">
        <v-progress-circular indeterminate color="primary" size="36" width="2" />
        <p class="text-meta" style="margin:0;">Retrieving your memories</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!journalStore.entries.length" class="sm-state-center">
        <div class="sm-empty-icon">
          <v-icon size="28" style="color:var(--db-gold);opacity:0.5;">mdi-feather</v-icon>
        </div>
        <h3 class="sm-empty-t font-display">Your journey begins here</h3>
        <p class="text-page-sub" style="max-width:360px;margin:0 auto 28px;text-align:center;">
          Write about the sacred places you've walked, the silence you've found, the moments that will stay with you.
        </p>
        <button class="sm-cta font-label" @click="openCreate">
          <v-icon size="13" style="margin-right:6px;">mdi-feather</v-icon>
          Write your first memory
        </button>
      </div>

      <!-- Timeline -->
      <div v-else class="sm-timeline">
        <div class="sm-tl-line" aria-hidden="true" />

        <!-- Start marker -->
        <div class="sm-tl-start">
          <p class="sm-tl-end-label font-label">Where it began</p>
          <span class="sm-tl-start-dot" />
        </div>

        <template v-for="group in groupedEntries" :key="group.key">

          <!-- Month separator -->
          <div class="sm-month">
            <span class="sm-month-pill font-label">{{ group.label }}</span>
          </div>

          <!-- Entry rows -->
          <div
            v-for="entry in group.entries"
            :key="entry.id"
            class="sm-row"
            :class="entry.side === 'left' ? 'sm-row--l' : 'sm-row--r'"
          >
            <!-- Panel -->
            <div
              class="sm-panel"
              :ref="el => { if (el) panelRefs[entry.id] = el }"
            >
              <div class="sm-panel-accent" />
              <div class="sm-panel-body">
                <div class="sm-meta-row">
                  <span v-if="entry.location_name" class="sm-loc font-label">
                    <v-icon size="9" style="color:var(--db-gold-bright);margin-right:3px;">mdi-map-marker-outline</v-icon>
                    {{ entry.location_name }}
                  </span>
                  <time v-if="entry.visit_date" class="sm-vdate font-label">
                    Visited {{ formatDate(entry.visit_date) }}
                  </time>
                </div>
                <h3 class="sm-title font-display">{{ entry.title }}</h3>
                <p
                  class="sm-content font-body"
                  :class="{ 'sm-content--full': expanded.has(entry.id) }"
                >{{ entry.content }}</p>
                <button
                  v-if="entry.content.length > 240"
                  class="sm-more font-label"
                  @click="toggleExpand(entry.id)"
                >
                  {{ expanded.has(entry.id) ? 'Show less' : 'Read more' }}
                </button>
                <div class="sm-foot">
                  <button
                    v-if="entry.trip"
                    class="sm-trip font-label"
                    @click.stop="router.push('/trips/' + entry.trip.id)"
                  >
                    <v-icon size="10" style="margin-right:3px;">mdi-map-marker-path</v-icon>
                    {{ entry.trip.name }}
                  </button>
                  <span v-else />
                  <div class="sm-foot-r">
                    <span class="sm-cdate font-label">Added {{ formatCreated(entry.createdAt) }}</span>
                    <button class="sm-icon-btn" title="Edit" @click.stop="openEdit(entry)">
                      <v-icon size="13">mdi-pencil-outline</v-icon>
                    </button>
                    <button class="sm-icon-btn sm-icon-btn--del" title="Delete" @click.stop="confirmDelete(entry)">
                      <v-icon size="13">mdi-delete-outline</v-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Center dot column with chapter number above -->
            <div class="sm-dot-col" aria-hidden="true">
              <span class="sm-chapter font-display">{{ String(entry.num).padStart(2, '0') }}</span>
              <div class="sm-dot">
                <span class="sm-dot-c" />
                <span class="sm-dot-r" />
              </div>
            </div>

            <!-- Spacer (opposite side) -->
            <div class="sm-spacer" />
          </div>

        </template>

        <!-- End marker -->
        <div class="sm-tl-end">
          <span class="sm-tl-end-dot" />
          <p class="sm-tl-end-label font-label">Your journey continues</p>
        </div>
      </div>

    </div>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="dialog.show" max-width="580" persistent>
      <div class="sm-dialog">
        <div class="sm-dialog-hd">
          <div class="sm-dialog-icon">
            <v-icon size="18" style="color:var(--db-gold);">mdi-feather</v-icon>
          </div>
          <div>
            <h2 class="sm-dialog-title font-display">
              {{ dialog.mode === 'create' ? 'New Memory' : 'Edit Memory' }}
            </h2>
            <p class="text-eyebrow" style="margin:0;">
              {{ dialog.mode === 'create' ? 'Capture this moment' : 'Revise your reflection' }}
            </p>
          </div>
        </div>

        <div class="sm-dialog-body">
          <div class="sm-dfield">
            <label class="sm-dlabel font-label">Title <span style="color:var(--db-gold);">*</span></label>
            <input
              v-model="form.title"
              class="sm-dinput font-body"
              placeholder="Give this memory a title"
              @input="formErr.title = ''"
            />
            <p v-if="formErr.title" class="sm-derr font-body">{{ formErr.title }}</p>
          </div>

          <div class="sm-drow">
            <div class="sm-dfield">
              <label class="sm-dlabel font-label">Location</label>
              <input v-model="form.location_name" class="sm-dinput font-body" placeholder="Where were you?" />
            </div>
            <div class="sm-dfield">
              <label class="sm-dlabel font-label">Visit Date</label>
              <input
                v-model="form.visit_date"
                class="sm-dinput font-body"
                type="date"
                :max="todayStr"
              />
            </div>
          </div>

          <div class="sm-dfield">
            <label class="sm-dlabel font-label">Link to a Trip (optional)</label>
            <select v-model="form.trip_id" class="sm-dselect font-body">
              <option :value="null">None</option>
              <option v-for="trip in trips" :key="trip.id" :value="trip.id">{{ trip.name }}</option>
            </select>
          </div>

          <div class="sm-dfield">
            <label class="sm-dlabel font-label">Your Reflection <span style="color:var(--db-gold);">*</span></label>
            <textarea
              v-model="form.content"
              class="sm-dtextarea font-body"
              rows="6"
              placeholder="Write about your experience. What you felt, what you saw, what moved you..."
              @input="formErr.content = ''"
            />
            <p v-if="formErr.content" class="sm-derr font-body">{{ formErr.content }}</p>
          </div>
        </div>

        <div class="sm-dialog-ft">
          <button class="sm-btn-cancel font-label" :disabled="saving" @click="closeDialog">Cancel</button>
          <button class="sm-btn-save font-label" :disabled="saving" @click="saveEntry">
            <v-progress-circular v-if="saving" indeterminate size="13" width="2" color="white" style="margin-right:6px;" />
            {{ dialog.mode === 'create' ? 'Save Memory' : 'Update Memory' }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Delete confirm dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <div class="sm-dialog">
        <div class="sm-dialog-hd">
          <div class="sm-dialog-icon" style="background:rgba(220,64,64,0.1);border-color:rgba(220,64,64,0.28);">
            <v-icon size="18" style="color:#F87171;">mdi-delete-outline</v-icon>
          </div>
          <div>
            <h2 class="sm-dialog-title font-display">Delete Memory</h2>
            <p class="text-eyebrow" style="margin:0;color:#F87171;">This cannot be undone</p>
          </div>
        </div>
        <div class="sm-dialog-body">
          <p class="font-body" style="color:var(--db-text-muted);margin:0;">
            Delete <strong style="color:var(--db-text);">"{{ deleteDialog.entry?.title }}"</strong>?
            This memory will be permanently removed from your Smriti.
          </p>
        </div>
        <div class="sm-dialog-ft">
          <button class="sm-btn-cancel font-label" @click="deleteDialog.show = false">Cancel</button>
          <button class="sm-btn-del font-label" :disabled="deleting" @click="doDelete">
            <v-progress-circular v-if="deleting" indeterminate size="13" width="2" color="white" style="margin-right:6px;" />
            Delete
          </button>
        </div>
      </div>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useJournalStore } from '@/stores/journal';
import { useTripsStore } from '@/stores/trips';
import MandalaLine from '@/components/MandalaLine.vue';

const journalStore = useJournalStore();
const tripsStore = useTripsStore();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const expanded = ref(new Set());
const trips = ref([]);
const panelRefs = {};

const todayStr = new Date().toISOString().slice(0, 10);

const dialog = ref({ show: false, mode: 'create', entryId: null });
const deleteDialog = ref({ show: false, entry: null });

const EMPTY = { title: '', content: '', location_name: '', visit_date: '', trip_id: null };
const form = ref({ ...EMPTY });
const formErr = ref({});

// ── Helpers ──────────────────────────────────
const formatDate = (d) => {
  if (!d) return '';
  const p = new Date(d + 'T00:00:00');
  if (isNaN(p)) return '';
  return p.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCreated = (d) => {
  if (!d) return '';
  const p = new Date(d);
  if (isNaN(p)) return '';
  return p.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Group entries by month, assign sequential numbers + alternating sides ──
const groupedEntries = computed(() => {
  const entries = journalStore.entries;
  const groups = {};

  entries.forEach((entry, globalIdx) => {
    const d = entry.visit_date
      ? new Date(entry.visit_date + 'T00:00:00')
      : entry.createdAt ? new Date(entry.createdAt) : new Date();

    const valid = !isNaN(d.getTime());
    const key = valid
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : 'undated';
    const label = valid
      ? d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : 'Undated';

    if (!groups[key]) groups[key] = { key, label, entries: [] };
    groups[key].entries.push({
      ...entry,
      num: globalIdx + 1,
      side: globalIdx % 2 === 0 ? 'left' : 'right',
    });
  });

  return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
});

// ── Expand / collapse with scroll-back ──
const toggleExpand = (id) => {
  const s = new Set(expanded.value);
  const collapsing = s.has(id);

  if (collapsing) {
    s.delete(id);
    expanded.value = s;
    nextTick(() => {
      const el = panelRefs[id];
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
  } else {
    s.add(id);
    expanded.value = s;
  }
};

// ── Dialog management ──
const openCreate = () => {
  form.value = { ...EMPTY };
  formErr.value = {};
  dialog.value = { show: true, mode: 'create', entryId: null };
};

const openEdit = (entry) => {
  form.value = {
    title: entry.title,
    content: entry.content,
    location_name: entry.location_name || '',
    visit_date: entry.visit_date || '',
    trip_id: entry.trip_id || null,
  };
  formErr.value = {};
  dialog.value = { show: true, mode: 'edit', entryId: entry.id };
};

const closeDialog = () => { dialog.value.show = false; };

const validate = () => {
  formErr.value = {};
  if (!form.value.title?.trim()) formErr.value.title = 'Title is required';
  if (!form.value.content?.trim()) formErr.value.content = 'Write something before saving';
  return !Object.keys(formErr.value).length;
};

const saveEntry = async () => {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      location_name: form.value.location_name?.trim() || null,
      visit_date: form.value.visit_date || null,
      trip_id: form.value.trip_id || null,
    };
    if (dialog.value.mode === 'create') {
      await journalStore.createEntry(payload);
    } else {
      await journalStore.updateEntry(dialog.value.entryId, payload);
    }
    dialog.value.show = false;
  } catch (err) {
    formErr.value.content = err.response?.data?.message || 'Something went wrong';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (entry) => { deleteDialog.value = { show: true, entry }; };

const doDelete = async () => {
  deleting.value = true;
  try {
    await journalStore.deleteEntry(deleteDialog.value.entry.id);
    deleteDialog.value.show = false;
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await journalStore.fetchEntries();
    if (!tripsStore.trips.length) await tripsStore.fetchTrips();
    trips.value = tripsStore.trips;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* ── Root ────────────────────────────────────────── */
.sm-root {
  min-height: 100vh;
  margin-top: -80px;
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
}
.sm-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px clamp(20px, 4vw, 60px) 120px;
}

/* ── Toolbar ─────────────────────────────────────── */
/* ── Page header: two-column ─────────────────────── */
.sm-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 44px;
  flex-wrap: wrap;
}
.sm-header-left { flex: 1; min-width: 260px; }
.sm-header-left .page-hd-title { margin-bottom: 8px; }
.sm-header-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 20px;
  flex-shrink: 0; padding-bottom: 2px;
}

.sm-stats { display: flex; align-items: center; gap: 28px; }
.sm-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.sm-stat-n { font-size: 2rem; font-weight: 600; color: var(--db-gold); line-height: 1; }
.sm-stat-sep { width: 1px; height: 32px; background: var(--db-border); }
.sm-stat-label {
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--db-text-muted);
}

.sm-cta {
  display: inline-flex; align-items: center;
  padding: 10px 22px; border-radius: 10px;
  background: var(--db-gold); border: none;
  color: var(--db-bg); font-size: 0.75rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
  transition: background 0.2s; white-space: nowrap;
}
.sm-cta:hover { background: var(--db-gold-bright); }

/* ── Empty state ─────────────────────────────────── */
.sm-state-center {
  display: flex; flex-direction: column;
  align-items: center; gap: 16px;
  padding: 80px 0;
}
.sm-empty-icon {
  width: 64px; height: 64px;
  border-radius: 18px;
  background: rgba(200,134,30,0.07);
  border: 1px solid var(--db-border);
  display: flex; align-items: center; justify-content: center;
}
.sm-empty-t { font-size: 1.7rem; color: var(--db-text); margin: 0; }

/* ── Timeline shell ──────────────────────────────── */
.sm-timeline {
  position: relative;
  padding-top: 16px;
}

/* The vertical golden path */
.sm-tl-line {
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 1px;
  transform: translateX(-50%);
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(200,134,30,0.55) 6%,
    rgba(200,134,30,0.3)  85%,
    transparent 100%
  );
  pointer-events: none;
}

/* ── Month separator ─────────────────────────────── */
.sm-month {
  display: flex; justify-content: center; align-items: center;
  position: relative; z-index: 2;
  margin: 52px 0 36px;
}
.sm-month-pill {
  background: var(--db-surface-2);
  border: 1px solid var(--db-border-strong);
  border-radius: 30px;
  padding: 6px 22px;
  font-size: 0.67rem; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--db-gold);
  box-shadow: 0 0 28px rgba(200,134,30,0.15);
  position: relative; z-index: 1;
}

/* ── Entry row ───────────────────────────────────── */
.sm-row {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: start;
  margin-bottom: 36px;
  position: relative; z-index: 1;
}

.sm-row--l .sm-panel { grid-column: 1; grid-row: 1; }
.sm-row--l .sm-dot-col { grid-column: 2; grid-row: 1; }
.sm-row--l .sm-spacer { grid-column: 3; grid-row: 1; }

.sm-row--r .sm-spacer { grid-column: 1; grid-row: 1; }
.sm-row--r .sm-dot-col { grid-column: 2; grid-row: 1; }
.sm-row--r .sm-panel { grid-column: 3; grid-row: 1; }

/* ── Entry panel ─────────────────────────────────── */
.sm-panel {
  background: var(--db-surface);
  border: 1px solid var(--db-border);
  border-radius: 14px;
  position: relative; overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s;
}
.sm-panel:hover {
  border-color: var(--db-border-strong);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  transform: translateY(-3px);
}

/* Gold accent bar */
.sm-panel-accent {
  height: 3px;
  background: linear-gradient(to right, var(--db-gold), var(--db-gold-bright), rgba(200,134,30,0.15));
}
.sm-row--r .sm-panel-accent {
  background: linear-gradient(to left, var(--db-gold), var(--db-gold-bright), rgba(200,134,30,0.15));
}

/* Panel body */
.sm-panel-body {
  padding: 18px 22px 20px;
}

/* Speech-bubble pointer toward timeline dot */
.sm-row--l .sm-panel::after {
  content: '';
  position: absolute;
  right: -9px; top: 30px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 9px solid var(--db-border);
  z-index: 2;
}
.sm-row--l .sm-panel::before {
  content: '';
  position: absolute;
  right: -7px; top: 31px; z-index: 3;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 8px solid var(--db-surface);
}
.sm-row--r .sm-panel::after {
  content: '';
  position: absolute;
  left: -9px; top: 30px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 9px solid var(--db-border);
  z-index: 2;
}
.sm-row--r .sm-panel::before {
  content: '';
  position: absolute;
  left: -7px; top: 31px; z-index: 3;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 8px solid var(--db-surface);
}

/* ── Timeline dot column ─────────────────────────── */
.sm-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  position: relative;
}

/* Connector lines anchored to the dot itself, always centered */
.sm-row--l .sm-dot::before {
  content: '';
  position: absolute;
  top: 50%; transform: translateY(-50%);
  right: 100%;
  width: 30px; height: 1px;
  background: linear-gradient(to left, rgba(200,134,30,0.55), transparent);
}
.sm-row--r .sm-dot::after {
  content: '';
  position: absolute;
  top: 50%; transform: translateY(-50%);
  left: 100%;
  width: 30px; height: 1px;
  background: linear-gradient(to right, rgba(200,134,30,0.55), transparent);
}

/* Chapter number above dot */
.sm-chapter {
  font-size: 1.30rem;
  font-weight: 600;
  color: var(--db-gold);
  opacity: 0.8;
  line-height: 1;
  letter-spacing: 0;
}

.sm-dot {
  position: relative; width: 14px; height: 14px;
  display: flex; align-items: center; justify-content: center;
}
.sm-dot-c {
  display: block;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--db-gold);
  box-shadow: 0 0 8px rgba(200,134,30,0.9), 0 0 20px rgba(200,134,30,0.4);
  position: relative; z-index: 1;
}
.sm-dot-r {
  display: block; position: absolute; inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(200,134,30,0.4);
}

/* Location + date row */
.sm-meta-row {
  display: flex; flex-wrap: wrap;
  align-items: center; gap: 8px;
  margin-bottom: 10px;
}
.sm-loc {
  display: inline-flex; align-items: center;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--db-text-muted);
}
.sm-vdate {
  font-size: 0.67rem; font-weight: 600;
  letter-spacing: 1px;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.14);
  border: 1px solid rgba(200,134,30,0.28);
  border-radius: 20px; padding: 2px 10px;
}

/* Title */
.sm-title {
  font-size: clamp(1.15rem, 2.5vw, 1.5rem);
  font-weight: 600; color: var(--db-text);
  margin: 0 0 10px; line-height: 1.2;
}

/* Content */
.sm-content {
  font-size: 0.91rem;
  color: var(--db-text-muted);
  line-height: 1.85; margin: 0 0 4px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}
.sm-content--full {
  display: block;
  -webkit-line-clamp: none;
  line-clamp: none;
  overflow: visible;
}
.sm-more {
  background: none; border: none; cursor: pointer;
  font-size: 0.67rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--db-gold); padding: 4px 0;
  display: block; transition: color 0.15s; margin-bottom: 2px;
}
.sm-more:hover { color: var(--db-gold-bright); }

/* Footer */
.sm-foot {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap;
  gap: 8px; margin-top: 14px; padding-top: 12px;
  border-top: 1px solid var(--db-border);
}
.sm-trip {
  display: inline-flex; align-items: center;
  font-size: 0.67rem; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.12);
  border: 1px solid rgba(200,134,30,0.3);
  border-radius: 20px; padding: 3px 10px;
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
}
.sm-trip:hover { background: rgba(200,134,30,0.22); border-color: rgba(200,134,30,0.5); }

.sm-foot-r { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.sm-cdate {
  font-size: 0.64rem; letter-spacing: 1px;
  color: var(--db-text-muted); text-transform: uppercase;
  font-family: var(--font-label);
  margin-right: 6px;
}
.sm-icon-btn {
  background: none; border: 1px solid var(--db-border);
  border-radius: 6px; cursor: pointer;
  color: var(--db-text-muted);
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.sm-icon-btn:hover {
  background: rgba(200,134,30,0.08);
  border-color: var(--db-border-strong); color: var(--db-gold-bright);
}
.sm-icon-btn--del:hover {
  background: rgba(220,64,64,0.08);
  border-color: rgba(220,64,64,0.3); color: #F87171;
}


.sm-dot {
  position: relative; width: 14px; height: 14px;
  display: flex; align-items: center; justify-content: center;
}
.sm-dot-c {
  display: block;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--db-gold);
  box-shadow: 0 0 8px rgba(200,134,30,0.9), 0 0 20px rgba(200,134,30,0.4);
  position: relative; z-index: 1;
}
.sm-dot-r {
  display: block; position: absolute; inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(200,134,30,0.4);
}

/* ── Timeline start + end markers ────────────────── */
.sm-tl-start {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 0 0 28px; position: relative; z-index: 1;
}
.sm-tl-start-dot {
  display: block; width: 5px; height: 5px;
  border-radius: 50%; background: rgba(200,134,30,0.5);
}
.sm-tl-end {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 20px 0 48px; position: relative; z-index: 1;
}
.sm-tl-end-dot {
  display: block; width: 5px; height: 5px;
  border-radius: 50%; background: rgba(200,134,30,0.5);
}
.sm-tl-end-label {
  font-size: 0.75rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--db-text-muted); margin: 0;
}

/* ── Dialog ──────────────────────────────────────── */
.sm-dialog {
  background: var(--db-surface);
  border: 1px solid var(--db-border-strong);
  border-radius: 18px; overflow: hidden;
}
.sm-dialog-hd {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 24px 16px;
  background: var(--db-surface-2);
  border-bottom: 1px solid var(--db-border);
}
.sm-dialog-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 10px;
  background: rgba(200,134,30,0.1); border: 1px solid rgba(200,134,30,0.28);
  display: flex; align-items: center; justify-content: center;
}
.sm-dialog-title { font-size: 1.25rem; color: var(--db-text); margin: 0 0 3px; }

.sm-dialog-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
.sm-drow { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.sm-dfield { display: flex; flex-direction: column; gap: 7px; }
.sm-dlabel {
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--db-text-muted);
}
.sm-dinput, .sm-dselect, .sm-dtextarea {
  background: var(--db-surface-2);
  border: 1px solid var(--db-border);
  border-radius: 9px; color: var(--db-text);
  font-family: var(--font-body); font-size: 0.93rem;
  padding: 11px 14px; outline: none; resize: none; width: 100%;
  transition: border-color 0.2s;
}
.sm-dinput:focus, .sm-dselect:focus, .sm-dtextarea:focus {
  border-color: var(--db-border-strong);
}
.sm-dinput::placeholder, .sm-dtextarea::placeholder { color: var(--db-text-faint); }
.sm-dselect {
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A08C72' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 32px;
}
.sm-dselect option { background: var(--db-surface-2); }
.sm-derr { font-size: 0.85rem; color: #F87171; margin: 0; }

.sm-dialog-ft {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px 20px;
}
.sm-btn-cancel {
  background: none; border: 1px solid var(--db-border);
  border-radius: 9px; color: var(--db-text-muted);
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 9px 18px; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.sm-btn-cancel:hover { border-color: var(--db-border-strong); color: var(--db-text); }
.sm-btn-save {
  display: inline-flex; align-items: center;
  background: var(--db-gold); border: none; border-radius: 9px;
  color: var(--db-bg); font-size: 0.72rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 9px 20px; cursor: pointer; transition: background 0.2s;
}
.sm-btn-save:hover:not(:disabled) { background: var(--db-gold-bright); }
.sm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.sm-btn-del {
  display: inline-flex; align-items: center;
  background: rgba(220,64,64,0.12); border: 1px solid rgba(220,64,64,0.28);
  border-radius: 9px; color: #F87171;
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 9px 20px; cursor: pointer; transition: background 0.2s;
}
.sm-btn-del:hover:not(:disabled) { background: rgba(220,64,64,0.22); }
.sm-btn-del:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Mobile ──────────────────────────────────────── */
@media (max-width: 640px) {
  .sm-tl-line { left: 22px; transform: none; }
  .sm-month { justify-content: flex-start; padding-left: 48px; }

  .sm-row {
    grid-template-columns: 48px 1fr;
  }
  .sm-row--l .sm-panel,
  .sm-row--r .sm-panel { grid-column: 2; grid-row: 1; }
  .sm-row--l .sm-dot-col,
  .sm-row--r .sm-dot-col { grid-column: 1; grid-row: 1; }
  .sm-row--l .sm-spacer,
  .sm-row--r .sm-spacer { display: none; }

  .sm-row--l .sm-panel::after,
  .sm-row--r .sm-panel::after {
    left: -9px; right: auto;
    border-right: 9px solid var(--db-border);
    border-left: none;
  }
  .sm-row--l .sm-panel::before,
  .sm-row--r .sm-panel::before {
    left: -7px; right: auto;
    border-right: 8px solid var(--db-surface);
    border-left: none;
  }
.sm-tl-start { align-items: flex-start; padding-left: 22px; }
  .sm-tl-end { align-items: flex-start; padding-left: 22px; }
  .sm-drow { grid-template-columns: 1fr; }
}
</style>
