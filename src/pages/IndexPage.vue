<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="dashboard-container">
      <h2 class="text-h5 q-mb-md">Dashboard</h2>

      <component :is="dashboardComponent" v-if="dashboardComponent" />

      <div v-else class="text-center">
        Rol no identificado. Por favor, inicia sesión.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import AdminDashboard from 'src/components/dashboard/AdminDashboard.vue';
import DocenteDashboard from 'src/components/dashboard/DocenteDashboard.vue';
import EstudianteDashboard from 'src/components/dashboard/EstudianteDashboard.vue';

const authStore = useAuthStore();
const rol = ref('');

const dashboardComponent = computed(() => {
  switch (rol.value) {
    case 'ADMINISTRADOR':
      return AdminDashboard;
    case 'DOCENTE':
      return DocenteDashboard;
    case 'ESTUDIANTE':
      return EstudianteDashboard;
    default:
      return null;
  }
});

onMounted(() => {
  rol.value = authStore.user?.role || '';
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
