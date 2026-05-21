import { defineStore } from 'pinia';
import api from '@/services/api';

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    currentTrip: null,
  }),
  actions: {
    async fetchTrips() {
      const response = await api.get('/trips');
      this.trips = response.data.trips;
    },

    async createTrip(data) {
      const response = await api.post('/trips', data);
      const trip = response.data.trip;
      this.trips.unshift(trip);
      this.currentTrip = { ...trip, tripPlaces: [] };
      return trip;
    },

    async planWithAI(data) {
      const response = await api.post('/trips/ai-plan', data);
      return response.data;
    },

    async updateTrip(id, data) {
      const response = await api.put(`/trips/${id}`, data);
      const idx = this.trips.findIndex(t => t.id === id);
      if (idx !== -1) this.trips[idx] = { ...this.trips[idx], ...response.data.trip };
      if (this.currentTrip?.id === id) {
        this.currentTrip = { ...this.currentTrip, ...response.data.trip };
      }
    },

    async deleteTrip(id) {
      await api.delete(`/trips/${id}`);
      this.trips = this.trips.filter(t => t.id !== id);
      if (this.currentTrip?.id === id) this.currentTrip = null;
    },

    async fetchTrip(id) {
      const response = await api.get(`/trips/${id}`);
      this.currentTrip = response.data.trip;
      return response.data.trip;
    },

    async addStop(tripId, data) {
      await api.post(`/trips/${tripId}/stops`, data);
      await this.fetchTrip(tripId);
    },

    async removeStop(tripId, stopId) {
      await api.delete(`/trips/${tripId}/stops/${stopId}`);
      if (this.currentTrip?.id === tripId) {
        this.currentTrip.tripPlaces = this.currentTrip.tripPlaces.filter(s => s.id !== stopId);
      }
    },

    async updateStop(tripId, stopId, data) {
      await api.patch(`/trips/${tripId}/stops/${stopId}`, data);
      await this.fetchTrip(tripId);
    },

    async reorderStops(tripId, order) {
      await api.put(`/trips/${tripId}/stops/reorder`, { order });
    },
  }
});
