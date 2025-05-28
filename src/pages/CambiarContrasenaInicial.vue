<template>
  <q-page class="bg-gradient flex flex-center">
    <q-card class="q-pa-xl shadow-10 animated-card" style="width: 400px; max-width: 90vw; border-radius: 16px">
      <q-card-section class="text-center">
        <q-icon name="key" size="56px" color="primary" />
        <div class="text-h6 q-mt-sm">Cambio de Contraseña</div>
        <p class="text-subtitle1 q-mt-sm">
          Por seguridad, debe cambiar su contraseña inicial
        </p>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="cambiarContrasena" class="q-gutter-md">
          <q-input
            v-model="nuevaContrasena"
            label="Nueva contraseña"
            :type="showPassword ? 'text' : 'password'"
            filled
            dense
            color="primary"
            :rules="[
              val => !!val || 'Este campo es obligatorio',
              val => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
            ]"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmarContrasena"
            label="Confirmar contraseña"
            :type="showConfirmPassword ? 'text' : 'password'"
            filled
            dense
            color="primary"
            :rules="[
              val => !!val || 'Este campo es obligatorio',
              val => val === nuevaContrasena || 'Las contraseñas no coinciden'
            ]"
          >
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <div class="text-caption q-px-sm">
            <ul>
              <li>La contraseña debe tener al menos 6 caracteres</li>
              <li>Por seguridad, use una contraseña diferente a su código o CI</li>
            </ul>
          </div>

          <q-btn
            label="CAMBIAR CONTRASEÑA"
            color="primary"
            class="full-width q-mt-md"
            type="submit"
            unelevated
            :loading="loading"
          />
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
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function cambiarContrasena() {
  if (nuevaContrasena.value !== confirmarContrasena.value) {
    Notify.create({
      message: 'Las contraseñas no coinciden',
      type: 'negative',
      position: 'top'
    })
    return
  }

  if (nuevaContrasena.value.length < 6) {
    Notify.create({
      message: 'La contraseña debe tener al menos 6 caracteres',
      type: 'negative',
      position: 'top'
    })
    return
  }

  loading.value = true

  api.post('/cambiar-contrasena-inicial', {
    password: nuevaContrasena.value
  })
    .then(() => {
      Notify.create({
        message: 'Contraseña cambiada exitosamente',
        type: 'positive',
        position: 'top'
      })

      // Actualizar el localStorage para indicar que ya no es el primer inicio de sesión
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        user.primera_vez = false
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Redirigir a la página de inicio después del cambio exitoso
      router.push({ name: 'inicio' })
    })
    .catch(error => {
      Notify.create({
        message: error.response?.data?.message || 'Error al cambiar la contraseña',
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
