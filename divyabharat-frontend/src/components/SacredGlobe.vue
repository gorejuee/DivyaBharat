<template>
  <div class="sg-root" ref="rootRef">
    <div ref="mountEl" class="sg-mount" />
    <Transition name="sg-fade">
      <div v-if="!ready" class="sg-loader">
        <span class="sg-spinner" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  places: { type: Array, default: () => [] },
});
const emit = defineEmits(['hover']);

const rootRef = ref(null);
const mountEl = ref(null);
const ready   = ref(false);

let globe      = null;
let cycleTimer = null;
let cycleIdx   = 0;
let userTimer  = null;

const coord = (p, k) => { const v = p[k]; return v != null ? Number(v) : null; };
const valid  = (p)   => coord(p, 'latitude') != null && coord(p, 'longitude') != null;
const vList  = ()    => props.places.filter(valid);

const startCycle = () => {
  stopCycle();
  cycleTimer = setInterval(() => {
    const list = vList();
    if (!list.length) return;
    cycleIdx = (cycleIdx + 1) % list.length;
    emit('hover', list[cycleIdx]);
  }, 6000);
};

const stopCycle = () => {
  if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
};

const onPointHover = point => {
  if (point) {
    if (globe) globe.controls().autoRotate = false;
    stopCycle();
    clearTimeout(userTimer);
    emit('hover', point);
  } else {
    clearTimeout(userTimer);
    userTimer = setTimeout(() => {
      if (globe) globe.controls().autoRotate = true;
      startCycle();
    }, 1200);
  }
};

const initGlobe = async () => {
  if (!mountEl.value) return;
  const list = vList();
  if (!list.length) return;

  try {
    const { default: Globe } = await import('globe.gl');
    const size = Math.min(rootRef.value?.clientWidth ?? 500, 560);

    globe = Globe({ animateIn: true })(mountEl.value)
      .width(size).height(size)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .atmosphereColor('rgba(200,134,30,0.3)')
      .atmosphereAltitude(0.14)
      .pointsData(list)
      .pointLat(d => coord(d, 'latitude'))
      .pointLng(d => coord(d, 'longitude'))
      .pointAltitude(0.012)
      .pointRadius(0.44)
      .pointColor(() => 'rgba(200,134,30,0.9)')
      .pointResolution(16)
      .onPointHover(onPointHover)
      .onPointClick(p => { if (p) emit('hover', p); });

    globe.controls().autoRotate      = true;
    globe.controls().autoRotateSpeed = 0.42;
    globe.controls().enableZoom      = false;
    globe.controls().enablePan       = false;

    // Stop auto-rotation while user drags; resume 3s after they release
    let resumeTimer = null;
    globe.controls().addEventListener('start', () => {
      globe.controls().autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
    });
    globe.controls().addEventListener('end', () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        globe.controls().autoRotate = true;
      }, 3000);
    });

    globe.pointOfView({ lat: 22, lng: 82, altitude: 1.82 }, 1000);

    ready.value = true;
    emit('hover', list[0]);
    startCycle();
  } catch (err) {
    console.warn('[SacredGlobe]', err);
  }
};

const onResize = () => {
  if (!globe || !rootRef.value) return;
  const size = Math.min(rootRef.value.clientWidth, 560);
  globe.width(size).height(size);
};

watch(() => props.places, (val) => {
  if (!globe && val.length) initGlobe();
  else if (globe) globe.pointsData(vList());
});

onMounted(() => {
  if (props.places.length) initGlobe();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  stopCycle();
  clearTimeout(userTimer);
  window.removeEventListener('resize', onResize);
  globe = null;
});
</script>

<style scoped>
.sg-root {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sg-mount { width: 100%; }
.sg-mount :deep(canvas) {
  display: block;
  border-radius: 50%;
  filter: drop-shadow(0 0 56px rgba(200,134,30,0.18)) drop-shadow(0 0 24px rgba(0,0,0,0.5));
}
.sg-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sg-spinner {
  display: block;
  width: 38px;
  height: 38px;
  border: 2px solid rgba(200,134,30,0.18);
  border-top-color: var(--db-gold);
  border-radius: 50%;
  animation: sg-spin 0.9s linear infinite;
}
@keyframes sg-spin { to { transform: rotate(360deg); } }
.sg-fade-enter-active, .sg-fade-leave-active { transition: opacity 0.5s; }
.sg-fade-enter-from, .sg-fade-leave-to { opacity: 0; }
</style>
