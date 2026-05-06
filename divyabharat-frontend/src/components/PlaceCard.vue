<template>
  <v-card
    elevation="0"
    rounded="lg"
    :style="{
      border: '1px solid rgba(180,83,9,0.1)',
      background: '#FFFBF4',
      cursor: 'pointer',
      height: '100%',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      transformStyle: 'preserve-3d',
      transform: `perspective(800px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) translateY(${hovered ? -4 : 0}px)`,
      boxShadow: hovered ? '0 16px 40px rgba(44,24,16,0.14)' : '0 1px 4px rgba(44,24,16,0.06)'
    }"
    @click="$emit('click')"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="img-wrap">
      <v-img
        :src="place.image_url"
        height="200"
        cover
        class="card-img"
      >
        <template #placeholder>
          <div
            class="d-flex align-center justify-center"
            :style="{ height: '200px', background: gradients[place.category] || gradients.other }"
          >
            <v-icon size="48" color="white" style="opacity: 0.6;">
              {{ icons[place.category] || 'mdi-map-marker' }}
            </v-icon>
          </div>
        </template>
        <template #error>
          <div
            class="d-flex align-center justify-center flex-column ga-2"
            :style="{ height: '200px', background: gradients[place.category] || gradients.other }"
          >
            <v-icon size="48" color="white" style="opacity: 0.7;">
              {{ icons[place.category] || 'mdi-map-marker' }}
            </v-icon>
            <span class="text-caption text-white" style="opacity: 0.6;">
              {{ formatCategory(place.category) }}
            </span>
          </div>
        </template>
      </v-img>

      <v-chip
        size="x-small"
        variant="flat"
        :color="categoryColor(place.category)"
        class="category-chip"
      >
        {{ formatCategory(place.category) }}
      </v-chip>

      <v-chip
        v-if="showVisited"
        size="x-small"
        variant="flat"
        color="success"
        prepend-icon="mdi-check-circle"
        class="visited-chip"
      >
        Visited
      </v-chip>
    </div>

    <v-card-text class="pb-2 pt-3">
      <p class="font-playfair card-place-name">{{ place.name }}</p>
      <p class="card-place-location">
        <v-icon size="12" color="primary">mdi-map-marker</v-icon>
        {{ place.city ? place.city + ', ' : '' }}{{ place.state }}
      </p>
      <p v-if="place.description" class="card-place-desc">
        {{ place.description.slice(0, 90) }}...
      </p>
    </v-card-text>

    <v-card-actions class="pt-0 px-4 pb-3">
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        size="small"
        append-icon="mdi-arrow-right"
        class="text-caption"
      >
        Explore
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import {
  categoryColor,
  formatCategory,
  categoryGradients as gradients,
  categoryIcons as icons
} from '@/utils/placeHelpers';

defineProps({
  place: { type: Object, required: true },
  showVisited: { type: Boolean, default: false }
});

defineEmits(['click']);

const hovered = ref(false);
const tiltX = ref(0);
const tiltY = ref(0);

const onMouseMove = (e) => {
  hovered.value = true;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  tiltX.value = ((x - rect.width / 2) / (rect.width / 2)) * 5;
  tiltY.value = -((y - rect.height / 2) / (rect.height / 2)) * 5;
};

const onMouseLeave = () => {
  hovered.value = false;
  tiltX.value = 0;
  tiltY.value = 0;
};
</script>

<style scoped>
.img-wrap {
  position: relative;
}

.card-img {
  border-radius: 12px 12px 0 0;
}

.category-chip {
  position: absolute;
  top: 10px;
  left: 10px;
}

.visited-chip {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-place-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #2C1810;
  margin-bottom: 4px;
  line-height: 1.3;
}

.card-place-location {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #B45309;
  margin-bottom: 8px;
}

.card-place-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #78614A;
  line-height: 1.6;
}
</style>