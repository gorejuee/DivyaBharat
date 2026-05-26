<template>
  <div
    class="place-card"
    :style="{ transform: `perspective(800px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)` }"
    @click="$emit('click')"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="pc-img-wrap">

      <!-- Gradient placeholder - shown when no image or image fails -->
      <div
        v-if="!place.image_url || imgFailed"
        class="pc-no-img"
        :style="{ background: gradients[place.category] || gradients.other }"
      >
        <div class="pc-no-img-veil" />
        <v-icon class="pc-no-img-icon" size="48">
          {{ icons[place.category] || 'mdi-map-marker' }}
        </v-icon>
      </div>

      <!-- Actual image - hidden on error, replaced by typographic card above -->
      <img
        v-else
        :src="place.image_url"
        :alt="place.name"
        class="pc-img"
        @error="imgFailed = true"
      />

      <div class="pc-img-veil" />

      <span class="pc-cat-badge font-label">{{ formatCategory(place.category) }}</span>
      <span v-if="showVisited" class="pc-visited-badge font-label">
        <v-icon size="11">mdi-check-circle</v-icon> Visited
      </span>
    </div>

    <div class="pc-body">
      <p class="pc-location font-label">
        <v-icon size="11" style="color: var(--db-gold); margin-right: 3px;">mdi-map-marker</v-icon>
        {{ place.city ? place.city + ', ' : '' }}{{ place.state }}
      </p>
      <h3 class="pc-name font-display">{{ place.name }}</h3>
      <p v-if="place.description" class="pc-desc font-body">
        {{ place.description.charAt(0).toUpperCase() + place.description.slice(1, 85) }}...
      </p>
    </div>

    <div class="pc-footer">
      <span class="pc-cta font-label">Explore &rarr;</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  formatCategory,
  categoryGradients as gradients,
  categoryIcons as icons
} from '@/utils/placeHelpers';

defineProps({
  place: { type: Object, required: true },
  showVisited: { type: Boolean, default: false }
});

defineEmits(['click']);

const imgFailed = ref(false);
const tiltX = ref(0);
const tiltY = ref(0);

const onMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  tiltX.value = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 4;
  tiltY.value = -((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 4;
};

const onMouseLeave = () => {
  tiltX.value = 0;
  tiltY.value = 0;
};
</script>

<style scoped>
.place-card {
  background: var(--db-surface);
  border: 1px solid var(--db-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  /* translate = lift (CSS :hover, instant) | transform = tilt (JS, slow) */
  transition: translate 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, transform 0.38s ease;
  transform-style: preserve-3d;
}
.place-card:hover {
  translate: 0 -6px;
  box-shadow: 0 24px 56px rgba(0,0,0,0.6);
  border-color: rgba(200,134,30,0.3);
}

/* ---- Image area ---- */
.pc-img-wrap {
  position: relative;
  height: 188px;
  overflow: hidden;
  flex-shrink: 0;
}

/* Typographic editorial placeholder when no image */
.pc-no-img {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-no-img-veil {
  position: absolute;
  inset: 0;
  background: rgba(22,13,6,0.38);
}

.pc-no-img-icon {
  position: relative;
  z-index: 1;
  color: rgba(255,255,255,0.22) !important;
}

/* Actual image */
.pc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.place-card:hover .pc-img { transform: scale(1.05); }

.pc-img-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(22,13,6,0.65) 100%);
  pointer-events: none;
}

.pc-cat-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-bg);
  background: var(--db-gold);
  padding: 3px 9px;
  border-radius: 4px;
  z-index: 2;
}

.pc-visited-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #4ade80;
  background: rgba(22,163,74,0.18);
  border: 1px solid rgba(74,222,128,0.3);
  padding: 3px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
  z-index: 2;
}

/* ---- Body ---- */
.pc-body {
  padding: 14px 16px 8px;
  flex: 1;
}

.pc-location {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.pc-name {
  font-size: 1.08rem;
  font-weight: 600;
  color: var(--db-text);
  line-height: 1.25;
  margin-bottom: 8px;
}

.pc-desc {
  font-size: 0.82rem;
  color: var(--db-text-muted);
  line-height: 1.6;
}

/* ---- Footer ---- */
.pc-footer {
  padding: 10px 16px 14px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--db-border);
}

.pc-cta {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--db-gold-bright);
  transition: color 0.2s;
}
.place-card:hover .pc-cta { color: var(--db-text); }
</style>
