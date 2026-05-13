<template>
  <div>
    <v-container v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-container>

    <v-container v-else-if="!place" class="text-center py-16">
      <v-icon size="64" color="primary" style="opacity: 0.4;">mdi-map-marker-off</v-icon>
      <h2 class="font-playfair mt-4" style="color: #2C1810;">Place not found</h2>
      <v-btn class="mt-4" color="primary" variant="tonal" @click="router.push('/places')">
        Back to Explore
      </v-btn>
    </v-container>

    <template v-else>
      <!-- Hero Image -->
      <div class="detail-hero">
        <v-img
          :src="place.image_url"
          height="480"
          cover
          class="detail-hero-img"
        >
          <template #placeholder>
            <div
              class="d-flex align-center justify-center"
              :style="{ height: '480px', background: gradients[place.category] || gradients.other }"
            >
              <v-icon size="80" color="white" style="opacity: 0.5;">
                {{ icons[place.category] || 'mdi-map-marker' }}
              </v-icon>
            </div>
          </template>
          <template #error>
            <div
              class="d-flex align-center justify-center flex-column ga-3"
              :style="{ height: '480px', background: gradients[place.category] || gradients.other }"
            >
              <v-icon size="80" color="white" style="opacity: 0.6;">
                {{ icons[place.category] || 'mdi-map-marker' }}
              </v-icon>
              <span class="text-white text-h6 font-playfair" style="opacity: 0.8;">
                {{ place.name }}
              </span>
            </div>
          </template>
          <div class="detail-hero-overlay" />
        </v-img>

        <!-- Back button overlaid on hero -->
        <div class="detail-back-btn">
          <v-btn
            variant="tonal"
            prepend-icon="mdi-arrow-left"
            style="background: rgba(0,0,0,0.45); color: #FDF8F0;"
            @click="router.push('/places')"
          >
            Back to Explore
          </v-btn>
        </div>
      </div>

      <v-container class="detail-container">

        <!-- Title row -->
        <v-row class="mb-2 mt-6" align="start">
          <v-col>
            <h1 class="font-playfair detail-title">{{ place.name }}</h1>
            <div class="mt-3 d-flex align-center flex-wrap ga-2">
              <v-chip
                :color="categoryColor(place.category)"
                variant="flat"
                size="small"
              >
                {{ formatCategory(place.category) }}
              </v-chip>
              <span class="detail-location">
                <v-icon size="14" color="primary">mdi-map-marker</v-icon>
                {{ place.city ? place.city + ', ' : '' }}{{ place.state }}
              </span>
            </div>
          </v-col>

          <v-col v-if="isLoggedIn" cols="auto" class="mt-1">
            <v-btn
              :color="isVisited ? 'success' : 'primary'"
              :variant="isVisited ? 'tonal' : 'outlined'"
              :prepend-icon="isVisited ? 'mdi-check-circle' : 'mdi-map-marker-check-outline'"
              :loading="visitLoading"
              @click="toggleVisited"
            >
              {{ isVisited ? 'Visited' : 'Mark as Visited' }}
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-6" color="primary" style="opacity: 0.15;" />

        <!-- About -->
        <section class="mb-10">
          <div class="section-label">
            <v-icon size="18" color="primary" class="mr-2">mdi-information-outline</v-icon>
            <span class="section-label-text">About</span>
          </div>

          <p v-if="place.description" class="detail-body mt-3">
            {{ place.description }}
          </p>

          <div v-if="place.wiki_extract" class="mt-3">
            <p class="detail-body">{{ place.wiki_extract }}</p>
              <a
                v-if="place.wiki_url"
                :href="place.wiki_url"
                target="_blank"
                class="text-caption mt-2 d-inline-block"
                style="color: #B45309;"
              >
                Read more on Wikipedia
              </a>
          </div>

          <p v-if="!place.description && !place.wiki_extract" class="detail-body mt-3" style="color: #78614A;">
            No description available yet. Be the first to contribute by submitting details about this place.
          </p>
        </section>

        <!-- History -->
        <section v-if="place.history" class="mb-10">
          <div class="section-label">
            <v-icon size="18" color="primary" class="mr-2">mdi-book-open-variant</v-icon>
            <span class="section-label-text">History</span>
          </div>
          <v-card
            variant="tonal"
            color="primary"
            rounded="lg"
            class="pa-5 mt-3"
            elevation="0"
          >
            <p class="detail-body">{{ place.history }}</p>
          </v-card>
        </section>

        <!-- Location -->
        <section v-if="place.latitude && place.longitude" class="mb-10">
          <div class="section-label">
            <v-icon size="18" color="primary" class="mr-2">mdi-map-marker</v-icon>
            <span class="section-label-text">Location</span>
          </div>
          <v-card variant="outlined" rounded="lg" class="mt-3" elevation="0" style="overflow: hidden;">
            <div :id="`mini-map-${place.id}`" style="height: 280px; width: 100%; z-index: 0;" />
            <v-card-text class="py-3 d-flex align-center justify-space-between">
              <span class="text-body-2" style="color: #78614A;">
                {{ place.latitude.toFixed(4) }}, {{ place.longitude.toFixed(4) }}
              </span>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-google-maps"
                :href="`https://www.google.com/maps?q=${place.latitude},${place.longitude}`"
                target="_blank"
              >
                Open in Google Maps
              </v-btn>
            </v-card-text>
          </v-card>
        </section>

        <!-- AI Guide -->
        <section class="mb-10">
          <div class="section-label mb-3">
            <v-icon size="18" color="primary" class="mr-2">mdi-robot</v-icon>
            <span class="section-label-text">Ask AI Guide</span>
          </div>

          <v-card v-if="!isLoggedIn" variant="outlined" rounded="lg" class="pa-6 text-center" elevation="0">
            <v-icon size="48" color="primary" style="opacity: 0.4;">mdi-lock-outline</v-icon>
            <p class="mt-3 detail-body">Please login to use the AI Guide</p>
            <v-btn class="mt-4" color="primary" variant="tonal" @click="router.push('/login')">
              Login
            </v-btn>
          </v-card>

          <v-card v-else variant="outlined" rounded="lg" elevation="0">
            <div class="chat-container" ref="chatContainer">
              <div v-if="chatHistory.length === 0" class="text-center py-8">
                <v-icon size="48" color="primary" style="opacity: 0.4;">mdi-robot-outline</v-icon>
                <p class="mt-3 text-body-2" style="color: #78614A;">
                  Ask me anything about {{ place.name }}
                </p>
                <div class="mt-4 d-flex flex-wrap justify-center ga-2">
                  <v-chip
                    v-for="suggestion in suggestions"
                    :key="suggestion"
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="suggestion-chip"
                    @click="askSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </v-chip>
                </div>
              </div>

              <div v-else>
                <div
                  v-for="(msg, index) in chatHistory"
                  :key="index"
                  class="mb-4"
                >
                  <div class="d-flex justify-end mb-2">
                    <v-card
                      color="primary"
                      variant="tonal"
                      class="pa-3 chat-bubble"
                      elevation="0"
                    >
                      <p class="text-body-2">{{ msg.question }}</p>
                    </v-card>
                  </div>

                  <div class="d-flex justify-start">
                    <div class="d-flex align-start ga-2 chat-bubble">
                      <v-icon color="primary" size="20" class="mt-1">mdi-robot</v-icon>
                      <v-card variant="tonal" color="grey" class="pa-3" elevation="0">
                        <p class="text-body-2" style="color: #1C1209;">{{ msg.answer }}</p>
                        <p v-if="msg.cached" class="text-caption mt-1" style="color: #78614A;">
                          <v-icon size="12" color="primary">mdi-lightning-bolt</v-icon>
                          Cached response
                        </p>
                      </v-card>
                    </div>
                  </div>
                </div>

                <div v-if="aiLoading" class="d-flex justify-start mb-4">
                  <div class="d-flex align-start ga-2">
                    <v-icon color="primary" size="20" class="mt-1">mdi-robot</v-icon>
                    <v-card variant="tonal" color="grey" class="pa-3" elevation="0">
                      <v-progress-circular indeterminate size="16" width="2" color="primary" />
                    </v-card>
                  </div>
                </div>
              </div>
            </div>

            <v-divider color="primary" style="opacity: 0.1;" />

            <div class="pa-4 d-flex ga-2">
              <v-text-field
                v-model="currentQuestion"
                placeholder="Ask anything about this place..."
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                base-color="primary"
                :disabled="aiLoading"
                @keyup.enter="askQuestion"
              />
              <v-btn
                color="primary"
                icon="mdi-send"
                :loading="aiLoading"
                :disabled="!currentQuestion.trim()"
                @click="askQuestion"
              />
            </div>
          </v-card>
        </section>

      </v-container>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/services/api';
import {
  categoryColor,
  formatCategory,
  categoryGradients as gradients,
  categoryIcons as icons
} from '@/utils/placeHelpers';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const place = ref(null);
const loading = ref(false);
const aiLoading = ref(false);
const visitLoading = ref(false);
const currentQuestion = ref('');
const chatHistory = ref([]);
const chatContainer = ref(null);

const isLoggedIn = computed(() => !!userStore.token);
const isVisited = computed(() => place.value ? userStore.isVisited(place.value.id) : false);

const suggestions = [
  'Who built this place?',
  'What is the historical significance?',
  'What should I know before visiting?',
  'What are the interesting facts?'
];

const fetchPlace = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/places/${route.params.id}/context`);
    place.value = response.data.place;
  } catch (err) {
    console.error('Failed to fetch place', err);
    place.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchVisitedIds = async () => {
  if (!isLoggedIn.value) return;
  try {
    const response = await api.get('/visits/ids');
    userStore.setVisitedPlaceIds(response.data.visitedPlaceIds);
  } catch (err) {
    console.error('Failed to fetch visited ids', err);
  }
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
  } catch (err) {
    console.error('Failed to toggle visited', err);
  } finally {
    visitLoading.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const askQuestion = async () => {
  if (!currentQuestion.value.trim() || aiLoading.value) return;
  const question = currentQuestion.value.trim();
  currentQuestion.value = '';
  aiLoading.value = true;
  await scrollToBottom();
  try {
    const response = await api.post('/ai/ask', {
      placeId: place.value.id,
      question
    });
    chatHistory.value.push({
      question,
      answer: response.data.answer,
      cached: response.data.cached
    });
    await scrollToBottom();
  } catch (err) {
    chatHistory.value.push({
      question,
      answer: 'Sorry, I could not answer that right now. Please try again.',
      cached: false
    });
  } finally {
    aiLoading.value = false;
  }
};

const askSuggestion = (suggestion) => {
  currentQuestion.value = suggestion;
  askQuestion();
};

let miniMap = null;

const initMiniMap = () => {
  if (!place.value?.latitude || !place.value?.longitude) return;

  const loadLeaflet = () => {
    return new Promise((resolve) => {
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
  };

  loadLeaflet().then(() => {
    const containerId = `mini-map-${place.value.id}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    miniMap = L.map(containerId, { zoomControl: true, scrollWheelZoom: false })
      .setView([place.value.latitude, place.value.longitude], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(miniMap);

    L.marker([place.value.latitude, place.value.longitude])
      .addTo(miniMap)
      .bindPopup(place.value.name)
      .openPopup();
  });
};

onMounted(async () => {
  await fetchPlace();
  await fetchVisitedIds();
  await nextTick();
  initMiniMap();
});

onUnmounted(() => {
  if (miniMap) {
    miniMap.remove();
    miniMap = null;
  }
});
</script>

<style scoped>
.detail-hero {
  position: relative;
}

.detail-hero-img {
  width: 100%;
}

.detail-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(28, 18, 9, 0.15) 0%,
    rgba(28, 18, 9, 0.5) 100%
  );
}

.detail-back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
}

.detail-container {
  max-width: 900px;
}

.detail-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: #2C1810;
  line-height: 1.2;
}

.detail-location {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #B45309;
}

.detail-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #3D2812;
  line-height: 1.8;
}

.section-label {
  display: flex;
  align-items: center;
}

.section-label-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2C1810;
}

.chat-container {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.chat-bubble {
  max-width: 80%;
}

.suggestion-chip {
  cursor: pointer;
}
</style>