<template>
  <q-dialog v-model="model">
    <q-card style="min-width: 400px; max-width: 90vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Añadir nueva característica</div>
        <q-input v-model="nueva" label="Nombre de la característica" autofocus class="text-uppercase"
          :rules="[val => !!val || 'Campo requerido']" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const model = ref(props.modelValue)
const nueva = ref('')

watch(() => props.modelValue, val => {
  model.value = val
})
watch(model, val => emit('update:modelValue', val))

async function guardar() {
  const clasificacion = nueva.value.trim().toUpperCase()
  if (!clasificacion) return

  try {
    const res = await api.post('/caracteristicas', { clasificacion })

    // Verificación adicional de la respuesta
    if (!res || !res.data) {
      console.error('❌ Error: Respuesta inválida del servidor')
      return
    }

    // Construye el objeto correctamente con validaciones para evitar undefined
    const caracteristicaCompleta = {
      id: res.data.id || (res.data.caracteristica ? res.data.caracteristica.id : null),
      clasificacion: res.data.clasificacion ||
        (res.data.caracteristica ? res.data.caracteristica.clasificacion : clasificacion)
    }

    // Verificar que el objeto tiene las propiedades necesarias
    if (!caracteristicaCompleta.id || !caracteristicaCompleta.clasificacion) {
      console.warn('⚠️ La característica creada no tiene todas las propiedades necesarias:', caracteristicaCompleta)
    }

    // Emitir el objeto completo, no solo el nombre
    emit('guardar', caracteristicaCompleta)
    emit('update:modelValue', false)
    nueva.value = ''

    // Disparar evento global para otros componentes
    window.dispatchEvent(new CustomEvent('caracteristica-creada-global', {
      detail: caracteristicaCompleta
    }))

    console.log('✅ Característica guardada:', caracteristicaCompleta)
  } catch (err) {
    console.error('Error al guardar característica:', err)
  }
}
</script>

<style scoped>
.text-uppercase input {
  text-transform: uppercase;
}
</style>
