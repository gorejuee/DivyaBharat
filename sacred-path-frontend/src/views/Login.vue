<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 mt-10">
          <h2 class="mb-4">Login</h2>
          <v-form ref="form">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              placeholder=" " 
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
              autocomplete="current-password"
              placeholder=" "
              :rules="[v => !!v || 'Password is required']"
              variant="outlined"
              class="mb-2"
            />
            <v-alert v-if="serverError" type="error" class="mb-3">
              {{ serverError }}
            </v-alert>
            <v-btn color="primary" block @click="login">Login</v-btn>
            <p class="mt-3 text-center">
              Don't have an account?
              <router-link to="/register">Register</router-link>
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import api from '../services/api'

const form = ref(null)
const email = ref('')
const password = ref('')
const serverError = ref('')
const router = useRouter()
const userStore = useUserStore()

const login = async () => {
  serverError.value = ''
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    userStore.setUser(response.data.user, response.data.token)
    router.push('/')
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Login failed'
  }
}
</script>