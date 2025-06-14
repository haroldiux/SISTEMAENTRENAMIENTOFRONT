<template>
  <div class="dashboard-container">
    <!-- Encabezado del Dashboard -->
    <div class="row q-mb-md items-center">
      <div class="col-12 col-sm-8">
        <h3 class="text-h6 q-mb-sm">Panel Estudiante</h3>
        <div class="row items-center">
          <q-avatar color="primary" text-color="white" size="40px" class="q-mr-sm">
            {{ userInitials }}
          </q-avatar>
          <div>
            <div class="text-subtitle1">{{ userData?.nombres || 'Estudiante' }} {{ userData?.apellido1 || '' }}</div>
            <div class="text-caption text-grey-8">
              <q-icon name="school" size="xs" class="q-mr-xs" />
              {{ currentGestion?.nombre || 'Gestión Actual' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Notificación de evaluación próxima -->
      <div class="col-12 col-sm-4 q-mt-sm q-mt-sm-none" v-if="evaluacionesPendientes.length > 0">
        <q-banner rounded dense class="bg-amber-1 text-amber-9 q-px-md">
          <template v-slot:avatar>
            <q-icon name="warning" color="amber-9" />
          </template>
          <span class="text-weight-medium">Próxima evaluación:</span>
          {{ getDiasRestantes(evaluacionesPendientes[0]?.fecha_fin) }}
        </q-banner>
      </div>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-blue-1">
          <q-card-section class="q-pt-lg">
            <div class="row items-center no-wrap">
              <div class="col-auto">
                <q-icon name="assignment_turned_in" size="3.5rem" color="primary" />
              </div>
              <div class="col q-pl-lg">
                <div class="text-h3 text-primary text-weight-bold">{{ casosResueltos }}</div>
                <div class="text-subtitle1 text-grey-8">Casos Resueltos</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-orange-1">
          <q-card-section class="q-pt-lg">
            <div class="row items-center no-wrap">
              <div class="col-auto">
                <q-icon name="pending_actions" size="3.5rem" color="orange" />
              </div>
              <div class="col q-pl-lg">
                <div class="text-h3 text-orange text-weight-bold">{{ evaluacionesPendientes.length }}</div>
                <div class="text-subtitle1 text-grey-8">Evaluaciones Pendientes</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-green-1">
          <q-card-section class="q-pt-lg">
            <div class="row items-center no-wrap">
              <div class="col-auto">
                <q-icon name="analytics" size="3.5rem" color="positive" />
              </div>
              <div class="col q-pl-lg">
                <div class="text-h3 text-positive text-weight-bold">{{ promedioGeneral }}</div>
                <div class="text-subtitle1 text-grey-8">Promedio General</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 flex items-center">
              <q-icon name="bar_chart" color="primary" size="sm" class="q-mr-xs" />
              Mis Calificaciones
            </div>
            <div class="chart-wrapper">
              <Bar :data="misCalificacionesData" :options="barOptions" class="chart-container"
                v-if="misCalificacionesData" />
              <div v-else class="text-center q-py-md text-grey-7">
                <q-spinner color="primary" size="2rem" class="q-mb-md" v-if="loading" />
                <div v-else>No hay datos disponibles</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 flex items-center">
              <q-icon name="pie_chart" color="primary" size="sm" class="q-mr-xs" />
              Progreso por Área
            </div>
            <div class="chart-wrapper">
              <Pie :data="progresoAreasData" :options="pieOptions" class="chart-container" v-if="progresoAreasData" />
              <div v-else class="text-center q-py-md text-grey-7">
                <q-spinner color="primary" size="2rem" class="q-mb-md" v-if="loading" />
                <div v-else>No hay datos disponibles</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Contenido principal en dos columnas -->
    <div class="row q-col-gutter-md">
      <!-- Columna izquierda -->
      <div class="col-12 col-lg-8">
        <!-- Próxima evaluación -->
        <q-card v-if="evaluacionesPendientes.length > 0" class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-subtitle1">
              <q-icon name="priority_high" class="q-mr-xs" />
              Próxima Evaluación
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-h6 q-mb-xs">{{ evaluacionesPendientes[0].titulo }}</div>
            <div class="row items-center q-gutter-x-md q-mb-sm">
              <q-chip size="sm" outline color="primary">
                {{ getMateriaById(evaluacionesPendientes[0].materia_id) }}
              </q-chip>
              <q-chip size="sm" outline :color="getDificultadColor(evaluacionesPendientes[0].filtro_nivel_dificultad)">
                Dificultad: {{ evaluacionesPendientes[0].filtro_nivel_dificultad || 1 }}/5
              </q-chip>
            </div>
            <div class="row justify-between items-center q-mt-md">
              <div>
                <div class="text-caption text-grey-8">Fecha límite:</div>
                <div class="text-subtitle2 text-weight-medium">
                  {{ formatDateTime(evaluacionesPendientes[0].fecha_fin) }}
                </div>
              </div>
              <q-btn color="primary" unelevated label="Iniciar ahora" icon-right="play_arrow"
                @click="iniciarEvaluacion(evaluacionesPendientes[0].id)" />
            </div>
          </q-card-section>
        </q-card>

        <!-- Historial de Casos -->
        <q-card>
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 flex items-center">
              <q-icon name="history" color="primary" size="sm" class="q-mr-xs" />
              Historial de Casos
            </div>
          </q-card-section>

          <q-separator inset class="q-mt-sm" />

          <q-card-section>
            <q-table :rows="historialCasos" :columns="columnasHistorial" row-key="id" flat dense
              :pagination="{ rowsPerPage: 5 }" :loading="loading" binary-state-sort>
              <template v-slot:body="props">
                <q-tr :props="props" class="cursor-pointer" @click="verCaso(props.row.id)">
                  <q-td key="titulo" :props="props">
                    {{ props.row.titulo }}
                  </q-td>
                  <q-td key="materia" :props="props">
                    {{ getMateriaById(props.row.materia_id) }}
                  </q-td>
                  <q-td key="fecha_resolucion" :props="props">
                    {{ formatDate(props.row.fecha_resolucion) }}
                  </q-td>
                  <q-td key="puntaje" :props="props">
                    <q-chip dense :color="getCalificacionColor(props.row.puntaje)" text-color="white">
                      {{ props.row.puntaje }}
                    </q-chip>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm q-pa-md">
                  <q-icon name="history" size="2rem" color="grey-5" />
                  <span class="text-grey-5">No hay casos resueltos</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna derecha -->
      <div class="col-12 col-lg-4">
        <!-- Todas las evaluaciones pendientes -->
        <q-card class="q-mb-md">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 flex items-center">
              <q-icon name="event" color="primary" size="sm" class="q-mr-xs" />
              Evaluaciones Pendientes
            </div>
          </q-card-section>

          <q-separator inset class="q-mt-sm" />

          <q-card-section class="q-py-none">
            <q-list separator>
              <q-item v-for="evaluacion in evaluacionesPendientes" :key="evaluacion.id" clickable v-ripple
                @click="iniciarEvaluacion(evaluacion.id)">
                <q-item-section>
                  <q-item-label>{{ evaluacion.titulo }}</q-item-label>
                  <q-item-label caption>
                    <div class="row items-center">
                      <q-icon name="event" size="xs" class="q-mr-xs" />
                      Límite: {{ formatDate(evaluacion.fecha_fin) }}
                    </div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip outline dense :color="getUrgenciaColor(evaluacion.fecha_fin)">
                    {{ getDiasRestantes(evaluacion.fecha_fin) }}
                  </q-chip>
                </q-item-section>
              </q-item>

              <q-item v-if="evaluacionesPendientes.length === 0">
                <q-item-section>
                  <div class="text-center q-py-md text-grey-7">
                    <q-icon name="check_circle" size="3rem" color="positive" />
                    <div class="q-mt-sm">No tienes evaluaciones pendientes</div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Progreso por materia -->
        <q-card v-if="progresoMaterias.length > 0">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 flex items-center">
              <q-icon name="leaderboard" color="primary" size="sm" class="q-mr-xs" />
              Progreso por Materias
            </div>
          </q-card-section>

          <q-separator inset class="q-mt-sm" />

          <q-card-section>
            <div class="q-gutter-y-md">
              <div v-for="materia in progresoMaterias" :key="materia.id">
                <div class="row justify-between q-mb-xs">
                  <div class="text-subtitle2">{{ materia.nombre }}</div>
                  <div class="text-subtitle2 text-weight-medium">{{ materia.promedio }}%</div>
                </div>
                <q-linear-progress :value="materia.promedio / 100" :color="getColorByIndex(materia.id)" size="md"
                  rounded />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pie de página fijo -->
    <div class="footer q-mt-xl">
      <div class="text-caption">© 2025 Sistema de Aprendizaje Médico</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'vue-chartjs';
import { useDashboard } from 'src/composables/useDashboard';
import { date } from 'quasar';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const router = useRouter();

// Datos del dashboard
const {
  loading,
  error,
  data,
  fetchDashboard
} = useDashboard("ESTUDIANTE");

// Estados reactivos
const casosResueltos = ref(0);
const promedioGeneral = ref(0);
const evaluacionesPendientes = ref([]);
const historialCasos = ref([]);
const misCalificacionesData = ref(null);
const progresoAreasData = ref(null);
const progresoMaterias = ref([]);
const materias = ref([]);
const casos = ref([]);
const userData = ref(null);
const userInitials = computed(() => {
  if (!userData.value) return 'E';
  return `${userData.value.nombres?.charAt(0) || ''}${userData.value.apellido1?.charAt(0) || ''}`;
});

const currentGestion = ref(null);

// Columnas para la tabla de historial
const columnasHistorial = [
  { name: 'titulo', align: 'left', label: 'Caso', field: 'titulo' },
  { name: 'materia', align: 'left', label: 'Materia', field: row => getMateriaById(row.materia_id) },
  { name: 'fecha_resolucion', align: 'center', label: 'Fecha', field: 'fecha_resolucion', sortable: true },
  { name: 'puntaje', align: 'center', label: 'Puntaje', field: 'puntaje', sortable: true }
];

// Configuración de gráficos
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 15,
        padding: 15,
        font: {
          size: 12,
          weight: 'bold'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      padding: 10,
      cornerRadius: 4,
      callbacks: {
        label: function (context) {
          return `${context.label}: ${context.parsed}%`;
        }
      }
    }
  },
  cutout: '60%',  // Hace un donut chart en lugar de pie chart
  animation: {
    animateScale: true,
    animateRotate: true
  }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      padding: 10,
      cornerRadius: 4,
      callbacks: {
        label: function (context) {
          return `Puntaje: ${context.parsed.y}/100`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        drawBorder: false,
        color: 'rgba(200, 200, 200, 0.2)'
      },
      ticks: {
        stepSize: 20,
        font: {
          size: 11
        },
        padding: 8
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 10
        },
        maxRotation: 45,
        minRotation: 45
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 6,
      borderWidth: 0
    }
  },
  layout: {
    padding: {
      top: 10,
      bottom: 0
    }
  }
};

// Observador para actualizar datos
watch(data, (newData) => {
  if (newData) {
    // Estadísticas generales
    if (newData.estadisticas_generales) {
      casosResueltos.value = newData.estadisticas_generales.casos_resueltos || 0;
      promedioGeneral.value = newData.estadisticas_generales.promedio_general || 0;
    }

    // Evaluaciones pendientes
    evaluacionesPendientes.value = newData.evaluaciones_pendientes || [];

    // Historial de casos
    historialCasos.value = newData.historial_casos || [];

    // Información del usuario
    userData.value = newData.datos_usuario || null;

    // Gestión actual
    currentGestion.value = newData.gestion_actual || null;

    // Datos para gráficos
    if (newData.mis_calificaciones && newData.mis_calificaciones.length > 0) {
      // Limitar a máximo 4 elementos para evitar sobrecarga visual y desconfiguraciones
      const limitedData = newData.mis_calificaciones.slice(0, 4);

      misCalificacionesData.value = {
        labels: limitedData.map(item => {
          // Acortar los nombres largos para evitar problemas de espacio
          const caso = item.caso || '';
          return caso.length > 15 ? caso.substring(0, 15) + '...' : caso;
        }),
        datasets: [{
          label: 'Puntaje',
          data: limitedData.map(item => item.puntaje),
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          hoverBackgroundColor: 'rgba(33, 150, 243, 1)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 0
        }]
      };
    }

    if (newData.progreso_areas && newData.progreso_areas.length > 0) {
      const colorPalette = [
        'rgba(76, 175, 80, 0.8)',  // Verde
        'rgba(255, 193, 7, 0.8)',  // Amarillo
        'rgba(33, 150, 243, 0.8)',  // Azul
        'rgba(156, 39, 176, 0.8)',  // Púrpura
        'rgba(255, 87, 34, 0.8)',   // Naranja
        'rgba(96, 125, 139, 0.8)'   // Gris azulado
      ];

      // Limitar la cantidad de áreas para evitar sobrecarga
      const limitedAreas = newData.progreso_areas.slice(0, 4);

      progresoAreasData.value = {
        labels: limitedAreas.map(item => {
          const materia = item.materia || '';
          return materia.length > 15 ? materia.substring(0, 15) + '...' : materia;
        }),
        datasets: [{
          data: limitedAreas.map(item => item.promedio),
          backgroundColor: colorPalette.slice(0, limitedAreas.length),
          hoverBackgroundColor: colorPalette.map(color => color.replace('0.8', '1')).slice(0, limitedAreas.length),
          borderColor: 'white',
          borderWidth: 2
        }]
      };
    }

    // Materias y progreso
    if (newData.materias) {
      materias.value = newData.materias;

      if (newData.progreso_materias) {
        progresoMaterias.value = newData.progreso_materias;
      }
    }

    // Casos
    if (newData.casos) {
      casos.value = newData.casos;
    }
  }
});

// Iniciar la carga de datos
onMounted(() => {
  fetchDashboard();
});

// Funciones de utilidad
function getCalificacionColor(puntaje) {
  if (puntaje >= 90) return 'positive';
  if (puntaje >= 80) return 'primary';
  if (puntaje >= 70) return 'warning';
  return 'negative';
}

function getDificultadColor(nivel) {
  const niveles = ['blue', 'teal', 'green', 'orange', 'red'];
  return niveles[Math.min(nivel - 1, 4)] || 'blue';
}

function getUrgenciaColor(fechaLimite) {
  const diasRestantes = calcularDiasRestantes(fechaLimite);
  if (diasRestantes <= 1) return 'negative';
  if (diasRestantes <= 3) return 'warning';
  return 'primary';
}

function getDiasRestantes(fechaLimite) {
  const diasRestantes = calcularDiasRestantes(fechaLimite);
  if (diasRestantes === 0) return 'Hoy';
  if (diasRestantes === 1) return 'Mañana';
  return `En ${diasRestantes} días`;
}

function calcularDiasRestantes(fechaLimite) {
  if (!fechaLimite) return 0;

  const hoy = new Date();
  const limite = new Date(fechaLimite);
  const diferenciaMs = limite - hoy;
  return Math.max(0, Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)));
}

function formatDate(dateString) {
  if (!dateString) return '';
  return date.formatDate(new Date(dateString), 'DD/MM/YYYY');
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  return date.formatDate(new Date(dateString), 'DD/MM/YYYY HH:mm');
}

function getColorByIndex(index) {
  const colors = ['primary', 'green', 'orange', 'purple', 'teal', 'red'];
  return colors[index % colors.length];
}

function getMateriaById(id) {
  const materia = materias.value.find(m => m.id === id);
  return materia ? materia.nombre : 'Sin materia';
}

function getCasoById(id) {
  return casos.value.find(c => c.id === id);
}

// Funciones de navegación
function iniciarEvaluacion(id) {
  router.push({ name: 'estudiante-evaluacion', params: { id } });
}

function verCaso(id) {
  router.push({ name: 'estudiante-caso', params: { id } });
}
</script>

<style scoped>
/* Contenedor principal con altura fija */
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

.stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Mejorar los contenedores de los gráficos */
.chart-card {
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08) !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Estilos para las tarjetas */
.q-card {
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
}

/* Mejora los estilos de las tablas */
.q-table__container {
  border-radius: 8px;
}

.q-table thead tr {
  background: #f5f5f5;
}

.q-table tbody tr:hover {
  background: rgba(33, 150, 243, 0.05);
}

/* Mejora el estilo de los indicadores de progreso */
.q-linear-progress {
  height: 10px !important;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

/* Estilos específicos para los chips */
.q-chip {
  font-weight: 500;
}

/* Estilos para el pie de página */
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 30px;
  padding: 16px 0;
  text-align: center;
  width: 100%;
}

/* Animación sutil para los iconos */
.q-icon {
  transition: transform 0.2s ease;
}

.q-card:hover .q-icon {
  transform: scale(1.1);
}

/* Mejora para dispositivos móviles */
@media (max-width: 599px) {
  .chart-wrapper {
    height: 160px;
  }

  .q-table th,
  .q-table td {
    padding: 8px 4px;
  }

  .footer {
    margin-top: 20px;
    padding: 12px 0;
  }
}
</style>
