<template>
  <v-container class="py-8">
    <h1 class="text-h5 font-weight-bold mb-2">Admin Panel</h1>
    <p class="text-grey text-body-2 mb-6">Review and manage place submissions.</p>

    <v-progress-circular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-10" />
    
    <v-alert v-else-if="!places.length" type="info" variant="tonal">
      No pending submissions right now.
    </v-alert>

    <div v-else>
      <v-card
        v-for="place in places"
        :key="place.id"
        class="mb-4"
        variant="outlined"
      >
        <v-card-text>
          <v-row align="start">
            <v-col cols="12" md="8">
              <div class="d-flex align-center ga-2 mb-1">
                <span class="text-body-1 font-weight-bold">{{ place.name }}</span>
                <v-chip size="x-small" color="warning" variant="tonal">pending</v-chip>
              </div>

              <p class="text-caption text-grey mb-2">
                {{ formatCategory(place.category) }} &bull;
                {{ place.city ? place.city + ', ' : '' }}{{ place.state }} &bull;
                Submitted {{ formatDate(place.created_at) }}
              </p>

              <p v-if="place.description" class="text-body-2 mb-2">
                {{ place.description }}
              </p>

              <p v-if="place.history" class="text-body-2 text-grey">
                <strong>History:</strong> {{ place.history }}
              </p>

              <p v-if="place.latitude && place.longitude" class="text-caption text-grey mt-2">
                📍 {{ place.latitude }}, {{ place.longitude }}
              </p>
            </v-col>

            <v-col cols="12" md="4">
              <v-img
                v-if="place.image_url"
                :src="place.image_url"
                height="120"
                cover
                rounded="lg"
                class="mb-3"
              />

              <v-btn
                color="success"
                variant="tonal"
                block
                class="mb-2"
                :loading="actionLoadingId === place.id + '_approve'"
                @click="reviewPlace(place.id, 'approved')"
              >
                <v-icon start>mdi-check</v-icon>
                Approve
              </v-btn>

              <v-btn
                color="error"
                variant="tonal"
                block
                :loading="actionLoadingId === place.id + '_reject'"
                @click="reviewPlace(place.id, 'rejected')"
              >
                <v-icon start>mdi-close</v-icon>
                Reject
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { formatCategory } from '@/utils/placeHelpers';

const places = ref([]);
const loading = ref(false);
const actionLoadingId = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color };
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const fetchPendingPlaces = async () => {
  loading.value = true;
  try {
    const response = await api.get('/places/admin/pending');
    places.value = response.data.places;
  } catch (err) {
    showSnackbar('Failed to load submissions.', 'error');
  } finally {
    loading.value = false;
  }
};

const reviewPlace = async (id, status) => {
  actionLoadingId.value = `${id}_${status === 'approved' ? 'approve' : 'reject'}`;
  try {
    await api.patch(`/places/${id}/review`, { status });
    places.value = places.value.filter(p => p.id !== id);
    showSnackbar(
      status === 'approved' ? 'Place approved and now live.' : 'Place rejected.',
      status === 'approved' ? 'success' : 'error'
    );
  } catch (err) {
    showSnackbar(err.response?.data?.message || 'Action failed.', 'error');
  } finally {
    actionLoadingId.value = null;
  }
};

onMounted(fetchPendingPlaces);
</script>