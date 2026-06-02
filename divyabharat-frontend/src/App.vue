<template>
  <v-app>
    <!-- Floating Nav -->
    <header class="db-nav" :class="{ 'db-nav--scrolled': scrolled }">
      <div class="db-nav-inner">

        <!-- Wordmark -->
        <router-link to="/" class="db-wordmark">
          DivyaBharat
        </router-link>

        <!-- Center links (desktop) -->
        <nav class="db-nav-links" aria-label="Main navigation">
          <router-link to="/" class="db-nav-link" exact-active-class="db-nav-link--active">
            Home
          </router-link>
          <router-link to="/places" class="db-nav-link" active-class="db-nav-link--active">
            Explore
          </router-link>
          <router-link to="/map" class="db-nav-link" active-class="db-nav-link--active">
            Map
          </router-link>
          <router-link v-if="isLoggedIn" to="/trips" class="db-nav-link" active-class="db-nav-link--active">
            Trips
          </router-link>
        </nav>

        <!-- Right side -->
        <div class="db-nav-right">

          <template v-if="!isLoggedIn">
            <router-link to="/login" class="db-nav-link" active-class="db-nav-link--active">Login</router-link>
            <router-link to="/register" class="db-nav-cta" active-class="db-nav-cta--active">Join</router-link>
          </template>

          <template v-else>
            <router-link to="/places/submit" class="db-nav-link db-nav-link--icon db-nav-tooltip" data-tip="Submit a place">
              <v-icon size="18">mdi-plus-circle-outline</v-icon>
            </router-link>

            <router-link v-if="userStore.isAdmin" to="/admin/places" class="db-nav-link" active-class="db-nav-link--active">
              Admin
            </router-link>

            <!-- User menu -->
            <button class="db-user-btn" @click="menuOpen = !menuOpen" ref="userBtnRef">
              <span class="db-user-avatar">{{ userStore.user?.name?.charAt(0).toUpperCase() }}</span>
              <v-icon size="14" :style="{ color: 'var(--db-text-muted)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }">mdi-chevron-down</v-icon>
            </button>

            <div v-if="menuOpen" class="db-user-menu" @click.stop>
              <div class="db-user-menu-name">{{ userStore.user?.name }}</div>
              <div class="db-user-menu-email">{{ userStore.user?.email }}</div>
              <div class="db-user-menu-divider" />
              <router-link to="/my-places" class="db-user-menu-item" @click="menuOpen = false">
                <v-icon size="15">mdi-heart-outline</v-icon>
                My Places
              </router-link>
              <router-link to="/trips" class="db-user-menu-item" @click="menuOpen = false">
                <v-icon size="15">mdi-map-marker-path</v-icon>
                My Trips
              </router-link>
              <div class="db-user-menu-divider" />
              <button class="db-user-menu-item db-user-menu-item--danger" @click="logout">
                <v-icon size="15">mdi-logout</v-icon>
                Sign out
              </button>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
        <button class="db-mobile-menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Open menu">
          <span class="db-hamburger" :class="{ 'db-hamburger--open': mobileOpen }">
            <span /><span /><span />
          </span>
        </button>

      </div>
    </header>

    <!-- Mobile drawer -->
    <transition name="mobile-menu">
      <div v-if="mobileOpen" class="db-mobile-drawer" @click="mobileOpen = false">
        <div class="db-mobile-drawer-inner" @click.stop>
          <div class="db-mobile-wordmark">DivyaBharat</div>
          <nav class="db-mobile-links">
            <router-link to="/" class="db-mobile-link" @click="mobileOpen = false">Home</router-link>
            <router-link to="/places" class="db-mobile-link" @click="mobileOpen = false">Explore</router-link>
            <router-link to="/map" class="db-mobile-link" @click="mobileOpen = false">Map</router-link>
            <router-link v-if="isLoggedIn" to="/trips" class="db-mobile-link" @click="mobileOpen = false">My Trips</router-link>
            <router-link v-if="isLoggedIn" to="/my-places" class="db-mobile-link" @click="mobileOpen = false">My Places</router-link>
            <router-link v-if="isLoggedIn" to="/places/submit" class="db-mobile-link" @click="mobileOpen = false">Submit a Place</router-link>
            <router-link v-if="userStore.isAdmin" to="/admin/places" class="db-mobile-link" @click="mobileOpen = false">Admin</router-link>
          </nav>
          <div class="db-mobile-auth">
            <template v-if="!isLoggedIn">
              <router-link to="/login" class="db-mobile-auth-btn db-mobile-auth-btn--ghost" @click="mobileOpen = false">Login</router-link>
              <router-link to="/register" class="db-mobile-auth-btn" @click="mobileOpen = false">Join</router-link>
            </template>
            <template v-else>
              <button class="db-mobile-auth-btn db-mobile-auth-btn--ghost" @click="logout">Sign out</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cursor glow (follows mouse) -->
    <div class="cursor-glow" ref="cursorEl" />

    <!-- Page content -->
    <v-main class="db-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in" @after-enter="onRouteEnter">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!userStore.token);

const scrolled = ref(false);
const menuOpen = ref(false);
const mobileOpen = ref(false);
const userBtnRef = ref(null);
const cursorEl = ref(null);

const handleScroll = () => {
  scrolled.value = window.scrollY > 40;
};

const handleClickOutside = (e) => {
  if (menuOpen.value && userBtnRef.value && !userBtnRef.value.closest('.db-user-btn')?.contains(e.target)) {
    menuOpen.value = false;
  }
};

const moveCursor = (e) => {
  if (!cursorEl.value) return;
  cursorEl.value.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('mousemove', moveCursor, { passive: true });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('mousemove', moveCursor);
  document.removeEventListener('click', handleClickOutside);
});

const logout = () => {
  menuOpen.value = false;
  mobileOpen.value = false;
  userStore.logout();
  router.push('/');
};

const onRouteEnter = () => {
  window.dispatchEvent(new Event('resize'));
};
</script>

<style scoped>
/* ---- Floating nav shell ---- */
.db-nav {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 1160px;
  z-index: 900;
  border-radius: 16px;
  background: rgba(9, 6, 10, 0.72);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--db-border);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.db-nav--scrolled {
  border-color: var(--db-border-strong);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

.db-nav-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  height: 56px;
}

/* ---- Wordmark ---- */
.db-wordmark {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--db-gold-bright);
  text-decoration: none;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---- Center links ---- */
.db-nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  justify-content: center;
}

.db-nav-link {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: rgba(237, 227, 206, 0.68);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.db-nav-link:hover {
  color: var(--db-text);
  background: rgba(200, 134, 30, 0.08);
}

.db-nav-link--active {
  color: var(--db-gold-bright) !important;
  background: rgba(200, 134, 30, 0.12) !important;
}

.db-nav-link--icon {
  padding: 6px 10px;
}

/* Styled tooltip for icon-only nav buttons */
.db-nav-tooltip {
  position: relative;
}
.db-nav-tooltip::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--db-surface-2);
  color: var(--db-text);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  padding: 5px 11px;
  border-radius: 7px;
  border: 1px solid var(--db-border-strong);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
  z-index: 1100;
}
.db-nav-tooltip:hover::after {
  opacity: 1;
}

/* ---- Right side ---- */
.db-nav-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.db-nav-cta {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--db-bg);
  background: var(--db-gold);
  text-decoration: none;
  padding: 6px 18px;
  border-radius: 8px;
  transition: background 0.2s;
}

.db-nav-cta:hover { background: var(--db-gold-bright); }
.db-nav-cta--active {
  background: var(--db-gold-bright) !important;
  box-shadow: 0 0 0 2px rgba(200,134,30,0.4);
}

/* ---- User button ---- */
.db-user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(200, 134, 30, 0.08);
  border: 1px solid var(--db-border);
  border-radius: 10px;
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
}

.db-user-btn:hover {
  border-color: var(--db-border-strong);
  background: rgba(200, 134, 30, 0.12);
}

.db-user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--db-gold);
  color: var(--db-bg);
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- User dropdown ---- */
.db-user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--db-surface-2);
  border: 1px solid var(--db-border-strong);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.db-user-menu-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--db-text);
  padding: 6px 10px 2px;
}

.db-user-menu-email {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: var(--db-text-muted);
  padding: 0 10px 6px;
}

.db-user-menu-divider {
  height: 1px;
  background: var(--db-border);
  margin: 4px 0;
}

.db-user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--db-text-muted);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-align: left;
}

.db-user-menu-item:hover {
  background: rgba(200, 134, 30, 0.08);
  color: var(--db-text);
}

.db-user-menu-item--danger {
  color: #DC4040;
}

.db-user-menu-item--danger:hover {
  background: rgba(220, 64, 64, 0.08);
  color: #F87171;
}

/* ---- Mobile toggle ---- */
.db-mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
}

.db-hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 22px;
}

.db-hamburger span {
  display: block;
  height: 1.5px;
  background: var(--db-text-muted);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}

.db-hamburger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.db-hamburger--open span:nth-child(2) { opacity: 0; }
.db-hamburger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* ---- Mobile drawer ---- */
.db-mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 800;
  background: rgba(9, 6, 10, 0.6);
  backdrop-filter: blur(4px);
}

.db-mobile-drawer-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: var(--db-surface);
  border-bottom: 1px solid var(--db-border-strong);
  border-radius: 0 0 20px 20px;
  padding: 80px 24px 32px;
}

.db-mobile-wordmark {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--db-gold-bright);
  margin-bottom: 28px;
}

.db-mobile-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
}

.db-mobile-link {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--db-text-muted);
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s, color 0.15s;
}

.db-mobile-link:hover,
.db-mobile-link.router-link-active {
  background: var(--db-gold-subtle);
  color: var(--db-gold-bright);
}

.db-mobile-auth {
  display: flex;
  gap: 10px;
}

.db-mobile-auth-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  background: var(--db-gold);
  color: var(--db-bg);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.db-mobile-auth-btn:hover {
  background: var(--db-gold-bright);
}

.db-mobile-auth-btn--ghost {
  background: transparent;
  border: 1px solid var(--db-border-strong);
  color: var(--db-text-muted);
}

.db-mobile-auth-btn--ghost:hover {
  border-color: var(--db-gold-muted);
  color: var(--db-text);
}

/* ---- Cursor glow ---- */
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 640px;
  height: 640px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(200, 134, 30, 0.22) 0%,
    rgba(200, 134, 30, 0.10) 30%,
    transparent 68%
  );
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}

/* ---- Main content offset ---- */
.db-main {
  padding-top: 80px !important;
}

/* ---- Page route transition ---- */
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-active {
  transition: opacity 0.28s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* ---- Mobile drawer transition ---- */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.25s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .db-nav-links,
  .db-nav-right {
    display: none;
  }

  .db-mobile-menu-btn {
    display: flex;
  }

  .db-nav-inner {
    padding: 0 16px;
  }

  .db-main {
    padding-top: 80px !important;
  }
}

/* ---- User menu positioning ---- */
.db-nav-right {
  position: relative;
}
</style>
