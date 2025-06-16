<template>
  <q-page padding>
    <!-- Encabezado -->
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-sm text-deep-purple-9">Mis Grupos</h1>
      <div>
      </div>
    </div>

    <!-- Tarjeta principal con tabla de grupos -->
    <q-card class="animate__animated animate__fadeIn">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <q-input
            v-model="busqueda"
            outlined
            dense
            placeholder="Buscar por materia o grupo"
            class="col-12 col-sm-4"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div class="col-12 col-sm-auto q-mt-sm q-mt-sm-none">
            <q-btn
              icon="picture_as_pdf"
              label="Exportar PDF"
              color="negative"
              class="q-mr-sm"
              @click="exportarPDF"
              :loading="exportandoPDF"
            />
            <q-btn
              icon="table_view"
              label="Exportar Excel"
              color="positive"
              @click="exportarExcel"
              :loading="exportandoExcel"
            />
          </div>
        </div>

        <q-table
          :rows="gruposFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          :loading="cargando"
          :filter="busqueda"
          binary-state-sort
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="materia" :props="props">
                {{ props.row.materia.nombre }}
              </q-td>
              <q-td key="nombre" :props="props">
                {{ props.row.nombre }}
              </q-td>
              <q-td key="gestion" :props="props">
                {{ props.row.gestion.nombre }} ({{ props.row.gestion.anio }})
              </q-td>
              <q-td key="estudiantes" :props="props">
                {{ getEstudiantesCount(props.row) }}
              </q-td>
              <q-td key="acciones" :props="props">
                <q-btn
                  color="primary"
                  icon="visibility"
                  size="sm"
                  flat
                  dense
                  @click="verEstudiantes(props.row)"
                  class="q-mr-xs"
                  tooltip="Ver estudiantes"
                />
                <q-btn
                  color="orange"
                  icon="picture_as_pdf"
                  size="sm"
                  flat
                  dense
                  @click="exportarGrupoPDF(props.row)"
                  class="q-mr-xs"
                  tooltip="Exportar a PDF"
                />
                <q-btn
                  color="green"
                  icon="table_view"
                  size="sm"
                  flat
                  dense
                  @click="exportarGrupoExcel(props.row)"
                  tooltip="Exportar a Excel"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner size="50px" color="primary" />
            </q-inner-loading>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-negative">
              <q-icon name="sentiment_dissatisfied" size="2rem" />
              <span class="q-ml-sm">No tienes grupos asignados para esta gestión</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para ver estudiantes -->
    <q-dialog v-model="mostrarEstudiantes" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="row items-center bg-deep-purple-9 text-white">
          <div class="text-h6">Estudiantes de {{ grupoSeleccionado.nombre }} - {{ grupoSeleccionado.materia?.nombre }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section style="max-height: 70vh" class="scroll">
          <div class="q-mb-md">
            <q-btn
              icon="picture_as_pdf"
              label="Exportar Lista PDF"
              color="negative"
              class="q-mr-sm"
              @click="exportarEstudiantesPDF"
              size="sm"
            />
            <q-btn
              icon="table_view"
              label="Exportar Lista Excel"
              color="positive"
              @click="exportarEstudiantesExcel"
              size="sm"
            />
          </div>

          <q-table
            :rows="estudiantesGrupo"
            :columns="columnsEstudiantes"
            row-key="id"
            :loading="cargandoEstudiantes"
            :pagination="{rowsPerPage: 0}"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner size="50px" color="primary" />
              </q-inner-loading>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-negative">
                <q-icon name="sentiment_dissatisfied" size="2rem" />
                <span class="q-ml-sm">No hay estudiantes inscritos en este grupo</span>
              </div>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import 'animate.css'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const cargando = ref(true)
const grupos = ref([])
const busqueda = ref('')
const pagination = ref({
  rowsPerPage: 10
})
const gestiones = ref([])
const gestionSeleccionada = ref(null)
const mostrarEstudiantes = ref(false)
const grupoSeleccionado = ref({})
const estudiantesGrupo = ref([])
const cargandoEstudiantes = ref(false)
const exportandoPDF = ref(false)
const exportandoExcel = ref(false)

// Definición de columnas para la tabla de grupos
const columns = [
  {
    name: 'materia',
    required: true,
    label: 'Materia',
    align: 'left',
    field: row => row.materia.nombre,
    sortable: true
  },
  {
    name: 'nombre',
    required: true,
    label: 'Grupo',
    align: 'left',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'gestion',
    required: true,
    label: 'Gestión',
    align: 'left',
    field: row => `${row.gestion.nombre} (${row.gestion.anio})`,
    sortable: true
  },
  {
    name: 'estudiantes',
    required: true,
    label: 'Estudiantes',
    align: 'center',
    field: row => getEstudiantesCount(row),
    sortable: true
  },
  {
    name: 'acciones',
    required: true,
    label: 'Acciones',
    align: 'center',
    field: 'id'
  }
]

// Definición de columnas para la tabla de estudiantes
const columnsEstudiantes = [
  {
    name: 'nombres',
    required: true,
    label: 'Nombres',
    align: 'left',
    field: 'nombres',
    sortable: true
  },
  {
    name: 'apellidos',
    required: true,
    label: 'Apellidos',
    align: 'left',
    field: row => `${row.apellido1} ${row.apellido2}`,
    sortable: true
  },
  {
    name: 'correo',
    label: 'Correo',
    align: 'left',
    field: 'correo',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    align: 'left',
    field: 'telefono'
  }
]

// Computed para opciones de gestión
const gestionesOptions = computed(() => {
  return gestiones.value.map(g => ({
    id: g.id,
    nombre: `${g.nombre} (${g.anio})`
  }))
})

  // Computed para filtrar grupos por gestión seleccionada
const gruposFiltrados = computed(() => {
  if (!gestionSeleccionada.value) return grupos.value

  return grupos.value.filter(g => g.gestion_id === gestionSeleccionada.value.id)
})

// Función para obtener el número de estudiantes de un grupo
function getEstudiantesCount(grupo) {
  // Verificar si existe la relación inscripciones
  if (grupo.inscripciones) {
    return grupo.inscripciones.length
  }

  // Verificar si existe la relación inscripcions (nombre en español singular)
  if (grupo.inscripcions) {
    return grupo.inscripcions.length
  }

  // Si existe un contador precomputado desde el backend
  if (grupo.estudiantes_count !== undefined) {
    return grupo.estudiantes_count
  }

  return 0
}

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarGestiones()
  await cargarGrupos()
})

// Función para cargar gestiones académicas
async function cargarGestiones() {
  try {
    const response = await api.get('/gestiones')
    gestiones.value = response.data.gestiones || []

    // Intentar seleccionar la gestión activa por defecto
    const gestionActiva = gestiones.value.find(g => g.estado === 1)
    if (gestionActiva) {
      gestionSeleccionada.value = {
        id: gestionActiva.id,
        nombre: `${gestionActiva.nombre} (${gestionActiva.anio})`
      }
    } else if (gestiones.value.length > 0) {
      gestionSeleccionada.value = {
        id: gestiones.value[0].id,
        nombre: `${gestiones.value[0].nombre} (${gestiones.value[0].anio})`
      }
    }
  } catch (error) {
    console.error('Error al cargar gestiones:', error)
    $q.notify({
      message: 'Error al cargar las gestiones académicas',
      color: 'negative'
    })
  }
}

// Función para cargar grupos del docente
async function cargarGrupos() {
  cargando.value = true
  try {
    const docenteId = localStorage.getItem('docente_id')
    if (!docenteId) {
      $q.notify({
        message: 'No se pudo identificar al docente',
        color: 'negative'
      })
      cargando.value = false
      return
    }

    // Este endpoint debe ser implementado en el backend
    const response = await api.get('/docentes/grupos')
    grupos.value = response.data.grupos || []
  } catch (error) {
    console.error('Error al cargar grupos:', error)
    $q.notify({
      message: 'Error al cargar los grupos',
      color: 'negative'
    })

    // DATOS DE PRUEBA (ELIMINAR EN PRODUCCIÓN)
    // Estos datos son solo para demostrar la funcionalidad mientras se implementa el endpoint real
    grupos.value = [
      {
        id: 1,
        nombre: 'Grupo A',
        materia: { id: 1, nombre: 'Pediatría' },
        gestion: { id: 1, nombre: 'Segundo Semestre', anio: 2025 },
        gestion_id: 1,
        inscripciones: [
          { id: 1, estudiante: { id: 1, nombres: 'Juan', apellido1: 'Pérez', apellido2: 'López', correo: 'juan.perez@ejemplo.com', telefono: '70123456' } },
          { id: 2, estudiante: { id: 2, nombres: 'María', apellido1: 'Gómez', apellido2: 'Ríos', correo: 'maria.gomez@ejemplo.com', telefono: '71234567' } }
        ]
      },
      {
        id: 2,
        nombre: 'Grupo B',
        materia: { id: 1, nombre: 'Pediatría' },
        gestion: { id: 1, nombre: 'Segundo Semestre', anio: 2025 },
        gestion_id: 1,
        inscripciones: [
          { id: 3, estudiante: { id: 3, nombres: 'Carlos', apellido1: 'Rodríguez', apellido2: 'Vargas', correo: 'carlos.rodriguez@ejemplo.com', telefono: '72345678' } }
        ]
      },
      {
        id: 3,
        nombre: 'Grupo A',
        materia: { id: 2, nombre: 'Cardiología' },
        gestion: { id: 2, nombre: 'Primer Semestre', anio: 2025 },
        gestion_id: 2,
        inscripciones: [
          { id: 4, estudiante: { id: 4, nombres: 'Ana', apellido1: 'Martínez', apellido2: 'Suárez', correo: 'ana.martinez@ejemplo.com', telefono: '73456789' } },
          { id: 5, estudiante: { id: 5, nombres: 'Roberto', apellido1: 'Sánchez', apellido2: 'Torres', correo: 'roberto.sanchez@ejemplo.com', telefono: '74567890' } },
          { id: 6, estudiante: { id: 6, nombres: 'Lucía', apellido1: 'Fernández', apellido2: 'Rojas', correo: 'lucia.fernandez@ejemplo.com', telefono: '75678901' } }
        ]
      }
    ]
  } finally {
    cargando.value = false
  }
}

// Función para ver estudiantes de un grupo
async function verEstudiantes(grupo) {
  grupoSeleccionado.value = grupo
  mostrarEstudiantes.value = true
  cargandoEstudiantes.value = true

  try {
    // Intentar obtener estudiantes según las diferentes relaciones posibles
    if (grupo.inscripciones && grupo.inscripciones.length > 0) {
      estudiantesGrupo.value = grupo.inscripciones.map(inscripcion => inscripcion.estudiante)
    } else if (grupo.inscripcions && grupo.inscripcions.length > 0) {
      estudiantesGrupo.value = grupo.inscripcions.map(inscripcion => inscripcion.estudiante)
    } else {
      // Si no, los cargamos del backend
      const response = await api.get(`/grupos/${grupo.id}/estudiantes`)
      estudiantesGrupo.value = response.data.estudiantes || []
    }
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
    $q.notify({
      message: 'Error al cargar la lista de estudiantes',
      color: 'negative'
    })
  } finally {
    cargandoEstudiantes.value = false
  }
}

// Función para exportar todos los grupos a PDF
function exportarPDF() {
  exportandoPDF.value = true
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text('Listado de Grupos Asignados', 14, 20)

    // Información del docente
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      doc.setFontSize(12)
      doc.text(`Docente: ${user.name}`, 14, 30)
    }

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.text(`Fecha: ${fecha}`, 14, 40)

    // Filtro de gestión
    if (gestionSeleccionada.value) {
      doc.text(`Gestión: ${gestionSeleccionada.value.nombre}`, 14, 50)
    }

    // Tabla de grupos
    const tableColumn = ["Materia", "Grupo", "Gestión", "Estudiantes"]
    const tableRows = []

    gruposFiltrados.value.forEach(grupo => {
      const gestionStr = `${grupo.gestion.nombre} (${grupo.gestion.anio})`
      const estudiantesCount = getEstudiantesCount(grupo)

      tableRows.push([
        grupo.materia.nombre,
        grupo.nombre,
        gestionStr,
        estudiantesCount
      ])
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] }
    })

    // Guardar PDF
    doc.save('grupos-docente.pdf')

    $q.notify({
      message: 'Archivo PDF generado correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF',
      color: 'negative'
    })
  } finally {
    exportandoPDF.value = false
  }
}

// Función para exportar todos los grupos a Excel
function exportarExcel() {
  exportandoExcel.value = true
  try {
    // Preparar datos para Excel
    const data = gruposFiltrados.value.map(grupo => {
      return {
        'Materia': grupo.materia.nombre,
        'Grupo': grupo.nombre,
        'Gestión': `${grupo.gestion.nombre} (${grupo.gestion.anio})`,
        'Estudiantes': grupo.inscripciones ? grupo.inscripciones.length : 0
      }
    })

    // Crear un libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos')

    // Guardar el archivo
    XLSX.writeFile(workbook, 'grupos-docente.xlsx')

    $q.notify({
      message: 'Archivo Excel generado correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar Excel:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel',
      color: 'negative'
    })
  } finally {
    exportandoExcel.value = false
  }
}

// Función para exportar un grupo específico a PDF
function exportarGrupoPDF(grupo) {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Grupo: ${grupo.nombre} - ${grupo.materia.nombre}`, 14, 20)

    // Información del grupo
    doc.setFontSize(12)
    doc.text(`Gestión: ${grupo.gestion.nombre} (${grupo.gestion.anio})`, 14, 30)
    doc.text(`Cantidad de estudiantes: ${getEstudiantesCount(grupo)}`, 14, 40)

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.text(`Fecha de emisión: ${fecha}`, 14, 50)

    // Verificar si podemos acceder a los estudiantes
    const tieneEstudiantes = (grupo.inscripciones && grupo.inscripciones.length > 0) ||
                            (grupo.inscripcions && grupo.inscripcions.length > 0)

    // Si tiene estudiantes inscritos, mostrarlos
    if (tieneEstudiantes) {
      // Determinar qué relación usar
      const inscripciones = grupo.inscripciones || grupo.inscripcions

      // Encabezados de la tabla
      const tableColumn = ["Nombres", "Apellidos", "Correo", "Teléfono"]
      const tableRows = []

      // Llenar filas con datos de estudiantes
      inscripciones.forEach(inscripcion => {
        const estudiante = inscripcion.estudiante
        tableRows.push([
          estudiante.nombres,
          `${estudiante.apellido1} ${estudiante.apellido2}`,
          estudiante.correo || 'No registrado',
          estudiante.telefono || 'No registrado'
        ])
      })

      // Generar tabla
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [75, 0, 130] }
      })
    } else {
      doc.text('No hay estudiantes inscritos en este grupo', 14, 60)
    }

    // Guardar PDF
    doc.save(`grupo-${grupo.nombre}-${grupo.materia.nombre}.pdf`)

    $q.notify({
      message: 'Archivo PDF del grupo generado correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar PDF del grupo:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF del grupo',
      color: 'negative'
    })
  }
}

// Función para exportar un grupo específico a Excel
function exportarGrupoExcel(grupo) {
  try {
    // Verificar si podemos acceder a los estudiantes
    const tieneEstudiantes = (grupo.inscripciones && grupo.inscripciones.length > 0) ||
                            (grupo.inscripcions && grupo.inscripcions.length > 0)

    // Si no tiene estudiantes inscritos
    if (!tieneEstudiantes) {
      $q.notify({
        message: 'No hay estudiantes inscritos en este grupo para exportar',
        color: 'warning'
      })
      return
    }

    // Determinar qué relación usar
    const inscripciones = grupo.inscripciones || grupo.inscripcions

    // Preparar datos para Excel
    const data = inscripciones.map(inscripcion => {
      const estudiante = inscripcion.estudiante
      return {
        'Nombres': estudiante.nombres,
        'Apellidos': `${estudiante.apellido1} ${estudiante.apellido2}`,
        'Correo': estudiante.correo || 'No registrado',
        'Teléfono': estudiante.telefono || 'No registrado'
      }
    })

    // Crear un libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes')

    // Guardar el archivo
    XLSX.writeFile(workbook, `grupo-${grupo.nombre}-${grupo.materia.nombre}.xlsx`)

    $q.notify({
      message: 'Archivo Excel del grupo generado correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar Excel del grupo:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel del grupo',
      color: 'negative'
    })
  }
}

// Función para exportar lista de estudiantes a PDF (desde el modal)
function exportarEstudiantesPDF() {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Estudiantes - ${grupoSeleccionado.value.nombre} - ${grupoSeleccionado.value.materia?.nombre}`, 14, 20)

    // Información del grupo
    doc.setFontSize(12)
    doc.text(`Gestión: ${grupoSeleccionado.value.gestion?.nombre} (${grupoSeleccionado.value.gestion?.anio})`, 14, 30)
    doc.text(`Cantidad de estudiantes: ${estudiantesGrupo.value.length}`, 14, 40)

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.text(`Fecha de emisión: ${fecha}`, 14, 50)

    // Tabla de estudiantes
    const tableColumn = ["Nombres", "Apellidos", "Correo", "Teléfono"]
    const tableRows = []

    estudiantesGrupo.value.forEach(estudiante => {
      tableRows.push([
        estudiante.nombres,
        `${estudiante.apellido1} ${estudiante.apellido2}`,
        estudiante.correo || 'No registrado',
        estudiante.telefono || 'No registrado'
      ])
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] }
    })

    // Guardar PDF
    doc.save(`estudiantes-${grupoSeleccionado.value.nombre}-${grupoSeleccionado.value.materia?.nombre}.pdf`)

    $q.notify({
      message: 'Lista de estudiantes exportada a PDF correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar lista de estudiantes a PDF:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF de estudiantes',
      color: 'negative'
    })
  }
}

// Función para exportar lista de estudiantes a Excel (desde el modal)
function exportarEstudiantesExcel() {
  try {
    // Preparar datos para Excel
    const data = estudiantesGrupo.value.map(estudiante => {
      return {
        'Nombres': estudiante.nombres,
        'Apellidos': `${estudiante.apellido1} ${estudiante.apellido2}`,
        'Correo': estudiante.correo || 'No registrado',
        'Teléfono': estudiante.telefono || 'No registrado'
      }
    })

    // Crear un libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes')

    // Guardar el archivo
    XLSX.writeFile(workbook, `estudiantes-${grupoSeleccionado.value.nombre}-${grupoSeleccionado.value.materia?.nombre}.xlsx`)

    $q.notify({
      message: 'Lista de estudiantes exportada a Excel correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar lista de estudiantes a Excel:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel de estudiantes',
      color: 'negative'
    })
  }
}
</script>

<style scoped>
.q-table__card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.q-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
