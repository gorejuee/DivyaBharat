<template>
  <v-container v-if="loading" class="text-center py-16">
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-container>

  <v-container v-else-if="!place" class="text-center py-16">
    <v-icon size="64" color="grey">mdi-map-marker-off</v-icon>
    <h2 class="mt-4 text-grey">Place not found</h2>
    <v-btn class="mt-4" color="primary" @click="router.push('/places')">
      Back to Explore
    </v-btn>
  </v-container>

  <v-container v-else>
    <!-- Back button -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 px-0"
      @click="router.push('/places')"
    >
      Back to Explore
    </v-btn>

    <!-- Hero Image -->
    <v-img
      :src="place.image_url || 'https://placehold.co/1200x400?text=DivyaBharat'"
      height="400"
      cover
      rounded="lg"
      class="mb-6"
    />

    <!-- Title and category -->
    <v-row class="mb-2" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold">{{ place.name }}</h1>
        <div class="mt-2 d-flex align-center ga-2">
          <v-chip
            :color="categoryColor(place.category)"
            variant="tonal"
            size="small"
          >
            {{ formatCategory(place.category) }}
          </v-chip>
          <v-icon size="16" color="grey" class="ml-2">mdi-map-marker</v-icon>
          <span class="text-grey text-body-2">{{ place.city }}, {{ place.state }}</span>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <!-- Description -->
    <section class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">About</h2>
      <p class="text-body-1">{{ place.description }}</p>
    </section>

    <!-- History -->
    <section v-if="place.history" class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-book-open-variant</v-icon>
        History
      </h2>
      <v-card variant="tonal" color="primary" class="pa-4">
        <p class="text-body-1">{{ place.history }}</p>
      </v-card>
    </section>

    <!-- Location -->
    <section v-if="place.latitude && place.longitude" class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-map</v-icon>
        Location
      </h2>
      <v-card variant="outlined" class="pa-4">
        <p class="text-body-2 text-grey">
          Coordinates: {{ place.latitude }}, {{ place.longitude }}
        </p>
        <v-btn
          class="mt-3"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-google-maps"
          :href="`https://www.google.com/maps?q=${place.latitude},${place.longitude}`"
          target="_blank"
        >
          Open in Google Maps
        </v-btn>
      </v-card>
    </section>

    <!-- AI Guide -->
    <section class="mb-8">
      <h2 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
        Ask AI Guide
      </h2>

      <v-card v-if="!isLoggedIn" variant="outlined" class="pa-6 text-center">
        <v-icon size="48" color="grey">mdi-lock-outline</v-icon>
        <p class="mt-3 text-grey">Please login to use the AI Guide</p>
        <v-btn class="mt-3" color="primary" @click="router.push('/login')">
          Login
        </v-btn>
      </v-card>

      <v-card v-else variant="outlined">
        <div class="pa-4" style="min-height: 200px; max-height: 400px; overflow-y: auto;" ref="chatContainer">
          <div v-if="chatHistory.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey">mdi-robot-outline</v-icon>
            <p class="mt-3 text-grey text-body-2">
              Ask me anything about {{ place.name }}
            </p>
            <div class="mt-4 d-flex flex-wrap justify-center gap-2">
              <v-chip
                v-for="suggestion in suggestions"
                :key="suggestion"
                size="small"
                variant="tonal"
                color="primary"
                style="cursor: pointer"
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
                  class="pa-3"
                  style="max-width: 80%"
                >
                  <p class="text-body-2">{{ msg.question }}</p>
                </v-card>
              </div>

              <div class="d-flex justify-start">
                <div class="d-flex align-start gap-2" style="max-width: 80%">
                  <v-icon color="primary" size="20" class="mt-1">mdi-robot</v-icon>
                  <v-card variant="tonal" color="grey" class="pa-3">
                    <p class="text-body-2">{{ msg.answer }}</p>
                    <p v-if="msg.cached" class="text-caption text-grey mt-1">
                      <v-icon size="12">mdi-lightning-bolt</v-icon>
                      Cached response
                    </p>
                  </v-card>
                </div>
              </div>
            </div>

            <div v-if="aiLoading" class="d-flex justify-start mb-4">
              <div class="d-flex align-start gap-2">
                <v-icon color="primary" size="20" class="mt-1">mdi-robot</v-icon>
                <v-card variant="tonal" color="grey" class="pa-3">
                  <v-progress-circular indeterminate size="16" width="2" color="primary" />
                </v-card>
              </div>
            </div>
          </div>
        </div>

        <v-divider />

        <div class="pa-4 d-flex gap-2">
          <v-text-field
            v-model="currentQuestion"
            placeholder="Ask anything about this place..."
            variant="outlined"
            density="compact"
            hide-details
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

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/services/api';
import { categoryColor, formatCategory } from '@/utils/placeHelpers';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const place = ref(null);
const loading = ref(false);
const aiLoading = ref(false);
const currentQuestion = ref('');
const chatHistory = ref([]);
const chatContainer = ref(null);

const isLoggedIn = computed(() => !!userStore.token);

const suggestions = [
  'Who built this place?',
  'What is the historical significance?',
  'What should I know before visiting?',
  'What are the interesting facts?'
];

const fetchPlace = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/places/${route.params.id}`);
    place.value = response.data.place;
  } catch (err) {
    console.error('Failed to fetch place', err);
    place.value = null;
  } finally {
    loading.value = false;
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

onMounted(fetchPlace);
</script>