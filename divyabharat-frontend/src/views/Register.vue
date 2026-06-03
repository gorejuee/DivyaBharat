<template>
  <div class="auth-root">
    <div class="auth-glow" />

    <div class="auth-card">

      <!-- Header -->
      <div class="auth-header">
        <div class="auth-icon-wrap">
          <v-icon size="24" style="color:var(--db-gold-bright);">mdi-temple-hindu</v-icon>
        </div>
        <p class="auth-eyebrow font-label">DivyaBharat</p>
        <h1 class="auth-title font-display">Join DivyaBharat</h1>
        <p class="auth-sub font-body">Create your account and begin your sacred journey</p>
      </div>

      <!-- Form body -->
      <div class="auth-body">
        <v-form ref="form">
          <v-text-field
            v-model="name"
            label="Full name"
            autocomplete="name"
            variant="outlined"
            color="primary"
            density="comfortable"
            class="auth-field mb-3"
            :rules="[v => !!v || 'Name is required']"
          />
          <v-text-field
            v-model="email"
            label="Email address"
            type="email"
            autocomplete="email"
            variant="outlined"
            color="primary"
            density="comfortable"
            class="auth-field mb-3"
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Enter a valid email'
            ]"
          />
          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            variant="outlined"
            color="primary"
            density="comfortable"
            class="auth-field mb-4"
            :rules="[
              v => !!v || 'Password is required',
              v => v.length >= 8 || 'Must be at least 8 characters'
            ]"
          >
            <template v-if="password" #append-inner>
              <button
                type="button"
                tabindex="-1"
                class="pwd-eye-btn"
                @mousedown.prevent
                @click="showPassword = !showPassword"
              >
                <v-icon size="18">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
            </template>
          </v-text-field>

          <div v-if="serverError" class="auth-error font-body">
            <v-icon size="15" style="margin-right:6px;flex-shrink:0;">mdi-alert-circle-outline</v-icon>
            {{ serverError }}
          </div>

          <button type="button" class="auth-submit-btn font-label" @click="register">
            Create Account
          </button>
        </v-form>

        <div class="auth-divider">
          <span class="auth-divider-line" />
          <span class="auth-divider-text font-label">or</span>
          <span class="auth-divider-line" />
        </div>

        <button class="auth-google-btn font-label" @click="loginWithGoogle">
          <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right:9px;flex-shrink:0;">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <p class="auth-footer-text font-body">
          Already have an account?
          <router-link to="/login" class="auth-footer-link">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/services/api';

const form = ref(null);
const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const serverError = ref('');
const router = useRouter();
const userStore = useUserStore();

const register = async () => {
  serverError.value = '';
  const { valid } = await form.value.validate();
  if (!valid) return;
  try {
    const response = await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value
    });
    userStore.setUser(response.data.user, response.data.token);
    router.push('/');
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Registration failed';
  }
};

const loginWithGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`;
};
</script>

<style src='@/styles/auth.css' />
