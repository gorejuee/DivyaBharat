import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    visitedPlaceIds: []
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isVisited: (state) => (placeId) => state.visitedPlaceIds.includes(placeId)
  },
  actions: {
    setUser(userData, token) {
      this.user = userData;
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
      this.visitedPlaceIds = [];
    },
    setVisitedPlaceIds(ids) {
      this.visitedPlaceIds = ids;
    },
    addVisitedPlaceId(id) {
      if (!this.visitedPlaceIds.includes(id)) {
        this.visitedPlaceIds.push(id);
      }
    },
    removeVisitedPlaceId(id) {
      this.visitedPlaceIds = this.visitedPlaceIds.filter(v => v !== id);
    }
  },
  persist: true
});