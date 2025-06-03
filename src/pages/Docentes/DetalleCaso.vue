<template>
  <div>
    <h2>Detalle del Caso Clínico</h2>
    <p>ID del caso: {{ casoId }}</p>
    <!-- Aquí se puede agregar la lógica para mostrar detalles del caso -->
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const casoId = ref(route.params.id);

onMounted(() => {
  // Aquí se puede agregar la lógica para cargar los detalles del caso usando casoId
});
</script>
