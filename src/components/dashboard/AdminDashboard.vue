<template>
  <div>
    <h3 class="text-h6 q-mb-md">Panel de Administración</h3>

    <!-- Estadísticas Generales -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-3">
        <q-card class="stats-card bg-purple-1">
          <q-card-section>
            <div class="text-h3 text-purple text-center">{{ totalUsuarios }}</div>
            <div class="text-subtitle1 text-center">Usuarios Totales</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="stats-card bg-blue-1">
          <q-card-section>
            <div class="text-h3 text-primary text-center">{{ totalDocentes }}</div>
            <div class="text-subtitle1 text-center">Docentes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="stats-card bg-teal-1">
          <q-card-section>
            <div class="text-h3 text-teal text-center">{{ totalEstudiantes }}</div>
            <div class="text-subtitle1 text-center">Estudiantes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="stats-card bg-orange-1">
          <q-card-section>
            <div class="text-h3 text-orange text-center">{{ totalCasos }}</div>
            <div class="text-subtitle1 text-center">Casos Totales</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Usuarios por Rol</div>
            <Pie :data="usuariosPorRolData" :options="pieOptions" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Actividad del Sistema</div>
            <Bar :data="actividadSistemaData" :options="barOptions" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="q-mt-lg row q-col-gutter-md">
      <div class="col-12 col-sm-4">
        <q-btn color="primary" class="full-width" icon="person_add" label="Gestionar Usuarios"
          @click="gestionarUsuarios" />
      </div>
      <div class="col-12 col-sm-4">
        <q-btn color="secondary" class="full-width" icon="groups" label="Gestionar Grupos" @click="gestionarGrupos" />
      </div>
      <div class="col-12 col-sm-4">
        <q-btn color="accent" class="full-width" icon="settings" label="Configuración" @click="configuracionSistema" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bar, Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,  // Necesario para gráficos tipo Pie
  CategoryScale,  // Necesario para gráficos tipo Bar
  LinearScale,   // Necesario para gráficos tipo Bar
  BarElement,    // Necesario para gráficos tipo Bar
  Title,
  Tooltip,
  Legend
);
import { useDashboard } from 'src/composables/useDashboard';

const router = useRouter();

const {
  loading,
  error,
  data,
  fetchDashboard
} = useDashboard('ADMINISTRADOR');

const totalUsuarios = ref(0);
const totalDocentes = ref(0);
const totalEstudiantes = ref(0);
const totalCasos = ref(0);
const usuariosPorRolData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: []
  }]
});
const actividadSistemaData = ref({
  labels: [],
  datasets: [{
    label: '',
    data: [],
    backgroundColor: ''
  }]
});

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  }
};

watch(data, (newData) => {
  if (newData) {
    // Actualizar estadísticas básicas
    totalUsuarios.value = newData.total_usuarios || 0;
    totalDocentes.value = newData.total_docentes || 0;
    totalEstudiantes.value = newData.total_estudiantes || 0;
    totalCasos.value = newData.total_casos || 0;

    // Actualizar gráfico de usuarios por rol
    usuariosPorRolData.value = {
      labels: ['Docentes', 'Estudiantes', 'Otros'],
      datasets: [{
        data: [
          newData.total_docentes || 0,
          newData.total_estudiantes || 0,
          (newData.total_usuarios - (newData.total_docentes + newData.total_estudiantes)) || 0
        ],
        backgroundColor: ['#2196F3', '#4CAF50', '#9C27B0']
      }]
    };

    // Por ahora, mostrar datos de ejemplo para la actividad del sistema
    actividadSistemaData.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      datasets: [{
        label: 'Casos Creados',
        data: [0, 0, 0, 0, 0], // Datos de ejemplo
        backgroundColor: '#2196F3'
      }]
    };
  }
});

onMounted(() => {
  fetchDashboard();
});

// Funciones de navegación
function gestionarUsuarios() {
  router.push({ name: 'admin-usuarios' });
}

function gestionarGrupos() {
  router.push({ name: 'admin-grupos' });
}

function configuracionSistema() {
  router.push({ name: 'admin-configuracion' });
}
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
