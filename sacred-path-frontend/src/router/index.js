import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Register from '@/views/Register.vue'
import Login from '@/views/Login.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router