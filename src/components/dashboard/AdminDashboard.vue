<template>
  <div>
    <h3 class="text-h5 q-mb-md">Panel de Administración</h3>

    <!-- Loader mientras se cargan los datos -->
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <div class="q-ml-sm text-subtitle1">Cargando datos del dashboard...</div>
    </div>

    <div v-else-if="error" class="q-pa-md bg-negative text-white rounded-borders">
      <div class="text-subtitle1">{{ error }}</div>
      <q-btn flat color="white" label="Reintentar" @click="loadDashboardData" />
    </div>

    <div v-else>
      <!-- Resumen General -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card bg-purple-1">
            <q-card-section class="text-center">
              <q-icon name="people" size="2.5rem" color="purple" />
              <div class="text-h4 text-purple">{{ dashboardData.total_usuarios }}</div>
              <div class="text-subtitle1">Usuarios Totales</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card bg-blue-1">
            <q-card-section class="text-center">
              <q-icon name="school" size="2.5rem" color="primary" />
              <div class="text-h4 text-primary">{{ dashboardData.total_docentes }}</div>
              <div class="text-subtitle1">Docentes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card bg-teal-1">
            <q-card-section class="text-center">
              <q-icon name="face" size="2.5rem" color="teal" />
              <div class="text-h4 text-teal">{{ dashboardData.total_estudiantes }}</div>
              <div class="text-subtitle1">Estudiantes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card bg-orange-1">
            <q-card-section class="text-center">
              <q-icon name="medical_information" size="2.5rem" color="orange" />
              <div class="text-h4 text-orange">{{ dashboardData.total_casos }}</div>
              <div class="text-subtitle1">Casos Médicos</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Distribución y Actividad -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Distribución de Casos por Dificultad -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Distribución de Casos por Dificultad</div>
              <div v-if="!casosPorDificultad.length" class="text-center q-pa-md">
                No hay datos disponibles
              </div>
              <div v-else class="row q-col-gutter-md q-mt-md">
                <div v-for="(nivel, index) in casosPorDificultad" :key="index" class="col-12">
                  <div class="text-subtitle2 q-mb-xs">Nivel {{ nivel.nivel }} ({{ nivel.porcentaje }}%)</div>
                  <q-linear-progress :value="nivel.porcentaje / 100" :color="nivel.color" size="15px" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption">{{ nivel.cantidad }} casos</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Distribución de Usuarios -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Distribución de Usuarios</div>
              <div v-if="!usuariosPorRolData.datasets[0].data.length" class="text-center q-pa-md">
                No hay datos disponibles
              </div>
              <div v-else>
                <Pie :data="usuariosPorRolData" :options="pieOptions" class="chart-container" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Materias y Evaluaciones -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Casos por Materia -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Casos por Materia</div>
              <div v-if="!casosPorMateria.length" class="text-center q-pa-md">
                No hay datos disponibles
              </div>
              <div v-else class="q-pa-md">
                <div v-for="materia in casosPorMateria" :key="materia.id" class="q-mb-md">
                  <div class="row justify-between items-center">
                    <div>{{ materia.nombre }}</div>
                    <div>{{ materia.cantidad }} casos</div>
                  </div>
                  <q-linear-progress :value="materia.porcentaje / 100" :color="materia.color" size="10px" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Estado de Evaluaciones -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Estado de Evaluaciones</div>
              <div v-if="!evaluacionesData.datasets[0].data.length" class="text-center q-pa-md">
                No hay datos disponibles
              </div>
              <div v-else>
                <Doughnut :data="evaluacionesData" :options="doughnutOptions" class="chart-container" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Casos Recientes (Ahora a pantalla completa) -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">Casos Clínicos Recientes</div>
            </q-card-section>
            <q-separator />
            <q-list v-if="!casosRecientes.length">
              <q-item>
                <q-item-section class="text-center">
                  No hay casos recientes disponibles
                </q-item-section>
              </q-item>
            </q-list>
            <q-list v-else>
              <q-item v-for="caso in casosRecientes" :key="caso.id" clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar :color="getDificultadColor(caso.nivel_dificultad)">
                    {{ caso.nivel_dificultad }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ caso.titulo }}</q-item-label>
                  <q-item-label caption>{{ caso.docente_nombre }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="getDificultadColor(caso.nivel_dificultad)">
                    Nivel {{ caso.nivel_dificultad }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { Pie, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default defineComponent({
  name: 'AdminDashboard',

  components: {
    Pie,
    Doughnut
  },

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const error = ref(null);

    // Datos generales del dashboard
    const dashboardData = ref({
      total_usuarios: 0,
      total_docentes: 0,
      total_estudiantes: 0,
      total_casos: 0
    });

    // Casos por dificultad
    const casosPorDificultad = ref([]);

    // Casos por materia
    const casosPorMateria = ref([]);

    // Casos recientes
    const casosRecientes = ref([]);

    // Estado de evaluaciones
    const evaluacionesActivas = ref(0);
    const evaluacionesCompletadas = ref(0);

    // Configuración para el gráfico de pie
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Configuración para el gráfico de dona
    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Datos para el gráfico de usuarios por rol
    const usuariosPorRolData = computed(() => {
      return {
        labels: ['Docentes', 'Estudiantes'],
        datasets: [{
          data: [dashboardData.value.total_docentes, dashboardData.value.total_estudiantes],
          backgroundColor: ['#2196F3', '#4CAF50']
        }]
      };
    });

    // Datos para el gráfico de evaluaciones
    const evaluacionesData = computed(() => {
      return {
        labels: ['Activas', 'Completadas'],
        datasets: [{
          data: [evaluacionesActivas.value, evaluacionesCompletadas.value],
          backgroundColor: ['#FF9800', '#8BC34A']
        }]
      };
    });

    // Función para obtener color según nivel de dificultad
    const getDificultadColor = (nivel) => {
      switch (parseInt(nivel)) {
        case 1: return 'green';
        case 2: return 'amber';
        case 3: return 'deep-orange';
        default: return 'grey';
      }
    };

    // Cargar datos del dashboard
    const loadDashboardData = async () => {
      loading.value = true;
      error.value = null;

      try {
        // 1. Cargar datos básicos del dashboard
        const dashboardResponse = await api.get('/dashboard/admin');
        if (dashboardResponse.data.success) {
          dashboardData.value = dashboardResponse.data.data;
        } else {
          throw new Error(dashboardResponse.data.message || 'Error al cargar datos del dashboard');
        }

        // 2. Cargar casos por dificultad
        try {
          const dificultadResponse = await api.get('/dashboard/casos-por-dificultad');
          if (dificultadResponse.data.success) {
            // Formatear los datos para el gráfico
            const data = dificultadResponse.data.data;
            const totalCasos = dashboardData.value.total_casos;

            casosPorDificultad.value = [
              {
                nivel: 1,
                cantidad: data.nivel1 || 0,
                porcentaje: totalCasos > 0 ? Math.round((data.nivel1 / totalCasos) * 100) : 0,
                color: 'green'
              },
              {
                nivel: 2,
                cantidad: data.nivel2 || 0,
                porcentaje: totalCasos > 0 ? Math.round((data.nivel2 / totalCasos) * 100) : 0,
                color: 'amber'
              },
              {
                nivel: 3,
                cantidad: data.nivel3 || 0,
                porcentaje: totalCasos > 0 ? Math.round((data.nivel3 / totalCasos) * 100) : 0,
                color: 'deep-orange'
              }
            ];
          }
        } catch (e) {
          console.error('Error al cargar casos por dificultad:', e);
          // No fallamos todo el dashboard por un error en una sección
        }

        // 3. Cargar casos por materia
        try {
          const materiasResponse = await api.get('/dashboard/casos-por-materia');
          if (materiasResponse.data.success) {
            const data = materiasResponse.data.data;
            const totalCasos = dashboardData.value.total_casos;

            // Asignar colores a cada materia
            const colores = ['red', 'blue', 'purple', 'teal', 'orange', 'indigo', 'cyan', 'brown', 'pink'];

            casosPorMateria.value = data.map((item, index) => {
              return {
                id: item.materia_id,
                nombre: item.materia_nombre,
                cantidad: item.cantidad,
                porcentaje: totalCasos > 0 ? Math.round((item.cantidad / totalCasos) * 100) : 0,
                color: colores[index % colores.length]
              };
            });
          }
        } catch (e) {
          console.error('Error al cargar casos por materia:', e);
        }

        // 4. Cargar casos recientes
        try {
          const recientesResponse = await api.get('/dashboard/casos/recientes');
          if (recientesResponse.data.success) {
            casosRecientes.value = recientesResponse.data.data.slice(0, 5);
          }
        } catch (e) {
          console.error('Error al cargar casos recientes:', e);
        }

        // 5. Cargar estado de evaluaciones
        try {
          const evaluacionesResponse = await api.get('/dashboard/evaluaciones/estado');
          if (evaluacionesResponse.data.success) {
            const data = evaluacionesResponse.data.data;
            evaluacionesActivas.value = data.activas || 0;
            evaluacionesCompletadas.value = data.completadas || 0;
          }
        } catch (e) {
          console.error('Error al cargar estado de evaluaciones:', e);
        }
      } catch (e) {
        console.error('Error general al cargar el dashboard:', e);
        error.value = e.message || 'Error al cargar datos del dashboard';

        $q.notify({
          type: 'negative',
          message: 'Error al cargar el dashboard: ' + error.value,
          position: 'top',
          timeout: 5000
        });
      } finally {
        loading.value = false;
      }
    };

    // Cargar datos al montar el componente
    onMounted(() => {
      loadDashboardData();
    });

    return {
      loading,
      error,
      dashboardData,
      casosPorDificultad,
      casosPorMateria,
      casosRecientes,
      evaluacionesActivas,
      evaluacionesCompletadas,
      usuariosPorRolData,
      evaluacionesData,
      pieOptions,
      doughnutOptions,
      getDificultadColor,
      loadDashboardData
    };
  }
});
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  height: 240px;
  width: 100%;
  margin: 0 auto;
}

/* Estilos para las barras de progreso */
.q-linear-progress {
  border-radius: 4px;
}
</style>
