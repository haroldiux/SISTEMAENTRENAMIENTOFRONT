<template>
  <div class="q-pa-md">
    <q-card class="my-card">
      <q-card-section class="bg-deep-purple-7 text-white">
        <div class="text-h6">Importar Usuarios desde Excel</div>
      </q-card-section>

      <q-card-section>
        <p class="text-body1">
          Sube un archivo Excel con los datos de los usuarios. El sistema creará automáticamente
          las cuentas de usuario y sus perfiles correspondientes.
        </p>

        <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
          narrow-indicator>
          <q-tab name="estudiantes" label="Estudiantes" />
          <q-tab name="docentes" label="Docentes" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="estudiantes">
            <div class="text-h6 q-mb-md">Importar Estudiantes</div>
            <p>
              El archivo Excel debe contener las siguientes columnas:
            </p>
            <ul>
              <li><strong>codigo:</strong> Código de estudiante (se usará como nombre de usuario y contraseña) <span
                  class="text-negative">*</span></li>
              <li><strong>nombres:</strong> Nombres del estudiante <span class="text-negative">*</span></li>
              <li><strong>apellido1:</strong> Primer apellido <span class="text-negative">*</span></li>
              <li><strong>apellido2:</strong> Segundo apellido</li>
              <li><strong>correo:</strong> Correo electrónico (opcional, pero debe ser único si se proporciona)</li>
              <li><strong>telefono:</strong> Número de teléfono (opcional, pero debe ser único si se proporciona)</li>
            </ul>
            <p class="text-caption text-negative">* Campos obligatorios</p>

            <q-separator spaced />

            <q-file v-model="estudiantesFile" label="Seleccionar archivo Excel" filled accept=".xlsx, .xls"
              :loading="loadingEstudiantes" @update:model-value="onFileSelected('estudiantes')">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn class="q-mt-md" color="primary" label="Importar Estudiantes" :loading="loadingEstudiantes"
              :disable="!estudiantesFile" @click="importarUsuarios('estudiantes')" />

            <template v-if="resultadosEstudiantes.length > 0">
              <q-separator spaced />
              <div class="text-h6 q-mb-md">Resultados de la importación</div>
              <q-list bordered separator>
                <q-item v-for="(resultado, index) in resultadosEstudiantes" :key="index">
                  <q-item-section>
                    <q-item-label>
                      <q-icon :name="resultado.exito ? 'check_circle' : 'error'"
                        :color="resultado.exito ? 'positive' : 'negative'" size="sm" class="q-mr-sm" />
                      {{ resultado.mensaje }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-tab-panel>

          <q-tab-panel name="docentes">
            <div class="text-h6 q-mb-md">Importar Docentes</div>
            <p>
              El archivo Excel debe contener las siguientes columnas:
            </p>
            <ul>
              <li><strong>ci:</strong> Cédula de identidad (se usará como nombre de usuario y contraseña) <span
                  class="text-negative">*</span></li>
              <li><strong>nombres:</strong> Nombres del docente <span class="text-negative">*</span></li>
              <li><strong>apellidos:</strong> Apellidos del docente <span class="text-negative">*</span></li>
              <li><strong>correo:</strong> Correo electrónico (opcional, pero debe ser único si se proporciona)</li>
              <li><strong>telefono:</strong> Número de teléfono (opcional, pero debe ser único si se proporciona)</li>
            </ul>
            <p class="text-caption text-negative">* Campos obligatorios</p>

            <q-separator spaced />

            <q-file v-model="docentesFile" label="Seleccionar archivo Excel" filled accept=".xlsx, .xls"
              :loading="loadingDocentes" @update:model-value="onFileSelected('docentes')">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn class="q-mt-md" color="primary" label="Importar Docentes" :loading="loadingDocentes"
              :disable="!docentesFile" @click="importarUsuarios('docentes')" />

            <template v-if="resultadosDocentes.length > 0">
              <q-separator spaced />
              <div class="text-h6 q-mb-md">Resultados de la importación</div>
              <q-list bordered separator>
                <q-item v-for="(resultado, index) in resultadosDocentes" :key="index">
                  <q-item-section>
                    <q-item-label>
                      <q-icon :name="resultado.exito ? 'check_circle' : 'error'"
                        :color="resultado.exito ? 'positive' : 'negative'" size="sm" class="q-mr-sm" />
                      {{ resultado.mensaje }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-section v-if="filePreview.length > 0">
        <div class="text-h6 q-mb-md">Vista previa del archivo</div>
        <q-table :rows="filePreview" :columns="previewColumns" row-key="index" dense flat
          :pagination="{ rowsPerPage: 5 }" />
      </q-card-section>
    </q-card>

    <!-- Plantillas de ejemplo para descargar -->
    <q-card class="my-card q-mt-md">
      <q-card-section class="bg-green-7 text-white">
        <div class="text-h6">Plantillas de Excel</div>
      </q-card-section>
      <q-card-section>
        <p>Descarga estas plantillas para llenar con los datos de los usuarios:</p>
        <q-btn color="green" icon="download" label="Plantilla Estudiantes" flat
          @click="descargarPlantilla('estudiantes')" />
        <q-btn color="green" icon="download" label="Plantilla Docentes" flat @click="descargarPlantilla('docentes')" />
        <div class="q-mt-sm">
          <q-btn color="teal" icon="download" label="Alt. Plantilla Estudiantes" flat size="sm"
            @click="descargarPlantillaAlternativa('estudiantes')" />
          <q-btn color="teal" icon="download" label="Alt. Plantilla Docentes" flat size="sm"
            @click="descargarPlantillaAlternativa('docentes')" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { api } from 'boot/axios'
import axios from 'axios'
import { useQuasar } from 'quasar'

export default {
  name: 'ImportarUsuarios',
  setup() {
    const $q = useQuasar()
    const tab = ref('estudiantes')
    const estudiantesFile = ref(null)
    const docentesFile = ref(null)
    const loadingEstudiantes = ref(false)
    const loadingDocentes = ref(false)
    const resultadosEstudiantes = ref([])
    const resultadosDocentes = ref([])
    const filePreview = ref([])
    const previewColumns = ref([])

    // Función para manejar la selección de archivo
    const onFileSelected = async (tipo) => {
      try {
        const file = tipo === 'estudiantes' ? estudiantesFile.value : docentesFile.value
        if (!file) return

        // Limpiar vista previa anterior
        filePreview.value = []
        previewColumns.value = []

        // Asegúrate de que file.name exista y sea un archivo válido
        console.log("Archivo seleccionado:", file.name, file.type, file.size);

        // Generar vista previa del archivo
        const formData = new FormData()
        formData.append('file', file, file.name)
        formData.append('tipo', tipo)

        // Enviar archivo para vista previa
        const response = await api.post('/importar-usuarios/preview', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Establecer columnas para la tabla de vista previa
          const columnas = []
          if (response.data.headers && response.data.headers.length > 0) {
            response.data.headers.forEach((header, index) => {
              columnas.push({
                name: header,
                label: header.charAt(0).toUpperCase() + header.slice(1),
                field: header,
                align: 'left'
              })
            })
          }
          previewColumns.value = columnas

          // Establecer datos para la vista previa
          filePreview.value = response.data.preview || []

          $q.notify({
            color: 'positive',
            message: 'Vista previa generada correctamente',
            icon: 'check_circle'
          })
        } else {
          $q.notify({
            color: 'negative',
            message: response.data.message || 'Error al generar vista previa del archivo',
            icon: 'error'
          })

          // Limpiar el archivo seleccionado
          if (tipo === 'estudiantes') {
            estudiantesFile.value = null
          } else {
            docentesFile.value = null
          }
        }
      } catch (error) {
        console.error('Error al generar vista previa:', error);

        // Mostrar detalles específicos de los errores de validación
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            // Mostrar cada error de validación
            const errores = Object.values(error.response.data.errors).flat();
            errores.forEach(err => {
              $q.notify({
                color: 'negative',
                message: err,
                icon: 'error',
                timeout: 5000
              });
            });
          } else if (error.response.data.message) {
            // Mostrar mensaje de error del servidor
            $q.notify({
              color: 'negative',
              message: error.response.data.message,
              icon: 'error',
              timeout: 5000
            });
          }
        } else {
          $q.notify({
            color: 'negative',
            message: 'Error al procesar el archivo. Verifica que sea un archivo Excel válido.',
            icon: 'error'
          });
        }

        // Limpiar el archivo seleccionado
        if (tipo === 'estudiantes') {
          estudiantesFile.value = null
        } else {
          docentesFile.value = null
        }
      }
    }

    // Función para importar usuarios
    const importarUsuarios = async (tipo) => {
      try {
        // Establecer estado de carga
        if (tipo === 'estudiantes') {
          loadingEstudiantes.value = true
          resultadosEstudiantes.value = []
        } else {
          loadingDocentes.value = true
          resultadosDocentes.value = []
        }

        const file = tipo === 'estudiantes' ? estudiantesFile.value : docentesFile.value
        if (!file) return

        // Asegúrate de que el archivo sea tratado como un File object
        console.log("Importando archivo:", file.name, file.type, file.size);

        const formData = new FormData()
        formData.append('file', file, file.name)
        formData.append('tipo', tipo)

        // Enviar archivo para importación
        // Enviar archivo para importación con Content-Type adecuado
        const response = await api.post('/importar-usuarios/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success) {
          $q.notify({
            color: 'positive',
            message: response.data.message || 'Usuarios importados correctamente',
            icon: 'check_circle'
          })

          // Actualizar resultados
          if (tipo === 'estudiantes') {
            resultadosEstudiantes.value = response.data.resultados || []
          } else {
            resultadosDocentes.value = response.data.resultados || []
          }
        } else {
          $q.notify({
            color: 'negative',
            message: response.data.message || 'Error al importar usuarios',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Error al importar usuarios:', error)
        $q.notify({
          color: 'negative',
          message: 'Error al importar usuarios. Por favor, inténtalo de nuevo.',
          icon: 'error'
        })
      } finally {
        // Restablecer estado de carga
        if (tipo === 'estudiantes') {
          loadingEstudiantes.value = false
        } else {
          loadingDocentes.value = false
        }
      }
    }

    // Función para descargar plantillas
    const descargarPlantilla = async (tipo) => {
      try {
        // Usar axios para hacer la petición con el token de autenticación
        const response = await api.get(`/importar-usuarios/plantilla/${tipo}`, {
          responseType: 'blob' // Importante para manejar la descarga como un archivo
        })

        // Crear un objeto URL para el blob
        const url = window.URL.createObjectURL(new Blob([response.data]))

        // Crear un enlace temporal
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `plantilla_${tipo}.xlsx`) // Nombre del archivo

        // Agregar a la página, hacer clic y eliminar
        document.body.appendChild(link)
        link.click()

        // Limpiar
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)

        // Notificar al usuario
        $q.notify({
          color: 'positive',
          message: `Plantilla de ${tipo} descargada correctamente`,
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error al descargar la plantilla:', error)
        $q.notify({
          color: 'negative',
          message: `Error al descargar la plantilla de ${tipo}`,
          icon: 'error'
        })
      }
    }

    // Función para descargar plantillas (alternativa usando ruta pública)
    const descargarPlantillaAlternativa = async (tipo) => {
      try {
        // Usar axios normal para hacer la petición sin token
        const response = await axios.get(`http://localhost:8000/api/plantillas/download/${tipo}`, {
          responseType: 'blob' // Importante para manejar la descarga como un archivo
        })

        // Crear un objeto URL para el blob
        const url = window.URL.createObjectURL(new Blob([response.data]))

        // Crear un enlace temporal
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `plantilla_${tipo}.xlsx`) // Nombre del archivo

        // Agregar a la página, hacer clic y eliminar
        document.body.appendChild(link)
        link.click()

        // Limpiar
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)

        $q.notify({
          color: 'positive',
          message: `Plantilla de ${tipo} descargada correctamente (ruta alternativa)`,
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error al descargar la plantilla (ruta alternativa):', error)
        $q.notify({
          color: 'negative',
          message: `Error al descargar la plantilla de ${tipo} (ruta alternativa)`,
          icon: 'error'
        })
      }
    }

    return {
      tab,
      estudiantesFile,
      docentesFile,
      loadingEstudiantes,
      loadingDocentes,
      resultadosEstudiantes,
      resultadosDocentes,
      filePreview,
      previewColumns,
      onFileSelected,
      importarUsuarios,
      descargarPlantilla,
      descargarPlantillaAlternativa
    }
  }
}
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
