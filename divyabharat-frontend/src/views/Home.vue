<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section" ref="heroRef">
      <div class="hero-image-wrap">
        <img
          src="/hero.png"
          alt="Indian temple corridor"
          class="hero-image"
          :style="{ transform: `translateY(${parallaxOffset}px)` }"
        />
        <div class="hero-overlay" />
      </div>

      <div class="hero-content">
        <div class="hero-floating-icon mb-4">
          <v-icon size="56" color="secondary">mdi-temple-hindu</v-icon>
        </div>
        <p class="hero-eyebrow">Explore Sacred India</p>
        <h1 class="hero-title">DivyaBharat</h1>
        <p class="hero-subtitle">
          Discover temples, forts, ghats, and sacred landscapes across India.<br />
          Rich history. Authentic stories. AI-powered guidance.
        </p>
        <div class="hero-actions">
          <v-btn
            size="large"
            color="secondary"
            variant="flat"
            prepend-icon="mdi-map"
            to="/map"
            class="mr-3 font-weight-semibold"
          >
            Explore on Map
          </v-btn>
          <v-btn
            size="large"
            variant="outlined"
            prepend-icon="mdi-compass"
            to="/places"
            class="hero-map-btn"
          >
            Browse Places
          </v-btn>
        </div>
      </div>

      <div class="hero-scroll-hint">
        <v-icon class="bounce-icon">mdi-chevron-down</v-icon>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-bar">
      <div class="stats-inner">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-number">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- Featured Places -->
    <section class="section-wrap">
      <div class="section-header reveal" :ref="el => addReveal(el)">
        <p class="section-eyebrow">Handpicked for you</p>
        <h2 class="section-title">Featured Places</h2>
        <p class="section-sub">Some of India's most revered spiritual and heritage destinations</p>
      </div>

      <v-row class="mt-6">
        <v-col
          v-for="(place, i) in featuredPlaces"
          :key="place.id"
          cols="12" md="4"
        >
          <PlaceCard
            :place="place"
            class="reveal"
            :ref="el => addReveal(el)"
            :style="{ transitionDelay: `${i * 80}ms` }"
            @click="router.push(`/places/${place.id}`)"
          />
        </v-col>
      </v-row>

      <div class="text-center mt-8">
        <v-btn variant="outlined" color="primary" size="large" to="/places" prepend-icon="mdi-arrow-right">
          View All Places
        </v-btn>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-wrap">
        <div class="section-header reveal" :ref="el => addReveal(el)">
          <p class="section-eyebrow">Browse by type</p>
          <h2 class="section-title">Explore Categories</h2>
        </div>

        <div class="categories-grid mt-6">
          <div
            v-for="(cat, i) in categoryItems"
            :key="cat.value"
            class="category-tile reveal"
            :ref="el => addReveal(el)"
            :style="{ transitionDelay: `${i * 50}ms` }"
            @click="goToCategory(cat.value)"
          >
            <v-icon size="28" color="primary">{{ cat.icon }}</v-icon>
            <span class="category-tile-label">{{ cat.title }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Guide CTA -->
    <section class="section-wrap">
      <v-card
        class="ai-cta-card reveal"
        :ref="el => addReveal(el)"
        elevation="0"
      >
        <v-row align="center">
          <v-col cols="12" md="8">
            <p class="section-eyebrow ai-eyebrow">Powered by AI</p>
            <h2 class="section-title ai-title">Ask the AI Guide</h2>
            <p class="ai-body mt-2">
              Every place on DivyaBharat comes with an AI guide that can answer your questions about history, significance, visiting tips, and more. Powered by Groq and Llama 3.3.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-icon size="80" color="secondary" class="ai-icon">mdi-robot-outline</v-icon>
            <div class="mt-4">
              <v-btn color="secondary" variant="flat" size="large" to="/places" prepend-icon="mdi-compass">
                Try it now
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </section>

    <!-- Submit CTA -->
    <section class="submit-cta-section">
      <div class="section-wrap text-center">
        <v-icon size="48" color="primary" class="mb-4">mdi-map-marker-plus</v-icon>
        <h2 class="section-title reveal" :ref="el => addReveal(el)">Know a place we missed?</h2>
        <p class="section-sub submit-sub reveal" :ref="el => addReveal(el)">
          India has lakhs of sacred and heritage sites. Help us build the most complete spiritual travel companion.
        </p>
        <v-btn
          class="mt-6 reveal"
          :ref="el => addReveal(el)"
          color="primary"
          size="large"
          variant="flat"
          to="/places/submit"
          prepend-icon="mdi-plus"
        >
          Submit a Place
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import PlaceCard from '@/components/PlaceCard.vue';

const router = useRouter();
const parallaxOffset = ref(0);
const featuredPlaces = ref([]);

const stats = [
  { value: '15+', label: 'Heritage Sites' },
  { value: '12', label: 'Categories' },
  { value: '10+', label: 'States Covered' },
  { value: 'Free', label: 'AI Guide' }
];

const categoryItems = [
  { title: 'Temples', value: 'temple', icon: 'mdi-temple-hindu' },
  { title: 'Forts', value: 'fort', icon: 'mdi-castle' },
  { title: 'Caves', value: 'cave', icon: 'mdi-tunnel' },
  { title: 'Ghats', value: 'ghat', icon: 'mdi-waves' },
  { title: 'Ashrams', value: 'ashram', icon: 'mdi-meditation' },
  { title: 'Gurudwaras', value: 'gurudwara', icon: 'mdi-star-david' },
  { title: 'Sacred Rivers', value: 'sacred_river', icon: 'mdi-wave' },
  { title: 'Ancient Sites', value: 'ancient_site', icon: 'mdi-pillar' },
  { title: 'Heritage Villages', value: 'heritage_village', icon: 'mdi-home-group' },
  { title: 'Museums', value: 'museum', icon: 'mdi-bank' },
  { title: 'Natural Sacred', value: 'natural_sacred', icon: 'mdi-tree' },
  { title: 'Other', value: 'other', icon: 'mdi-map-marker' }
];

const goToCategory = (category) => {
  router.push({ path: '/places', query: { category } });
};

const handleScroll = () => {
  parallaxOffset.value = window.scrollY * 0.3;
};

const revealElements = ref([]);
const addReveal = (el) => {
  if (el?.$el) el = el.$el;
  if (el && !revealElements.value.includes(el)) {
    revealElements.value.push(el);
  }
};

const checkReveal = () => {
  revealElements.value.forEach((el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
};

const fetchFeatured = async () => {
  try {
    const response = await api.get('/places/featured');
    featuredPlaces.value = response.data.places;
  } catch (err) {
    console.error('Failed to fetch featured places', err);
  }
};

onMounted(() => {
  fetchFeatured();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('scroll', checkReveal, { passive: true });
  setTimeout(checkReveal, 100);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('scroll', checkReveal);
});
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 85vw;
  max-height: 100vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image-wrap {
  position: absolute;
  inset: -8% 0 -8% 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  will-change: transform;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(28, 18, 9, 0.55) 0%,
    rgba(28, 18, 9, 0.70) 60%,
    rgba(28, 18, 9, 0.85) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
  max-width: 800px;
}

.hero-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #F59E0B;
  margin-bottom: 16px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  color: #FDF8F0;
  line-height: 1.1;
  margin-bottom: 20px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: rgba(253, 248, 240, 0.85);
  line-height: 1.7;
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-map-btn {
  color: #FDF8F0 !important;
  border-color: rgba(253, 248, 240, 0.5) !important;
}

.hero-scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.bounce-icon {
  color: rgba(253, 248, 240, 0.6) !important;
  animation: bounce 2s infinite;
}

.hero-floating-icon {
  animation: float 4s ease-in-out infinite;
  display: inline-block;
}

.stats-bar {
  background: #2C1810;
  padding: 28px 24px;
}

.stats-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #F59E0B;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: rgba(253, 248, 240, 0.65);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px;
}

.section-header {
  text-align: center;
}

.section-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #B45309;
  margin-bottom: 8px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #2C1810;
  line-height: 1.2;
}

.section-sub {
  font-family: 'Inter', sans-serif;
  color: #78614A;
  margin-top: 10px;
  line-height: 1.7;
}

.submit-sub {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.categories-section {
  background: #FFF8ED;
  border-top: 1px solid rgba(180, 83, 9, 0.1);
  border-bottom: 1px solid rgba(180, 83, 9, 0.1);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.category-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: #FDF8F0;
  border-radius: 12px;
  border: 1px solid rgba(180, 83, 9, 0.12);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.category-tile:hover {
  background: #FFF0D6;
  border-color: #B45309;
}

.category-tile-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #2C1810;
  text-align: center;
}

.ai-cta-card {
  background: linear-gradient(135deg, #1C1209 0%, #2C1810 100%) !important;
  border-radius: 20px !important;
  padding: 48px !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
}

.ai-eyebrow {
  color: #F59E0B !important;
}

.ai-title {
  color: #FDF8F0 !important;
}

.ai-body {
  font-family: 'Inter', sans-serif;
  color: rgba(253, 248, 240, 0.75);
  line-height: 1.7;
}

.ai-icon {
  opacity: 0.9;
}

.submit-cta-section {
  background: #FFF8ED;
  border-top: 1px solid rgba(180, 83, 9, 0.1);
  padding: 64px 24px;
}
</style>