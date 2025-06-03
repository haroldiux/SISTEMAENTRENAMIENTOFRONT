<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Encabezado con título y botón -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-primary q-mb-none">Casos clínicos creados</div>

      <!-- Botón para alternar entre vistas -->
      <div class="row items-center">
        <q-btn-toggle v-model="tipoVista" flat toggle-color="primary" class="q-mr-md" :options="[
          { label: 'Cuadrícula', value: 'grid', icon: 'grid_view' },
          { label: 'Lista', value: 'list', icon: 'view_list' }
        ]" />

        <q-btn v-if="tipoUsuario === 'DOCENTE' || tipoUsuario === 'ADMINISTRADOR'" color="primary" icon="add"
          label="Crear nuevo caso" class="q-px-md" @click="$router.push('/app/docentes/crear-caso')" />
      </div>
    </div>

    <!-- Filtros de búsqueda -->
    <div class="row items-center q-col-gutter-md q-mb-lg bg-white shadow-1 rounded-borders q-pa-md">
      <div class="col-12 col-md-4">
        <q-input outlined dense debounce="300" clearable v-model="filtro" placeholder="Buscar por título..."
          class="no-shadow">
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <q-select outlined dense clearable v-model="filtroDificultad"
          :options="['Todos', 'Básico', 'Intermedio', 'Avanzado']" label="Filtrar por dificultad" class="no-shadow">
          <template v-slot:prepend>
            <q-icon name="filter_list" color="primary" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-4">
        <q-select outlined dense clearable v-model="ordenamiento" :options="opcionesOrdenamiento" label="Ordenar por"
          class="no-shadow">
          <template v-slot:prepend>
            <q-icon name="sort" color="primary" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Grid de casos -->
    <div class="row q-col-gutter-lg">
      <div v-for="caso in casosPaginados" :key="caso.id" :class="{
        'col-12 col-md-6 col-lg-4': tipoVista === 'grid',
        'col-12': tipoVista === 'list'
      }">
        <q-card class="caso-card q-mb-md" :class="[getCardColor(caso.nivel_dificultad),
        tipoVista === 'list' ? 'list-card' : '']">
          <q-card-section :class="{ 'row items-start justify-between': tipoVista === 'list' }">
            <div :class="{ 'col-grow': tipoVista === 'list' }">
              <div class="text-h6 text-weight-bold">{{ caso.titulo }}</div>

              <div class="q-mt-xs">
                <q-badge :color="getBadgeTextColor(caso.nivel_dificultad)"
                  :text-color="getBadgeColor(caso.nivel_dificultad)" outline class="q-pa-xs">
                  {{ nivelLabel(caso.nivel_dificultad) }}
                </q-badge>

                <!-- Estado del caso para estudiantes -->
                <q-badge v-if="tipoUsuario === 'ESTUDIANTE' && caso.estado" :color="getEstadoColor(caso.estado)"
                  class="q-ml-sm q-pa-xs">
                  {{ caso.estado === 'en_progreso' ? 'Intentado' : getEstadoLabel(caso.estado) }}
                </q-badge>
              </div>

              <!-- Mostrar información del docente -->
              <div class="text-caption q-mt-sm text-grey-8">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                Creado por: {{ nombreCompletoDocente(caso.docente) }}
              </div>

              <!-- Información de tiempo -->
              <div class="q-mt-md text-body2">
                <div class="row items-center q-gutter-x-md">
                  <div class="flex items-center">
                    <q-icon name="timer" size="xs" class="q-mr-xs" />
                    <span>Resolución: {{ caso.config.tiempo_resolucion }} min</span>
                  </div>
                  <div class="flex items-center">
                    <q-icon name="visibility" size="xs" class="q-mr-xs" />
                    <span>Lectura:
                      <span v-if="caso.config.tipo === 1">∞</span>
                      <span v-else>{{ caso.config.tiempo_vista_enunciado }} min</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <q-card-actions :class="{ 'col-auto': tipoVista === 'list' }"
              :align="tipoVista === 'grid' ? 'right' : undefined" class="q-pa-md">
              <template v-if="tipoUsuario === 'DOCENTE' || tipoUsuario === 'ADMINISTRADOR'">
              </template>
              <template v-else-if="tipoUsuario === 'ESTUDIANTE'">
                <q-btn label="Entrenar" color="primary" class="q-px-md" unelevated @click="entrenarConCaso(caso.id)" />
              </template>
            </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Mensaje si no hay casos -->
    <div v-if="!casosFiltrados.length" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
      <q-icon name="search_off" size="3rem" color="grey-5" />
      <div class="text-h6 text-grey-7 q-mt-md">No hay casos que coincidan con tu búsqueda.</div>
      <div class="text-body2 text-grey-6 q-mt-sm">Prueba a cambiar los filtros o crear un nuevo caso.</div>
    </div>

    <!-- Paginación -->
    <div v-if="casosFiltrados.length > 0" class="row justify-center q-mt-lg">
      <q-pagination v-model="paginaActual" :max="totalPaginas" :max-pages="6" boundary-numbers direction-links
        color="primary" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const filtro = ref('')
const filtroDificultad = ref('Todos')
const tipoUsuario = ref('')
const tipoVista = ref('grid') // Por defecto, vista de cuadrícula

// Variables para paginación
const itemsPorPagina = ref(9) // Ajustar según diseño
const paginaActual = ref(1)

// Variables para ordenamiento
const ordenamiento = ref({ label: 'Más recientes', value: 'reciente' })
const opcionesOrdenamiento = [
  { label: 'Más recientes', value: 'reciente' },
  { label: 'Más antiguos', value: 'antiguo' },
  { label: 'Dificultad (ascendente)', value: 'dificultad_asc' },
  { label: 'Dificultad (descendente)', value: 'dificultad_desc' },
  { label: 'Alfabético (A-Z)', value: 'alfa_asc' },
  { label: 'Alfabético (Z-A)', value: 'alfa_desc' }
]

// Array donde almacenamos los casos traídos del back
const casos = ref([])

// Traemos el usuario y su rol al montar
onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  tipoUsuario.value = user?.role || ''

  // Petición al back
  try {
    const { data } = await api.get('/casos')

    // Si es estudiante, obtener info de resoluciones
    if (tipoUsuario.value === 'ESTUDIANTE') {
      const estudianteId = localStorage.getItem('estudiante_id')
      try {
        const { data: resoluciones } = await api.get(`/estudiantes/${estudianteId}/resoluciones`)

        casos.value = data.map(c => {
          // Buscar si el estudiante ya ha resuelto este caso
          const resolucion = resoluciones.find(r => r.caso_id === c.id)
          // Determinar estado: pendiente, en_progreso, completado
          const estado = !resolucion ? 'pendiente' :
            (resolucion.puntaje > 0 ? 'completado' : 'en_progreso')

          return {
            ...c,
            estado,
            config: c.configuraciones?.[0] || { tiempo_resolucion: 0, tiempo_vista_enunciado: 0, tipo: 0 }
          }
        })
      } catch (err) {
        console.error('Error obteniendo resoluciones:', err)
        // Si hay error, cargar casos sin info de estado
        casos.value = data.map(c => ({
          ...c,
          config: c.configuraciones?.[0] || { tiempo_resolucion: 0, tiempo_vista_enunciado: 0, tipo: 0 }
        }))
      }
    } else {
      // Damos formato a cada caso: extraemos su configuración única
      casos.value = data.map(c => ({
        ...c,
        config: c.configuraciones?.[0] || { tiempo_resolucion: 0, tiempo_vista_enunciado: 0, tipo: 0 }
      }))
    }
  }
  catch (err) {
    console.error('Error cargando casos:', err)
    $q.notify({
      message: 'Error al cargar casos clínicos',
      color: 'negative',
      icon: 'error'
    })
  }
})

// Computed para filtrar por título y nivel
const casosFiltrados = computed(() => {
  let resultado = casos.value.filter(caso => {
    const okTitulo = caso.titulo.toLowerCase().includes(filtro.value.toLowerCase())
    const okNivel = filtroDificultad.value === 'Todos' ||
      nivelLabel(caso.nivel_dificultad) === filtroDificultad.value
    return okTitulo && okNivel
  })

  // Aplicar ordenamiento
  switch (ordenamiento.value.value) {
    case 'reciente':
      return resultado.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
    case 'antiguo':
      return resultado.sort((a, b) => new Date(a.updated_at || a.created_at || 0) - new Date(b.updated_at || b.created_at || 0))
    case 'dificultad_asc':
      return resultado.sort((a, b) => a.nivel_dificultad - b.nivel_dificultad)
    case 'dificultad_desc':
      return resultado.sort((a, b) => b.nivel_dificultad - a.nivel_dificultad)
    case 'alfa_asc':
      return resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
    case 'alfa_desc':
      return resultado.sort((a, b) => b.titulo.localeCompare(a.titulo))
    default:
      return resultado
  }
})

// Computed para la paginación
const totalPaginas = computed(() => {
  return Math.ceil(casosFiltrados.value.length / itemsPorPagina.value)
})

const casosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return casosFiltrados.value.slice(inicio, fin)
})

// Función para mostrar el nombre completo del docente
function nombreCompletoDocente(docente) {
  if (!docente) return 'Docente no especificado';
  return `${docente.nombres || ''} ${docente.apellidos || ''}`.trim();
}

// Funciones para el estado del caso
function getEstadoLabel(estado) {
  switch (estado) {
    case 'completado': return 'Completado'
    case 'en_progreso': return 'Intentado' // Cambiar aquí
    case 'pendiente': return 'Pendiente'
    default: return 'Desconocido'
  }
}

function getEstadoColor(estado) {
  switch (estado) {
    case 'completado': return 'positive'
    case 'en_progreso': return 'warning'
    case 'pendiente': return 'grey-7'
    default: return 'grey'
  }
}

function editarCaso(id) {
  router.push(`/app/docentes/crear-caso?id=${id}`)
}

function eliminarCaso(id) {
  // Confirmación antes de eliminar
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro que deseas eliminar este caso clínico?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/casos/${id}`)
      casos.value = casos.value.filter(c => c.id !== id)
      $q.notify({
        message: 'Caso eliminado correctamente',
        color: 'positive',
        icon: 'check_circle'
      })
    } catch (err) {
      console.error('Error eliminando caso:', err)
      $q.notify({
        message: 'Error al eliminar el caso',
        color: 'negative',
        icon: 'error'
      })
    }
  })
}

function entrenarConCaso(id) {
  router.push(`/app/estudiantes/resolver-caso?id=${id}`)
}

// Helpers de estilos y labels
const nivelLabel = n => {
  switch (n) {
    case 0: return 'Básico'
    case 1: return 'Intermedio'
    case 2: return 'Avanzado'
    default: return '—'
  }
}

function getBadgeColor(n) {
  switch (n) {
    case 0: return 'white'
    case 1: return 'white'
    case 2: return 'white'
    default: return 'white'
  }
}

function getBadgeTextColor(n) {
  switch (n) {
    case 0: return 'green'
    case 1: return 'orange'
    case 2: return 'red'
    default: return 'grey'
  }
}

function getCardColor(n) {
  switch (n) {
    case 0: return 'bg-green-1'
    case 1: return 'bg-orange-1'
    case 2: return 'bg-red-1'
    default: return 'bg-grey-1'
  }
}
</script>

<style scoped>
.caso-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.caso-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* Estilos para vista de lista */
.list-card {
  height: auto;
  flex-direction: row;
}

.list-card .q-card__section {
  padding: 12px 16px;
}

.no-shadow .q-field__control {
  box-shadow: none !important;
}

/* Color más intenso para el hover en botones */
.q-btn:hover {
  opacity: 0.9;
}
</style>
