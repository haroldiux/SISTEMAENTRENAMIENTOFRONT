<template>
  <q-dialog v-model="model">
    <q-card style="min-width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Registrar nueva localización</div>

        <q-input v-model="nombre" label="Nombre de la localización" autofocus class="q-mt-md text-uppercase"
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

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const model = ref(props.modelValue)
const nombre = ref('')

watch(() => props.modelValue, val => model.value = val)
watch(model, val => emit('update:modelValue', val))

async function guardar() {
  const nuevo = nombre.value.trim().toUpperCase()
  if (!nuevo) return

  try {
    const res = await api.post('/localizaciones', {
      nombre: nuevo
    })

    emit('guardar', res.data.localizacion)

    model.value = false
    nombre.value = ''

    console.log('✅ Localización registrada correctamente:', res.data.localizacion)

    // ✅ Emitir el evento SOLO si localización existe
    if (res.data && res.data.localizacion) {
      window.dispatchEvent(new CustomEvent('localizacion-creada-global', { detail: res.data.localizacion }))
    } else {
      console.error('⚠️ No se obtuvo localizacion en la respuesta')
    }
  } catch (error) {
    console.error('Error al guardar localización:', error)
  }
}
</script>

<style scoped>
.text-uppercase input {
  text-transform: uppercase;
}
</style>
