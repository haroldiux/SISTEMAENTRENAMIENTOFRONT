<template>
  <div class="q-pa-sm q-mb-md">
    <div class="text-subtitle1 text-weight-bold q-mb-sm">DIAGNÓSTICO</div>
    <q-card flat bordered>
      <q-card-section class="q-pa-md">
        <q-input
          v-model="diagnostico"
          label="Diagnóstico del caso clínico"
          outlined
          dense
          placeholder="Escriba el diagnóstico (opcional)"
          :disable="soloLectura"
          class="text-uppercase"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="assignment" color="primary" />
          </template>
        </q-input>

        <div class="text-caption text-grey-6 q-mt-xs">
          * Este campo es opcional. Puede dejarlo vacío si no desea especificar un diagnóstico.
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  soloLectura: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Computed para manejar el v-model
const diagnostico = computed({
  get: () => props.modelValue || "",
  set: (value) => emit("update:modelValue", value),
});

// Métodos expuestos al componente padre
defineExpose({
  limpiar: () => {
    diagnostico.value = "";
  },
  esValido: () => {
    return true; // Siempre válido porque es opcional
  },
  estaVacio: () => {
    return !diagnostico.value || diagnostico.value.trim().length === 0;
  }
});
</script>

<style scoped>
.text-uppercase input {
  text-transform: uppercase;
}
</style>
