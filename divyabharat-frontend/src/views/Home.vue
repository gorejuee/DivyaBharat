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
              Temples, forts, caves, ghats and sacred landscapes across India.
              Rich history and AI-powered guidance.
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

    <!-- FEATURED PLACES -->
    <section class="featured-section" v-if="featuredPlaces.length">
      <div class="section-head">
        <MandalaLine />
        <h2 class="section-title font-display">Places Worth Discovering</h2>
      </div>
      <p class="feat-sub font-body">Sacred sites, ancient forts and living heritage across India.</p>

      <div class="feat-grid">
        <div
          v-for="place in featuredPlaces.slice(0, 3)"
          :key="place.id"
          class="feat-card"
          @click="router.push(`/places/${place.id}`)"
        >
          <img :src="place.image_url" :alt="place.name" class="feat-img" />
          <div class="feat-gradient" />
          <div class="feat-body">
            <p class="feat-state font-label">{{ place.state }}</p>
            <h3 class="feat-name font-display">{{ place.name }}</h3>
            <p class="feat-desc font-body" v-if="place.description">
              {{ (place.description.charAt(0).toUpperCase() + place.description.slice(1)).slice(0, 90) }}...
            </p>
            <span class="feat-cta font-label">Explore &rarr;</span>
          </div>
        </div>
      </div>

      <div class="feat-footer">
        <router-link to="/places" class="db-btn db-btn--ghost">View all places</router-link>
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

const router = useRouter();
const featuredPlaces = ref([]);
const activePortalIdx = ref(0);


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
  } catch { /* silent */ }
};

const handleScroll = () => {
  updatePortals();
};

const scrollPortalForward = () => {
  const portalsCount = document.querySelectorAll('.full-portal').length;
  if (activePortalIdx.value >= portalsCount - 1) {
    // Last portal - jump past the entire portals section
    const wrap = document.querySelector('.portals-wrap');
    if (wrap) window.scrollTo({ top: wrap.offsetTop + wrap.offsetHeight, behavior: 'smooth' });
  } else {
    // Each portal = one viewport height of scroll distance
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
    if (isActive && !el.classList.contains('active')) {
      el.classList.add('active');
    }
  });
  activePortalIdx.value = activeIdx;
};

onMounted(() => {
  fetchFeatured();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const first = document.querySelector('.full-portal');
  if (first) first.classList.add('active', 'visible');
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
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
   FEATURED PLACES
================================================================ */
.featured-section {
  padding: 72px 0 80px;
}

.feat-sub {
  text-align: center;
  font-size: 1rem;
  color: var(--db-text-muted);
  line-height: 1.7;
  margin: -18px 0 40px;
  padding: 0 24px;
}

.feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 0 32px;
  max-width: 1280px;
  margin: 0 auto;
}

.feat-card {
  position: relative;
  height: 460px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 3px;
  background: var(--db-surface-2);
  transition: transform 0.45s var(--ease-out), box-shadow 0.45s var(--ease-out);
}
.feat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 32px 72px rgba(0,0,0,0.7);
}
.feat-card:hover .feat-img { transform: scale(1.07); }
.feat-card:hover .feat-cta { opacity: 1; transform: translateY(0); }

.feat-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.65s var(--ease-out);
}

.feat-gradient {
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

.feat-body {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 0 26px 28px;
}

.feat-state {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin-bottom: 7px;
}

.feat-name {
  font-size: 1.65rem;
  font-weight: 600;
  color: var(--db-text);
  line-height: 1.1;
  margin-bottom: 10px;
}

.feat-desc {
  font-size: 0.84rem;
  color: rgba(237,227,206,0.75);
  line-height: 1.65;
  margin-bottom: 14px;
}

.feat-cta {
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

.feat-footer {
  text-align: center;
  margin-top: 40px;
}

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
@media (max-width: 900px) {
  .feat-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .fp-content { padding: 28px 24px 56px; }
  .fp-content--right { text-align: left; margin-left: 0; }
  .fp-content--right .fp-desc { margin-left: 0; }
  .fp-title { font-size: clamp(2.6rem, 10vw, 3.5rem); }
  .fp-content--hero { padding: 0 24px; }
  .fp-hero .fp-title { font-size: clamp(3rem, 12vw, 5rem); }
  .feat-grid { grid-template-columns: 1fr; padding: 0 16px; }
  .feat-card { height: 320px; }
}
</style>
