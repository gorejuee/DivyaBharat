<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 mt-10">
          <h2 class="mb-4">Register</h2>
          <v-form ref="form">
            <v-text-field
              v-model="name"
              label="Name"
              autocomplete="name"
              clearable
              :rules="[v => !!v || 'Name is required']"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              clearable
              :rules="[
                v => !!v || 'Email is required',
                v => /.+@.+\..+/.test(v) || 'Enter a valid email'
              ]"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="new-password"
              clearable
              :rules="[
                  v => !!v || 'Password is required',
                  v => v.length >= 8 || 'Password must be at least 8 characters'
                ]"
              variant="outlined"
              class="mb-2"
            />
            <v-alert v-if="serverError" type="error" class="mb-3">
              {{ serverError }}
            </v-alert>
            <v-btn color="primary" block @click="register">Register</v-btn>
            <p class="mt-3 text-center">
              Already have an account?
              <router-link to="/login">Login</router-link>
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import api from '../services/api';

const form = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const serverError = ref('');
const router = useRouter();
const userStore = useUserStore();

const register = async () => {
  serverError.value = ''
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    const response = await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value
    })
    userStore.setUser(response.data.user, response.data.token)
    router.push('/')
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Registration failed'
  }
}
</script>