<template>
  <q-page padding class="bg-grey-1">
    <div class="row q-mb-md">
      <div class="col-12">
        <q-card class="bg-deep-purple-10 text-white">
          <q-card-section>
            <div class="text-h5">Reporte de Usuarios</div>
            <div class="text-subtitle2">Filtrar y descargar información de usuarios del sistema</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md animate__animated animate__fadeIn">
      <q-card-section>
        <div class="text-h6 q-mb-md">Filtros</div>
        <div class="row q-col-gutter-md">
          <!-- Tipo de usuario -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.tipoUsuario" :options="opcionesTipoUsuario" label="Tipo de Usuario" outlined
              dense emit-value map-options clearable @update:model-value="cargarUsuarios" />
          </div>

          <!-- Gestión -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.gestionId" :options="opcionesGestiones" label="Gestión Académica" outlined dense
              emit-value map-options clearable @update:model-value="cargarGrupos" />
          </div>

          <!-- Materia -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.materiaId" :options="opcionesMaterias" label="Materia" outlined dense emit-value
              map-options clearable :disable="!filtros.gestionId" @update:model-value="cargarGrupos" />
          </div>

          <!-- Grupo -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.grupoId" :options="opcionesGrupos" label="Grupo" outlined dense emit-value
              map-options clearable :disable="!filtros.materiaId" @update:model-value="cargarUsuarios" />
          </div>
        </div>

        <div class="row q-mt-md">
          <div class="col-12">
            <q-btn color="primary" icon="search" label="Buscar" @click="cargarUsuarios" :loading="cargando"
              class="q-mr-sm" />
            <q-btn color="green" icon="download" label="Descargar Excel" @click="descargarExcel"
              :disable="usuarios.length === 0" class="q-mr-sm" />
            <q-btn color="deep-orange" icon="picture_as_pdf" label="Descargar PDF" @click="descargarPDF"
              :disable="usuarios.length === 0" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de resultados -->
    <q-card class="animate__animated animate__fadeIn">
      <q-card-section>
        <div class="text-h6 q-mb-md">Resultados</div>
        <div class="text-caption text-grey-8 q-mb-xs" v-if="usuarios.length > 0">
          {{ usuarios.length }} usuarios encontrados
        </div>

        <q-table :rows="usuarios" :columns="columns" row-key="id" :loading="cargando" :filter="filtroTexto"
          v-model:pagination="pagination" flat bordered>
          <template v-slot:top-right>
            <q-input v-model="filtroTexto" outlined dense placeholder="Buscar en resultados" class="q-ml-md" clearable>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="props.value ? 'positive' : 'negative'">
                {{ props.value ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { exportFile } from 'quasar'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default defineComponent({
  name: 'ReporteUsuarios',

  setup() {
    const $q = useQuasar()
    const cargando = ref(false)
    const usuarios = ref([])
    const filtroTexto = ref('')
    const opcionesGestiones = ref([])
    const opcionesMaterias = ref([])
    const opcionesGrupos = ref([])

    const pagination = ref({
      sortBy: 'apellido1',
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0
    })

    const opcionesTipoUsuario = [
      { label: 'Estudiantes', value: 'estudiantes' },
      { label: 'Docentes', value: 'docentes' },
      { label: 'Todos', value: 'todos' }
    ]

    const filtros = reactive({
      tipoUsuario: 'todos',
      gestionId: null,
      materiaId: null,
      grupoId: null
    })

    const columns = [
      {
        name: 'id',
        label: 'ID',
        field: 'id',
        sortable: true,
        align: 'left'
      },
      {
        name: 'tipo',
        label: 'Tipo',
        field: 'tipo',
        sortable: true,
        align: 'left'
      },
      {
        name: 'nombres',
        label: 'Nombres',
        field: 'nombres',
        sortable: true,
        align: 'left'
      },
      {
        name: 'apellidos',
        label: 'Apellidos',
        field: row => row.apellido1 ? `${row.apellido1} ${row.apellido2 || ''}` : row.apellidos,
        sortable: true,
        align: 'left'
      },
      {
        name: 'correo',
        label: 'Correo',
        field: 'correo',
        sortable: true,
        align: 'left'
      },
      {
        name: 'telefono',
        label: 'Teléfono',
        field: 'telefono',
        sortable: true,
        align: 'left'
      },
      {
        name: 'estado',
        label: 'Estado',
        field: 'estado',
        sortable: true,
        align: 'center'
      }
    ]

    // Cargar datos iniciales
    onMounted(() => {
      cargarGestiones()
      cargarMaterias()
      cargarUsuarios()
    })

    // Cargar gestiones académicas
    const cargarGestiones = async () => {
      try {
        const response = await api.get('/gestiones')
        opcionesGestiones.value = response.data.map(gestion => ({
          label: `${gestion.nombre} ${gestion.anio}`,
          value: gestion.id
        }))
      } catch (error) {
        console.error('Error al cargar gestiones:', error)
        $q.notify({
          message: 'Error al cargar gestiones académicas',
          color: 'negative'
        })
      }
    }

    // Cargar materias
    const cargarMaterias = async () => {
      try {
        const response = await api.get('/materias')
        opcionesMaterias.value = response.data.map(materia => ({
          label: materia.nombre,
          value: materia.id
        }))
      } catch (error) {
        console.error('Error al cargar materias:', error)
        $q.notify({
          message: 'Error al cargar materias',
          color: 'negative'
        })
      }
    }

    // Cargar grupos según la materia y gestión seleccionadas
    const cargarGrupos = async () => {
      try {
        if (!filtros.materiaId || !filtros.gestionId) {
          opcionesGrupos.value = []
          filtros.grupoId = null
          return
        }

        const response = await api.get(`/materias/${filtros.materiaId}/grupos`, {
          params: { gestion_id: filtros.gestionId }
        })

        opcionesGrupos.value = response.data.map(grupo => ({
          label: grupo.nombre,
          value: grupo.id
        }))
      } catch (error) {
        console.error('Error al cargar grupos:', error)
        $q.notify({
          message: 'Error al cargar grupos',
          color: 'negative'
        })
      }
    }

    // Cargar usuarios según los filtros
    const cargarUsuarios = async () => {
      cargando.value = true
      usuarios.value = []

      try {
        const response = await api.get('/reportes/usuarios', {
          params: {
            tipo: filtros.tipoUsuario,
            gestion_id: filtros.gestionId,
            materia_id: filtros.materiaId,
            grupo_id: filtros.grupoId
          }
        })

        usuarios.value = response.data.data
        pagination.value.rowsNumber = usuarios.value.length
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        $q.notify({
          message: 'Error al cargar datos de usuarios',
          color: 'negative'
        })
      } finally {
        cargando.value = false
      }
    }

    // Descargar reporte en Excel
    const descargarExcel = () => {
      try {
        // Formatear datos para el Excel
        const data = usuarios.value.map(user => ({
          ID: user.id,
          Tipo: user.tipo,
          Nombres: user.nombres,
          Apellidos: user.apellido1 ? `${user.apellido1} ${user.apellido2 || ''}` : user.apellidos,
          Correo: user.correo,
          Teléfono: user.telefono,
          Estado: user.estado ? 'Activo' : 'Inactivo',
          ...(user.grupos ? { Grupos: user.grupos } : {}),
          ...(user.materias ? { Materias: user.materias } : {})
        }))

        // Crear workbook y worksheet
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')

        // Configurar ancho de columnas
        const colWidths = [
          { wch: 5 },  // ID
          { wch: 10 }, // Tipo
          { wch: 20 }, // Nombres
          { wch: 25 }, // Apellidos
          { wch: 30 }, // Correo
          { wch: 15 }, // Teléfono
          { wch: 10 }, // Estado
          { wch: 30 }, // Grupos (opcional)
          { wch: 30 }  // Materias (opcional)
        ]
        worksheet['!cols'] = colWidths

        // Generar archivo y descargar
        const fechaActual = new Date().toISOString().slice(0, 10)
        const nombreArchivo = `reporte_usuarios_${fechaActual}.xlsx`
        XLSX.writeFile(workbook, nombreArchivo)

        $q.notify({
          message: 'Reporte Excel descargado correctamente',
          color: 'positive'
        })
      } catch (error) {
        console.error('Error al descargar Excel:', error)
        $q.notify({
          message: 'Error al generar el archivo Excel',
          color: 'negative'
        })
      }
    }

    // Descargar reporte en PDF
    const descargarPDF = async () => {
      try {
        // Mostrar indicador de carga
        $q.loading.show({
          message: 'Generando PDF...'
        });

        // Importar html2pdf dinámicamente
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default;

        // Crear un elemento temporal para la tabla
        const element = document.createElement('div');
        element.style.padding = '20px';

        // Crear encabezado con estilos
        const header = document.createElement('h2');
        header.textContent = 'Reporte de Usuarios';
        header.style.color = '#512da8';
        header.style.marginBottom = '5px';
        element.appendChild(header);

        // Añadir fecha
        const fecha = document.createElement('p');
        fecha.textContent = `Fecha de generación: ${new Date().toLocaleDateString()}`;
        fecha.style.marginBottom = '15px';
        element.appendChild(fecha);

        // Añadir información de filtros
        let textoFiltros = 'Filtros aplicados: ';
        if (filtros.tipoUsuario !== 'todos') {
          const tipoTexto = filtros.tipoUsuario === 'estudiantes' ? 'Estudiantes' :
            filtros.tipoUsuario === 'docentes' ? 'Docentes' : '';
          if (tipoTexto) textoFiltros += `Tipo: ${tipoTexto}, `;
        }
        if (filtros.gestionId) {
          const gestion = opcionesGestiones.value.find(g => g.value === filtros.gestionId);
          if (gestion) textoFiltros += `Gestión: ${gestion.label}, `;
        }
        if (filtros.materiaId) {
          const materia = opcionesMaterias.value.find(m => m.value === filtros.materiaId);
          if (materia) textoFiltros += `Materia: ${materia.label}, `;
        }
        if (filtros.grupoId) {
          const grupo = opcionesGrupos.value.find(g => g.value === filtros.grupoId);
          if (grupo) textoFiltros += `Grupo: ${grupo.label}, `;
        }

        if (textoFiltros !== 'Filtros aplicados: ') {
          textoFiltros = textoFiltros.slice(0, -2); // Quitar última coma
          const filtrosElement = document.createElement('p');
          filtrosElement.textContent = textoFiltros;
          filtrosElement.style.marginBottom = '20px';
          filtrosElement.style.fontSize = '12px';
          filtrosElement.style.color = '#666';
          element.appendChild(filtrosElement);
        }

        // Añadir contador de resultados
        const contador = document.createElement('p');
        contador.textContent = `${usuarios.value.length} usuarios encontrados`;
        contador.style.marginBottom = '10px';
        contador.style.fontSize = '12px';
        element.appendChild(contador);

        // Crear tabla
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';
        table.style.fontSize = '12px';

        // Crear encabezado de tabla
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        ['ID', 'Tipo', 'Nombres', 'Apellidos', 'Correo', 'Teléfono', 'Estado'].forEach(text => {
          const th = document.createElement('th');
          th.textContent = text;
          th.style.backgroundColor = '#512da8';
          th.style.color = 'white';
          th.style.padding = '8px';
          th.style.textAlign = 'left';
          th.style.fontWeight = 'bold';
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Crear cuerpo de tabla
        const tbody = document.createElement('tbody');

        usuarios.value.forEach((user, index) => {
          const row = document.createElement('tr');
          row.style.backgroundColor = index % 2 === 0 ? '#f2f2f2' : 'white';

          // Añadir celdas
          [
            user.id,
            user.tipo,
            user.nombres,
            user.apellido1 ? `${user.apellido1} ${user.apellido2 || ''}` : user.apellidos,
            user.correo || '',
            user.telefono || '',
            user.estado ? 'Activo' : 'Inactivo'
          ].forEach((text, cellIndex) => {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #ddd';

            // Aplicar estilo especial a la columna de estado
            if (cellIndex === 6) {
              td.style.fontWeight = 'bold';
              td.style.color = text === 'Activo' ? 'green' : 'red';
            }

            row.appendChild(td);
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        element.appendChild(table);

        // Añadir pie de página
        const footer = document.createElement('div');
        footer.style.marginTop = '20px';
        footer.style.fontSize = '10px';
        footer.style.color = '#666';
        footer.style.textAlign = 'center';
        footer.textContent = 'Sistema de Medicina - Reporte generado automáticamente';
        element.appendChild(footer);

        // Opciones para html2pdf
        const opt = {
          margin: [15, 15, 15, 15],
          filename: `reporte_usuarios_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        // Generar PDF
        await html2pdf().from(element).set(opt).save();

        // Ocultar indicador de carga
        $q.loading.hide();

        $q.notify({
          message: 'Reporte PDF descargado correctamente',
          color: 'positive',
          position: 'top'
        });
      } catch (error) {
        // Ocultar indicador de carga en caso de error
        $q.loading.hide();

        console.error('Error al descargar PDF:', error);
        $q.notify({
          message: `Error al generar el archivo PDF: ${error.message}`,
          color: 'negative',
          position: 'top'
        });
      }
    };

    return {
      cargando,
      usuarios,
      filtroTexto,
      filtros,
      opcionesTipoUsuario,
      opcionesGestiones,
      opcionesMaterias,
      opcionesGrupos,
      columns,
      pagination,
      cargarUsuarios,
      cargarGrupos,
      descargarExcel,
      descargarPDF
    }
  }
})
</script>

<style scoped>
.animate__animated {
  animation-duration: 0.5s;
}
</style>
