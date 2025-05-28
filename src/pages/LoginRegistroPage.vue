<template>
  <q-page class="bg-gradient flex flex-center">
    <q-card class="q-pa-xl shadow-10 animated-card" style="width: 400px; max-width: 90vw; border-radius: 16px">
      <q-card-section class="text-center">
        <q-icon name="account_circle" size="56px" color="primary" />
        <div class="text-h6 q-mt-sm">Iniciar sesión</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="login" class="q-gutter-md">
          <q-input v-model="user" label="CI o Código de estudiante" filled dense autocomplete="username" clearable
            color="primary" :rules="[val => !!val || 'Este campo es obligatorio']" />

          <q-input v-model="password" label="Contraseña" :type="showPassword ? 'text' : 'password'" filled dense
            autocomplete="current-password" color="primary" :rules="[val => !!val || 'Este campo es obligatorio']">
            <template #append>
              <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="showPassword = !showPassword" />
            </template>
          </q-input>

          <q-btn label="INGRESAR" color="primary" class="full-width q-mt-md" type="submit" unelevated
            :loading="loading" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const user = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

function login() {
  loading.value = true
  api.post('/login', {
    user: user.value,
    password: password.value
  })
    .then(res => {
      const data = res.data

      // Verificar explícitamente si el usuario es docente y tiene un ID válido
      if (data.user.role === 'DOCENTE' && !data.user.docente_id) {
        Notify.create({
          message: 'Error: No se pudo obtener su ID de docente. Contacte al administrador.',
          type: 'negative',
          position: 'top'
        })
        loading.value = false
        return
      }

      // Verificar explícitamente si el usuario es estudiante y tiene un ID válido
      if (data.user.role === 'ESTUDIANTE' && !data.user.estudiante_id) {
        Notify.create({
          message: 'Error: No se pudo obtener su ID de estudiante. Contacte al administrador.',
          type: 'negative',
          position: 'top'
        })
        loading.value = false
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Solo guardar docente_id si existe
      if (data.user.docente_id) {
        localStorage.setItem('docente_id', data.user.docente_id)
      }

      // Solo guardar estudiante_id si existe
      if (data.user.estudiante_id) {
        localStorage.setItem('estudiante_id', data.user.estudiante_id)
      }

      Notify.create({
        message: 'Inicio de sesión exitoso',
        type: 'positive',
        position: 'top'
      })

      // Si es la primera vez que inicia sesión, redirigir a la página de cambio de contraseña
      if (data.user.primera_vez) {
        router.push({ name: 'cambiar-contrasena-inicial' })
      } else {
        router.push({ name: 'inicio' })
      }
    })
    .catch(() => {
      Notify.create({
        message: 'Credenciales incorrectas',
        type: 'negative',
        position: 'top'
      })
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to right, #4facfe, #00f2fe);
  min-height: 100vh;
}

.animated-card {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
