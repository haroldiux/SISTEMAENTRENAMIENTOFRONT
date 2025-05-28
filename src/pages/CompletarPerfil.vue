<template>
  <div class="flex flex-center column q-pa-md bg-gradient">
    <q-card class="q-pa-lg shadow-3 bg-white" style="width: 400px; max-width: 90vw;">
      <div class="text-h6 text-center text-primary q-mb-md">Completa tu perfil</div>

      <q-form @submit.prevent="guardarPerfil">
        <q-input v-model="datos.nombres" label="Nombres" outlined dense class="q-mb-sm" />

        <q-input v-if="esEstudiante" v-model="datos.apellido1" label="Apellido Paterno" outlined dense class="q-mb-sm" />
        <q-input v-if="esEstudiante" v-model="datos.apellido2" label="Apellido Materno" outlined dense class="q-mb-sm" />

        <q-input v-if="!esEstudiante" v-model="datos.apellidos" label="Apellidos" outlined dense class="q-mb-sm" />

        <q-input v-model="datos.correo" label="Correo electrónico" outlined dense class="q-mb-sm" type="email" />
        <q-input v-model="datos.telefono" label="Teléfono" outlined dense class="q-mb-md" type="tel" />

        <!-- Password input -->
        <q-input
          ref="passwordInput"
          v-model="nuevaPassword"
          label="Nueva contraseña"
          :type="verPassword ? 'text' : 'password'"
          outlined
          dense
          class="q-mb-xs"
          @focus="mostrarRequisitos = true"
          @blur="ocultarRequisitos"
          @input="evaluarSeguridad"
        >
          <template #append>
            <q-icon :name="verPassword ? 'visibility_off' : 'visibility'" @click="verPassword = !verPassword" class="cursor-pointer" />
          </template>
        </q-input>

        <!-- Password strength indicator and recommendations -->
        <transition name="fade">
          <div v-if="mostrarRequisitos && nuevaPassword" class="q-mb-sm">
            <q-linear-progress
              :value="nivelPassword.valor"
              :color="nivelPassword.color"
              size="xs"
              class="q-my-sm"
            />
            <div class="text-caption" :class="`text-${nivelPassword.color}`">
              Nivel: {{ nivelPassword.texto }}
            </div>

            <div class="q-mt-sm">
              <div class="text-caption text-grey q-mb-xs">Recomendaciones:</div>
              <ul class="q-pa-none q-ma-none" style="list-style-type: none;">
                <li class="q-mb-xs flex items-center">
                  <q-icon
                    :name="cumpleMinLength ? 'check_circle' : 'cancel'"
                    size="xs"
                    :class="cumpleMinLength ? 'text-positive q-mr-xs' : 'text-negative q-mr-xs'"
                  />
                  <span :class="cumpleMinLength ? 'text-positive' : 'text-negative'">
                    <span class="text-weight-medium">Mínimo 6 caracteres</span> (obligatorio)
                  </span>
                </li>
                <li class="q-mb-xs flex items-center">
                  <q-icon
                    :name="cumpleMayuscula ? 'check_circle' : 'cancel'"
                    size="xs"
                    :class="cumpleMayuscula ? 'text-positive q-mr-xs' : 'text-grey q-mr-xs'"
                  />
                  <span :class="cumpleMayuscula ? 'text-positive' : 'text-grey'">
                    Una letra mayúscula
                  </span>
                </li>
                <li class="q-mb-xs flex items-center">
                  <q-icon
                    :name="cumpleNumero ? 'check_circle' : 'cancel'"
                    size="xs"
                    :class="cumpleNumero ? 'text-positive q-mr-xs' : 'text-grey q-mr-xs'"
                  />
                  <span :class="cumpleNumero ? 'text-positive' : 'text-grey'">
                    Un número
                  </span>
                </li>
                <li class="q-mb-xs flex items-center">
                  <q-icon
                    :name="cumpleEspecial ? 'check_circle' : 'cancel'"
                    size="xs"
                    :class="cumpleEspecial ? 'text-positive q-mr-xs' : 'text-grey q-mr-xs'"
                  />
                  <span :class="cumpleEspecial ? 'text-positive' : 'text-grey'">
                    Un carácter especial
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </transition>

        <q-input
          v-model="confirmarPassword"
          label="Confirmar contraseña"
          :type="verPassword ? 'text' : 'password'"
          outlined
          dense
          class="q-mb-md"
          @focus="mostrarRequisitos = false"
        >
          <template v-if="nuevaPassword && confirmarPassword" #append>
            <q-icon :name="passwordsMatch ? 'check_circle' : 'cancel'"
                   :class="passwordsMatch ? 'text-positive' : 'text-negative'" />
          </template>
        </q-input>

        <q-btn
          label="GUARDAR"
          color="primary"
          type="submit"
          unelevated
          class="full-width"
          :disable="!formularioValido"
        />
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Notify } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const datos = ref({ nombres: '', apellido1: '', apellido2: '', apellidos: '', correo: '', telefono: '' })
const nuevaPassword = ref('')
const confirmarPassword = ref('')
const verPassword = ref(false)
const mostrarRequisitos = ref(false)
const nivelPassword = ref({ valor: 0, color: 'negative', texto: 'Muy débil' })
const passwordInput = ref(null)

const user = JSON.parse(localStorage.getItem('user') || '{"role":""}')
const token = localStorage.getItem('token') || ''
const esEstudiante = computed(() => user?.role === 'ESTUDIANTE')

const cumpleMinLength = computed(() => nuevaPassword.value.length >= 6)
const cumpleMayuscula = computed(() => /[A-Z]/.test(nuevaPassword.value))
const cumpleNumero = computed(() => /[0-9]/.test(nuevaPassword.value))
const cumpleEspecial = computed(() => /[^A-Za-z0-9]/.test(nuevaPassword.value))
const passwordsMatch = computed(() =>
  nuevaPassword.value && nuevaPassword.value === confirmarPassword.value
)

const formularioValido = computed(() => {
  return datos.value.nombres &&
         datos.value.correo &&
         datos.value.telefono &&
         cumpleMinLength.value &&
         passwordsMatch.value &&
         ((esEstudiante.value && datos.value.apellido1 && datos.value.apellido2) ||
          (!esEstudiante.value && datos.value.apellidos))
})

watch(nuevaPassword, evaluarSeguridad, { immediate: true })

function ocultarRequisitos() {
  setTimeout(() => {
    const active = document.activeElement
    const passwordField = passwordInput.value?.$el.querySelector('input')
    if (!passwordField || active !== passwordField) {
      mostrarRequisitos.value = false
    }
  }, 150)
}

function evaluarSeguridad() {
  const pass = nuevaPassword.value
  let score = 0

  if (!pass) {
    nivelPassword.value = { valor: 0, color: 'negative', texto: 'Muy débil' }
    return
  }

  if (cumpleMinLength.value) score++
  if (cumpleMayuscula.value) score++
  if (cumpleNumero.value) score++
  if (cumpleEspecial.value) score++

  switch(score) {
    case 0:
    case 1:
      nivelPassword.value = { valor: 0.25, color: 'negative', texto: 'Muy débil' }
      break
    case 2:
      nivelPassword.value = { valor: 0.5, color: 'warning', texto: 'Débil' }
      break
    case 3:
      nivelPassword.value = { valor: 0.75, color: 'info', texto: 'Media' }
      break
    case 4:
      nivelPassword.value = { valor: 1, color: 'positive', texto: 'Fuerte' }
      break
  }
}

function guardarPerfil() {
  if (!cumpleMinLength.value) {
    Notify.create({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'negative' })
    return
  }

  if (!passwordsMatch.value) {
    Notify.create({ message: 'Las contraseñas no coinciden', type: 'negative' })
    return
  }

  const payload = {
    ...datos.value,
    password: nuevaPassword.value
  }

  const endpoint = esEstudiante.value
    ? '/completar-perfil-estudiante'
    : '/completar-perfil-docente'

  console.log('⏳ Enviando a:', endpoint)
  console.log('Payload:', payload)

  api.post(endpoint, payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => {
      Notify.create({ message: '✅ Perfil actualizado', type: 'positive' })
      router.push({ name: 'inicio' })
    })
    .catch(err => {
      console.error('❌ Error al completar perfil:', err.response?.data || err)
      Notify.create({
        message: err.response?.data?.message || 'Error al guardar los datos',
        type: 'negative'
      })
    })
}
</script>

<style scoped>
.bg-gradient {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
