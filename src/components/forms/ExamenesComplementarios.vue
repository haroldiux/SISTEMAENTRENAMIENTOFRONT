<template>
  <div class="examenes-section q-mt-md">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">Exámenes complementarios</div>

    <!-- Selección de exámenes -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-sm">
        <div class="row items-center">
          <div class="col">
            <q-select dense filled use-input hide-selected fill-input input-debounce="300" label="Seleccionar exámenes"
              :options="examenesFiltrados" option-label="nombre" option-value="id" @filter="filtrarExamenes" clearable v-model="examenSeleccionado"
              @update:model-value="agregarExamen">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section>
                    <div class="text-grey">No hay resultados</div>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:after>
                <q-btn round dense flat icon="add" @click="abrirModalNuevoExamen" />
              </template>
            </q-select>
          </div>
        </div>

        <!-- Exámenes seleccionados como chips -->
        <div class="q-mt-sm">
          <q-chip v-for="(examen, index) in modelValue" :key="index" removable color="primary" text-color="white"
            class="q-ma-xs" @remove="eliminarExamen(index)">
            {{ examen }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Sección para adjuntar archivos estilo original -->
    <div v-if="modelValue.length > 0" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Adjunta archivos para los exámenes seleccionados</div>

      <!-- Campo de archivo para cada examen, con borde punteado -->
      <div v-for="(examen, index) in modelValue" :key="'file-' + index" class="q-mb-md">
        <div class="archivo-container">
          <span class="archivo-label">Archivo para {{ examen }}</span>
          <input type="file" :ref="el => { if (el) fileInputRefs[index] = el }" style="display: none"
            @change="(e) => adjuntarArchivo(e, examen)" />
          <div class="archivo-campo" @click="abrirSelectorArchivo(index)"
            :class="{ 'uploading': archivoCargando[examen], 'has-file': archivosExamen[examen] }">
            <div class="archivo-content">
              <span v-if="!archivosExamen[examen] && !archivoCargando[examen]" class="archivo-placeholder">
                Seleccionar o arrastrar archivo
              </span>
              <span v-else-if="archivoCargando[examen]" class="archivo-uploading">
                Subiendo...
              </span>
              <span v-else class="archivo-name">
                {{ archivosExamen[examen].name }}
              </span>
            </div>
            <div class="archivo-actions">
              <q-spinner v-if="archivoCargando[examen]" color="primary" size="1.5em" />
              <q-icon v-else-if="archivosExamen[examen]" name="check_circle" size="1.5em" class="text-positive" />
              <q-icon v-else name="attach_file" size="1.5em" class="archivo-icono" />

              <q-icon v-if="archivosExamen[examen]" name="delete" size="1.5em" class="q-ml-sm archivo-delete"
                @click.stop="eliminarArchivo(examen)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar nuevo examen -->
    <q-dialog v-model="modalNuevoExamen">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nuevo examen complementario</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="nuevoExamen" label="Nombre del examen" autofocus @keyup.enter="guardarNuevoExamen" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="guardarNuevoExamen" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default {
  name: 'ExamenesComplementarios',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    archivos: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'update:archivos'],

  setup(props, { emit }) {
    const $q = useQuasar();
    // Cambiamos la estructura para almacenar objetos completos con id y nombre
    const examenes = ref([]);
    const examenesFiltrados = ref([]);
    const examenSeleccionado = ref(null);
    const modalNuevoExamen = ref(false);
    const nuevoExamen = ref('');
    const archivosExamen = ref({ ...props.archivos });

    // Mapa para relacionar nombres de exámenes con sus IDs
    const examenesMap = ref({});

    // Usar un objeto reactivo para los refs de file inputs
    const fileInputRefs = reactive({});

    // Estado de carga para cada archivo
    const archivoCargando = reactive({});

    // Opciones predefinidas comunes
    const opcionesExamen = [
      'RADIOGRAFÍA',
      'TOMOGRAFÍA',
      'ECOGRAFÍA',
      'RESONANCIA MAGNÉTICA',
      'HEMOGRAMA',
      'BIOQUÍMICA',
      'ANÁLISIS DE ORINA',
      'ELECTROCARDIOGRAMA'
    ];

    // Vigilar cambios en los archivos
    watch(() => props.archivos, (newVal) => {
      archivosExamen.value = { ...newVal };
    }, { deep: true });

    // Cargar exámenes al montar el componente
    onMounted(async () => {
      await cargarExamenes();

      // Configurar eventos de arrastrar y soltar para cada contenedor
      setupDragAndDrop();
    });

    // Configurar drag and drop para los contenedores de archivos
    const setupDragAndDrop = () => {
      setTimeout(() => {
        const archivoCampos = document.querySelectorAll('.archivo-campo');

        archivoCampos.forEach((campo, index) => {
          campo.addEventListener('dragover', (e) => {
            e.preventDefault();
            campo.classList.add('dragging');
          });

          campo.addEventListener('dragleave', (e) => {
            e.preventDefault();
            campo.classList.remove('dragging');
          });

          campo.addEventListener('drop', (e) => {
            e.preventDefault();
            campo.classList.remove('dragging');

            const examen = props.modelValue[index];
            if (!examen) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
              const fileChangeEvent = { target: { files: files } };
              adjuntarArchivo(fileChangeEvent, examen);
            }
          });
        });
      }, 100);
    };

    // Modificado: Ahora almacena objetos con id y nombre, y construye el mapa de relación
    const cargarExamenes = async () => {
      try {
        const { data } = await api.get('/examenes');
        // Guardar objetos completos
        examenes.value = data;  // Asumimos que cada objeto tiene {id, nombre}
        examenesFiltrados.value = [...examenes.value];

        // Construir un mapa de nombres a IDs para uso futuro
        data.forEach(examen => {
          examenesMap.value[examen.nombre] = examen.id;
        });
      } catch (error) {
        console.error('Error al cargar exámenes:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al cargar la lista de exámenes'
        });
      }
    };

    // Modificado: Filtra por el campo 'nombre' en lugar de filtrar strings
    const filtrarExamenes = (val, update) => {
      if (val === '') {
        update(() => {
          examenesFiltrados.value = examenes.value;
        });
        return;
      }

      const needle = val.toLowerCase();
      update(() => {
        examenesFiltrados.value = examenes.value.filter(
          examen => examen.nombre.toLowerCase().indexOf(needle) > -1
        );
      });
    };

    // Modificado: Ahora usa el objeto examen completo
    const agregarExamen = () => {
      if (!examenSeleccionado.value) return;

      // Extraemos el nombre del examen seleccionado (objeto)
      const nombreExamen = examenSeleccionado.value.nombre;

      if (!props.modelValue.includes(nombreExamen)) {
        const nuevosExamenes = [...props.modelValue, nombreExamen];
        emit('update:modelValue', nuevosExamenes);

        // Reiniciar configuración de drag and drop después de añadir un examen
        setTimeout(() => {
          setupDragAndDrop();
        }, 100);
      }

      // Limpiar selección
      examenSeleccionado.value = null;
    };

    const agregarExamenPreDefinido = (examen) => {
      if (!props.modelValue.includes(examen)) {
        const nuevosExamenes = [...props.modelValue, examen];
        emit('update:modelValue', nuevosExamenes);

        // Reiniciar configuración de drag and drop después de añadir un examen
        setTimeout(() => {
          setupDragAndDrop();
        }, 100);
      }
    };

    const eliminarExamen = (index) => {
      const examen = props.modelValue[index];
      const nuevosExamenes = [...props.modelValue];
      nuevosExamenes.splice(index, 1);
      emit('update:modelValue', nuevosExamenes);

      // Eliminar el archivo adjunto si existe
      if (archivosExamen.value[examen]) {
        const nuevosArchivos = { ...archivosExamen.value };
        delete nuevosArchivos[examen];
        emit('update:archivos', nuevosArchivos);
      }

      // Eliminar estado de carga
      if (archivoCargando[examen]) {
        delete archivoCargando[examen];
      }
    };

    const abrirModalNuevoExamen = () => {
      modalNuevoExamen.value = true;
      nuevoExamen.value = '';
    };

    // Modificado: Guarda el objeto completo con ID y construye el mapa de relación
    const guardarNuevoExamen = async () => {
      const nombre = nuevoExamen.value.trim().toUpperCase();
      if (!nombre) return;

      // Verificar si ya existe basado en el nombre
      if (examenes.value.some(e => e.nombre === nombre)) {
        $q.notify({
          type: 'warning',
          message: 'Este examen ya existe en la lista'
        });
        modalNuevoExamen.value = false;
        return;
      }

      try {
        // Guardar en la base de datos
        const { data } = await api.post('/examenes', { nombre });

        // Extraer el objeto examen completo de la respuesta
        const nuevoExamenObj = data.examen || { id: data.id, nombre: nombre };

        // Actualizar lista local con el objeto completo
        examenes.value.push(nuevoExamenObj);
        examenesFiltrados.value = [...examenes.value];

        // Actualizar el mapa de nombres a IDs
        examenesMap.value[nombre] = nuevoExamenObj.id;

        // Añadir a seleccionados (solo el nombre para la visualización)
        const nuevosExamenes = [...props.modelValue, nombre];
        emit('update:modelValue', nuevosExamenes);

        // Reiniciar configuración de drag and drop después de añadir un examen
        setTimeout(() => {
          setupDragAndDrop();
        }, 100);

        $q.notify({
          type: 'positive',
          message: 'Examen agregado correctamente'
        });

        modalNuevoExamen.value = false;
      } catch (error) {
        console.error('Error al guardar nuevo examen:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al guardar el nuevo examen'
        });
      }
    };

    // Método para abrir el selector de archivos
    const abrirSelectorArchivo = (index) => {
      if (fileInputRefs[index]) {
        fileInputRefs[index].click();
      }
    };

    const adjuntarArchivo = async (event, examen) => {
      const archivo = event.target.files[0];
      if (!archivo) return;

      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!tiposPermitidos.includes(archivo.type)) {
        $q.notify({
          type: 'negative',
          message: 'Formato de archivo no soportado'
        });
        return;
      }

      try {
        // Marcar el archivo como cargando
        archivoCargando[examen] = true;

        // Convertir archivo a Base64
        const archivoBase64 = await convertirArchivoABase64(archivo);

        // Crear objeto de archivo con información relevante
        const archivoInfo = {
          name: archivo.name,
          type: archivo.type,
          size: archivo.size,
          base64: archivoBase64
        };

        // Actualizar archivos después de la carga
        const nuevosArchivos = { ...archivosExamen.value, [examen]: archivoInfo };
        archivosExamen.value = nuevosArchivos;
        emit('update:archivos', nuevosArchivos);

        // Mostrar notificación de éxito
        $q.notify({
          type: 'positive',
          message: `Archivo "${archivo.name}" subido correctamente`
        });
      } catch (error) {
        console.error('Error al subir archivo:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al subir el archivo'
        });
      } finally {
        // Quitar estado de carga
        archivoCargando[examen] = false;
      }
    };

    // Función para convertir archivos a Base64
    const convertirArchivoABase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    };

    const eliminarArchivo = (examen) => {
      const nuevosArchivos = { ...archivosExamen.value };
      delete nuevosArchivos[examen];

      archivosExamen.value = nuevosArchivos;
      emit('update:archivos', nuevosArchivos);

      // Mostrar notificación
      $q.notify({
        type: 'info',
        message: 'Archivo eliminado'
      });
    };

    // Observar cambios en los exámenes seleccionados para actualizar drag and drop
    watch(() => props.modelValue, () => {
      setTimeout(() => {
        setupDragAndDrop();
      }, 100);
    }, { deep: true });

    // Exportar el mapa de relación nombre-ID para usar desde fuera
    const obtenerIdExamen = (nombreExamen) => {
      return examenesMap.value[nombreExamen] || null;
    };

    return {
      examenes,
      examenesFiltrados,
      examenSeleccionado,
      modalNuevoExamen,
      nuevoExamen,
      archivosExamen,
      archivoCargando,
      opcionesExamen,
      fileInputRefs,
      examenesMap,
      cargarExamenes,
      filtrarExamenes,
      agregarExamen,
      agregarExamenPreDefinido,
      eliminarExamen,
      abrirModalNuevoExamen,
      guardarNuevoExamen,
      adjuntarArchivo,
      eliminarArchivo,
      abrirSelectorArchivo,
      setupDragAndDrop,
      obtenerIdExamen
    };
  }
};
</script>

<style scoped>
.examenes-section {
  margin-bottom: 1.5rem;
}

.archivo-container {
  position: relative;
  margin-bottom: 10px;
}

.archivo-label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 5px;
  color: rgba(0, 0, 0, 0.7);
}

.archivo-campo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px dashed #ccc;
  border-radius: 4px;
  min-height: 46px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f5f5f5;
}

.archivo-campo:hover {
  border-color: #1976d2;
  background-color: #f0f7ff;
}

.archivo-campo.dragging {
  border-color: #1976d2;
  background-color: #e3f2fd;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.5);
}

.archivo-campo.uploading {
  border-color: #fb8c00;
  background-color: #fff3e0;
}

.archivo-campo.has-file {
  border-color: #4caf50;
  background-color: #f1f8e9;
}

.archivo-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archivo-placeholder {
  color: #9e9e9e;
}

.archivo-uploading {
  color: #fb8c00;
  font-weight: 500;
}

.archivo-name {
  color: #2e7d32;
  font-weight: 500;
}

.archivo-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.archivo-icono {
  color: #777;
}

.archivo-delete {
  color: #d32f2f;
  cursor: pointer;
  transition: transform 0.2s;
}

.archivo-delete:hover {
  transform: scale(1.2);
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.archivo-uploading {
  animation: pulse 1.5s infinite;
}
</style>
