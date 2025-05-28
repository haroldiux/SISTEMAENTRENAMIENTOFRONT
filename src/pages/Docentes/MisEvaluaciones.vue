<template>
  <q-page padding class="bg-grey-2">
    <div class="container q-my-md">
      <div class="text-h5 text-deep-purple-9 q-mb-md">Mis Evaluaciones</div>

      <q-card class="shadow-3">
        <q-card-section class="bg-grey-3">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">Evaluaciones programadas</div>
            <q-btn color="deep-purple" label="Nueva evaluación" icon="add" to="/app/docentes/programar-examen" />
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Barra de filtro y búsqueda -->
          <div class="row q-mb-md items-center">
            <div class="col-12 col-md-4 q-pr-md">
              <q-input outlined dense v-model="busqueda" placeholder="Buscar evaluación" class="full-width">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-8 row items-center justify-end q-gutter-sm">
              <q-select outlined dense v-model="filtroMateria" :options="materiaOptions" label="Materia" class="q-ml-sm" style="min-width: 150px" />
              <q-select outlined dense v-model="filtroEstado" :options="estadoOptions" label="Estado" class="q-ml-sm" style="min-width: 150px" />
            </div>
          </div>

          <!-- Tabla de evaluaciones -->
          <q-table
            :rows="evaluacionesFiltradas"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :loading="loading"
            class="full-width"
            :rows-per-page-options="[10, 20, 50]"
            binary-state-sort
            flat
            bordered
            separator="horizontal"
          >
            <!-- Personalización de columnas -->
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="titulo" :props="props">
                  <div class="text-weight-medium">{{ props.row.titulo }}</div>
                </q-td>
                <q-td key="materia" :props="props">
                  {{ props.row.materia.nombre }}
                </q-td>
                <q-td key="grupo" :props="props">
                  {{ props.row.grupo.nombre }}
                </q-td>
                <q-td key="fechas" :props="props">
                  <div>Inicio: {{ formatFecha(props.row.fecha_inicio) }}</div>
                  <div>Fin: {{ formatFecha(props.row.fecha_fin) }}</div>
                </q-td>
                <q-td key="estado" :props="props">
                  <q-badge :color="getEstadoColor(props.row)" class="q-pa-xs">
                    {{ getEstadoTexto(props.row) }}
                  </q-badge>
                </q-td>
                <q-td key="progreso" :props="props">
                  <div class="row items-center no-wrap">
                    <q-linear-progress
                      size="sm"
                      :value="getProgreso(props.row)"
                      class="q-mr-sm col"
                      rounded
                      :color="getProgresoColor(props.row)"
                    />
                    <div class="col-auto text-caption">{{ Math.round(getProgreso(props.row) * 100) }}%</div>
                  </div>
                </q-td>
                <q-td key="acciones" :props="props">
                  <div class="row q-gutter-xs justify-center">
                    <q-btn size="sm" flat round color="primary" icon="visibility" @click="verDetalles(props.row.id)">
                      <q-tooltip>Ver detalles</q-tooltip>
                    </q-btn>
                    <q-btn size="sm" flat round color="negative" icon="delete" @click="confirmarEliminar(props.row)" :disable="!puedeEliminar(props.row)">
                      <q-tooltip>Eliminar evaluación</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <!-- Template para mostrar cuando no hay datos -->
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md">
                <div class="text-center">
                  <q-icon name="assignment" size="64px" color="grey-5" />
                  <div class="text-h6 text-grey-7 q-mt-sm">No hay evaluaciones disponibles</div>
                  <div class="text-grey-6 q-mt-sm">Comienza creando una nueva evaluación</div>
                  <q-btn color="deep-purple" class="q-mt-md" label="Crear evaluación" icon="add" to="/app/docentes/programar-examen" />
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { date } from 'quasar';

export default {
  name: 'MisEvaluaciones',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const evaluaciones = ref([]);
    const loading = ref(true);
    const busqueda = ref('');
    const filtroMateria = ref(null);
    const filtroEstado = ref(null);
    const materiaOptions = ref([]);
    const estadoOptions = ref([
      { label: 'Todos', value: null },
      { label: 'Pendiente', value: 'pendiente' },
      { label: 'En curso', value: 'en_curso' },
      { label: 'Finalizada', value: 'finalizada' }
    ]);
    const pagination = ref({
      rowsPerPage: 10,
      sortBy: 'fecha_inicio',
      descending: true
    });

    const columns = [
      { name: 'titulo', align: 'left', label: 'Título', field: 'titulo', sortable: true },
      { name: 'materia', align: 'left', label: 'Materia', field: row => row.materia.nombre, sortable: true },
      { name: 'grupo', align: 'left', label: 'Grupo', field: row => row.grupo.nombre, sortable: true },
      { name: 'fechas', align: 'left', label: 'Fechas', field: 'fecha_inicio', sortable: true },
      { name: 'estado', align: 'center', label: 'Estado', field: row => getEstadoTexto(row), sortable: true },
      { name: 'progreso', align: 'center', label: 'Progreso', sortable: false },
      { name: 'acciones', align: 'center', label: 'Acciones', sortable: false }
    ];

    // Obtener evaluaciones del docente
    const cargarEvaluaciones = async () => {
      loading.value = true;
      try {
        const { data } = await api.get('/evaluaciones/docente');
        evaluaciones.value = data.evaluaciones;

        // Extraer materias para el filtro
        const materias = new Set();
        evaluaciones.value.forEach(e => {
          if (e.materia && e.materia.nombre) {
            materias.add(e.materia.nombre);
          }
        });

        materiaOptions.value = [
          { label: 'Todas', value: null },
          ...Array.from(materias).map(nombre => ({ label: nombre, value: nombre }))
        ];
      } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
        $q.notify({
          color: 'negative',
          message: 'Error al cargar las evaluaciones',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // Evaluaciones filtradas
    const evaluacionesFiltradas = computed(() => {
      let resultado = [...evaluaciones.value];

      // Filtro por búsqueda
      if (busqueda.value) {
        const terminoBusqueda = busqueda.value.toLowerCase();
        resultado = resultado.filter(e =>
          e.titulo.toLowerCase().includes(terminoBusqueda) ||
          e.materia.nombre.toLowerCase().includes(terminoBusqueda) ||
          e.grupo.nombre.toLowerCase().includes(terminoBusqueda)
        );
      }

      // Filtro por materia
      if (filtroMateria.value) {
        resultado = resultado.filter(e => e.materia.nombre === filtroMateria.value);
      }

      // Filtro por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(e => {
          const estado = getEstado(e);
          return estado === filtroEstado.value;
        });
      }

      return resultado;
    });

    // Funciones para determinar el estado de una evaluación
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
        case 'pendiente': return 'Pendiente';
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
        case 'finalizada': return 'grey';
        default: return 'grey';
      }
    };

    // Formato de fecha
    const formatFecha = (fechaStr) => {
      try {
        return date.formatDate(fechaStr, 'DD/MM/YYYY HH:mm');
      } catch (e) {
        return fechaStr;
      }
    };

    // Cálculo del progreso
    const getProgreso = (evaluacion) => {
      // Si tiene estadísticas, usarlas
      if (evaluacion.estadisticas) {
        return evaluacion.estadisticas.completados / evaluacion.estadisticas.total_estudiantes;
      }

      // Estimación basada en tiempo (si no hay estadísticas)
      const ahora = new Date();
      const inicio = new Date(evaluacion.fecha_inicio);
      const fin = new Date(evaluacion.fecha_fin);

      // Si no ha comenzado
      if (ahora < inicio) return 0;

      // Si ya finalizó
      if (ahora > fin) return 1;

      // Si está en curso
      const totalDuracion = fin - inicio;
      const transcurrido = ahora - inicio;
      return Math.min(1, Math.max(0, transcurrido / totalDuracion));
    };

    const getProgresoColor = (evaluacion) => {
      const progreso = getProgreso(evaluacion);
      if (progreso < 0.25) return 'red';
      if (progreso < 0.75) return 'orange';
      return 'green';
    };

    // Navegación y acciones
    const verDetalles = (id) => {
      router.push(`/app/docentes/detalle-evaluacion/${id}`);
    };

    const puedeEliminar = (evaluacion) => {
      const ahora = new Date();
      const inicio = new Date(evaluacion.fecha_inicio);

      // Sólo se puede eliminar si todavía no ha comenzado
      return ahora < inicio;
    };

    const confirmarEliminar = (evaluacion) => {
      if (!puedeEliminar(evaluacion)) return;

      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar la evaluación "${evaluacion.titulo}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete(`/evaluaciones/${evaluacion.id}`);

          $q.notify({
            color: 'positive',
            message: 'Evaluación eliminada correctamente',
            icon: 'check_circle'
          });

          // Recargar la lista
          cargarEvaluaciones();
        } catch (error) {
          console.error('Error al eliminar la evaluación:', error);
          $q.notify({
            color: 'negative',
            message: 'Error al eliminar la evaluación',
            icon: 'error'
          });
        }
      });
    };

    onMounted(() => {
      cargarEvaluaciones();
    });

    return {
      loading,
      evaluaciones,
      busqueda,
      filtroMateria,
      filtroEstado,
      materiaOptions,
      estadoOptions,
      pagination,
      columns,
      evaluacionesFiltradas,

      formatFecha,
      getEstado,
      getEstadoTexto,
      getEstadoColor,
      getProgreso,
      getProgresoColor,
      verDetalles,
      puedeEliminar,
      confirmarEliminar
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
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
