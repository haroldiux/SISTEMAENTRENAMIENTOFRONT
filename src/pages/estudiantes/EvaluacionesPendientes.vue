<template>
  <q-page padding>
    <div class="text-center q-mb-lg">
      <h1 class="text-h4 text-primary">Evaluaciones Pendientes</h1>
    </div>

    <!-- Pestañas de navegación -->
    <div class="q-mb-lg">
      <q-tabs v-model="tabActiva" class="text-primary" active-color="primary" indicator-color="primary" align="left"
        narrow-indicator>
        <q-tab name="pendientes" label="PENDIENTES" />
        <q-tab name="no_realizadas" label="NO REALIZADAS" />
      </q-tabs>
    </div>

    <!-- Contenido de la pestaña seleccionada -->
    <q-tab-panels v-model="tabActiva" animated>
      <!-- Pestaña de evaluaciones pendientes -->
      <q-tab-panel name="pendientes">
        <div class="q-pa-md">
          <!-- Indicador de carga -->
          <div v-if="cargando" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
            <p class="text-subtitle1 q-mt-sm">Cargando evaluaciones pendientes...</p>
          </div>

          <!-- Contenido cuando no está cargando -->
          <template v-else>
            <!-- Tabla de evaluaciones (solo si hay datos) -->
            <q-table v-if="evaluacionesPendientes.length > 0" :rows="evaluacionesPendientes" :columns="columnas"
              row-key="id" :pagination="{ rowsPerPage: 0 }" hide-pagination>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="evaluacion" :props="props">
                    {{ props.row.evaluacion.titulo }}
                  </q-td>
                  <q-td key="materia" :props="props">
                    {{ props.row.evaluacion.materia ? props.row.evaluacion.materia.nombre : 'Sin materia' }}
                  </q-td>
                  <q-td key="docente" :props="props">
                    {{
                      props.row.evaluacion.docente ?
                        `${props.row.evaluacion.docente.nombres} ${props.row.evaluacion.docente.apellidos}` :
                        'Sin docente'
                    }}
                  </q-td>
                  <q-td key="fecha" :props="props">
                    <div>
                      <q-icon name="event" size="xs" /> {{ formatearFecha(props.row.evaluacion.fecha_inicio) }}
                    </div>
                    <div>
                      <q-icon name="schedule" size="xs" /> {{ formatearHora(props.row.evaluacion.fecha_inicio) }} - {{
                        formatearHora(props.row.evaluacion.fecha_fin) }}
                    </div>
                  </q-td>
                  <q-td key="acciones" :props="props">
                    <q-btn color="primary" label="Iniciar" @click="confirmarInicio(props.row)"
                      :disable="!!props.row.intentada" :class="{ 'bg-grey-5': props.row.intentada }">
                      <q-tooltip v-if="props.row.intentada">
                        Ya has iniciado esta evaluación anteriormente. Si no la completaste, tu calificación será 0.
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>

            <!-- Mensaje cuando no hay datos -->
            <div v-else class="text-center q-pa-md">
              <q-icon name="check_circle" color="positive" size="3rem" />
              <p class="text-h6">¡No tienes evaluaciones pendientes!</p>
            </div>
          </template>
        </div>
      </q-tab-panel>

      <!-- Pestaña de evaluaciones no realizadas -->
      <q-tab-panel name="no_realizadas">
        <div class="q-pa-md">
          <!-- Indicador de carga -->
          <div v-if="cargando" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
            <p class="text-subtitle1 q-mt-sm">Cargando evaluaciones vencidas...</p>
          </div>

          <!-- Contenido cuando no está cargando -->
          <template v-else>
            <!-- Tabla de evaluaciones no realizadas (solo si hay datos) -->
            <q-table v-if="evaluacionesNoRealizadas.length > 0" :rows="evaluacionesNoRealizadas" :columns="columnas"
              row-key="id" :pagination="{ rowsPerPage: 0 }" hide-pagination>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="evaluacion" :props="props">
                    {{ props.row.evaluacion.titulo }}
                  </q-td>
                  <q-td key="materia" :props="props">
                    {{ props.row.evaluacion.materia ? props.row.evaluacion.materia.nombre : 'Sin materia' }}
                  </q-td>
                  <q-td key="docente" :props="props">
                    {{
                      props.row.evaluacion.docente ?
                        `${props.row.evaluacion.docente.nombres} ${props.row.evaluacion.docente.apellidos}` :
                        'Sin docente'
                    }}
                  </q-td>
                  <q-td key="fecha" :props="props">
                    <div>
                      <q-icon name="event" size="xs" /> {{ formatearFecha(props.row.evaluacion.fecha_inicio) }}
                    </div>
                    <div>
                      <q-icon name="schedule" size="xs" /> {{ formatearHora(props.row.evaluacion.fecha_inicio) }} - {{
                        formatearHora(props.row.evaluacion.fecha_fin) }}
                    </div>
                  </q-td>
                  <q-td key="acciones" :props="props">
                    <q-chip color="negative" text-color="white" icon="warning">
                      Vencida
                    </q-chip>
                  </q-td>
                </q-tr>
              </template>
            </q-table>

            <!-- Mensaje cuando no hay datos -->
            <div v-else class="text-center q-pa-md">
              <q-icon name="check_circle" color="positive" size="3rem" />
              <p class="text-h6">¡No tienes evaluaciones vencidas!</p>
            </div>
          </template>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Modal de confirmación para iniciar evaluación -->
    <q-dialog v-model="modalConfirmacionInicio" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-warning text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            ADVERTENCIA IMPORTANTE
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <p class="text-body1 q-mb-md">
            <strong>Una vez inicies esta evaluación:</strong>
          </p>
          <ul>
            <li class="q-mb-sm">No podrás volver atrás ni cancelarla</li>
            <li class="q-mb-sm">Si cierras la ventana o te desconectas, la evaluación se considerará como realizada</li>
            <li class="q-mb-sm">Recibirás una calificación de 0 puntos si no la completas</li>
          </ul>
          <p class="text-body1 q-mt-md">
            Asegúrate de disponer del tiempo necesario para completarla sin interrupciones.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Entiendo y deseo iniciar" @click="iniciarEvaluacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { date, Notify } from 'quasar';
import { api } from 'boot/axios';

export default {
  name: 'EvaluacionesPendientes',

  setup() {
    const router = useRouter();

    // Obtener ID del estudiante desde localStorage
    const estudianteId = localStorage.getItem('estudiante_id');

    // Estados reactivos
    const evaluacionesPendientes = ref([]);
    const evaluacionesNoRealizadas = ref([]);
    const tabActiva = ref('pendientes');
    const cargando = ref(false);
    const modalConfirmacionInicio = ref(false);
    const evaluacionSeleccionada = ref(null);

    // Columnas para las tablas
    const columnas = [
      {
        name: 'evaluacion',
        required: true,
        label: 'Evaluación',
        align: 'left',
        field: row => row.evaluacion.titulo,
        sortable: true
      },
      {
        name: 'materia',
        required: true,
        label: 'Materia',
        align: 'left',
        field: row => row.evaluacion.materia ? row.evaluacion.materia.nombre : 'Sin materia',
        sortable: true
      },
      {
        name: 'docente',
        required: true,
        label: 'Docente',
        align: 'left',
        field: row => row.evaluacion.docente ? `${row.evaluacion.docente.nombres} ${row.evaluacion.docente.apellidos}` : 'Sin docente',
        sortable: true
      },
      {
        name: 'fecha',
        required: true,
        label: 'Fecha y Hora',
        align: 'left',
        sortable: true
      },
      {
        name: 'acciones',
        required: true,
        label: 'Acciones',
        align: 'center',
      }
    ];

    // Formatear fecha
    const formatearFecha = (fechaStr) => {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      return date.formatDate(fecha, 'DD/MM/YYYY');
    };

    // Formatear hora
    const formatearHora = (fechaStr) => {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      return date.formatDate(fecha, 'HH:mm');
    };

    // Cargar evaluaciones pendientes
    const cargarEvaluacionesPendientes = async () => {
      cargando.value = true;
      try {
        const { data } = await api.get('/evaluaciones/pendientes');
        evaluacionesPendientes.value = data.evaluaciones.map(asignacion => {
          console.log('Asignación pendiente raw →', asignacion);
          const casoId =
            asignacion.caso_id
            ?? asignacion.evaluacion?.caso_id
            ?? asignacion.evaluacion?.evaluacionCasos?.[0]?.caso_id
            ?? asignacion.evaluacion?.evaluacionCasos?.[0]?.pivot?.caso_id
            ?? null;

          return {
            id: asignacion.id,
            evaluacion: asignacion.evaluacion,
            caso_id: casoId,
            completado: asignacion.completado,
            intentada: asignacion.intentada || false
          };
        });
      } catch (error) {
        console.error('Error al cargar evaluaciones pendientes:', error);
        Notify.create({
          message: 'Error al cargar evaluaciones pendientes',
          color: 'negative',
          position: 'top'
        });
      } finally {
        cargando.value = false;
      }
    };

    // Cargar evaluaciones no realizadas
    const cargarEvaluacionesNoRealizadas = async () => {
      cargando.value = true;
      try {
        const { data } = await api.get('/evaluaciones/vencidas');
        evaluacionesNoRealizadas.value = data.evaluaciones;
      } catch (error) {
        console.error('Error al cargar evaluaciones vencidas:', error);
        Notify.create({
          message: 'Error al cargar evaluaciones vencidas',
          color: 'negative',
          position: 'top'
        });
      } finally {
        cargando.value = false;
      }
    };

    // Función para mostrar el modal de confirmación al hacer clic en "Iniciar"
    const confirmarInicio = (evaluacion) => {
      evaluacionSeleccionada.value = evaluacion;
      modalConfirmacionInicio.value = true;
    };

    // Función para iniciar la evaluación después de la confirmación
    const iniciarEvaluacion = () => {
      if (!evaluacionSeleccionada.value) return;

      // Verificar si tenemos el ID del estudiante
      if (!estudianteId) {
        Notify.create({
          message: 'Error: No se pudo obtener tu identificación de estudiante. Por favor, inicia sesión nuevamente.',
          color: 'negative',
          position: 'top',
          timeout: 5000
        });
        router.push('/');
        return;
      }

      // Cerrar el modal
      modalConfirmacionInicio.value = false;

      // Primero, marcar la evaluación como "intentada" en el backend
      api.post(`/evaluaciones/${evaluacionSeleccionada.value.evaluacion.id}/marcar-intentada`, {
        estudiante_id: estudianteId
      })
        .then(() => {
          // Redirigir al usuario a la página de resolver caso con los parámetros necesarios
          const evaluacionId = evaluacionSeleccionada.value.evaluacion.id;
          const casoId = evaluacionSeleccionada.value.caso_id || obtenerCasoIdDesdeEvaluacion(evaluacionSeleccionada.value);

          if (!casoId) {
            throw new Error('No se pudo determinar el ID del caso');
          }

          // Redireccionar al componente de resolver caso
          router.push({
            path: '/app/estudiantes/resolver-caso',
            query: {
              id: casoId,
              evaluacion: evaluacionId
            }
          });
        })
        .catch((error) => {
          console.error("Error al marcar la evaluación como intentada:", error);
          Notify.create({
            message: "Error al iniciar la evaluación. Por favor, inténtalo de nuevo.",
            color: "negative",
            icon: "error",
            position: "top",
            timeout: 3000
          });
        });
    };

    // Función auxiliar para obtener el caso_id si no está directamente disponible
    const obtenerCasoIdDesdeEvaluacion = (evaluacion) => {
      // Intentar obtener el ID del caso desde la evaluación
      if (evaluacion.evaluacion && evaluacion.evaluacion.evaluacionCasos &&
        evaluacion.evaluacion.evaluacionCasos.length > 0) {
        return evaluacion.evaluacion.evaluacionCasos[0].caso_id;
      }

      console.warn('No se pudo obtener el ID del caso desde la evaluación:', evaluacion);
      return null;
    };

    // Ciclo de vida del componente
    onMounted(() => {
      // Verificar si hay un token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        Notify.create({
          message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          color: 'negative',
          position: 'top'
        });
        router.push('/');
        return;
      }

      cargarEvaluacionesPendientes();
      cargarEvaluacionesNoRealizadas();
    });

    return {
      evaluacionesPendientes,
      evaluacionesNoRealizadas,
      tabActiva,
      cargando,
      columnas,
      formatearFecha,
      formatearHora,
      modalConfirmacionInicio,
      evaluacionSeleccionada,
      confirmarInicio,
      iniciarEvaluacion
    };
  }
};
</script>

<style lang="scss" scoped>
.q-table {
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>
