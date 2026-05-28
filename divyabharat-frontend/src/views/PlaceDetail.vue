<template>
  <div class="pd-root">

    <!-- ── Loading ── -->
    <div v-if="loading" class="pd-loading">
      <v-progress-circular indeterminate color="primary" size="52" width="2" />
      <p class="pd-loading-label font-label">Summoning records…</p>
    </div>

    <!-- ── Not Found ── -->
    <div v-else-if="!place" class="pd-notfound">
      <v-icon size="52" color="primary" style="opacity:0.3;">mdi-map-marker-off</v-icon>
      <h2 class="pd-nf-title font-display">Place Not Found</h2>
      <v-btn variant="tonal" color="primary" @click="router.back()">← Back to Explore</v-btn>
    </div>

    <!-- ── Detail ── -->
    <template v-else>

      <!-- Hero 100vh -->
      <div class="pd-hero">
        <div v-if="!imgFailed && place.image_url" class="pd-hero-img-wrap">
          <img
            :src="place.image_url"
            :alt="place.name"
            class="pd-hero-img"
            @error="imgFailed = true"
          />
        </div>
        <div
          v-else
          class="pd-hero-placeholder"
          :style="{ background: gradients[place.category] || gradients.other }"
        >
          <!-- dot-grid texture -->
          <div class="pd-hero-placeholder-grid" />
          <!-- radial vignette -->
          <div class="pd-hero-placeholder-vignette" />
          <v-icon size="140" class="pd-hero-placeholder-icon">
            {{ icons[place.category] || 'mdi-map-marker' }}
          </v-icon>
        </div>

        <div class="pd-hero-veil-top" />
        <div class="pd-hero-veil-bottom" />

        <button class="pd-back font-label" @click="router.back()">
          <v-icon size="13">mdi-arrow-left</v-icon> Explore
        </button>

        <div class="pd-hero-content">
          <p class="pd-hero-eyebrow font-label">{{ formatCategory(place.category) }}</p>
          <h1 class="pd-hero-title font-display">{{ place.name }}</h1>
          <p class="pd-hero-loc font-label">
            <v-icon size="12" style="color:var(--db-gold);margin-right:5px;">mdi-map-marker</v-icon>
            {{ place.city ? place.city + ', ' : '' }}{{ place.state }}
          </p>
        </div>

        <div class="pd-hero-scroll-hint" @click="scrollHeroDown" style="cursor:pointer;">
          <svg class="pd-scroll-arrow" viewBox="0 0 28 36" width="28" height="36" fill="none">
            <polyline points="4,4 14,16 24,4"
              stroke="rgba(200,134,30,0.85)" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="4,16 14,28 24,16"
              stroke="rgba(200,134,30,0.45)" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- ── Page body: rail + main ── -->
      <div class="pd-body">

        <!-- Left sticky rail (desktop) -->
        <aside class="pd-rail">

          <div v-if="isLoggedIn" class="pd-rail-visited">
            <button
              class="pd-visited-btn font-label"
              :class="{ 'pd-visited-btn--active': isVisited }"
              :disabled="visitLoading"
              @click="toggleVisited"
            >
              <v-icon size="13">{{ isVisited ? 'mdi-check-circle' : 'mdi-map-marker-check-outline' }}</v-icon>
              {{ isVisited ? 'Visited' : 'Mark Visited' }}
            </button>
          </div>

          <nav class="pd-rail-nav">
            <button
              v-for="s in visibleSections"
              :key="s.id"
              class="pd-rail-item font-label"
              :class="{ 'pd-rail-item--active': activeSection === s.id }"
              @click="scrollToSection(s.id)"
            >
              <span class="pd-rail-tick" />
              {{ s.label }}
            </button>
          </nav>

          <div class="pd-rail-meta font-label">
            <div class="pd-rail-meta-row">
              <v-icon size="12" style="color:var(--db-gold);opacity:0.65;">{{ icons[place.category] || 'mdi-map-marker' }}</v-icon>
              <span>{{ formatCategory(place.category) }}</span>
            </div>
            <div class="pd-rail-meta-row">
              <v-icon size="12" style="color:var(--db-gold);opacity:0.65;">mdi-map-marker-outline</v-icon>
              <span>{{ place.state }}</span>
            </div>
          </div>
        </aside>

        <!-- Scrolling content -->
        <main class="pd-main">

          <!-- About -->
          <section
            id="pd-section-about"
            data-section="about"
            class="pd-section pd-reveal"
          >
            <h2 class="pd-section-title font-label">About</h2>
            <p v-if="place.description" class="pd-body-text font-body">
              {{ place.description }}
            </p>
            <div v-if="place.wiki_extract">
              <p class="pd-body-text font-body">{{ place.wiki_extract }}</p>
              <a
                v-if="place.wiki_url"
                :href="place.wiki_url"
                target="_blank"
                class="pd-wiki-link font-label"
              >Read more on Wikipedia →</a>
            </div>
            <p
              v-if="!place.description && !place.wiki_extract"
              class="pd-body-text pd-muted font-body"
            >No description available yet.</p>
          </section>

          <!-- History -->
          <section
            v-if="place.history"
            id="pd-section-history"
            data-section="history"
            class="pd-section pd-reveal"
          >
            <h2 class="pd-section-title font-label">History</h2>
            <div class="pd-history-card">
              <p class="pd-body-text font-body" style="margin:0;">{{ place.history }}</p>
            </div>
          </section>

          <!-- Location -->
          <section
            v-if="place.latitude && place.longitude"
            id="pd-section-location"
            data-section="location"
            class="pd-section pd-reveal"
          >
            <h2 class="pd-section-title font-label">Location</h2>
            <div class="pd-map-wrap">
              <div :id="`mini-map-${place.id}`" class="pd-map" />
              <div class="pd-map-footer">
                <span class="pd-coords font-label">
                  {{ place.latitude.toFixed(4) }}°N &nbsp;{{ place.longitude.toFixed(4) }}°E
                </span>
                <a
                  :href="`https://www.google.com/maps?q=${place.latitude},${place.longitude}`"
                  target="_blank"
                  class="pd-gmaps-btn font-label"
                >
                  <v-icon size="13" style="margin-right:4px;">mdi-google-maps</v-icon>
                  Open in Maps
                </a>
              </div>
            </div>
          </section>

          <!-- AI Guide -->
          <section
            id="pd-section-ai"
            data-section="ai"
            class="pd-section pd-section--last pd-reveal"
          >
            <h2 class="pd-section-title font-label">AI Guide</h2>

            <div v-if="!isLoggedIn" class="pd-ai-locked">
              <v-icon size="36" style="color:var(--db-gold);opacity:0.3;">mdi-lock-outline</v-icon>
              <p class="pd-body-text pd-muted font-body" style="margin:0;">
                Login to consult the sacred guide
              </p>
              <button class="pd-pill-btn font-label" @click="router.push('/login')">Login</button>
            </div>

            <div v-else class="pd-chat">
              <div class="pd-chat-msgs" ref="chatContainer">

                <div v-if="chatHistory.length === 0" class="pd-chat-empty">
                  <v-icon size="32" style="color:var(--db-gold);opacity:0.3;">mdi-robot-outline</v-icon>
                  <p class="pd-body-text pd-muted font-body" style="margin:0;font-size:0.9rem;">
                    Ask anything about {{ place.name }}
                  </p>
                  <div class="pd-suggestions">
                    <button
                      v-for="s in suggestions"
                      :key="s"
                      class="pd-suggestion font-label"
                      @click="askSuggestion(s)"
                    >{{ s }}</button>
                  </div>
                </div>

                <div v-else>
                  <div v-for="(msg, i) in chatHistory" :key="i" class="pd-msg-pair">
                    <div class="pd-msg pd-msg--user">
                      <p class="pd-user-bubble font-body">{{ msg.question }}</p>
                    </div>
                    <div class="pd-msg pd-msg--ai">
                      <v-icon size="14" style="color:var(--db-gold);flex-shrink:0;margin-top:3px;">mdi-robot</v-icon>
                      <div>
                        <p class="pd-ai-bubble font-body">{{ msg.answer }}</p>
                        <span v-if="msg.cached" class="pd-cached font-label">
                          <v-icon size="10">mdi-lightning-bolt</v-icon> Cached
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="aiLoading" class="pd-msg pd-msg--ai">
                    <v-icon size="14" style="color:var(--db-gold);flex-shrink:0;margin-top:14px;">mdi-robot</v-icon>
                    <div class="pd-ai-dots"><span /><span /><span /></div>
                  </div>
                </div>
              </div>

              <div class="pd-chat-input-row">
                <input
                  v-model="currentQuestion"
                  class="pd-chat-input font-body"
                  placeholder="Ask anything about this place…"
                  :disabled="aiLoading"
                  @keyup.enter="askQuestion"
                />
                <button
                  class="pd-chat-send"
                  :disabled="aiLoading || !currentQuestion.trim()"
                  @click="askQuestion"
                >
                  <v-icon size="17">mdi-send</v-icon>
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/services/api';
import {
  formatCategory,
  categoryGradients as gradients,
  categoryIcons as icons
} from '@/utils/placeHelpers';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const place       = ref(null);
const loading     = ref(false);
const aiLoading   = ref(false);
const visitLoading= ref(false);
const currentQuestion = ref('');
const chatHistory = ref([]);
const chatContainer = ref(null);
const imgFailed   = ref(false);
const activeSection = ref('about');

const isLoggedIn = computed(() => !!userStore.token);
const isVisited  = computed(() => place.value ? userStore.isVisited(place.value.id) : false);

const visibleSections = computed(() => {
  if (!place.value) return [];
  const s = [{ id: 'about', label: 'About' }];
  if (place.value.history) s.push({ id: 'history', label: 'History' });
  if (place.value.latitude && place.value.longitude) s.push({ id: 'location', label: 'Location' });
  s.push({ id: 'ai', label: 'AI Guide' });
  return s;
});

const suggestions = [
  'Who built this place?',
  'What is the historical significance?',
  'What should I know before visiting?',
  'What are the interesting facts?'
];

/* ── API ── */

const fetchPlace = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/places/${route.params.id}/context`);
    place.value = res.data.place;
  } catch {
    place.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchVisitedIds = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await api.get('/visits/ids');
    userStore.setVisitedPlaceIds(res.data.visitedPlaceIds);
  } catch { /* silent */ }
};

const toggleVisited = async () => {
  if (!place.value) return;
  visitLoading.value = true;
  try {
    if (isVisited.value) {
      await api.delete(`/visits/${place.value.id}`);
      userStore.removeVisitedPlaceId(place.value.id);
    } else {
      await api.post('/visits', { placeId: place.value.id });
      userStore.addVisitedPlaceId(place.value.id);
    }
  } catch { /* silent */ } finally {
    visitLoading.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

const askQuestion = async () => {
  if (!currentQuestion.value.trim() || aiLoading.value) return;
  const question = currentQuestion.value.trim();
  currentQuestion.value = '';
  aiLoading.value = true;
  await scrollToBottom();
  try {
    const res = await api.post('/ai/ask', { placeId: place.value.id, question });
    chatHistory.value.push({ question, answer: res.data.answer, cached: res.data.cached });
    await scrollToBottom();
  } catch {
    chatHistory.value.push({ question, answer: 'Sorry, I could not answer that right now.', cached: false });
  } finally {
    aiLoading.value = false;
  }
};

const askSuggestion = (s) => { currentQuestion.value = s; askQuestion(); };

const scrollHeroDown = () => {
  const body = document.querySelector('.pd-body');
  if (body) body.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
};

/* ── Section nav ── */

const scrollToSection = (id) => {
  const el = document.getElementById(`pd-section-${id}`);
  if (!el) return;
  // Scroll so the section top lands at ~30% from viewport top (safely below the 45% trigger)
  const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
};

/* ── Observers ── */

let revealObserver   = null;
let scrollSpyHandler = null;

const initScrollSpy = () => {
  scrollSpyHandler = () => {
    const sections = document.querySelectorAll('[data-section]');
    const trigger = window.innerHeight * 0.45;
    // When near page bottom, last visible section in viewport wins
    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;
    let current = visibleSections.value[0]?.id || 'about';
    if (atBottom) {
      sections.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) current = el.dataset.section;
      });
    } else {
      sections.forEach(el => {
        if (el.getBoundingClientRect().top <= trigger) current = el.dataset.section;
      });
    }
    activeSection.value = current;
  };
  window.addEventListener('scroll', scrollSpyHandler, { passive: true });
  scrollSpyHandler();
};

const initRevealObserver = () => {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('pd-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.pd-reveal').forEach(el => revealObserver.observe(el));
};

/* ── Leaflet ── */

let miniMap = null;

const initMiniMap = () => {
  if (!place.value?.latitude || !place.value?.longitude) return;
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

  loadLeaflet().then(() => {
    const id = `mini-map-${place.value.id}`;
    if (!document.getElementById(id)) return;
    miniMap = window.L.map(id, { zoomControl: true, scrollWheelZoom: false })
      .setView([place.value.latitude, place.value.longitude], 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(miniMap);
    window.L.marker([place.value.latitude, place.value.longitude])
      .addTo(miniMap).bindPopup(place.value.name).openPopup();
  });
};

onMounted(async () => {
  await fetchPlace();
  await fetchVisitedIds();
  await nextTick();
  initMiniMap();
  initScrollSpy();
  initRevealObserver();
});

onUnmounted(() => {
  if (miniMap) { miniMap.remove(); miniMap = null; }
  if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
  revealObserver?.disconnect();
});
</script>

<style scoped>
/* ── Root ── */
.pd-root {
  background: var(--db-bg);
  color: var(--db-text);
  min-height: 100vh;
  margin-top: -80px;
}

/* ── Loading / Not found ── */
.pd-loading {
  min-height: 100vh;
  background: var(--db-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.pd-loading-label {
  font-size: 0.62rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.6;
}
.pd-notfound {
  min-height: 100vh;
  background: var(--db-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
  padding: 40px;
}
.pd-nf-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: var(--db-text);
}

/* ── Hero ── */
.pd-hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
}
.pd-hero-img-wrap {
  position: absolute;
  inset: 0;
}
.pd-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: pdKenBurns 22s ease-in-out infinite alternate;
}
@keyframes pdKenBurns {
  from { transform: scale(1.0) translate(0, 0); }
  to   { transform: scale(1.09) translate(-1%, -0.8%); }
}
.pd-hero-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pd-hero-placeholder-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}
.pd-hero-placeholder-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 20%, rgba(22,13,6,0.55) 100%);
  pointer-events: none;
}
.pd-hero-placeholder-icon {
  position: relative;
  color: rgba(255,255,255,0.1) !important;
  z-index: 1;
}
.pd-hero-veil-top {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(22,13,6,0.7) 0%, transparent 28%);
  pointer-events: none;
}
.pd-hero-veil-bottom {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 32%, rgba(22,13,6,0.6) 60%, #160D06 100%);
  pointer-events: none;
}

/* Back pill - fixed at same height as floating nav */
.pd-back {
  position: fixed;
  top: 22px;
  left: 20px;
  z-index: 910;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(237,227,206,0.85);
  background: rgba(9,6,10,0.72);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(200,134,30,0.3);
  border-radius: 12px;
  padding: 9px 18px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.pd-back:hover {
  background: rgba(200,134,30,0.15);
  color: var(--db-gold-bright);
  border-color: rgba(200,134,30,0.55);
}

/* Hero content block */
.pd-hero-content {
  position: absolute;
  bottom: 88px;
  left: 0;
  right: 0;
  padding: 0 clamp(24px, 6vw, 100px);
  z-index: 5;
}
.pd-hero-eyebrow {
  font-size: 0.85rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 0 0 18px;
}
.pd-hero-title {
  font-size: clamp(3rem, 7vw, 6.5rem);
  color: var(--db-text);
  line-height: 1.0;
  margin: 0 0 18px;
  text-shadow: 0 4px 48px rgba(22,13,6,0.9);
}
.pd-hero-loc {
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(237,227,206,0.9);
  margin: 0;
  display: flex;
  align-items: center;
}

/* Scroll hint line */
.pd-hero-scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pd-scroll-arrow {
  animation: pdArrowBob 2s ease-in-out infinite;
}
@keyframes pdArrowBob {
  0%, 100% { transform: translateY(0); opacity: 0.65; }
  50%       { transform: translateY(9px); opacity: 1; }
}

/* ── Page body layout ── */
.pd-body {
  display: flex;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 60px);
}

/* ── Left sticky rail ── */
.pd-rail {
  width: 210px;
  flex-shrink: 0;
  padding-top: 72px;
  padding-right: 48px;
  position: sticky;
  top: 96px;
  height: fit-content;
  align-self: flex-start;
}

.pd-rail-visited {
  margin-bottom: 36px;
  margin-left: -5px; /* visually float the pill slightly left of the bullet dots */
}
.pd-visited-btn {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 14px 8px 10px;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid rgba(200,134,30,0.35);
  background: rgba(200,134,30,0.07);
  color: var(--db-gold);
  transition: background 0.2s, border-color 0.2s;
}
.pd-visited-btn:hover:not(:disabled) {
  background: rgba(200,134,30,0.16);
  border-color: rgba(200,134,30,0.6);
}
.pd-visited-btn--active {
  background: rgba(74,222,128,0.09);
  border-color: rgba(74,222,128,0.35);
  color: #4ade80;
}
.pd-visited-btn--active:hover:not(:disabled) { background: rgba(74,222,128,0.18); }
.pd-visited-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.pd-rail-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 36px;
}
.pd-rail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.88rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-text);
  background: none;
  border: none;
  cursor: pointer;
  padding: 9px 0;
  text-align: left;
  opacity: 0.55;
  transition: color 0.25s, opacity 0.25s;
}
.pd-rail-item--active {
  color: var(--db-gold);
  opacity: 1;
}
/* Circle dot indicator instead of tick */
.pd-rail-tick {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid rgba(200,134,30,0.4);
  flex-shrink: 0;
  transition: background 0.25s, border-color 0.25s, transform 0.25s;
}
.pd-rail-item--active .pd-rail-tick {
  background: var(--db-gold);
  border-color: var(--db-gold);
  transform: scale(1.2);
}

.pd-rail-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(200,134,30,0.1);
}
.pd-rail-meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.86rem;
  letter-spacing: 0.5px;
  color: var(--db-text);
  opacity: 0.9;
}

/* ── Scrolling main content ── */
.pd-main {
  flex: 1;
  min-width: 0;
  padding-top: 72px;
  padding-bottom: 100px;
}

/* Sections */
.pd-section {
  margin-bottom: 84px;
  /* reveal initial state */
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.75s ease, transform 0.75s ease;
}
.pd-section.pd-revealed {
  opacity: 1;
  transform: translateY(0);
}
.pd-section--last { margin-bottom: 0; }

.pd-section-title {
  font-size: 0.78rem;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin: 0 0 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}
/* Gold diamond ornament */
.pd-section-title::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: var(--db-gold);
  transform: rotate(45deg);
  flex-shrink: 0;
  opacity: 0.9;
  border-radius: 1px;
}
/* Short fade-out rule after the label */
.pd-section-title::after {
  content: '';
  display: block;
  flex: 1;
  max-width: 48px;
  height: 1px;
  background: linear-gradient(to right, rgba(200,134,30,0.5), transparent);
}

/* Body text */
.pd-body-text {
  font-size: 1.05rem;
  line-height: 1.88;
  color: rgba(237, 227, 206, 0.88);
  margin: 0 0 20px;
}
.pd-body-text:last-child { margin-bottom: 0; }
.pd-muted { color: var(--db-text-muted); opacity: 0.72; }


/* Wikipedia link */
.pd-wiki-link {
  display: inline-block;
  margin-top: 14px;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  text-decoration: none;
  border-bottom: 1px solid rgba(234,160,48,0.5);
  padding-bottom: 2px;
  transition: color 0.2s, border-color 0.2s;
}
.pd-wiki-link:hover {
  color: #fff;
  border-color: rgba(234,160,48,0.9);
}

/* History card */
.pd-history-card {
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.1);
  border-left: 3px solid rgba(200,134,30,0.5);
  border-radius: 8px;
  padding: 28px 32px;
}

/* Map */
.pd-map-wrap {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(200,134,30,0.15);
}
.pd-map {
  height: 300px;
  width: 100%;
  z-index: 0;
}
.pd-map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: var(--db-surface);
}
.pd-coords {
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: var(--db-text);
  opacity: 0.75;
}
.pd-gmaps-btn {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  text-decoration: none;
  border: 1px solid rgba(234,160,48,0.45);
  border-radius: 14px;
  padding: 6px 16px;
  transition: background 0.2s, color 0.2s;
}
.pd-gmaps-btn:hover { background: rgba(200,134,30,0.15); color: #fff; }

/* AI locked */
.pd-ai-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 52px 40px;
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.1);
  border-radius: 12px;
  text-align: center;
}
.pd-pill-btn {
  font-size: 0.6rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 9px 22px;
  border-radius: 20px;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.35);
  color: var(--db-gold);
  cursor: pointer;
  transition: background 0.2s;
}
.pd-pill-btn:hover { background: rgba(200,134,30,0.2); }

/* Chat */
.pd-chat {
  background: var(--db-surface);
  border: 1px solid rgba(200,134,30,0.12);
  border-radius: 12px;
  overflow: hidden;
}
.pd-chat-msgs {
  min-height: 200px;
  max-height: 440px;
  overflow-y: auto;
  padding: 24px;
  scrollbar-width: thin;
  scrollbar-color: rgba(200,134,30,0.18) transparent;
}
.pd-chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 0;
  text-align: center;
}
.pd-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.pd-suggestion {
  font-size: 0.72rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 14px;
  background: rgba(200,134,30,0.07);
  border: 1px solid rgba(200,134,30,0.24);
  color: var(--db-gold);
  cursor: pointer;
  transition: background 0.2s;
}
.pd-suggestion:hover { background: rgba(200,134,30,0.17); }

.pd-msg-pair { margin-bottom: 22px; }
.pd-msg { display: flex; margin-bottom: 8px; }
.pd-msg--user { justify-content: flex-end; }
.pd-msg--ai { gap: 10px; align-items: flex-start; }

.pd-user-bubble {
  background: rgba(200,134,30,0.12);
  border: 1px solid rgba(200,134,30,0.22);
  border-radius: 12px 12px 4px 12px;
  padding: 10px 15px;
  max-width: 76%;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--db-text);
  margin: 0;
}
.pd-ai-bubble {
  background: var(--db-surface-2);
  border: 1px solid rgba(200,134,30,0.09);
  border-radius: 4px 12px 12px 12px;
  padding: 10px 15px;
  max-width: 76%;
  font-size: 0.9rem;
  line-height: 1.65;
  color: rgba(237, 227, 206, 0.82);
  margin: 0;
}
.pd-cached {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.54rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--db-gold);
  opacity: 0.5;
  margin-top: 5px;
}
.pd-ai-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
  background: var(--db-surface-2);
  border: 1px solid rgba(200,134,30,0.09);
  border-radius: 4px 12px 12px 12px;
}
.pd-ai-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--db-gold);
  opacity: 0.45;
  animation: pdDot 1.2s ease-in-out infinite;
}
.pd-ai-dots span:nth-child(2) { animation-delay: 0.2s; }
.pd-ai-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes pdDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.22; }
  40%           { transform: scale(1);   opacity: 0.75; }
}

.pd-chat-input-row {
  display: flex;
  border-top: 1px solid rgba(200,134,30,0.12);
}
.pd-chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px 20px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--db-text);
}
.pd-chat-input::placeholder { color: rgba(160,140,114,0.4); }
.pd-chat-input:disabled { opacity: 0.4; }
.pd-chat-send {
  padding: 0 22px;
  background: transparent;
  border: none;
  border-left: 1px solid rgba(200,134,30,0.12);
  color: var(--db-gold);
  cursor: pointer;
  transition: background 0.2s;
}
.pd-chat-send:hover:not(:disabled) { background: rgba(200,134,30,0.1); }
.pd-chat-send:disabled { opacity: 0.28; cursor: not-allowed; }

/* ── Mobile ── */
@media (max-width: 840px) {
  .pd-rail { display: none; }
  .pd-body { display: block; padding: 0 20px; }
  .pd-main { padding-top: 48px; padding-bottom: 64px; }
  .pd-hero-title { font-size: clamp(2.4rem, 10vw, 4rem); }
  .pd-hero-content { padding: 0 24px; bottom: 64px; }
  .pd-back { top: 20px; left: 16px; }
}
</style>
