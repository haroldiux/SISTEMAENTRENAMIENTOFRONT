<template>
  <q-card flat bordered class="q-pa-md q-mb-md">
    <div class="text-subtitle1 text-bold q-mb-sm">{{ titulo.toUpperCase() }}</div>

    <div v-for="(item, index) in model" :key="index"
      class="q-gutter-sm row items-center q-mb-sm bg-grey-2 q-pa-sm rounded-borders">
      <!-- Manifestación -->
      <q-select v-model="item.casoclinico" :options="casoclinicoFiltrado" label="Manifestación" use-input dense clearable
        class="col" input-debounce="0" @filter="(val, update) => filtrar(val, update, 'casoclinico')" />
      <q-btn flat round dense icon="add" v-if="!soloLectura" @click="abrirModal('casoclinico', index)" />

      <!-- Característica -->
      <template v-if="titulo.toLowerCase() !== 'síndromes'">
        <q-select v-model="item.subclinicos" :options="subclinicosFiltrado" label="Característica" use-input dense clearable
          class="col" input-debounce="0" @filter="(val, update) => filtrar(val, update, 'subclinicos')" />
        <q-btn flat round dense icon="add" v-if="!soloLectura" @click="abrirModal('subclinicos', index)" />

        <!-- Parámetro -->
        <q-select v-model="item.parametro" :options="parametrosFiltrado" option-label="parametro" option-value="id"
          label="Parámetro" use-input dense clearable class="col" input-debounce="50"
          @filter="(val, update) => filtrar(val, update, 'parametros')" />
        <q-btn flat round dense icon="add" v-if="!soloLectura" @click="abrirModal('parametros', index)" />

        <!-- Localización -->
        <q-select v-model="item.localizacion" :options="localizacionFiltrado" label="Localización" use-input dense clearable
          class="col" input-debounce="0" @filter="(val, update) => filtrar(val, update, 'localizacion')" />
        <q-btn flat round dense icon="add" v-if="!soloLectura" @click="abrirModal('localizacion', index)" />
      </template>

      <q-btn icon="delete" flat color="red" @click="eliminar(index)" class="col-1" />
    </div>

    <q-btn flat icon="add" :label="`Añadir ${titulo}`" @click="agregar" color="primary" />

    <!-- MODALES -->
    <ModalNuevaManifestacion v-model="modalCuadro.abierto" :tipoPreseleccionado="tipoPorTitulo"
      @guardar="guardarCuadroClinico" @manifestacionCreada="onManifestacionCreada" />
    <ModalNuevaCaracteristica v-model="modalSub.abierto" @guardar="guardarSubClinico" />
    <ModalNuevoParametro v-model="modalParametro.abierto" :manifestaciones="casoclinico" :caracteristicas="subclinicos"
      @guardar="guardarParametro" />
    <ModalNuevoLocalizacion v-model="modalLocal.abierto" campo="localización" />
  </q-card>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import { useFiltros } from 'src/composables/useFiltro'
import ModalNuevaManifestacion from '../modals/ModalNuevaManifestacion.vue'
import ModalNuevaCaracteristica from '../modals/ModalNuevaCaracteristica.vue'
import ModalNuevoParametro from '../modals/ModalNuevoParametro.vue'
import ModalNuevoLocalizacion from '../modals/ModalNuevoLocalizacion.vue'

const props = defineProps({
  modelValue: Array,
  titulo: String,
  opciones: Object,
  caracteristicas: Array,
  parametros: Array,
  soloLectura: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['update:modelValue', 'guardar', 'update:caracteristicas'])

// Obtener la función de filtro del composable
const { filtrar: filtrarComposable } = useFiltros()

// Computed properties para gestionar estado reactivo
const model = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue : [],
  set: val => emit('update:modelValue', val),
})

const subclinicos = computed(() => {
  return Array.isArray(props.caracteristicas) ? props.caracteristicas : []
})

const tipoPorTitulo = computed(() => {
  const t = props.titulo.toLowerCase()
  if (t === 'signos') return 1
  if (t === 'síntomas') return 2
  if (t === 'síndromes') return 3
  return null
})

// Referencias reactivas
const casoclinico = ref([])
const localizacion = ref([])
const parametros = ref(Array.isArray(props.parametros) ? [...props.parametros] : [])
const todasManifestaciones = ref([])
const todasCaracteristicas = ref([])

// Estado de modales
const modalCuadro = reactive({ abierto: false, index: null })
const modalSub = reactive({ abierto: false, index: null })
const modalParametro = reactive({ abierto: false, index: null })
const modalLocal = reactive({ abierto: false, index: null })

// Agregar estas nuevas refs para manejar las opciones filtradas
const casoclinicoFiltrado = ref([])
const subclinicosFiltrado = ref([])
const localizacionFiltrado = ref([])
const parametrosFiltrado = ref([])

// WATCHERS
// Observar cambios en localizaciones
watch(
  () => props.opciones?.localizacion,
  (nuevasLocalizaciones) => {
    if (Array.isArray(nuevasLocalizaciones)) {
      localizacion.value = [...new Set(nuevasLocalizaciones)]
    }
  },
  { deep: true }
)

// Observar cambios en título para recargar manifestaciones
watch(() => props.titulo, () => {
  cargarManifestaciones()
})

// Observar cambios en el modelo para filtrar parámetros
watch(
  () => model.value,
  (nuevo) => {
    if (!Array.isArray(nuevo) || nuevo.length === 0) return

    const fila = nuevo.at(-1)
    if (!fila) return

    const manifestacionSeleccionada = fila.casoclinico
    const caracteristicaSeleccionada = fila.subclinicos

    // Obtener IDs para filtrado
    const manifestacionId = obtenerIdDesdeNombre(casoclinico.value, manifestacionSeleccionada)
    const caracteristicaId = obtenerIdDesdeNombre(subclinicos.value, caracteristicaSeleccionada)

    // Cargar parámetros filtrados
    cargarParametrosFiltrados(manifestacionId, caracteristicaId)
  },
  { deep: true }
)

watch(() => casoclinico.value, (newValue) => {
  casoclinicoFiltrado.value = [...newValue]
})

watch(() => subclinicos.value, (newValue) => {
  subclinicosFiltrado.value = [...newValue]
})

watch(() => localizacion.value, (newValue) => {
  localizacionFiltrado.value = [...newValue]
})

watch(() => parametros.value, (newValue) => {
  parametrosFiltrado.value = [...newValue]
})

// MÉTODOS DE CARGA DE DATOS
// Cargar manifestaciones desde la API
async function cargarManifestaciones() {
  try {
    const { data } = await api.get('/manifestaciones')
    todasManifestaciones.value = data

    // Filtrar según el tipo de sección
    const tipoActual = tipoPorTitulo.value
    if (tipoActual !== null) {
      casoclinico.value = data.filter(m => m.tipo === tipoActual).map(m => m.nombre)
    } else {
      casoclinico.value = []
    }
  } catch (error) {
    console.error('Error al cargar manifestaciones:', error)
    todasManifestaciones.value = []
    casoclinico.value = []
  }
}

// Cargar características desde la API
async function cargarCaracteristicas() {
  try {
    const { data } = await api.get('/caracteristicas')
    todasCaracteristicas.value = Array.isArray(data) ? data : []

    // Determinar si debe emitir strings u objetos, basado en lo que recibió
    if (!Array.isArray(props.caracteristicas)) {
      emit('update:caracteristicas', [])
      return
    }

    if (props.caracteristicas.length > 0 && typeof props.caracteristicas[0] === 'string') {
      const nuevas = Array.isArray(data) ? data.map(c => c.clasificacion) : []
      emit('update:caracteristicas', nuevas)
    } else {
      emit('update:caracteristicas', Array.isArray(data) ? data : [])
    }
  } catch (error) {
    console.error('Error al cargar características:', error)
    todasCaracteristicas.value = []
    emit('update:caracteristicas', [])
  }
}

// Cargar localizaciones desde la API
async function cargarLocalizaciones() {
  try {
    const { data } = await api.get('/localizaciones')
    localizacion.value = [...new Set(data.map(l => l.nombre))]
  } catch (error) {
    console.error('Error cargando localizaciones:', error)
    localizacion.value = []
  }
}

// Cargar parámetros filtrados según manifestación y característica
async function cargarParametrosFiltrados(manifestacion_id, caracteristica_id) {
  try {
    if (!manifestacion_id || !caracteristica_id) {
      // Sin filtros, cargar todos los parámetros
      const { data } = await api.get('/variables')
      parametros.value = data
    } else {
      // Aplicar filtros específicos
      const { data } = await api.get('/variables/filtrar', {
        params: { manifestacion_id, caracteristica_id }
      })
      parametros.value = data
    }
  } catch (err) {
    console.error('Error cargando parámetros:', err)
    parametros.value = []
  }
}

// MANEJADORES DE EVENTOS
// Abrir modal según el campo seleccionado
function abrirModal(campo, index) {
  const modalMap = {
    'casoclinico': modalCuadro,
    'subclinicos': modalSub,
    'parametros': modalParametro,
    'localizacion': modalLocal
  }

  if (modalMap[campo]) {
    modalMap[campo].abierto = true
    modalMap[campo].index = index
  }
}

// Guardar nueva manifestación
function guardarCuadroClinico(manifestacion) {
  if (!manifestacion || !manifestacion.id || !manifestacion.nombre) {
    console.error('Manifestación inválida:', manifestacion)
    return
  }

  // Agregar a la lista si no existe
  const yaExiste = todasManifestaciones.value.some(m => m.id === manifestacion.id)
  if (!yaExiste) {
    todasManifestaciones.value.push(manifestacion)
  }

  // Regenerar lista filtrada
  casoclinico.value = todasManifestaciones.value
    .filter(m => m.tipo === tipoPorTitulo.value)
    .map(m => m.nombre)

  // Seleccionar automáticamente en el modelo
  if (modalCuadro.index !== null && modalCuadro.index >= 0 && model.value[modalCuadro.index]) {
    model.value[modalCuadro.index].casoclinico = manifestacion.nombre
  }

  console.log('✅ Manifestación nueva registrada con ID:', manifestacion.id)

  // Emitir evento global para otros componentes
  window.dispatchEvent(new CustomEvent('manifestacion-creada-global', {
    detail: manifestacion
  }))
}

// Guardar nueva característica
function guardarSubClinico(nueva) {
  if (!nueva) return

  // Validar que caracteristicas es un array
  if (!Array.isArray(props.caracteristicas)) {
    emit('update:caracteristicas', [])
    return
  }

  // Normalizar formato de características
  if (typeof nueva === 'object' && nueva !== null) {
    // Verificar si ya existe en la lista
    const yaExiste = props.caracteristicas.some(c => {
      if (!c) return false
      if (typeof c === 'object') return c.id === nueva.id || c.clasificacion === nueva.clasificacion
      return c === nueva.clasificacion
    })

    if (!yaExiste) {
      // Mantener coherencia con el formato existente (string u objeto)
      if (props.caracteristicas.length > 0 && typeof props.caracteristicas[0] === 'string') {
        emit('update:caracteristicas', [...props.caracteristicas, nueva.clasificacion])
      } else {
        emit('update:caracteristicas', [...props.caracteristicas, nueva])
      }
    }

    // Asignar al modelo actual si hay índice válido
    if (modalSub.index !== null && modalSub.index >= 0 && model.value[modalSub.index]) {
      model.value[modalSub.index].subclinicos = nueva.clasificacion
    }

    // Emitir evento global
    window.dispatchEvent(new CustomEvent('caracteristica-creada-global', {
      detail: nueva
    }))
  } else if (typeof nueva === 'string') {
    // Caso de string simple
    if (!props.caracteristicas.includes(nueva)) {
      emit('update:caracteristicas', [...props.caracteristicas, nueva])
    }

    if (modalSub.index !== null && modalSub.index >= 0 && model.value[modalSub.index]) {
      model.value[modalSub.index].subclinicos = nueva
    }
  }
}

// Guardar nuevo parámetro
function guardarParametro(nuevo) {
  if (!nuevo.parametro || !nuevo.id) {
    console.error('El nuevo parámetro no está bien formado:', nuevo)
    return
  }

  // Agregar el parámetro si no existe
  const existe = parametros.value.find(p => p.id === nuevo.id)
  if (!existe) {
    parametros.value.push({
      id: nuevo.id,
      parametro: nuevo.parametro
    })
  }

  // Asignar al modelo si hay índice válido
  if (modalParametro.index !== null && model.value[modalParametro.index]) {
    model.value[modalParametro.index].parametro = {
      id: nuevo.id,
      parametro: nuevo.parametro
    }
  }
}

// Función para actualizar localizaciones
function actualizarLocalizacion(e) {
  const nueva = e.detail
  if (nueva?.nombre) {
    console.log('🌟 Nueva localización recibida:', nueva)

    if (!localizacion.value.includes(nueva.nombre)) {
      localizacion.value.push(nueva.nombre)
    }

    if (model.value.length > 0) {
      const index = modalLocal.index !== null ? modalLocal.index : model.value.length - 1
      if (model.value[index]) {
        model.value[index].localizacion = nueva.nombre
      }
    }
  }
}

// FUNCIONES AUXILIARES
// Filtrar opciones en selects
function filtrar(val, update, campo) {
  // Normalizar el valor de búsqueda
  const filtro = (val || "").toLowerCase();

  // Determinar lista a filtrar
  const listasMap = {
    'casoclinico': casoclinico.value,
    'subclinicos': subclinicos.value,
    'localizacion': localizacion.value,
    'parametros': parametros.value
  };

  // Lista de opciones filtradas
  const listasFiltradas = {
    'casoclinico': casoclinicoFiltrado,
    'subclinicos': subclinicosFiltrado,
    'localizacion': localizacionFiltrado,
    'parametros': parametrosFiltrado
  };

  // Obtener la lista correcta
  const lista = Array.isArray(listasMap[campo]) ? listasMap[campo] : [];

  // Si no hay filtro, mostrar todas las opciones
  if (!filtro) {
    listasFiltradas[campo].value = [...lista];
    update(() => [...lista]);
    return;
  }

  // Filtrar la lista según el tipo de datos
  const resultadoFiltrado = lista.filter(item => {
    // Manejar valores nulos o indefinidos
    if (item == null) return false;

    // Si es un string simple
    if (typeof item === 'string') {
      return item.toLowerCase().includes(filtro);
    }

    // Si es un objeto, buscar en las propiedades relevantes
    if (typeof item === 'object') {
      // Propiedades específicas según el tipo de campo
      if (campo === 'casoclinico' && item.nombre) {
        return item.nombre.toLowerCase().includes(filtro);
      }
      if (campo === 'subclinicos' && item.clasificacion) {
        return item.clasificacion.toLowerCase().includes(filtro);
      }
      if (campo === 'parametros' && item.parametro) {
        return item.parametro.toLowerCase().includes(filtro);
      }
      if (campo === 'localizacion' && item.nombre) {
        return item.nombre.toLowerCase().includes(filtro);
      }

      // Búsqueda genérica en todas las propiedades de tipo string
      return Object.values(item).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(filtro)
      );
    }

    // Último recurso: convertir a string y buscar
    return String(item).toLowerCase().includes(filtro);
  });

  // Actualizar la lista filtrada
  listasFiltradas[campo].value = resultadoFiltrado;

  // Notificar a Quasar que el filtrado está completo
  update(() => resultadoFiltrado);

}

// Obtener ID desde nombre
function obtenerIdDesdeNombre(lista, nombre) {
  if (!nombre) return null

  // Para manifestaciones
  if (lista === casoclinico.value) {
    const encontrado = todasManifestaciones.value.find(m => m.nombre === nombre)
    return encontrado?.id || null
  }
  // Para características
  else if (lista === subclinicos.value) {
    // Caso objeto con ID
    if (typeof nombre === 'object' && nombre?.id) {
      return nombre.id
    }

    // Caso objeto con clasificación
    if (typeof nombre === 'object' && nombre?.clasificacion) {
      const buscarPorNombre = todasCaracteristicas.value.find(
        c => c.clasificacion === nombre.clasificacion
      )
      return buscarPorNombre?.id || null
    }

    // Caso string
    const encontrado = todasCaracteristicas.value.find(
      c => c.clasificacion === nombre
    )
    return encontrado?.id || null
  }

  return null
}

// Agregar nueva fila
function agregar() {
  model.value.push({
    casoclinico: '',
    subclinicos: '',
    localizacion: '',
    parametro: ''
  })
}

// Eliminar fila
function eliminar(index) {
  model.value.splice(index, 1)
}

// MANEJADORES DE EVENTOS GLOBALES
// Manejar nueva manifestación creada
function onManifestacionCreada(nuevaManifestacion) {
  if (!nuevaManifestacion || !nuevaManifestacion.id) return

  // Actualizar lista local
  todasManifestaciones.value.push(nuevaManifestacion)

  // Si corresponde al tipo actual, añadir al select
  if (nuevaManifestacion.tipo === tipoPorTitulo.value) {
    casoclinico.value.push(nuevaManifestacion.nombre)

    // Autoseleccionar en el modelo
    if (modalCuadro.index !== null) {
      model.value[modalCuadro.index].casoclinico = nuevaManifestacion.nombre
    } else {
      // Si no hay índice específico, seleccionar en la última fila
      const ultimaFila = model.value.at(-1)
      if (ultimaFila) {
        ultimaFila.casoclinico = nuevaManifestacion.nombre
      }
    }
  }

  // Emitir un evento global para actualizar todas las listas de manifestaciones
  window.dispatchEvent(new CustomEvent('manifestacion-creada-global', {
    detail: nuevaManifestacion
  }))
}

// Manejar nueva característica creada
function onCaracteristicaCreada(e) {
  const caracteristicaNueva = e.detail
  if (!caracteristicaNueva || !caracteristicaNueva.id) return

  // Actualizar la lista local
  todasCaracteristicas.value.push(caracteristicaNueva)

  // Actualizar según el formato (string u objeto)
  if (props.caracteristicas.length > 0 && typeof props.caracteristicas[0] === 'string') {
    if (!props.caracteristicas.includes(caracteristicaNueva.clasificacion)) {
      emit('update:caracteristicas', [...props.caracteristicas, caracteristicaNueva.clasificacion])
    }
  } else {
    const yaExiste = props.caracteristicas.some(c => {
      if (typeof c === 'object') return c.id === caracteristicaNueva.id
      return c === caracteristicaNueva.clasificacion
    })

    if (!yaExiste) {
      emit('update:caracteristicas', [...props.caracteristicas, caracteristicaNueva])
    }
  }
}

// Manejar nueva localización creada
function onLocalizacionCreada(e) {
  const nuevaLocalizacion = e.detail
  if (!nuevaLocalizacion?.nombre) return

  // Actualizar lista local
  if (!localizacion.value.includes(nuevaLocalizacion.nombre)) {
    localizacion.value.push(nuevaLocalizacion.nombre)
  }

  // Autoseleccionar en el modelo
  if (modalLocal.index !== null && model.value[modalLocal.index]) {
    model.value[modalLocal.index].localizacion = nuevaLocalizacion.nombre
  }

  // Propagar el evento con el objeto completo para otros componentes
  window.dispatchEvent(new CustomEvent('actualizar-localizaciones', {
    detail: nuevaLocalizacion // Enviar el objeto completo, no solo el nombre
  }))
}

// CICLO DE VIDA DEL COMPONENTE
onMounted(() => {
  // Inicializar arrays
  casoclinico.value = []
  casoclinicoFiltrado.value = [] // Inicializar
  localizacion.value = []
  localizacionFiltrado.value = [] // Inicializar
  parametros.value = Array.isArray(props.parametros) ? [...props.parametros] : []
  parametrosFiltrado.value = [] // Inicializar
  todasManifestaciones.value = []
  todasCaracteristicas.value = []
  subclinicosFiltrado.value = [] // Inicializar

  // Cargar datos
  cargarManifestaciones()
  cargarCaracteristicas()
  cargarLocalizaciones()

  // Escuchar eventos globales
  window.addEventListener('localizacion-creada-global', onLocalizacionCreada)
  window.addEventListener('caracteristica-creada-global', onCaracteristicaCreada)
  window.addEventListener('actualizar-localizaciones', actualizarLocalizacion)
})

onUnmounted(() => {
  // Limpiar listeners al desmontar
  window.removeEventListener('localizacion-creada-global', onLocalizacionCreada)
  window.removeEventListener('caracteristica-creada-global', onCaracteristicaCreada)
  window.removeEventListener('actualizar-localizaciones', actualizarLocalizacion)
})
</script>
