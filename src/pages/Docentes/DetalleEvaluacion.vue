<template>
  <q-page padding class="bg-grey-2">
    <div class="container q-my-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" class="q-mr-sm" @click="$router.push('/app/docentes/mis-evaluaciones')" />
        <div class="text-h5 text-deep-purple-9">Detalles de Evaluación</div>
      </div>

      <!-- Contenido principal -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <div class="text-subtitle1 q-mt-md">Cargando detalles de la evaluación...</div>
      </div>

      <div v-else-if="evaluacion">
        <!-- Información general de la evaluación -->
        <q-card class="shadow-3 q-mb-md">
          <q-card-section class="bg-deep-purple-2">
            <div class="text-h6 text-deep-purple-9">{{ evaluacion.titulo }}</div>
            <div class="text-subtitle2 text-grey-8">{{ evaluacion.materia.nombre }} - {{ evaluacion.grupo.nombre }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Periodo de evaluación</q-item-label>
                      <q-item-label caption>
                        {{ formatFecha(evaluacion.fecha_inicio) }} - {{ formatFecha(evaluacion.fecha_fin) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="school" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Gestión académica</q-item-label>
                      <q-item-label caption>{{ evaluacion.gestion.nombre }} {{ evaluacion.gestion.anio }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="psychology" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Nivel de dificultad</q-item-label>
                      <q-item-label caption>
                        <q-badge :color="getNivelColor(evaluacion.filtro_nivel_dificultad)">
                          {{ getNivelTexto(evaluacion.filtro_nivel_dificultad) }}
                        </q-badge>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="shuffle" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Modo de selección</q-item-label>
                      <q-item-label caption>
                        <q-badge :color="evaluacion.modo_seleccion === 'manual' ? 'blue' : 'orange'">
                          {{ evaluacion.modo_seleccion === 'manual' ? 'Manual' : 'Aleatorio' }}
                        </q-badge>
                        <span v-if="evaluacion.modo_seleccion === 'aleatorio'" class="q-ml-sm">
                          (Límite: {{ evaluacion.limite_casos || 'No definido' }})
                        </span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="assignment" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Total de casos</q-item-label>
                      <q-item-label caption>{{ totalCasos }} casos en esta evaluación</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="people" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Estudiantes</q-item-label>
                      <q-item-label caption>{{ totalEstudiantes }} estudiantes asignados</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tarjeta de progreso y estadísticas -->
        <q-card class="shadow-3 q-mb-md">
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-bold">Progreso de la evaluación</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-lg">
              <!-- Gráfico de progreso -->
              <div class="col-12 col-md-6 text-center">
                <q-circular-progress
                  show-value
                  font-size="20px"
                  class="text-primary q-ma-md"
                  :value="porcentajeCompletados"
                  size="200px"
                  :thickness="0.22"
                  color="positive"
                  track-color="grey-3"
                >
                  <div class="text-deep-purple text-h5">{{ Math.round(porcentajeCompletados) }}%</div>
                  <div class="text-caption">completados</div>
                </q-circular-progress>
              </div>

              <!-- Tabla de estadísticas -->
              <div class="col-12 col-md-6">
                <q-list bordered separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Estado</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge :color="getEstadoColor(evaluacion)">
                        {{ getEstadoTexto(evaluacion) }}
                      </q-badge>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>Estudiantes que han completado</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-weight-medium text-positive">{{ estadisticas.completados }}</div>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>Estudiantes pendientes</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-weight-medium text-amber">{{ estadisticas.pendientes }}</div>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>Nota promedio</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-weight-medium" :class="getColorClaseNota(estadisticas.nota_promedio)">
                        {{ estadisticas.nota_promedio ? estadisticas.nota_promedio.toFixed(2) : 'N/A' }}
                      </div>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>Nota más alta</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-weight-medium text-positive">
                        {{ estadisticas.nota_maxima ? estadisticas.nota_maxima.toFixed(2) : 'N/A' }}
                      </div>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>Nota más baja</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-weight-medium text-negative">
                        {{ estadisticas.nota_minima ? estadisticas.nota_minima.toFixed(2) : 'N/A' }}
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Lista de asignaciones a estudiantes -->
        <q-card class="shadow-3">
          <q-card-section class="bg-grey-2">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">Asignaciones a estudiantes</div>
              <div>
                <q-input v-model="busquedaEstudiante" dense outlined placeholder="Buscar estudiante" class="q-mr-sm" style="width: 200px">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-btn v-if="evaluacion.evaluacionCasos" outline color="deep-purple" label="Exportar resultados" icon="download" @click="exportarResultados" />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="asignacionesFiltradas"
              :columns="columnsAsignaciones"
              row-key="id"
              v-model:pagination="pagination"
              :loading="loadingAsignaciones"
              binary-state-sort
              flat
              bordered
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="estudiante" :props="props">
                    <div class="text-weight-medium">
                      {{ props.row.estudiante.nombres }} {{ props.row.estudiante.apellido1 }} {{ props.row.estudiante.apellido2 }}
                    </div>
                  </q-td>
                  <q-td key="caso" :props="props">
                    {{ props.row.caso.titulo }}
                  </q-td>
                  <q-td key="estado" :props="props">
                    <q-badge v-if="props.row.completado" color="positive" class="q-pa-xs">
                      Completado
                    </q-badge>
                    <q-badge v-else color="grey" class="q-pa-xs">
                      Pendiente
                    </q-badge>
                  </q-td>
                  <q-td key="nota" :props="props">
                    <div v-if="props.row.resolucion && props.row.resolucion.puntaje !== undefined" :class="getColorClaseNota(props.row.resolucion.puntaje)">
                      {{ props.row.resolucion.puntaje.toFixed(2) }}
                    </div>
                    <div v-else class="text-grey">
                      N/A
                    </div>
                  </q-td>
                  <q-td key="fecha" :props="props">
                    <div v-if="props.row.resolucion && props.row.resolucion.fecha_resolucion">
                      {{ formatFecha(props.row.resolucion.fecha_resolucion) }}
                    </div>
                    <div v-else class="text-grey">
                      Sin resolver
                    </div>
                  </q-td>
                  <q-td key="acciones" :props="props">
                    <q-btn v-if="props.row.completado" flat round color="primary" icon="visibility" @click="verResolucion(props.row)">
                      <q-tooltip>Ver resolución</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Mensaje si no se encuentra la evaluación -->
      <div v-else class="q-pa-lg text-center">
        <q-icon name="error_outline" size="56px" color="grey-6" />
        <div class="text-h6 q-mt-md text-grey-8">Evaluación no encontrada</div>
        <q-btn color="primary" class="q-mt-lg" label="Volver a mis evaluaciones" to="/app/docentes/mis-evaluaciones" />
      </div>
    </div>

    <!-- Modal para ver detalles de resolución -->
    <q-dialog v-model="modalResolucion" maximized persistent class="resolucion-modal">
      <q-card>
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Resolución del estudiante</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="resolucionSeleccionada" class="resolucion-content">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card class="info-card">
                <q-card-section class="bg-grey-2">
                  <div class="text-subtitle1 text-weight-bold">Información de la resolución</div>
                </q-card-section>
                <q-card-section>
                  <q-list bordered separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label>Estudiante</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-weight-medium">
                          {{ resolucionSeleccionada.estudiante.nombres }} {{ resolucionSeleccionada.estudiante.apellido1 }}
                        </div>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label>Caso</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-weight-medium">{{ resolucionSeleccionada.caso.titulo }}</div>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label>Fecha de resolución</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-weight-medium">
                          {{ resolucionSeleccionada.resolucion ? formatFecha(resolucionSeleccionada.resolucion.fecha_resolucion) : 'N/A' }}
                        </div>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label>Nota</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-weight-medium text-h6" :class="getColorClaseNota(resolucionSeleccionada.resolucion?.puntaje)">
                          {{ resolucionSeleccionada.resolucion ? resolucionSeleccionada.resolucion.puntaje.toFixed(2) : 'N/A' }}
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <!-- Aquí iría el detalle de la resolución (respuestas, elementos clínicos, etc.) -->
              <q-card>
                <q-card-section class="bg-grey-2">
                  <div class="text-subtitle1 text-weight-bold">Detalles de la resolución</div>
                </q-card-section>
                <q-card-section v-if="resolucionSeleccionada.resolucion">
                  <q-tabs
                    v-model="pestanaActiva"
                    dense
                    class="text-primary"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                  >
                    <q-tab name="motivos" label="Motivos de consulta" />
                    <q-tab name="elementos" label="Elementos clínicos" />
                    <q-tab name="examenes" label="Exámenes complementarios" />
                  </q-tabs>

                  <q-separator />

                  <q-tab-panels v-model="pestanaActiva" animated>
                    <q-tab-panel name="motivos">
                      <div class="text-body1 text-weight-medium q-mb-md">Motivos de consulta seleccionados</div>
                      <!-- Aquí el contenido de motivos de consulta -->
                      <div class="text-grey-8 text-center" v-if="!resolucionSeleccionada.resolucion.motivos?.length">
                        No hay información disponible sobre los motivos seleccionados
                      </div>
                    </q-tab-panel>

                    <q-tab-panel name="elementos">
                      <div class="text-body1 text-weight-medium q-mb-md">Elementos clínicos identificados</div>
                      <!-- Aquí el contenido de elementos clínicos -->
                      <div class="text-grey-8 text-center" v-if="!resolucionSeleccionada.resolucion.elementos_clinicos?.length">
                        No hay información disponible sobre los elementos clínicos identificados
                      </div>
                    </q-tab-panel>

                    <q-tab-panel name="examenes">
                      <div class="text-body1 text-weight-medium q-mb-md">Exámenes solicitados</div>
                      <!-- Aquí el contenido de exámenes -->
                      <div class="text-grey-8 text-center" v-if="!resolucionSeleccionada.resolucion.examenes?.length">
                        No hay información disponible sobre los exámenes solicitados
                      </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </q-card-section>
                <q-card-section v-else class="text-center">
                  <q-icon name="info" size="48px" color="grey-5" />
                  <div class="text-subtitle1 q-mt-sm text-grey-7">Resolución no disponible</div>
                  <div class="text-caption text-grey-6">No se encontraron detalles de la resolución del estudiante</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { date } from 'quasar';

export default {
  name: 'DetalleEvaluacion',

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    // Estados principales
    const evaluacion = ref(null);
    const loading = ref(true);
    const loadingAsignaciones = ref(false);
    const busquedaEstudiante = ref('');
    const modalResolucion = ref(false);
    const resolucionSeleccionada = ref(null);
    const pestanaActiva = ref('motivos');

    // Paginación
    const paginacion = ref({
      rowsPerPage: 10,
      sortBy: 'estudiante',
    });

    // Definición de columnas para la tabla de asignaciones
    const columnsAsignaciones = [
      { name: 'estudiante', label: 'Estudiante', field: row => `${row.estudiante.nombres} ${row.estudiante.apellido1}`, align: 'left', sortable: true },
      { name: 'caso', label: 'Caso asignado', field: row => row.caso.titulo, align: 'left', sortable: true },
      { name: 'estado', label: 'Estado', field: 'completado', align: 'center', sortable: true },
      { name: 'nota', label: 'Nota', field: row => row.resolucion?.puntaje, align: 'center', sortable: true },
      { name: 'fecha', label: 'Fecha de resolución', field: row => row.resolucion?.fecha_resolucion, align: 'center', sortable: true },
      { name: 'acciones', label: 'Acciones', field: '', align: 'center' }
    ];

    // Estadísticas
    const estadisticas = ref({
      total_estudiantes: 0,
      completados: 0,
      pendientes: 0,
      nota_promedio: 0,
      nota_maxima: 0,
      nota_minima: 0
    });

    // Computed properties
    const totalCasos = computed(() => {
      if (!evaluacion.value || !evaluacion.value.evaluacionCasos) return 0;
      return evaluacion.value.evaluacionCasos.length;
    });

    const totalEstudiantes = computed(() => {
      return estadisticas.value.total_estudiantes || 0;
    });

    const porcentajeCompletados = computed(() => {
      if (estadisticas.value.total_estudiantes === 0) return 0;
      return (estadisticas.value.completados / estadisticas.value.total_estudiantes) * 100;
    });

    const asignacionesFiltradas = computed(() => {
      if (!evaluacion.value || !evaluacion.value.evaluacionCasos) return [];

      // Recopilar todas las asignaciones a estudiantes
      let asignaciones = [];
      evaluacion.value.evaluacionCasos.forEach(ec => {
        if (ec.asignacionesEstudiantes && ec.asignacionesEstudiantes.length > 0) {
          ec.asignacionesEstudiantes.forEach(ae => {
            asignaciones.push({
              id: ae.id,
              estudiante: ae.estudiante,
              caso: ec.caso,
              completado: ae.completado,
              evaluacion_caso_id: ec.id,
              resolucion: ae.resolucion
            });
          });
        }
      });

      // Filtrar por búsqueda de estudiante
      if (busquedaEstudiante.value) {
        const busqueda = busquedaEstudiante.value.toLowerCase();
        asignaciones = asignaciones.filter(a => {
          const nombreCompleto = `${a.estudiante.nombres} ${a.estudiante.apellido1} ${a.estudiante.apellido2}`.toLowerCase();
          return nombreCompleto.includes(busqueda);
        });
      }

      return asignaciones;
    });

    // Métodos
    const cargarEvaluacion = async () => {
      loading.value = true;
      try {
        const id = route.params.id;
        const { data } = await api.get(`/evaluaciones/${id}`);
        evaluacion.value = data.evaluacion;

        // Cargar estadísticas
        cargarEstadisticas(id);
      } catch (error) {
        console.error('Error al cargar evaluación:', error);
        $q.notify({
          color: 'negative',
          message: 'Error al cargar los detalles de la evaluación',
          icon: 'error'
        });
        evaluacion.value = null;
      } finally {
        loading.value = false;
      }
    };

    const cargarEstadisticas = async (id) => {
      try {
        const { data } = await api.get(`/evaluaciones/${id}/estadisticas`);
        estadisticas.value = data;
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    const formatFecha = (fechaStr) => {
      try {
        return date.formatDate(fechaStr, 'DD/MM/YYYY HH:mm');
      } catch (e) {
        return fechaStr;
      }
    };

    const getNivelTexto = (nivel) => {
      switch(parseInt(nivel)) {
        case 1: return 'Básico';
        case 2: return 'Intermedio';
        case 3: return 'Avanzado';
        default: return 'Desconocido';
      }
    };

    const getNivelColor = (nivel) => {
      switch(parseInt(nivel)) {
        case 1: return 'green';
        case 2: return 'orange';
        case 3: return 'red';
        default: return 'grey';
      }
    };

    const getEstado = (evaluacion) => {
      const ahora = new Date();
      const inicio = new Date(evaluacion.fecha_inicio);
      const fin = new Date(evaluacion.fecha_fin);

      if (ahora < inicio) return 'pendiente';
      if (ahora > fin) return 'finalizada';
      return 'en_curso';
    };

    const getEstadoTexto = (evaluacion) => {
      const estado = getEstado(evaluacion);
      switch (estado) {
        case 'pendiente': return 'Pendiente de inicio';
        case 'en_curso': return 'En curso';
        case 'finalizada': return 'Finalizada';
        default: return 'Desconocido';
      }
    };

    const getEstadoColor = (evaluacion) => {
      const estado = getEstado(evaluacion);
      switch (estado) {
        case 'pendiente': return 'blue';
        case 'en_curso': return 'green';
        case 'finalizada': return 'grey-7';
        default: return 'grey';
      }
    };

    const getColorClaseNota = (nota) => {
      if (!nota) return 'text-grey';
      if (nota >= 80) return 'text-positive';
      if (nota >= 60) return 'text-amber';
      return 'text-negative';
    };

    const verResolucion = (asignacion) => {
      resolucionSeleccionada.value = asignacion;
      modalResolucion.value = true;
    };

    const exportarResultados = () => {
      $q.notify({
        color: 'info',
        message: 'Función de exportación en desarrollo',
        icon: 'info'
      });
    };

    onMounted(() => {
      cargarEvaluacion();
    });

    return {
      evaluacion,
      loading,
      loadingAsignaciones,
      busquedaEstudiante,
      modalResolucion,
      resolucionSeleccionada,
      pestanaActiva,
      paginacion,
      columnsAsignaciones,
      estadisticas,
      totalCasos,
      totalEstudiantes,
      porcentajeCompletados,
      asignacionesFiltradas,

      formatFecha,
      getNivelTexto,
      getNivelColor,
      getEstado,
      getEstadoTexto,
      getEstadoColor,
      getColorClaseNota,
      verResolucion,
      exportarResultados
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.info-card {
  height: 100%;
}

.resolucion-content {
  max-height: 80vh;
  overflow-y: auto;
}

/* Estilos para responsive */
@media (max-width: 600px) {
  :deep(.q-table__card) {
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.q-table) {
    background-color: transparent;
  }
}
</style>
