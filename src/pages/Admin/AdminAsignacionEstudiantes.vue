<template>
  <div class="q-pa-md">
    <div class="text-h4 text-deep-purple-10 q-mb-lg text-center">
      Asignación de Estudiantes a Grupos
    </div>

    <!-- Gestión activa badge (nuevo estilo) -->
    <div class="text-center q-mb-md">
      <q-badge color="deep-purple" class="text-white q-pa-sm">
        <q-icon name="calendar_month" size="xs" class="q-mr-xs" />
        Gestión Activa: {{ gestionActiva ? gestionActiva.nombre : 'Cargando...' }}
      </q-badge>
    </div>

    <!-- Selección de materia y grupo -->
    <q-card class="q-mb-lg shadow-3">
      <q-card-section class="bg-deep-purple-2">
        <div class="text-h6 text-deep-purple-10">Seleccionar Materia y Grupo</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-6 col-xs-12">
            <q-select v-model="selectedMateria" :options="materias" option-label="nombre" label="Materia" outlined
              emit-value map-options class="q-mb-md" :loading="loadingMaterias"
              @update:model-value="loadGruposByMateria" />
          </div>
          <div class="col-md-6 col-xs-12">
            <q-select v-model="selectedGrupo" :options="grupos" option-label="nombre" option-value="id" label="Grupo"
              outlined emit-value map-options :disable="!selectedMateria || grupos.length === 0"
              :loading="loadingGrupos" @update:model-value="loadEstudiantesGrupo">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>
                      Docente: {{ scope.opt.docente ? scope.opt.docente.nombre_completo : 'No asignado' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No hay grupos disponibles</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Sistema de dos tablas para asignación -->
    <div v-if="selectedGrupo" class="row q-col-gutter-md">
      <!-- Lista de estudiantes del sistema -->
      <div class="col-md-6 col-xs-12">
        <q-card class="shadow-3">
          <q-card-section class="bg-deep-purple-2">
            <div class="text-h6 text-deep-purple-10">
              Estudiantes Disponibles
              <q-chip v-if="estudiantesSeleccionados.length > 0"
                color="deep-purple-6"
                text-color="white"
                class="q-ml-sm">
                {{ estudiantesSeleccionados.length }} seleccionados
              </q-chip>
            </div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="searchEstudiante" outlined dense placeholder="Buscar por código de estudiante"
              class="q-mb-md" clearable @update:model-value="onSearchChange" @keyup.enter="buscarEstudiantes">
              <template v-slot:append>
                <q-icon name="search" class="cursor-pointer" @click="buscarEstudiantes" />
              </template>
            </q-input>

            <div v-if="loadingEstudiantesDisponibles" class="text-center q-pa-md">
              <q-spinner color="deep-purple" size="3em" />
              <div class="q-mt-sm">Buscando estudiantes...</div>
            </div>
            <div v-else-if="estudiantesDisponibles.length === 0 && searchEstudiante" class="text-center q-pa-lg">
              <q-icon name="person_search" size="3em" color="grey-7" />
              <div class="text-h6 text-grey-7 q-mt-sm">No se encontraron estudiantes con ese código</div>
            </div>
            <div v-else-if="estudiantesDisponibles.length === 0 && !searchEstudiante" class="text-center q-pa-lg">
              <q-icon name="info" size="3em" color="grey-7" />
              <div class="text-h6 text-grey-7 q-mt-sm">Ingrese un código de estudiante para buscar</div>
            </div>
            <q-table v-else :rows="estudiantesDisponibles" :columns="columnsEstudiantes" row-key="id" separator="cell"
              :pagination="{ rowsPerPage: 10 }" :loading="loadingEstudiantesDisponibles" selection="multiple"
              v-model:selected="estudiantesSeleccionados">
              <template v-slot:body-cell-codigo="props">
                <q-td :props="props">
                  <div class="text-weight-bold">{{ props.value }}</div>
                </q-td>
              </template>
            </q-table>

            <div class="text-center q-mt-md" v-if="estudiantesSeleccionados.length > 0">
              <q-btn color="deep-purple-9" icon="arrow_forward"
                :label="`Asignar ${estudiantesSeleccionados.length} Estudiante${estudiantesSeleccionados.length > 1 ? 's' : ''}`"
                @click="asignarEstudiantes"
                :loading="asignandoEstudiantes" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Lista de estudiantes asignados al grupo -->
      <div class="col-md-6 col-xs-12">
        <q-card class="shadow-3">
          <q-card-section class="bg-green-2">
            <div class="text-h6 text-green-10">
              Estudiantes Asignados al Grupo
              <q-chip v-if="estudiantesGrupo.length > 0"
                color="green-6"
                text-color="white"
                class="q-ml-sm">
                {{ estudiantesGrupo.length }} estudiantes
              </q-chip>
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="loadingEstudiantesGrupo" class="text-center q-pa-md">
              <q-spinner color="green" size="3em" />
              <div class="q-mt-sm">Cargando estudiantes del grupo...</div>
            </div>
            <div v-else-if="estudiantesGrupo.length === 0" class="text-center q-pa-lg">
              <q-icon name="group_off" size="3em" color="grey-7" />
              <div class="text-h6 text-grey-7 q-mt-sm">No hay estudiantes asignados a este grupo</div>
            </div>
            <q-table v-else :rows="estudiantesGrupo" :columns="columnsEstudiantesGrupo" row-key="id" separator="cell"
              :pagination="{ rowsPerPage: 10 }" :loading="loadingEstudiantesGrupo" selection="multiple"
              v-model:selected="estudiantesSeleccionadosRemover" />

            <div class="text-center q-mt-md" v-if="estudiantesGrupo.length > 0 && estudiantesSeleccionadosRemover.length > 0">
              <q-btn color="negative" icon="remove_circle"
                :label="`Remover ${estudiantesSeleccionadosRemover.length} Estudiante${estudiantesSeleccionadosRemover.length > 1 ? 's' : ''}`"
                @click="removerEstudiantes"
                :loading="removiendoEstudiantes" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Mensaje cuando no hay grupo seleccionado -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="groups" size="5em" color="grey-7" />
      <div class="text-h5 text-grey-7 q-mt-md">
        Seleccione una materia y un grupo para asignar estudiantes
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

// Variables reactivas
const loadingMaterias = ref(true)
const loadingGrupos = ref(false)
const loadingEstudiantesDisponibles = ref(false)
const loadingEstudiantesGrupo = ref(false)
const materias = ref([])
const grupos = ref([])
const selectedMateria = ref(null)
const selectedGrupo = ref(null)
const estudiantesDisponibles = ref([])
const estudiantesGrupo = ref([])
const estudiantesSeleccionados = ref([])
const estudiantesSeleccionadosRemover = ref([])
const searchEstudiante = ref('')
const asignandoEstudiantes = ref(false)
const removiendoEstudiantes = ref(false)
const gestionActiva = ref(null)

// Variable para acumular estudiantes encontrados
const estudiantesAcumulados = ref([])

// Columnas para la tabla de estudiantes disponibles
const columnsEstudiantes = [
  { name: 'codigo', label: 'Código', field: row => row.user?.name || 'Sin código', align: 'center' },
  { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left' },
  { name: 'apellidos', label: 'Apellidos', field: row => `${row.apellido1 || ''} ${row.apellido2 || ''}`.trim(), align: 'left' },
]

// Columnas para la tabla de estudiantes asignados
const columnsEstudiantesGrupo = [
  { name: 'codigo', label: 'Código', field: row => row.user?.name || 'Sin código', align: 'center' },
  { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left' },
  { name: 'apellidos', label: 'Apellidos', field: row => `${row.apellido1 || ''} ${row.apellido2 || ''}`.trim(), align: 'left' },
]

// Cargar materias y gestión activa al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      cargarMaterias(),
      cargarGestionActiva()
    ])
  } catch (error) {
    console.error('Error al inicializar:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar datos iniciales',
      icon: 'error'
    })
  }
})

// Función para manejar cambios en el campo de búsqueda
function onSearchChange(value) {
  // Si el valor es null o vacío (cuando se usa clear), establecer string vacío
  searchEstudiante.value = value || ''
}

// Función para cargar la gestión activa
async function cargarGestionActiva() {
  try {
    const response = await api.get('/gestiones/activa')
    gestionActiva.value = response.data
  } catch (error) {
    console.error('Error al cargar gestión activa:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar la gestión académica activa',
      icon: 'error'
    })
  }
}

// Función para cargar materias
async function cargarMaterias() {
  loadingMaterias.value = true
  try {
    const response = await api.get('/materias')
    materias.value = response.data
  } catch (error) {
    console.error('Error al cargar materias:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar materias',
      icon: 'error'
    })
  } finally {
    loadingMaterias.value = false
  }
}

// Función para cargar grupos por materia
async function loadGruposByMateria() {
  if (!selectedMateria.value) return

  selectedGrupo.value = null
  estudiantesDisponibles.value = []
  estudiantesSeleccionados.value = []
  estudiantesAcumulados.value = []
  loadingGrupos.value = true
  try {
    const response = await api.get(`/materias/${selectedMateria.value.id}/grupos`, {
      params: { gestion_id: 'activa' } // Obtener solo de la gestión activa
    })
    grupos.value = response.data
  } catch (error) {
    console.error('Error al cargar grupos:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar grupos de la materia',
      icon: 'error'
    })
  } finally {
    loadingGrupos.value = false
  }
}

// Función para cargar estudiantes de un grupo
async function loadEstudiantesGrupo() {
  if (!selectedGrupo.value) return

  loadingEstudiantesGrupo.value = true
  estudiantesSeleccionadosRemover.value = [] // Limpiar selección
  estudiantesDisponibles.value = [] // Limpiar lista de disponibles
  estudiantesSeleccionados.value = [] // Limpiar seleccionados
  estudiantesAcumulados.value = [] // Limpiar acumulados
  searchEstudiante.value = '' // Limpiar búsqueda

  try {
    const response = await api.get(`/grupos/${selectedGrupo.value}/estudiantes`)
    estudiantesGrupo.value = response.data
  } catch (error) {
    console.error('Error al cargar estudiantes del grupo:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar estudiantes del grupo',
      icon: 'error'
    })
  } finally {
    loadingEstudiantesGrupo.value = false
  }
}

// Función para buscar estudiantes disponibles
async function buscarEstudiantes() {
  if (!selectedGrupo.value) return

  // Validar que haya un término de búsqueda
  const searchTerm = searchEstudiante.value ? searchEstudiante.value.trim() : ''

  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar solo los estudiantes ya acumulados
    estudiantesDisponibles.value = [...estudiantesAcumulados.value]
    return
  }

  loadingEstudiantesDisponibles.value = true

  try {
    // Parámetros de búsqueda
    const params = {
      grupo_id: selectedGrupo.value,
      search: searchTerm
    }

    const response = await api.get('/estudiantes/disponibles', { params })
    const nuevosEstudiantes = response.data

    // Agregar los nuevos estudiantes encontrados a los acumulados (evitando duplicados)
    nuevosEstudiantes.forEach(estudiante => {
      const existe = estudiantesAcumulados.value.find(e => e.id === estudiante.id)
      if (!existe) {
        estudiantesAcumulados.value.push(estudiante)
      }
    })

    // Mostrar todos los estudiantes acumulados
    estudiantesDisponibles.value = [...estudiantesAcumulados.value]

    // Mantener las selecciones previas
    const idsSeleccionados = estudiantesSeleccionados.value.map(e => e.id)
    estudiantesSeleccionados.value = estudiantesDisponibles.value.filter(e =>
      idsSeleccionados.includes(e.id)
    )

  } catch (error) {
    console.error('Error al buscar estudiantes:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al buscar estudiantes disponibles',
      icon: 'error'
    })
  } finally {
    loadingEstudiantesDisponibles.value = false
  }
}

// Función para asignar estudiantes al grupo
async function asignarEstudiantes() {
  if (!selectedGrupo.value || estudiantesSeleccionados.value.length === 0) return

  asignandoEstudiantes.value = true
  try {
    const estudianteIds = estudiantesSeleccionados.value.map(est => est.id)

    await api.post(`/grupos/${selectedGrupo.value}/asignar-estudiantes`, {
      estudiante_ids: estudianteIds
    })

    $q.notify({
      color: 'positive',
      message: `${estudianteIds.length} estudiante(s) asignado(s) correctamente`,
      icon: 'check_circle'
    })

    // Limpiar datos después de asignar
    estudiantesSeleccionados.value = []
    estudiantesDisponibles.value = []
    estudiantesAcumulados.value = []
    searchEstudiante.value = ''

    // Recargar estudiantes del grupo
    await loadEstudiantesGrupo()

  } catch (error) {
    console.error('Error al asignar estudiantes:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Error al asignar estudiantes al grupo',
      icon: 'error'
    })
  } finally {
    asignandoEstudiantes.value = false
  }
}

// Función para remover estudiantes del grupo
async function removerEstudiantes() {
  if (!selectedGrupo.value || estudiantesSeleccionadosRemover.value.length === 0) return

  removiendoEstudiantes.value = true
  try {
    const estudianteIds = estudiantesSeleccionadosRemover.value.map(est => est.id)

    await api.post(`/grupos/${selectedGrupo.value}/remover-estudiantes`, {
      estudiante_ids: estudianteIds
    })

    $q.notify({
      color: 'positive',
      message: `${estudianteIds.length} estudiante(s) removido(s) correctamente`,
      icon: 'check_circle'
    })

    // Recargar datos
    estudiantesSeleccionadosRemover.value = []
    await loadEstudiantesGrupo()

  } catch (error) {
    console.error('Error al remover estudiantes:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Error al remover estudiantes del grupo',
      icon: 'error'
    })
  } finally {
    removiendoEstudiantes.value = false
  }
}
</script>

<style scoped>
.q-table th {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
