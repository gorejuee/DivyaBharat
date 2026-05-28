<template>
  <div class="explore-page">

    <!-- HEADER -->
    <section class="ex-header">
      <div class="ex-header-inner">
        <div class="ex-header-title">
          <p class="ex-eyebrow font-label">Discover India's Soul</p>
          <h1 class="ex-title font-display">Explore India</h1>
        </div>
        <div class="ex-search-wrap">
          <v-icon class="ex-search-icon" size="20">mdi-magnify</v-icon>
          <input
            v-model="search"
            class="ex-search-input font-body"
            placeholder="Search temples, forts, ghats..."
            @input="debouncedFetch"
          />
          <button v-if="search" class="ex-search-clear" @click="clearSearch">
            <v-icon size="15">mdi-close</v-icon>
          </button>
        </div>
        <div class="ex-count-row">
          <span class="ex-count font-display">{{ displayCount }}</span>
          <span class="ex-count-label font-label">Heritage Sites</span>
        </div>
      </div>
    </section>

    <!-- FILTER STRIP (sticky) -->
    <div class="filter-strip">
      <div class="filter-strip-inner">
        <div class="fcat-track">
          <button
            class="fcat-arrow fcat-arrow--left"
            :class="{ hidden: catScrollLeft === 0 }"
            @click="scrollCats(-1)"
            aria-label="Scroll left"
          >
            <v-icon size="16">mdi-chevron-left</v-icon>
          </button>

          <div class="fcat-scroll" ref="catScrollEl" @scroll="onCatScroll">
            <button
              class="fcat-pill font-label"
              :class="{ active: !selectedCategory }"
              @click="clearCategory"
            >All</button>
            <button
              v-for="cat in CATEGORIES"
              :key="cat.value"
              class="fcat-pill font-label"
              :class="{ active: selectedCategory === cat.value }"
              @click="selectCategory(cat.value)"
            >{{ cat.title }}</button>
          </div>

          <button
            class="fcat-arrow fcat-arrow--right"
            :class="{ hidden: catScrollAtEnd }"
            @click="scrollCats(1)"
            aria-label="Scroll right"
          >
            <v-icon size="16">mdi-chevron-right</v-icon>
          </button>
        </div>
        <button
          class="filter-region-btn font-label"
          :class="{ active: selectedState }"
          @click="regionPanel = !regionPanel"
        >
          <v-icon size="13">mdi-map-marker</v-icon>
          {{ selectedState || 'All Regions' }}
          <v-icon
            size="12"
            :style="{ transform: regionPanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }"
          >mdi-chevron-down</v-icon>
        </button>
      </div>
    </div>

    <!-- REGION PANEL -->
    <transition name="region-slide">
      <div v-if="regionPanel" class="region-panel">
        <div class="region-panel-inner">
          <div class="region-panel-head">
            <input
              v-model="regionSearch"
              class="region-search font-body"
              placeholder="Search regions..."
            />
            <button v-if="selectedState" class="region-clear font-label" @click="selectState('')">
              Clear
            </button>
            <button class="region-close" @click="regionPanel = false">
              <v-icon size="16">mdi-close</v-icon>
            </button>
          </div>
          <div class="region-chips">
            <button
              v-for="item in filteredRegions"
              :key="item.state"
              class="region-chip font-label"
              :class="{ active: selectedState === item.state }"
              @click="selectState(item.state)"
            >
              {{ item.state }}<span class="region-chip-count">{{ item.count }}</span>
            </button>
            <p v-if="filteredRegions.length === 0" class="region-empty font-body">No regions match</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- RESULTS META -->
    <div class="results-bar">
      <div class="results-bar-inner">
        <div class="active-filters">
          <span class="filter-tag font-label" v-if="selectedState">
            <v-icon size="11">mdi-map-marker</v-icon>
            {{ selectedState }}
            <button @click="selectState('')"><v-icon size="11">mdi-close</v-icon></button>
          </span>
          <span class="filter-tag font-label" v-if="selectedCategory">
            {{ CATEGORIES.find(c => c.value === selectedCategory)?.title }}
            <button @click="clearCategory"><v-icon size="11">mdi-close</v-icon></button>
          </span>
        </div>
        <p class="results-count font-label" v-if="!loading && total > 0">
          {{ total.toLocaleString() }} places
          <template v-if="totalPages > 1"> &middot; Page {{ page }} of {{ totalPages }}</template>
        </p>
      </div>
    </div>

    <!-- LOADING SKELETON -->
    <div v-if="loading" class="places-grid">
      <div v-for="n in 24" :key="n" class="place-skeleton" />
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="places.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <v-icon size="44" color="primary">mdi-map-search</v-icon>
      </div>
      <h3 class="empty-title font-display">No places found</h3>
      <p class="empty-sub font-body">Try a different search or filter</p>
      <button class="empty-reset font-label" @click="clearFilters">Reset all filters</button>
    </div>

    <!-- PLACES GRID -->
    <transition-group v-else name="card-stagger" tag="div" class="places-grid">
      <PlaceCard
        v-for="place in places"
        :key="place.id"
        :place="place"
        :style="{ transitionDelay: `${places.indexOf(place) * 25}ms` }"
        @click="goToPlace(place.id)"
      />
    </transition-group>

    <!-- PAGINATION -->
    <div v-if="totalPages > 1" class="explore-pagination">
      <button class="pg-arrow font-label" :disabled="page === 1" @click="goToPage(page - 1)">
        &larr; Prev
      </button>
      <div class="pg-pages">
        <button
          v-for="(p, i) in visiblePages"
          :key="i"
          class="pg-num font-label"
          :class="{ active: p === page, ellipsis: p === '...' }"
          :disabled="p === '...'"
          @click="p !== '...' && goToPage(p)"
        >{{ p }}</button>
      </div>
      <button class="pg-arrow font-label" :disabled="page === totalPages" @click="goToPage(page + 1)">
        Next &rarr;
      </button>
      <div class="pg-jump">
        <input
          v-model="jumpPage"
          class="pg-jump-input font-label"
          type="number"
          :min="1"
          :max="totalPages"
          placeholder="Page"
          @keyup.enter="handleJump"
        />
        <button class="pg-jump-btn font-label" @click="handleJump">Go</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'lodash';
import api from '@/services/api';
import { CATEGORIES } from '@/utils/placeHelpers';
import PlaceCard from '@/components/PlaceCard.vue';


const router = useRouter();
const route = useRoute();

const places = ref([]);
const loading = ref(false);
const search = ref('');
const selectedCategory = ref(null);
const selectedState = ref('');
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);
const topStates = ref([]);
const regionPanel = ref(false);
const regionSearch = ref('');
const jumpPage = ref('');
const catScrollEl = ref(null);
const catScrollLeft = ref(0);
const catScrollAtEnd = ref(false);
const displayCount = ref('...');

// Animate the count from old value to new when total loads
watch(total, (newVal, oldVal) => {
  if (newVal === 0) return;
  const start = oldVal || 0;
  const end = newVal;
  const duration = 900;
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayCount.value = Math.round(start + (end - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const onCatScroll = () => {
  const el = catScrollEl.value;
  if (!el) return;
  catScrollLeft.value = el.scrollLeft;
  catScrollAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
};

const scrollCats = (dir) => {
  const el = catScrollEl.value;
  if (!el) return;
  el.scrollBy({ left: dir * 200, behavior: 'smooth' });
};

const filteredRegions = computed(() => {
  if (!regionSearch.value) return topStates.value;
  return topStates.value.filter(s =>
    s.state.toLowerCase().includes(regionSearch.value.toLowerCase())
  );
});

const visiblePages = computed(() => {
  const tot = totalPages.value;
  const cur = page.value;
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, '...', tot];
  if (cur >= tot - 3) return [1, '...', tot - 4, tot - 3, tot - 2, tot - 1, tot];
  return [1, '...', cur - 1, cur, cur + 1, '...', tot];
});

const fetchStates = async () => {
  try {
    const res = await api.get('/places/states');
    topStates.value = res.data.states;
  } catch { /* silent */ }
};

const fetchPlaces = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, limit: 24 };
    if (search.value)           params.search = search.value;
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (selectedState.value)    params.state = selectedState.value;
    const res = await api.get('/places', { params });
    places.value = res.data.places;
    totalPages.value = res.data.pagination.totalPages;
    total.value = res.data.pagination.total;

  } catch { /* silent */ }
  finally { loading.value = false; }
};

const debouncedFetch = debounce(() => { page.value = 1; fetchPlaces(); }, 300);

const selectCategory = (val) => {
  selectedCategory.value = selectedCategory.value === val ? null : val;
  page.value = 1;
  fetchPlaces();
};

const clearCategory = () => { selectedCategory.value = null; page.value = 1; fetchPlaces(); };
const clearSearch   = () => { search.value = ''; page.value = 1; fetchPlaces(); };

const selectState = (state) => {
  selectedState.value = selectedState.value === state ? '' : state;
  regionPanel.value = false;
  regionSearch.value = '';
  page.value = 1;
  fetchPlaces();
};

const clearFilters = () => {
  search.value = '';
  selectedCategory.value = null;
  selectedState.value = '';
  regionSearch.value = '';
  page.value = 1;
  fetchPlaces();
};

const goToPage = (p) => {
  page.value = p;
  // Persist page in URL so router.back() from PlaceDetail restores it
  router.replace({ query: { ...route.query, page: p === 1 ? undefined : p } });
  fetchPlaces();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleJump = () => {
  const p = parseInt(jumpPage.value);
  if (p >= 1 && p <= totalPages.value) { goToPage(p); jumpPage.value = ''; }
};

const goToPlace = (id) => router.push(`/places/${id}`);

onMounted(() => {
  if (route.query.category) selectedCategory.value = route.query.category;
  if (route.query.state)    selectedState.value = route.query.state;
  if (route.query.page)     page.value = parseInt(route.query.page) || 1;
  fetchStates();
  fetchPlaces();
  // initialise arrow state after DOM renders
  setTimeout(onCatScroll, 100);
});
</script>

<style scoped>
/* ================================================================
   PAGE BASE
================================================================ */
.explore-page {
  min-height: 100vh;
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  background-attachment: fixed;
}

/* ================================================================
   HEADER - compact single row
================================================================ */
.ex-header {
  background: var(--db-bg);
  border-bottom: 1px solid var(--db-border);
  padding: 28px 48px 24px;
}

.ex-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 40px;
}

.ex-header-title { flex-shrink: 0; }

.ex-eyebrow {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin-bottom: 4px;
}

.ex-title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 600;
  color: var(--db-text);
  letter-spacing: -0.5px;
  line-height: 1;
}

.ex-count-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.ex-count {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--db-gold-bright);
  line-height: 1;
}

.ex-count-label {
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-text-muted);
}

/* ---- Search (inline) ---- */
.ex-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  padding: 9px 14px;
  background: var(--db-surface);
  transition: border-color 0.2s;
}
.ex-search-wrap:focus-within {
  border-color: rgba(200,134,30,0.45);
}

.ex-search-icon {
  color: var(--db-text-muted) !important;
  flex-shrink: 0;
}

.ex-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: var(--db-text);
  caret-color: var(--db-gold);
}
.ex-search-input::placeholder {
  color: rgba(160,140,114,0.45);
}

.ex-search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--db-text-muted);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}
.ex-search-clear:hover { color: var(--db-text); }

/* ================================================================
   FILTER STRIP - sticky below the floating nav
================================================================ */
.filter-strip {
  position: sticky;
  top: 68px;
  z-index: 50;
  background: rgba(22,13,6,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--db-border);
}

.filter-strip-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 48px;
  gap: 16px;
}

.fcat-track {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  position: relative;
}

.fcat-arrow {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--db-border);
  background: var(--db-surface-2);
  color: var(--db-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s, opacity 0.18s;
  z-index: 2;
}
.fcat-arrow:hover {
  background: rgba(200,134,30,0.12);
  border-color: rgba(200,134,30,0.35);
  color: var(--db-gold-bright);
}
.fcat-arrow.hidden {
  opacity: 0;
  pointer-events: none;
}

.fcat-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow-x: auto;
  padding: 12px 6px;
  scrollbar-width: none;
}
.fcat-scroll::-webkit-scrollbar { display: none; }

.fcat-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 40px;
  border: 1px solid var(--db-border);
  background: transparent;
  color: var(--db-text-muted);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.fcat-pill:hover {
  background: rgba(200,134,30,0.08);
  border-color: rgba(200,134,30,0.3);
  color: var(--db-text);
}
.fcat-pill.active {
  background: var(--db-gold);
  border-color: var(--db-gold);
  color: var(--db-bg);
}

.filter-region-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 40px;
  border: 1px solid var(--db-border);
  background: transparent;
  color: var(--db-text-muted);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.filter-region-btn:hover,
.filter-region-btn.active {
  background: rgba(200,134,30,0.1);
  border-color: rgba(200,134,30,0.4);
  color: var(--db-gold-bright);
}

/* ================================================================
   REGION PANEL
================================================================ */
.region-panel {
  background: var(--db-surface-2);
  border-bottom: 1px solid var(--db-border);
}

.region-panel-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 48px;
}

.region-panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.region-search {
  flex: 1;
  background: var(--db-surface-3);
  border: 1px solid var(--db-border);
  border-radius: 8px;
  padding: 8px 14px;
  color: var(--db-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.region-search:focus { border-color: var(--db-gold-muted); }
.region-search::placeholder { color: var(--db-text-muted); }

.region-clear {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--db-gold);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  padding: 0 4px;
}

.region-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--db-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s;
}
.region-close:hover { color: var(--db-text); }

.region-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  max-height: 180px;
  overflow-y: auto;
}

.region-chip {
  padding: 5px 14px;
  border-radius: 40px;
  border: 1px solid var(--db-border);
  background: transparent;
  color: var(--db-text-muted);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.region-chip:hover {
  background: rgba(200,134,30,0.08);
  border-color: rgba(200,134,30,0.3);
  color: var(--db-text);
}
.region-chip.active {
  background: rgba(200,134,30,0.15);
  border-color: var(--db-gold);
  color: var(--db-gold-bright);
}

.region-chip-count {
  opacity: 0.45;
  margin-left: 5px;
  font-size: 0.72rem;
}

.region-empty {
  font-size: 0.88rem;
  color: var(--db-text-muted);
}

/* region panel slide */
.region-slide-enter-active,
.region-slide-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.region-slide-enter-from,
.region-slide-leave-to   { opacity: 0; transform: translateY(-8px); }

/* ================================================================
   RESULTS BAR
================================================================ */
.results-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 48px 12px;
}

.results-bar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px 12px;
  border-radius: 40px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.28);
  color: var(--db-gold-bright);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.filter-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--db-gold);
  display: flex;
  align-items: center;
  padding: 0;
  opacity: 0.65;
  transition: opacity 0.15s;
}
.filter-tag button:hover { opacity: 1; }

.results-count {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-text-muted);
  white-space: nowrap;
  margin-left: auto;
}

/* ================================================================
   LOADING SKELETON
================================================================ */
.place-skeleton {
  height: 280px;
  border-radius: 12px;
  background: var(--db-surface);
  border: 1px solid var(--db-border);
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

/* ================================================================
   EMPTY STATE
================================================================ */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  max-width: 380px;
  margin: 0 auto;
}
.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(200,134,30,0.06);
  border: 1px solid rgba(200,134,30,0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}
.empty-title {
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--db-text);
  margin-bottom: 10px;
}
.empty-sub {
  font-size: 0.95rem;
  color: var(--db-text-muted);
  line-height: 1.6;
  margin-bottom: 28px;
}
.empty-reset {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--db-gold);
  background: none;
  border: 1px solid rgba(200,134,30,0.3);
  border-radius: 40px;
  padding: 9px 22px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.empty-reset:hover {
  background: rgba(200,134,30,0.08);
  border-color: var(--db-gold);
}

/* ================================================================
   PLACES GRID
================================================================ */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px 40px;
}

.card-stagger-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.card-stagger-enter-from   { opacity: 0; transform: translateY(16px); }
.card-stagger-leave-active { transition: opacity 0.2s ease; }
.card-stagger-leave-to     { opacity: 0; }

/* ================================================================
   PAGINATION
================================================================ */
.explore-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 48px 64px;
}

.pg-arrow {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-text-muted);
  background: none;
  border: 1px solid var(--db-border);
  border-radius: 8px;
  padding: 8px 18px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.pg-arrow:not(:disabled):hover {
  color: var(--db-gold-bright);
  border-color: rgba(200,134,30,0.4);
  background: rgba(200,134,30,0.06);
}
.pg-arrow:disabled { opacity: 0.28; cursor: default; }

.pg-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pg-num {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: none;
  color: var(--db-text-muted);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.pg-num:not(.ellipsis):not(.active):hover {
  color: var(--db-text);
  border-color: var(--db-border);
  background: var(--db-surface);
}
.pg-num.active {
  color: var(--db-gold-bright);
  border-color: rgba(200,134,30,0.4);
  background: rgba(200,134,30,0.1);
  cursor: default;
}
.pg-num.ellipsis {
  cursor: default;
  color: rgba(160,140,114,0.35);
}

.pg-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding-left: 16px;
  border-left: 1px solid var(--db-border);
}

.pg-jump-input {
  width: 68px;
  background: var(--db-surface);
  border: 1px solid var(--db-border);
  border-radius: 8px;
  padding: 7px 10px;
  color: var(--db-text);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
  appearance: textfield;
}
.pg-jump-input::-webkit-inner-spin-button,
.pg-jump-input::-webkit-outer-spin-button { -webkit-appearance: none; appearance: none; }
.pg-jump-input:focus { border-color: rgba(200,134,30,0.4); }
.pg-jump-input::placeholder { color: var(--db-text-muted); opacity: 0.5; }

.pg-jump-btn {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.35);
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s;
}
.pg-jump-btn:hover {
  background: rgba(200,134,30,0.18);
  border-color: var(--db-gold);
}

/* ================================================================
   RESPONSIVE
================================================================ */
@media (max-width: 900px) {
  .ex-header          { padding: 40px 24px 36px; }
  .ex-header-inner    { flex-wrap: wrap; gap: 16px; }
  .ex-count-row       { margin-left: 0; }
  .filter-strip-inner { padding: 0 24px; }
  .region-panel-inner { padding: 20px 24px; }
  .results-bar        { padding: 14px 24px 10px; }

  .places-grid        { padding: 0 24px 40px; }
  .explore-pagination { padding: 16px 24px 48px; }
}

@media (max-width: 600px) {
  .ex-header          { padding: 32px 16px 28px; }
  .filter-strip-inner { padding: 0 16px; }
  .region-panel-inner { padding: 16px; }
  .results-bar        { padding: 12px 16px 8px; }

  .places-grid        { padding: 0 16px 32px; grid-template-columns: 1fr; }
  .explore-pagination { padding: 16px 16px 40px; }
  .pg-pages           { display: none; }
}
</style>
