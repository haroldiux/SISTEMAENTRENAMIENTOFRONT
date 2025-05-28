<template>
  <q-dialog v-model="internalModel">
    <q-card style="min-width: 400px; max-width: 90vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Añadir nueva manifestación</div>
        <q-input v-model="nombre" label="Nombre" autofocus class="text-uppercase"
          :rules="[val => !!val || 'Campo requerido']" />
        <q-select v-model="tipo" :options="tipos" label="Tipo de manifestación" emit-value map-options
          :rules="[val => !!val || 'Campo requerido']" class="q-mt-sm" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="cerrar" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: Boolean,
  tipoPreseleccionado: Number,
})
const emit = defineEmits(['update:modelValue', 'guardar', 'manifestacionCreada'])

const internalModel = ref(props.modelValue)
const nombre = ref('')
const tipo = ref(props.tipoPreseleccionado)

watch(() => props.modelValue, val => internalModel.value = val)
watch(() => props.tipoPreseleccionado, val => tipo.value = val)
watch(internalModel, val => emit('update:modelValue', val))

const tipos = [
  { label: 'Signo', value: 1 },
  { label: 'Síntoma', value: 2 },
  { label: 'Síndrome', value: 3 },
]

async function guardar() {
  const nuevoNombre = nombre.value.trim().toUpperCase()
  if (!nuevoNombre || tipo.value === null) return

  try {
    const res = await api.post('/manifestaciones', {
      nombre: nuevoNombre,
      tipo: tipo.value
    })

    emit('guardar', res.data.manifestacion)
    emit('manifestacionCreada', res.data) // <-- enviar todo el objeto manifestacion creado
    internalModel.value = false
    nombre.value = ''
  } catch (error) {
    console.error('Error al guardar manifestación:', error)
  }
}

function cerrar() {
  internalModel.value = false
  nombre.value = ''
}
</script>

<style scoped>
.text-uppercase input {
  text-transform: uppercase;
}
</style>
