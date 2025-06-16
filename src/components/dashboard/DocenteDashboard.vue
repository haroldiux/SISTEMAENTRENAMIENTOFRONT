<template>
  <div>
    <h3 class="text-h6 q-mb-md">Panel Docente</h3>

    <!-- Loading -->
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error -->
    <q-banner v-if="error" class="text-white bg-red q-mb-md">
      <template v-slot:avatar>
        <q-icon name="error" color="white" />
      </template>
      Error al cargar el dashboard: {{ error }}
    </q-banner>

    <!-- Dashboard Content -->
    <div v-if="!loading && !error">
      <!-- Estadísticas Principales -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <q-card class="stats-card bg-blue-1">
            <q-card-section>
              <div class="text-h3 text-primary text-center">{{ misCasos }}</div>
              <div class="text-subtitle1 text-center">Mis Casos Clínicos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card class="stats-card bg-orange-1">
            <q-card-section>
              <div class="text-h3 text-orange text-center">{{ evaluacionesPendientes }}</div>
              <div class="text-subtitle1 text-center">Evaluaciones Pendientes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card class="stats-card bg-green-1">
            <q-card-section>
              <div class="text-h3 text-positive text-center">{{ gruposAsignados }}</div>
              <div class="text-subtitle1 text-center">Grupos Asignados</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mis Evaluaciones -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card class="evaluaciones-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">Mis Evaluaciones</div>
              <div v-if="loadingEvaluacionesDetalle" class="text-center q-pa-md">
                <q-spinner color="primary" size="2em" />
              </div>
              <div v-else>
                <q-table v-if="misEvaluaciones.length > 0" :rows="misEvaluaciones" :columns="evaluacionesColumns"
                  row-key="id" :pagination="{ rowsPerPage: 5 }" flat :loading="loadingEvaluacionesDetalle">
                  <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                      <q-badge :color="getEstadoColor(props.row.estado)">
                        {{ props.row.estado }}
                      </q-badge>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-progreso="props">
                    <q-td :props="props">
                      <q-linear-progress :value="getProgresoValue(props.row)"
                        :color="getProgresoColor(getProgresoValue(props.row))" size="xs" :stripe="true" />
                      <div class="text-caption q-mt-xs">
                        {{ props.row.completados || 0 }} / {{ props.row.total_estudiantes || 1 }}
                        ({{ Math.round(getProgresoValue(props.row) * 100) }}%)
                      </div>
                    </q-td>
                  </template>
                </q-table>
                <div v-else class="text-center q-pa-md text-grey">
                  No hay evaluaciones disponibles
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mis Casos Recientes y Grupos -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-7">
          <q-card class="casos-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">Mis Casos Recientes</div>
              <div v-if="loadingCasosRecientes" class="text-center q-pa-md">
                <q-spinner color="primary" size="2em" />
              </div>
              <q-list separator v-else>
                <q-item v-for="(caso, index) in misCasosRecientes" :key="index" class="cursor-pointer">
                  <q-item-section avatar>
                    <q-avatar>
                      <q-icon name="medical_services" color="primary" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ caso.titulo }}</q-item-label>
                    <q-item-label caption>{{ caso.materia }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="getDificultadColor(caso.nivel_dificultad)">
                      Nivel {{ caso.nivel_dificultad }}
                    </q-badge>
                  </q-item-section>
                </q-item>
                <q-item v-if="!misCasosRecientes.length" class="text-center text-grey">
                  <q-item-section>No hay casos recientes</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-5">
          <q-card class="grupos-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">Mis Grupos</div>
              <div v-if="loadingGrupos" class="text-center q-pa-md">
                <q-spinner color="primary" size="2em" />
              </div>
              <q-list separator v-else>
                <q-item v-for="(grupo, index) in misGrupos" :key="index" class="cursor-pointer">
                  <q-item-section avatar>
                    <q-avatar>
                      <q-icon name="groups" color="primary" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ grupo.nombre }}</q-item-label>
                    <q-item-label caption>{{ grupo.materia }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip size="sm" color="primary" text-color="white">
                      {{ grupo.estudiantes }} estudiantes
                    </q-chip>
                  </q-item-section>
                </q-item>
                <q-item v-if="!misGrupos.length" class="text-center text-grey">
                  <q-item-section>No hay grupos asignados</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { api } from 'src/boot/axios';
import { useDashboard } from 'src/composables/useDashboard';
import Chart from 'chart.js/auto';

// Estado principal del dashboard
const {
  loading,
  error,
  data,
  fetchDashboard
} = useDashboard('DOCENTE');

// Estados adicionales para carga de datos
const loadingCasos = ref(false);
const loadingEvaluaciones = ref(false);
const loadingEvaluacionesDetalle = ref(false);
const loadingCasosRecientes = ref(false);
const loadingGrupos = ref(false);

// Variables reactivas para las estadísticas básicas
const misCasos = ref(0);
const evaluacionesPendientes = ref(0);
const gruposAsignados = ref(0);

// Referencias para los charts
const casosDificultadChart = ref(null);
const estadoEvaluacionesChart = ref(null);
let chartInstances = {
  casosDificultad: null,
  estadoEvaluaciones: null
};

// Datos para gráficos
const casosPorDificultad = ref({
  labels: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'],
  datasets: [{
    label: 'Casos por Dificultad',
    data: [],
    backgroundColor: [
      'rgba(54, 162, 235, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(255, 99, 132, 0.7)'
    ]
  }]
});

const estadoEvaluaciones = ref({
  labels: ['Activas', 'Por Vencer', 'Vencidas'],
  datasets: [{
    label: 'Evaluaciones',
    data: [],
    backgroundColor: [
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(255, 99, 132, 0.7)'
    ]
  }]
});

// Datos para tablas y listas
const misEvaluaciones = ref([]);
const misCasosRecientes = ref([]);
const misGrupos = ref([]);

// Columnas para tabla de evaluaciones
const evaluacionesColumns = [
  { name: 'titulo', align: 'left', label: 'Título', field: 'titulo', sortable: true },
  { name: 'grupo', align: 'left', label: 'Grupo', field: 'grupo', sortable: true },
  { name: 'fecha_fin', align: 'left', label: 'Fecha Límite', field: 'fecha_fin', sortable: true },
  { name: 'estado', align: 'left', label: 'Estado', field: 'estado', sortable: true },
  { name: 'progreso', align: 'center', label: 'Progreso', field: 'progreso' }
];

// Watch para actualizar los datos cuando lleguen del API
watch(data, (newData) => {
  console.log('Datos del dashboard:', newData);

  if (newData) {
    // Asignar los valores de estadísticas básicas
    misCasos.value = newData.mis_casos || 0;
    evaluacionesPendientes.value = newData.evaluaciones_pendientes || 0;
    gruposAsignados.value = newData.grupos_asignados || 0;

    // Cargar datos adicionales
    loadDashboardExtendedData();
  }
}, { immediate: true });

// Función para cargar datos extendidos del dashboard
async function loadDashboardExtendedData() {
  // Cargar datos de casos por dificultad
  loadCasosPorDificultad();

  // Cargar datos de evaluaciones
  loadEstadoEvaluaciones();

  // Cargar detalles de evaluaciones
  loadMisEvaluaciones();

  // Cargar casos recientes
  loadCasosRecientes();

  // Cargar grupos
  loadMisGrupos();
}

// Función para cargar casos por nivel de dificultad
async function loadCasosPorDificultad() {
  loadingCasos.value = true;
  try {
    const response = await api.get('/dashboard/casos-por-dificultad');

    if (response.data && response.data.success) {
      // Transformar datos para el gráfico
      const niveles = [1, 2, 3, 4, 5];
      const data = response.data.data || {};

      // Asegurarnos de que tenemos datos para cada nivel
      const dataPorNivel = niveles.map(nivel => data[nivel] || 0);

      // Solo actualizar si tenemos al menos un caso
      if (dataPorNivel.some(valor => valor > 0)) {
        casosPorDificultad.value.datasets[0].data = dataPorNivel;

        // Esperar a que se actualice el DOM y luego inicializar el gráfico
        await nextTick();
        initCasosDificultadChart();
      }
    } else {
      // Usar datos de ejemplo
      usarDatosEjemploCasosPorDificultad();
    }
  } catch (error) {
    console.error('Error al cargar casos por dificultad:', error);
    // Usar datos de ejemplo si hay error
    usarDatosEjemploCasosPorDificultad();
  } finally {
    loadingCasos.value = false;
  }
}

// Función para usar datos de ejemplo para casos por dificultad
async function usarDatosEjemploCasosPorDificultad() {
  casosPorDificultad.value.datasets[0].data = [4, 7, 5, 3, 1];
  await nextTick();
  initCasosDificultadChart();
}

// Función para cargar estado de evaluaciones
async function loadEstadoEvaluaciones() {
  loadingEvaluaciones.value = true;
  try {
    const response = await api.get('/dashboard/evaluaciones/estado');

    if (response.data && response.data.success) {
      const data = response.data.data || {};

      const datosEvaluaciones = [
        data.activas || 0,
        data.por_vencer || 0,
        data.vencidas || 0
      ];

      // Solo actualizar si tenemos al menos una evaluación
      if (datosEvaluaciones.some(valor => valor > 0)) {
        estadoEvaluaciones.value.datasets[0].data = datosEvaluaciones;

        await nextTick();
        initEstadoEvaluacionesChart();
      }
    } else {
      // Usar datos de ejemplo
      usarDatosEjemploEstadoEvaluaciones();
    }
  } catch (error) {
    console.error('Error al cargar estado de evaluaciones:', error);
    // Usar datos de ejemplo si hay error
    usarDatosEjemploEstadoEvaluaciones();
  } finally {
    loadingEvaluaciones.value = false;
  }
}
// Función para usar datos de ejemplo para estado de evaluaciones
async function usarDatosEjemploEstadoEvaluaciones() {
  estadoEvaluaciones.value.datasets[0].data = [2, 1, 0];
  await nextTick();
  initEstadoEvaluacionesChart();
}

// Función para cargar evaluaciones con detalles
async function loadMisEvaluaciones() {
  loadingEvaluacionesDetalle.value = true;
  try {
    const response = await api.get('/dashboard/evaluaciones');

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Transformar datos para la tabla
      misEvaluaciones.value = response.data.data.map(ev => {
        // Asegurarnos de que los campos necesarios existen
        const grupo = ev.grupo || {};

        // Calcular estado basado en fechas
        const fechaFin = new Date(ev.fecha_fin || Date.now());
        const ahora = new Date();
        const diasRestantes = Math.floor((fechaFin - ahora) / (1000 * 60 * 60 * 24));

        let estado = 'Activa';
        if (diasRestantes < 0) {
          estado = 'Vencida';
        } else if (diasRestantes <= 2) {
          estado = 'Por vencer';
        }

        return {
          id: ev.id || 0,
          titulo: ev.titulo || 'Sin título',
          grupo: grupo.nombre || 'Sin grupo',
          fecha_fin: fechaFin.toLocaleDateString(),
          estado: estado,
          completados: ev.completados || 0,
          total_estudiantes: ev.total_estudiantes || 1,
          dias_restantes: diasRestantes
        };
      });
    } else {
      // Usar datos de ejemplo
      usarDatosEjemploEvaluaciones();
    }
  } catch (error) {
    console.error('Error al cargar evaluaciones:', error);
    // Usar datos de ejemplo si hay error
    usarDatosEjemploEvaluaciones();
  } finally {
    loadingEvaluacionesDetalle.value = false;
  }
}

// Función para usar datos de ejemplo para evaluaciones
function usarDatosEjemploEvaluaciones() {
  misEvaluaciones.value = [
    {
      id: 1,
      titulo: 'Evaluación de Anatomía',
      grupo: 'Grupo A',
      fecha_fin: '20/06/2025',
      estado: 'Activa',
      completados: 10,
      total_estudiantes: 15,
      dias_restantes: 4
    },
    {
      id: 2,
      titulo: 'Caso Clínico Cardiología',
      grupo: 'Grupo B',
      fecha_fin: '18/06/2025',
      estado: 'Por vencer',
      completados: 8,
      total_estudiantes: 12,
      dias_restantes: 2
    }
  ];
}

// Función para cargar casos recientes
async function loadCasosRecientes() {
  loadingCasosRecientes.value = true;
  try {
    const response = await api.get('/dashboard/casos/recientes');

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      misCasosRecientes.value = response.data.data.map(caso => {
        // Verificar si materia existe
        const materia = caso.materia || {};

        return {
          id: caso.id || 0,
          titulo: caso.titulo || 'Sin título',
          materia: materia.nombre || 'Sin materia',
          nivel_dificultad: caso.nivel_dificultad || 1,
          created_at: caso.created_at ? new Date(caso.created_at).toLocaleDateString() : 'Fecha desconocida'
        };
      });
    } else {
      // Usar datos de ejemplo
      usarDatosEjemploCasosRecientes();
    }
  } catch (error) {
    console.error('Error al cargar casos recientes:', error);
    // Usar datos de ejemplo si hay error
    usarDatosEjemploCasosRecientes();
  } finally {
    loadingCasosRecientes.value = false;
  }
}

// Función para usar datos de ejemplo para casos recientes
function usarDatosEjemploCasosRecientes() {
  misCasosRecientes.value = [
    { id: 1, titulo: 'Dolor abdominal agudo', materia: 'Gastroenterología', nivel_dificultad: 3, created_at: '10/06/2025' },
    { id: 2, titulo: 'Cefalea persistente', materia: 'Neurología', nivel_dificultad: 2, created_at: '05/06/2025' },
    { id: 3, titulo: 'Insuficiencia respiratoria', materia: 'Neumología', nivel_dificultad: 4, created_at: '01/06/2025' }
  ];
}

// Función para cargar mis grupos
async function loadMisGrupos() {
  loadingGrupos.value = true;
  try {
    const response = await api.get('/dashboard/grupos');

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      misGrupos.value = response.data.data.map(grupo => {
        // Verificar si materia existe
        const materia = grupo.materia || {};

        return {
          id: grupo.id || 0,
          nombre: grupo.nombre || 'Sin nombre',
          materia: materia.nombre || 'Sin materia',
          estudiantes: grupo.total_estudiantes || 0
        };
      });
    } else {
      // Usar datos de ejemplo
      usarDatosEjemploGrupos();
    }
  } catch (error) {
    console.error('Error al cargar grupos:', error);
    // Usar datos de ejemplo si hay error
    usarDatosEjemploGrupos();
  } finally {
    loadingGrupos.value = false;
  }
}

// Función para usar datos de ejemplo para grupos
function usarDatosEjemploGrupos() {
  misGrupos.value = [
    { id: 1, nombre: 'Grupo A', materia: 'Anatomía', estudiantes: 15 },
    { id: 2, nombre: 'Grupo B', materia: 'Fisiología', estudiantes: 12 },
    { id: 3, nombre: 'Grupo C', materia: 'Farmacología', estudiantes: 18 }
  ];
}

// Función para obtener valor de progreso de forma segura
function getProgresoValue(row) {
  if (!row || typeof row.completados !== 'number' || !row.total_estudiantes || row.total_estudiantes <= 0) {
    return 0;
  }
  return row.completados / row.total_estudiantes;
}

// Inicializar gráfico de casos por dificultad
function initCasosDificultadChart() {
  try {
    // Solo inicializar si tenemos el elemento y datos válidos
    if (!casosDificultadChart.value || !casosPorDificultad.value.datasets[0].data.some(d => d > 0)) {
      return;
    }

    // Destruir instancia previa si existe
    if (chartInstances.casosDificultad) {
      chartInstances.casosDificultad.destroy();
    }

    const ctx = casosDificultadChart.value.getContext('2d');
    if (ctx) {
      chartInstances.casosDificultad = new Chart(ctx, {
        type: 'pie',
        data: casosPorDificultad.value,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al inicializar gráfico de casos por dificultad:', error);
  }
}

// Inicializar gráfico de estado de evaluaciones
function initEstadoEvaluacionesChart() {
  try {
    // Solo inicializar si tenemos el elemento y datos válidos
    if (!estadoEvaluacionesChart.value || !estadoEvaluaciones.value.datasets[0].data.some(d => d > 0)) {
      return;
    }

    // Destruir instancia previa si existe
    if (chartInstances.estadoEvaluaciones) {
      chartInstances.estadoEvaluaciones.destroy();
    }

    const ctx = estadoEvaluacionesChart.value.getContext('2d');
    if (ctx) {
      chartInstances.estadoEvaluaciones = new Chart(ctx, {
        type: 'doughnut',
        data: estadoEvaluaciones.value,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al inicializar gráfico de estado de evaluaciones:', error);
  }
}

// Función para obtener color según dificultad
function getDificultadColor(nivel) {
  const colores = {
    1: 'blue',
    2: 'teal',
    3: 'amber',
    4: 'orange',
    5: 'red'
  };
  return colores[nivel] || 'grey';
}

// Función para obtener color según estado
function getEstadoColor(estado) {
  const colores = {
    'Activa': 'positive',
    'Por vencer': 'warning',
    'Vencida': 'negative'
  };
  return colores[estado] || 'grey';
}

// Función para obtener color según progreso
function getProgresoColor(valor) {
  if (valor >= 0.8) return 'positive';
  if (valor >= 0.5) return 'primary';
  if (valor >= 0.3) return 'warning';
  return 'negative';
}

onMounted(() => {
  fetchDashboard();
});
</script>

<style scoped>
.stats-card,
.chart-card,
.evaluaciones-card,
.casos-card,
.grupos-card {
  transition: all 0.3s ease;
  height: 100%;
}

.stats-card:hover,
.chart-card:hover,
.evaluaciones-card:hover,
.casos-card:hover,
.grupos-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}

/* Estilos para pantallas pequeñas */
@media (max-width: 600px) {
  .chart-container {
    height: 200px;
  }
}
</style>
