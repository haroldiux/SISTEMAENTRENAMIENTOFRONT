<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="dashboard-container">
      <h2 class="text-h5 q-mb-md">Dashboard</h2>

      <!-- Selector de rol (temporal, para pruebas) -->
      <div class="q-mb-md">
        <q-btn-group spread>
          <q-btn :color="rol === 'admin' ? 'primary' : 'grey'" label="Admin" @click="rol = 'admin'" />
          <q-btn :color="rol === 'docente' ? 'primary' : 'grey'" label="Docente" @click="rol = 'docente'" />
          <q-btn :color="rol === 'estudiante' ? 'primary' : 'grey'" label="Estudiante" @click="rol = 'estudiante'" />
        </q-btn-group>
      </div>

      <!-- Dashboard según rol -->
      <AdminDashboard v-if="rol === 'admin'" />
      <DocenteDashboard v-else-if="rol === 'docente'" />
      <EstudianteDashboard v-else-if="rol === 'estudiante'" />
      <div v-else class="text-center">
        <div class="text-h6">Rol no identificado</div>
        <div class="text-subtitle1">Por favor, inicia sesión para acceder a tu dashboard.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import AdminDashboard from 'components/dashboard/AdminDashboard.vue';
import DocenteDashboard from 'components/dashboard/DocenteDashboard.vue';
import EstudianteDashboard from 'components/dashboard/EstudianteDashboard.vue';
import { useDashboard } from 'src/composables/useDashboard';

const { data, fetchDashboard } = useDashboard();
const rol = ref(null);

watch(data, (newData) => {
  if (newData && newData.rol) {
    rol.value = newData.rol.toLowerCase();
  }
});

fetchDashboard();
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
