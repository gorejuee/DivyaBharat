import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  igetters: {
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    setUser(userData, token) {
      this.user = userData;
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
    }
  },
  persist: true
});