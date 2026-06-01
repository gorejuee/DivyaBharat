import { defineStore } from 'pinia';
import api from '@/services/api';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const usePlacesStore = defineStore('places', {
  state: () => ({
    places: [],
    lastFetched: null,
    loading: false,
    loadingMessage: 'Loading heritage sites...',
    error: null,
  }),

  getters: {
    isStale: (state) =>
      !state.lastFetched ||
      !state.places.length ||
      Date.now() - state.lastFetched > CACHE_TTL,
  },

  actions: {
    async fetchIfStale() {
      if (!this.isStale) return true;
      return this.fetchAll();
    },

    async fetchAll() {
      this.loading = true;
      this.loadingMessage = 'Loading heritage sites...';
      this.error = null;

      try {
        const first = await api.get('/places', { params: { limit: 500, page: 1 } });
        const { pagination } = first.data;
        let all = [...first.data.places];
        let loaded = all.length;
        this.loadingMessage = `${loaded} of ${pagination.total} sites...`;

        if (pagination.totalPages > 1) {
          const pageNums = Array.from(
            { length: pagination.totalPages - 1 },
            (_, i) => i + 2
          );

          // Fetch all remaining pages in parallel
          const batches = await Promise.all(
            pageNums.map(async (p) => {
              const r = await api.get('/places', { params: { limit: 500, page: p } });
              loaded += r.data.places.length;
              this.loadingMessage = `${loaded} of ${pagination.total} sites...`;
              return r.data.places;
            })
          );

          for (const batch of batches) {
            all = [...all, ...batch];
          }
        }

        this.places = all;
        this.lastFetched = Date.now();
        return true;
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return false;
        console.error('[PlacesStore] Failed to fetch places:', err);
        this.error = 'Failed to load places. Please try again.';
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
