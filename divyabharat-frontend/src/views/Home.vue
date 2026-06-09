<template>
  <div class="home">

    <div class="portals-wrap">
      <div class="portals-stage">

        <section class="full-portal fp-hero">
          <img src="/hero.png" class="fp-img" alt="Sacred India" />
          <div class="fp-veil fp-veil--hero" />
          <div class="fp-content fp-content--hero">
            <span class="fp-badge text-eyebrow">Sacred India</span>
            <h1 class="fp-title font-display">
              <span class="lw"><span class="li">DivyaBharat</span></span>
            </h1>
            <p class="fp-desc font-body">
              Every sacred site in India holds a story.
              Explore temples, ghats, forts, caves and ancient heritage, guided by history and AI.
            </p>
            <div class="hero-actions">
              <router-link to="/places" class="db-btn db-btn--gold">Explore Places</router-link>
              <router-link to="/map"    class="db-btn db-btn--ghost">View on Map</router-link>
            </div>
          </div>
        </section>

        <section class="full-portal fp-ai">
          <img src="/portal-ai.png" class="fp-img" alt="" />
          <div class="fp-veil fp-veil--bottom" />
          <div class="fp-num font-label">01 / 03</div>
          <div class="fp-content fp-content--center">
            <span class="fp-badge text-eyebrow">AI Powered</span>
            <h2 class="fp-title font-display">
              <span class="lw"><span class="li">Ask the</span></span>
              <span class="lw"><span class="li">Guide</span></span>
            </h2>
            <p class="fp-desc font-body">
              Every place comes with an AI guide that knows its history, mythology,
              significance, and the best times to visit. Ask anything.
            </p>
            <router-link to="/places" class="fp-cta font-label">
              Find a place to ask about &rarr;
            </router-link>
          </div>
        </section>

        <section class="full-portal fp-map">
          <img src="/portal-map.png" class="fp-img" alt="" />
          <div class="fp-veil fp-veil--left" />
          <div class="fp-num font-label">02 / 03</div>
          <div class="fp-content fp-content--left">
            <span class="fp-badge text-eyebrow">Interactive</span>
            <h2 class="fp-title font-display">
              <span class="lw"><span class="li">Sacred</span></span>
              <span class="lw"><span class="li">Map</span></span>
            </h2>
            <p class="fp-desc font-body">
              Every one of our 6000+ heritage sites plotted on a live map.
              Filter by category, zoom into any state, find what's near you.
            </p>
            <router-link to="/map" class="fp-cta font-label">
              Open the map &rarr;
            </router-link>
          </div>
        </section>

        <section class="full-portal fp-trips">
          <img src="/portal-trips.png" class="fp-img" alt="" />
          <div class="fp-veil fp-veil--right" />
          <div class="fp-num font-label">03 / 03</div>
          <div class="fp-content fp-content--right">
            <span class="fp-badge text-eyebrow">Plan Your Journey</span>
            <h2 class="fp-title font-display">
              <span class="lw"><span class="li">Your</span></span>
              <span class="lw"><span class="li">Yatra</span></span>
            </h2>
            <p class="fp-desc font-body">
              Build a day-by-day pilgrimage itinerary. Add stops from our database
              and let AI generate a complete plan for you.
            </p>
            <router-link to="/trips" class="fp-cta font-label">
              Plan your yatra &rarr;
            </router-link>
          </div>
        </section>

        <!-- Persistent across all four portals -->
        <div class="stage-scroll-hint">
          <template v-if="activePortalIdx === 0">
            <span class="stage-hint-line" />
            <span class="font-label stage-hint-label">Scroll to discover</span>
            <span class="stage-hint-line" />
          </template>
          <template v-else>
            <svg
              class="stage-scroll-arrow"
              viewBox="0 0 28 36" width="28" height="36" fill="none"
              style="cursor:pointer;"
              @click="scrollPortalForward"
            >
              <polyline points="4,4 14,16 24,4"
                stroke="rgba(200,134,30,0.85)" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="4,16 14,28 24,16"
                stroke="rgba(200,134,30,0.45)" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </div>

      </div>
    </div>

    <!-- STATS -->
    <section class="stats-strip">
      <div class="stats-inner">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-num font-display">{{ stat.value }}</span>
          <span class="stat-lbl font-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="cat-section">
      <div class="section-head">
        <MandalaLine />
        <h2 class="section-title font-display">Browse by Type</h2>
      </div>
      <div class="ribbon-wrap">
        <div class="ribbon">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="ribbon-pill"
            @click="router.push({ path: '/places', query: { category: cat.value } })"
          >
            <span class="pill-icon">
              <v-icon size="18" color="primary">{{ cat.icon }}</v-icon>
            </span>
            <span class="pill-label font-label">{{ cat.title }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FEATURED PLACES - Globe -->
    <section class="featured-section" v-if="globePlaces.length || featuredPlaces.length">
      <div class="section-head">
        <MandalaLine />
        <h2 class="section-title font-display">Places Worth Discovering</h2>
        <p class="feat-sub font-body">Rotate the globe to explore sacred sites across India.</p>
      </div>

      <div class="globe-layout">

        <div class="globe-col">
          <SacredGlobe
            :places="globePlaces.length ? globePlaces : featuredPlaces"
            @hover="place => activePlace = place"
          />
        </div>

        <div class="globe-panel-col">
          <Transition name="place-fade" mode="out-in">
            <div
              v-if="activePlace"
              :key="activePlace.id"
              class="globe-panel"
              @click="router.push(`/places/${activePlace.id}`)"
            >
              <div class="gp-img-wrap" v-if="activePlace.image_url">
                <img :src="activePlace.image_url" :alt="activePlace.name" class="gp-img" />
                <div class="gp-img-overlay" />
              </div>
              <div class="gp-body">
                <div class="gp-meta font-label">
                  <span class="gp-state">{{ activePlace.state }}</span>
                  <span class="gp-dot" v-if="activePlace.category">·</span>
                  <span class="gp-cat" v-if="activePlace.category">{{ activePlace.category.replace('_', ' ') }}</span>
                </div>
                <h3 class="gp-name font-display">{{ activePlace.name }}</h3>
                <p class="gp-desc font-body" v-if="activePlace.description">
                  {{ activePlace.description.slice(0, 110) }}{{ activePlace.description.length > 110 ? '...' : '' }}
                </p>
                <span class="gp-cta font-label">Explore &rarr;</span>
              </div>
            </div>
            <div v-else class="globe-panel globe-panel--empty">
              <p class="font-body" style="color:var(--db-text-muted);font-size:0.9rem;">
                Hover a point on the globe to discover a place.
              </p>
            </div>
          </Transition>
        </div>

      </div>

      <div class="feat-footer">
        <router-link to="/places" class="db-btn db-btn--ghost">View all places</router-link>
      </div>
    </section>

    <!-- CHRONICLES CTA -->
    <section class="chronicles-cta">
      <div class="chronicles-inner">

        <div class="chronicles-text">
          <span class="chronicles-eyebrow font-label">Smriti · Chronicles</span>
          <h2 class="section-title font-display" style="margin-top:10px;">Chronicle Your Yatra</h2>
          <p class="chronicles-sub font-body">
            Write about the sacred places you have walked. The moments that moved you,
            the silence you found. A living record of your personal pilgrimage.
          </p>
          <router-link to="/journal" class="db-btn db-btn--gold" style="margin-top:28px;">
            <v-icon size="14" style="margin-right:7px;">mdi-feather</v-icon>
            Start Writing
          </router-link>
        </div>

        <div class="chronicles-card-wrap">
          <div class="chronicles-card">
            <div class="cc-header">
              <div class="cc-header-left">
                <span class="cc-date font-label">June 4, 2025</span>
                <span class="cc-place font-label">· Varanasi</span>
              </div>
              <v-icon size="15" style="color:var(--db-gold);opacity:0.6;">mdi-feather</v-icon>
            </div>
            <div class="cc-divider" />
            <div class="cc-body font-body">
              <span class="cc-text">{{ chroniclesText }}</span><span class="cc-cursor">|</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- SUBMIT CTA -->
    <section class="submit-cta">
      <div class="submit-inner">
        <MandalaLine />
        <h2 class="section-title font-display" style="margin-top:14px;">Know a place we missed?</h2>
        <p class="submit-sub font-body">
          India has lakhs of sacred and heritage sites. Help us build the most
          complete spiritual travel companion.
        </p>
        <router-link to="/places/submit" class="db-btn db-btn--gold" style="margin-top:24px;">
          Submit a Place
        </router-link>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="db-footer">
      <div class="footer-inner">
        <span class="footer-brand font-display">DivyaBharat</span>
        <span class="footer-copy font-body">Built for those who love India's heritage.</span>
        <nav class="footer-links">
          <router-link to="/places">Explore</router-link>
          <router-link to="/map">Map</router-link>
          <router-link to="/trips">Trips</router-link>
          <router-link to="/places/submit">Submit</router-link>
        </nav>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import MandalaLine from '@/components/MandalaLine.vue';
import SacredGlobe from '@/components/SacredGlobe.vue';

const router = useRouter();
const featuredPlaces = ref([]);
const globePlaces    = ref([]);
const activePlace    = ref(null);
const activePortalIdx = ref(0);

// Chronicles typewriter
const SAMPLE = "Stood at the Dasaswamedh Ghat as the evening aarti began. The flames, the chanting, the river reflecting a thousand lamps. Some places do not just exist in space. They exist in time. In this moment I understood why people have been walking to Kashi for three thousand years.";
const chroniclesText = ref('');
let twInterval = null;
let twTimeout  = null;
let twObserver = null;

const startTypewriter = () => {
  if (twInterval) clearInterval(twInterval);
  if (twTimeout)  clearTimeout(twTimeout);
  chroniclesText.value = '';
  let i = 0;
  twInterval = setInterval(() => {
    if (i < SAMPLE.length) {
      chroniclesText.value += SAMPLE[i++];
    } else {
      clearInterval(twInterval);
      twInterval = null;
      twTimeout = setTimeout(startTypewriter, 2200);
    }
  }, 55);
};

const stats = [
  { value: '6000+', label: 'Heritage Sites' },
  { value: '12',    label: 'Categories' },
  { value: '28+',   label: 'States' },
  { value: 'Free',  label: 'AI Guide' },
];

const categories = [
  { title: 'Temples',           value: 'temple',           icon: 'mdi-temple-hindu' },
  { title: 'Forts',             value: 'fort',             icon: 'mdi-castle' },
  { title: 'Caves',             value: 'cave',             icon: 'mdi-tunnel' },
  { title: 'Ghats',             value: 'ghat',             icon: 'mdi-waves' },
  { title: 'Ashrams',           value: 'ashram',           icon: 'mdi-meditation' },
  { title: 'Gurudwaras',        value: 'gurudwara',        icon: 'mdi-star-david' },
  { title: 'Sacred Rivers',     value: 'sacred_river',     icon: 'mdi-wave' },
  { title: 'Ancient Sites',     value: 'ancient_site',     icon: 'mdi-pillar' },
  { title: 'Heritage Villages', value: 'heritage_village', icon: 'mdi-home-group' },
  { title: 'Museums',           value: 'museum',           icon: 'mdi-bank' },
  { title: 'Natural Sacred',    value: 'natural_sacred',   icon: 'mdi-tree' },
  { title: 'Other',             value: 'other',            icon: 'mdi-map-marker' },
];

const imageLoads = (url) => new Promise(resolve => {
  const img = new window.Image();
  img.onload  = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = url;
});

const fetchFeatured = async () => {
  try {
    let candidates = [];
    try {
      const res = await api.get('/places/featured');
      candidates = (res.data.places || []).filter(p => p.image_url && p.image_url.trim());
    } catch { /* silent */ }

    if (candidates.length < 3) {
      const fallback = await api.get('/places', { params: { limit: 200, page: 1 } });
      const extra = (fallback.data.places || []).filter(
        p => p.image_url && p.image_url.trim() && !candidates.some(x => x.id === p.id)
      );
      candidates = [...candidates, ...extra];
    }

    const pool = candidates.slice(0, 30);
    const results = await Promise.all(
      pool.map(p => imageLoads(p.image_url).then(ok => ok ? p : null))
    );

    featuredPlaces.value = results.filter(Boolean).slice(0, 3);
    if (featuredPlaces.value.length && !activePlace.value) {
      activePlace.value = featuredPlaces.value[0];
    }
  } catch { /* silent */ }
};

const fetchGlobePlaces = async () => {
  try {
    const res = await api.get('/places', { params: { limit: 300, page: 1 } });
    const all = (res.data.places || []).filter(
      p => p.latitude != null && p.longitude != null &&
           p.image_url && p.image_url.trim()
    );
    globePlaces.value = all;
    if (all.length && !activePlace.value) activePlace.value = all[0];
  } catch { /* silent */ }
};

const handleScroll = () => { updatePortals(); };

const scrollPortalForward = () => {
  const portalsCount = document.querySelectorAll('.full-portal').length;
  if (activePortalIdx.value >= portalsCount - 1) {
    const wrap = document.querySelector('.portals-wrap');
    if (wrap) window.scrollTo({ top: wrap.offsetTop + wrap.offsetHeight, behavior: 'smooth' });
  } else {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  }
};

const updatePortals = () => {
  const wrap = document.querySelector('.portals-wrap');
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollable = wrap.offsetHeight - vh;
  if (scrollable <= 0) return;
  const scrolled = Math.max(0, -rect.top);
  const progress = Math.min(1, scrolled / scrollable);
  const portals = document.querySelectorAll('.full-portal');
  const activeIdx = Math.min(portals.length - 1, Math.floor(progress * portals.length));
  portals.forEach((el, i) => {
    const isActive = i === activeIdx;
    el.classList.toggle('visible', isActive);
    if (isActive && !el.classList.contains('active')) el.classList.add('active');
  });
  activePortalIdx.value = activeIdx;
};

onMounted(() => {
  fetchFeatured();
  fetchGlobePlaces();
  window.addEventListener('scroll', handleScroll, { passive: true });
  const first = document.querySelector('.full-portal');
  if (first) first.classList.add('active', 'visible');

  // Chronicles typewriter - trigger when section scrolls into view
  const section = document.querySelector('.chronicles-cta');
  if (section) {
    twObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { startTypewriter(); twObserver.disconnect(); } },
      { threshold: 0.25 }
    );
    twObserver.observe(section);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (twInterval) clearInterval(twInterval);
  if (twTimeout)  clearTimeout(twTimeout);
  if (twObserver) twObserver.disconnect();
});
</script>

<style scoped>
/* ================================================================
   PAGE BASE
================================================================ */
.home {
  background: var(--db-bg);
  background-image: radial-gradient(circle, rgba(200,134,30,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  background-attachment: fixed;
}

/* ================================================================
   SHARED BUTTONS
================================================================ */
.db-btn {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-label);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-decoration: none;
  padding: 12px 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.db-btn--gold  { background: var(--db-gold); color: var(--db-bg); border: 1px solid transparent; }
.db-btn--gold:hover { background: var(--db-gold-bright); }
.db-btn--ghost { background: transparent; color: rgba(237,227,206,0.8); border: 1px solid rgba(237,227,206,0.22); }
.db-btn--ghost:hover { border-color: var(--db-gold-muted); color: var(--db-gold-bright); }

/* ================================================================
   PORTALS
   portals-wrap: 400vh - hero + 3 feature portals
   portals-stage: sticky 100vh window
   full-portal: absolutely stacked, one visible at a time
================================================================ */
.portals-wrap {
  position: relative;
  height: 400vh;
  margin-top: -80px; /* absorbs db-main padding-top */
}

.portals-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.full-portal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: var(--db-bg);
  opacity: 0;
  transition: opacity 0.55s ease;
  pointer-events: none;
}
.full-portal.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Background image - Ken Burns on all portals */
.fp-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: kenBurns 20s ease-in-out infinite alternate;
  animation-delay: -5s;
  will-change: transform;
}

@keyframes kenBurns {
  from { transform: scale(1.0) translate(0, 0); }
  to   { transform: scale(1.08) translate(-1%, -0.8%); }
}

/* ---- Hero portal ---- */
.fp-hero {
  align-items: center;
  justify-content: center;
}

/* Hero badge is plain label text - no pill, lighter brown against the warm image */
.fp-hero .fp-badge {
  color: #7A3D12;
  background: transparent;
  border-color: transparent;
  padding: 0;
  border-radius: 0;
  letter-spacing: 5px;
}

.fp-veil--hero {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(22,13,6,0.18) 0%,
    rgba(22,13,6,0.48) 45%,
    rgba(22,13,6,0.88) 88%,
    rgba(22,13,6,1)    100%
  );
}

.fp-content--hero {
  text-align: center;
  max-width: 680px;
  padding: 0 48px;
}

.fp-hero .fp-title {
  font-size: clamp(3.5rem, 8vw, 6.5rem);
  white-space: nowrap;
}
.fp-hero .fp-title .lw {
  padding-bottom: 0.18em;
  margin-bottom: -0.18em;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s var(--ease-out) 1.4s, transform 0.55s var(--ease-out) 1.4s;
}
.full-portal.active .hero-actions {
  opacity: 1;
  transform: translateY(0);
}

/* ---- Persistent scroll hint ---- */
.stage-scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  pointer-events: none; /* text hint: not clickable */
}
.stage-scroll-hint .stage-scroll-arrow {
  pointer-events: auto; /* arrow only: clickable */
}
.stage-hint-line {
  width: 44px;
  height: 1px;
  background: rgba(200,134,30,0.35);
}
.stage-hint-label {
  font-size: 0.78rem;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--db-text-muted);
  white-space: nowrap;
}
.stage-scroll-arrow {
  animation: stageArrowBob 2s ease-in-out infinite;
}
@keyframes stageArrowBob {
  0%, 100% { transform: translateY(0);   opacity: 0.65; }
  50%       { transform: translateY(9px); opacity: 1;    }
}

/* ---- Directional gradient veils ---- */
.fp-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.fp-veil--bottom {
  background: linear-gradient(
    to top,
    rgba(22,13,6,0.98) 0%,
    rgba(22,13,6,0.6)  40%,
    rgba(22,13,6,0.1)  75%,
    transparent        100%
  );
}
.fp-veil--left {
  background: linear-gradient(
    to right,
    rgba(22,13,6,0.97) 0%,
    rgba(22,13,6,0.55) 42%,
    rgba(22,13,6,0.05) 100%
  );
}
.fp-veil--right {
  background: linear-gradient(
    to left,
    rgba(22,13,6,0.97) 0%,
    rgba(22,13,6,0.55) 42%,
    rgba(22,13,6,0.05) 100%
  );
}

/* Section counter */
.fp-num {
  position: absolute;
  top: 36px;
  right: 40px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: rgba(200,134,30,0.4);
  z-index: 5;
}

/* Content container */
.fp-content {
  position: relative;
  z-index: 5;
  padding: 48px;
  max-width: 580px;
}
.fp-content--center {
  margin: 0 auto;
  text-align: center;
  padding-bottom: 80px;
  align-self: flex-end;
  width: 100%;
  max-width: 640px;
}
.fp-content--left  { align-self: flex-end; }
.fp-content--right { align-self: flex-end; margin-left: auto; text-align: right; }

/* Badge */
.fp-badge {
  display: inline-block;
  font-weight: 700;
  background: rgba(200,134,30,0.1);
  border: 1px solid rgba(200,134,30,0.28);
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s var(--ease-out) 0.5s, transform 0.6s var(--ease-out) 0.5s;
}
.full-portal.active .fp-badge { opacity: 1; transform: translateY(0); }

/* Title with line-by-line mask reveal */
.fp-title {
  font-size: clamp(3.2rem, 7vw, 5.5rem);
  font-weight: 600;
  color: var(--db-text);
  line-height: 1.0;
  margin-bottom: 22px;
  letter-spacing: -1.5px;
}
.lw {
  display: block;
  overflow: hidden;
  line-height: 1.05;
}
.li {
  display: block;
  transform: translateY(110%);
  transition: transform 0.9s var(--ease-out) 0.65s;
}
.fp-title .lw:nth-child(2) .li { transition-delay: 0.82s; }
.full-portal.active .li { transform: translateY(0); }

/* Description */
.fp-desc {
  font-size: 1.08rem;
  color: rgba(237,227,206,0.62);
  line-height: 1.78;
  margin-bottom: 32px;
  max-width: 420px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s var(--ease-out) 1.0s, transform 0.6s var(--ease-out) 1.0s;
}
.full-portal.active .fp-desc { opacity: 1; transform: translateY(0); }
.fp-content--center .fp-desc { margin-left: auto; margin-right: auto; }
.fp-content--right  .fp-desc { margin-left: auto; }
.fp-content--hero   .fp-desc { margin-left: auto; margin-right: auto; }

/* CTA - pill button */
.fp-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--db-gold-bright);
  background: rgba(200,134,30,0.12);
  border: 1px solid rgba(200,134,30,0.48);
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 40px;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.5s var(--ease-out) 1.25s,
    transform 0.5s var(--ease-out) 1.25s,
    background 0.2s,
    border-color 0.2s;
}
.full-portal.active .fp-cta { opacity: 1; transform: translateY(0); }
.fp-cta:hover {
  background: rgba(200,134,30,0.22);
  border-color: var(--db-gold);
}

/* ================================================================
   STATS
================================================================ */
.stats-strip {
  background: var(--db-surface);
  border-top: 1px solid var(--db-border);
  border-bottom: 1px solid var(--db-border);
  padding: 36px 24px;
}
.stats-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-num {
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--db-gold-bright);
  line-height: 1;
}
.stat-lbl {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-text-muted);
}

/* ================================================================
   SECTION HEADER (shared)
================================================================ */
.section-head {
  text-align: center;
  padding: 0 24px;
  margin-bottom: 36px;
}
.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 600;
  color: var(--db-text);
  margin-top: 12px;
}

/* ================================================================
   CATEGORY RIBBON
================================================================ */
.cat-section {
  padding: 64px 0 68px;
  background: var(--db-surface);
  border-bottom: 1px solid var(--db-border);
}
.ribbon-wrap {
  position: relative;
  overflow: hidden;
}
.ribbon-wrap::before,
.ribbon-wrap::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 56px;
  pointer-events: none;
  z-index: 2;
}
.ribbon-wrap::before { left: 0;  background: linear-gradient(to right, var(--db-surface), transparent); }
.ribbon-wrap::after  { right: 0; background: linear-gradient(to left,  var(--db-surface), transparent); }

.ribbon {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 56px 12px;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
.ribbon::-webkit-scrollbar { display: none; }

.ribbon-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px 10px 10px;
  background: var(--db-surface-2);
  border: 1px solid var(--db-border);
  border-radius: 40px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  scroll-snap-align: start;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.ribbon-pill:hover {
  background: var(--db-surface-3);
  border-color: var(--db-border-strong);
  transform: translateY(-2px);
}
.pill-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--db-gold-subtle);
  border: 1px solid var(--db-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pill-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--db-text-muted);
  transition: color 0.2s;
}
.ribbon-pill:hover .pill-label { color: var(--db-text); }

/* ================================================================
   FEATURED PLACES - Globe layout
================================================================ */
.featured-section {
  padding: 72px 0 80px;
}

.feat-sub {
  text-align: center;
  font-size: 1rem;
  color: var(--db-text-muted);
  line-height: 1.7;
  margin: -10px 0 44px;
  padding: 0 24px;
}

/* Two-column: globe left, panel right */
.globe-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 0;
  align-items: center;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 32px;
}

.globe-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px 0 0;
}

/* Place info panel */
.globe-panel-col {
  display: flex;
  align-items: stretch;
}

.globe-panel {
  width: 100%;
  min-height: 440px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  background: var(--db-surface-2);
  box-shadow: 0 0 0 1px rgba(200,134,30,0.15), 0 8px 32px rgba(0,0,0,0.3);
  transition: translate 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out);
}
.globe-panel:hover {
  translate: 0 -6px;
  box-shadow: 0 0 0 1px rgba(200,134,30,0.55), 0 24px 56px rgba(0,0,0,0.55);
}
.globe-panel:hover .gp-img { transform: scale(1.08); }
.globe-panel:hover .gp-cta { opacity: 1; transform: translateY(0); }

.globe-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.globe-panel--empty:hover { translate: none; box-shadow: 0 0 0 1px rgba(200,134,30,0.15), 0 8px 32px rgba(0,0,0,0.3); }

.gp-img-wrap {
  position: absolute;
  inset: 0;
}
.gp-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.65s var(--ease-out);
}
.gp-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(22,13,6,0.97) 0%,
    rgba(22,13,6,0.68) 38%,
    rgba(22,13,6,0.15) 65%,
    transparent        100%
  );
}

.gp-body {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 0 26px 28px;
}

.gp-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin-bottom: 7px;
}
.gp-dot { color: rgba(200,134,30,0.4); }

.gp-name {
  font-size: 1.65rem;
  font-weight: 600;
  color: var(--db-text);
  line-height: 1.1;
  margin-bottom: 10px;
}

.gp-desc {
  font-size: 0.84rem;
  color: rgba(237,227,206,0.75);
  line-height: 1.65;
  margin-bottom: 14px;
}

.gp-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}

/* Panel transition */
.place-fade-enter-active,
.place-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.place-fade-enter-from { opacity: 0; transform: translateY(10px); }
.place-fade-leave-to   { opacity: 0; transform: translateY(-6px); }

.feat-footer {
  text-align: center;
  margin-top: 48px;
}

/* ================================================================
   CHRONICLES CTA - split layout with journal card
================================================================ */
.chronicles-cta {
  padding: 90px 48px;
  background: var(--db-surface);
  border-top: 1px solid var(--db-border);
  border-bottom: 1px solid var(--db-border);
  position: relative;
  overflow: hidden;
}
.chronicles-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(200,134,30,0.055) 0%, transparent 65%);
  pointer-events: none;
}

.chronicles-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
  position: relative;
}

/* Left: text */
.chronicles-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.chronicles-eyebrow {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 4.5px;
  text-transform: uppercase;
  color: var(--db-gold);
}
.chronicles-sub {
  font-size: 1rem;
  color: var(--db-text-muted);
  line-height: 1.78;
  margin-top: 12px;
  max-width: 420px;
}

/* Right: animated journal card */
.chronicles-card-wrap {
  perspective: 900px;
}
.chronicles-card {
  background: var(--db-surface-2);
  border: 1px solid rgba(200,134,30,0.22);
  border-left: 3px solid rgba(200,134,30,0.45);
  border-radius: 10px;
  padding: 26px 28px 28px;
  transform: rotateY(-4deg) rotateX(2deg);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.35),
    0 0 0 1px rgba(200,134,30,0.08),
    inset 0 1px 0 rgba(255,255,255,0.03);
  transition: transform 0.4s var(--ease-out);
}
.chronicles-card-wrap:hover .chronicles-card {
  transform: rotateY(0deg) rotateX(0deg);
}

.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.cc-header-left { display: flex; align-items: center; gap: 6px; }
.cc-date {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--db-gold);
}
.cc-place {
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(237,227,206,0.45);
}

.cc-divider {
  height: 1px;
  background: linear-gradient(to right, rgba(200,134,30,0.3), transparent);
  margin-bottom: 16px;
}

.cc-body {
  font-size: 0.92rem;
  color: rgba(237,227,206,0.72);
  line-height: 1.82;
  min-height: 140px;
}

.cc-cursor {
  display: inline-block;
  color: var(--db-gold);
  font-weight: 300;
  animation: cc-blink 1s step-end infinite;
  margin-left: 1px;
}
@keyframes cc-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

/* ================================================================
   SUBMIT CTA
================================================================ */
.submit-cta {
  background: var(--db-surface);
  border-top: 1px solid var(--db-border);
  border-bottom: 1px solid var(--db-border);
  padding: 80px 24px;
  text-align: center;
}
.submit-inner {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.submit-sub {
  font-size: 1rem;
  color: var(--db-text-muted);
  line-height: 1.75;
  margin-top: 10px;
}

/* ================================================================
   FOOTER
================================================================ */
.db-footer {
  background: var(--db-surface);
  border-top: 1px solid var(--db-border);
  padding: 36px 24px;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-brand { font-size: 1.25rem; font-weight: 600; color: var(--db-gold); flex-shrink: 0; }
.footer-copy  { font-size: 0.85rem; color: var(--db-text-muted); flex: 1; min-width: 140px; }
.footer-links { display: flex; gap: 18px; }
.footer-links a {
  font-family: var(--font-label);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--db-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--db-gold-bright); }

/* ================================================================
   RESPONSIVE
================================================================ */
@media (max-width: 1024px) {
  .globe-layout { grid-template-columns: 1fr 340px; }
  .chronicles-inner { gap: 48px; }
}

@media (max-width: 900px) {
  .globe-layout { grid-template-columns: 1fr; }
  .globe-col { padding: 0; }
  .globe-panel-col { min-height: auto; }
  .chronicles-inner { grid-template-columns: 1fr; gap: 40px; }
  .chronicles-text { align-items: center; text-align: center; }
  .chronicles-sub { max-width: 100%; }
  .chronicles-card { transform: none; }
  .chronicles-cta { padding: 64px 24px; }
}

@media (max-width: 768px) {
  .fp-content { padding: 28px 24px 56px; }
  .fp-content--right { text-align: left; margin-left: 0; }
  .fp-content--right .fp-desc { margin-left: 0; }
  .fp-title { font-size: clamp(2.6rem, 10vw, 3.5rem); }
  .fp-content--hero { padding: 0 20px 12vh; }
  .globe-layout { padding: 0 16px; }
}
</style>
