<template>
  <div>
    <h3 class="text-h6 q-mb-md">Panel Estudiante</h3>

    <!-- Estadísticas del Estudiante -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-blue-1">
          <q-card-section>
            <div class="text-h3 text-primary text-center">{{ casosResueltos }}</div>
            <div class="text-subtitle1 text-center">Casos Resueltos</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-orange-1">
          <q-card-section>
            <div class="text-h3 text-orange text-center">{{ evaluacionesPendientes.length }}</div>
            <div class="text-subtitle1 text-center">Evaluaciones Pendientes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="stats-card bg-green-1">
          <q-card-section>
            <div class="text-h3 text-positive text-center">{{ promedioGeneral }}</div>
            <div class="text-subtitle1 text-center">Promedio General</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Mis Calificaciones</div>
            <Bar :data="misCalificacionesData" :options="barOptions" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Progreso por Área</div>
            <Pie :data="progresoAreasData" :options="pieOptions" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Próximas Evaluaciones -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1">Próximas Evaluaciones</div>
        <q-list bordered separator>
          <q-item v-for="evaluacion in evaluacionesPendientes" :key="evaluacion.id" clickable
            @click="iniciarEvaluacion(evaluacion.id)">
            <q-item-section>
              <q-item-label>{{ evaluacion.titulo }}</q-item-label>
              <q-item-label caption>Fecha límite: {{ evaluacion.fechaLimite }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="primary" flat dense label="Iniciar" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Historial de Casos -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1">Historial de Casos</div>
        <q-list bordered separator>
          <q-item v-for="caso in historialCasos" :key="caso.id" clickable @click="verCaso(caso.id)">
            <q-item-section>
              <q-item-label>{{ caso.titulo }}</q-item-label>
              <q-item-label caption>Completado: {{ caso.fechaCompletado }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip :color="getCalificacionColor(caso.calificacion)" text-color="white">
                {{ caso.calificacion }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Botón de Acción -->
    <div class="q-mt-lg">
      <q-btn color="primary" class="full-width" icon="play_arrow" label="Iniciar Nueva Evaluación"
        @click="iniciarNuevaEvaluacion" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bar, Pie } from 'vue-chartjs';
import { useDashboard } from 'src/composables/useDashboard';

const router = useRouter();

const {
  loading,
  error,
  data,
  fetchDashboard
} = useDashboard();

const casosResueltos = ref(0);
const promedioGeneral = ref(0);
const evaluacionesPendientes = ref([]);
const historialCasos = ref([]);
const misCalificacionesData = ref(null);
const progresoAreasData = ref(null);

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
  if (newData && newData.estadisticas_generales) {
    casosResueltos.value = newData.estadisticas_generales.casos_resueltos || 0;
    promedioGeneral.value = newData.estadisticas_generales.promedio_general || 0;
    evaluacionesPendientes.value = newData.evaluaciones_pendientes || [];
    historialCasos.value = newData.historial_casos || [];

    misCalificacionesData.value = {
      labels: newData.mis_calificaciones.map(item => item.caso),
      datasets: [{
        label: 'Calificación',
        data: newData.mis_calificaciones.map(item => item.calificacion),
        backgroundColor: '#2196F3'
      }]
    };

    progresoAreasData.value = {
      labels: newData.progreso_areas.map(item => item.materia),
      datasets: [{
        data: newData.progreso_areas.map(item => item.promedio),
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0']
      }]
    };
  }
});

onMounted(() => {
  fetchDashboard();
});

function getCalificacionColor(calificacion) {
  if (calificacion >= 90) return 'positive';
  if (calificacion >= 80) return 'primary';
  if (calificacion >= 70) return 'warning';
  return 'negative';
}

// Funciones de navegación
function iniciarEvaluacion(id) {
  router.push({ name: 'estudiante-evaluacion', params: { id } });
}

function verCaso(id) {
  router.push({ name: 'estudiante-caso', params: { id } });
}

function iniciarNuevaEvaluacion() {
  router.push({ name: 'estudiante-nueva-evaluacion' });
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
