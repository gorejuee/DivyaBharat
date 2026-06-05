import { defineStore } from 'pinia';
import api from '@/services/api';

export const useJournalStore = defineStore('journal', {
  state: () => ({
    entries: [],
    loaded: false,
  }),

  getters: {
    totalEntries:  (s) => s.entries.length,
    linkedTrips:   (s) => new Set(s.entries.map(e => e.trip_id).filter(Boolean)).size,
  },

  actions: {
    async fetchEntries() {
      const res = await api.get('/journal');
      this.entries = res.data.entries;
      this.loaded = true;
    },

    async createEntry(data) {
      const res = await api.post('/journal', data);
      this.entries.unshift(res.data.entry);
      return res.data.entry;
    },

    async updateEntry(id, data) {
      const res = await api.put(`/journal/${id}`, data);
      const idx = this.entries.findIndex(e => e.id === id);
      if (idx !== -1) this.entries[idx] = res.data.entry;
      return res.data.entry;
    },

    async deleteEntry(id) {
      await api.delete(`/journal/${id}`);
      this.entries = this.entries.filter(e => e.id !== id);
    },
  },
});
