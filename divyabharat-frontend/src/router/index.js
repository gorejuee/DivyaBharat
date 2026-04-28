import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';
import Places from '@/views/Places.vue';
import SubmitPlace from '@/views/SubmitPlace.vue';
import PlaceDetail from '@/views/PlaceDetail.vue';
import AdminPlaces from '@/views/AdminPlaces.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/register', component: Register, meta: { guestOnly: true } },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/places', component: Places },
  { path: '/admin/places', component: AdminPlaces, meta: { requiresAdmin: true } },  // ✅ add this
  { path: '/places/submit', component: SubmitPlace },
  { path: '/places/:id', component: PlaceDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.token;

  if (to.meta.guestOnly && isLoggedIn) {
    return '/places';
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return '/';
  }
});

export default router;