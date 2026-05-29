<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">

        <div class="text-center mb-8">
          <v-icon size="40" color="primary" class="mb-3">mdi-temple-hindu</v-icon>
          <h1 class="font-playfair text-h4 font-weight-bold" style="color: #2C1810;">
            Join DivyaBharat
          </h1>
          <p class="text-body-2 mt-1" style="color: #78614A;">
            Create your account and start exploring
          </p>
        </div>

        <v-card
          elevation="0"
          rounded="xl"
          class="pa-6"
          style="background: #FFFBF4; border: 1px solid rgba(180,83,9,0.12);"
        >
          <v-form ref="form">
            <v-text-field
              v-model="name"
              label="Full name"
              autocomplete="name"
              variant="outlined"
              color="primary"
              base-color="primary"
              clearable
              class="mb-3"
              :rules="[v => !!v || 'Name is required']"
            />
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              variant="outlined"
              color="primary"
              base-color="primary"
              clearable
              class="mb-3"
              :rules="[
                v => !!v || 'Email is required',
                v => /.+@.+\..+/.test(v) || 'Enter a valid email'
              ]"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="new-password"
              variant="outlined"
              color="primary"
              base-color="primary"
              clearable
              class="mb-4"
              :rules="[
                v => !!v || 'Password is required',
                v => v.length >= 8 || 'Password must be at least 8 characters'
              ]"
            />

            <v-alert v-if="serverError" type="error" variant="tonal" rounded="lg" class="mb-4">
              {{ serverError }}
            </v-alert>

            <v-btn color="primary" variant="flat" block size="large" rounded="lg" class="mb-4" @click="register">
              Create Account
            </v-btn>
          </v-form>

          <div class="d-flex align-center ga-3 mb-4">
            <v-divider color="primary" style="opacity: 0.2;" />
            <span class="text-caption" style="color: #78614A; white-space: nowrap;">or</span>
            <v-divider color="primary" style="opacity: 0.2;" />
          </div>

          <v-btn
            block
            variant="outlined"
            color="primary"
            size="large"
            rounded="lg"
            prepend-icon="mdi-google"
            @click="loginWithGoogle"
          >
            Continue with Google
          </v-btn>

          <p class="text-center mt-5 text-body-2" style="color: #78614A;">
            Already have an account?
            <router-link to="/login" style="color: #B45309; font-weight: 500; text-decoration: none;">
              Sign in
            </router-link>
          </p>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
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