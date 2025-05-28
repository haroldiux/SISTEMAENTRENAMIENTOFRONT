<template>
  <q-dialog v-model="model" @hide="limpiar">
    <q-card>
      <q-card-section>
        <div class="text-h6">Añadir nuevo motivo de consulta</div>
        <q-input
          v-model="nuevo"
          label="Motivo"
          autofocus
          :rules="[val => !!val || 'Campo requerido']"
          class="text-uppercase"
        />
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

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'guardar', 'manifestacionCreada'])

const model = ref(props.modelValue)
const nuevo = ref('')

// Sincronizar el estado local con la prop
watch(() => props.modelValue, (val) => {
  model.value = val
})

watch(model, (val) => {
  emit('update:modelValue', val)
})

// Función guardar
function guardar() {
  const nombreMayuscula = nuevo.value.trim().toUpperCase()
  if (!nombreMayuscula) return

  emit('guardar', nombreMayuscula)
  limpiar()
  model.value = false
}

// Limpiar campo cuando se cierra o se guarda
function limpiar() {
  nuevo.value = ''
}
</script>

<style scoped>
.text-uppercase {
  text-transform: uppercase;
}
</style>
