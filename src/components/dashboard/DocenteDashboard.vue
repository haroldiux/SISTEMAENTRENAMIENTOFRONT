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
      <!-- Estadísticas del Docente -->
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

      <!-- Gráficos (Comentados hasta tener datos adicionales) -->
      <!--
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1">Rendimiento de Estudiantes</div>
              <Pie v-if="distribucionNotasData && distribucionNotasData.labels.length" :data="distribucionNotasData"
                :options="pieOptions" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1">Estado de Mis Casos</div>
              <Bar v-if="casosPorEstadoData && casosPorEstadoData.labels.length" :data="casosPorEstadoData"
                :options="barOptions" />
            </q-card-section>
          </q-card>
        </div>
      </div>
      -->

      <!-- Resumen de actividad reciente -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">Resumen de Actividad</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <q-icon name="school" size="2em" color="primary" />
                      <div class="text-h6 q-mt-sm">{{ misCasos }}</div>
                      <div class="text-caption">Casos creados</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <q-icon name="assignment" size="2em" color="orange" />
                      <div class="text-h6 q-mt-sm">{{ evaluacionesPendientes }}</div>
                      <div class="text-caption">Por calificar</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <q-icon name="groups" size="2em" color="positive" />
                      <div class="text-h6 q-mt-sm">{{ gruposAsignados }}</div>
                      <div class="text-caption">Grupos activos</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-btn color="primary" class="full-width" icon="add_circle" label="Crear Caso Clínico" @click="crearNuevoCaso"
            unelevated />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-btn color="secondary" class="full-width" icon="assignment" label="Crear Evaluación"
            @click="crearNuevaEvaluacion" unelevated />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-btn color="info" class="full-width" icon="group" label="Ver Mis Grupos" @click="verMisGrupos" unelevated />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-btn color="warning" class="full-width" icon="assessment" label="Calificar" @click="irACalificaciones"
            unelevated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboard } from 'src/composables/useDashboard';

const router = useRouter();

const {
  loading,
  error,
  data,
  fetchDashboard
} = useDashboard('DOCENTE');

// Variables reactivas para las estadísticas
const misCasos = ref(0);
const evaluacionesPendientes = ref(0);
const gruposAsignados = ref(0);

// Watch para actualizar los datos cuando lleguen del API
watch(data, (newData) => {
  console.log('Datos del dashboard:', newData); // Para debug

  if (newData) {
    // Asignar los valores correctamente (son números, no arrays)
    misCasos.value = newData.mis_casos || 0;
    evaluacionesPendientes.value = newData.evaluaciones_pendientes || 0;
    gruposAsignados.value = newData.grupos_asignados || 0;
  }
}, { immediate: true });

// Computed para mostrar un resumen
const resumenActividad = computed(() => {
  const total = misCasos.value + evaluacionesPendientes.value + gruposAsignados.value;
  return {
    total,
    tieneActividad: total > 0
  };
});

onMounted(() => {
  fetchDashboard();
});

// Funciones de navegación
function crearNuevoCaso() {
  router.push({ name: 'docente-crear-caso' });
}

function crearNuevaEvaluacion() {
  router.push({ name: 'docente-crear-evaluacion' });
}

function verMisGrupos() {
  router.push({ name: 'docente-grupos' });
}

function irACalificaciones() {
  router.push({ name: 'docente-calificaciones' });
}

// Función para refrescar los datos
function refrescarDatos() {
  fetchDashboard();
}
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.q-btn {
  height: 60px;
}
</style>