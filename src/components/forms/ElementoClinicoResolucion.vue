<template>
  <div class="q-mb-md">
    <div class="text-subtitle1 text-bold q-mb-sm text-primary">
      {{ tituloFormateado }}
    </div>

    <div v-if="model.length > 0" class="q-mb-md">
      <!-- Filas de elementos -->
      <div v-for="(item, index) in model" :key="index" class="q-my-xs">
        <div class="row items-center bg-grey-1 rounded-borders shadow-1"
             :class="calcularEstadoFila(item)">
          <!-- Manifestación (siempre visible) -->
          <div :class="esSindrome ? 'col-12 col-md-11 q-pa-xs' : 'col-12 col-md q-pa-xs'">
            <q-select
              dense
              v-model="item.manifestacion"
              :options="opciones.manifestaciones"
              placeholder="Manifestación"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :disable="soloLectura"
              @filter="(val, update) => filtrarOpciones(val, update, 'manifestaciones')"
              class="bg-white"
              :class="{
                'campo-correcto': item.estados?.manifestacion === 'correcto',
                'campo-incorrecto': item.estados?.manifestacion === 'incorrecto',
                'campo-vacio': item.estadosVacios?.manifestacion
              }"
              borderless
            >
              <template v-if="item.estados?.manifestacion === 'incorrecto'" v-slot:after>
                <q-icon name="warning" class="text-negative" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Característica (oculto para síndromes) -->
          <div v-if="!esSindrome" class="col-12 col-md q-pa-xs">
            <q-select
              dense
              v-model="item.caracteristica"
              :options="opciones.caracteristicas"
              placeholder="Característica"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :disable="soloLectura"
              @filter="(val, update) => filtrarOpciones(val, update, 'caracteristicas')"
              class="bg-white"
              :class="{
                'campo-correcto': item.estados?.caracteristica === 'correcto',
                'campo-incorrecto': item.estados?.caracteristica === 'incorrecto',
                'campo-vacio': item.estadosVacios?.caracteristica
              }"
              borderless
            >
              <template v-if="item.estados?.caracteristica === 'incorrecto'" v-slot:after>
                <q-icon name="warning" class="text-negative" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Parámetro (oculto para síndromes) -->
          <div v-if="!esSindrome" class="col-12 col-md q-pa-xs">
            <q-select
              dense
              v-model="item.parametro"
              :options="opciones.parametros"
              placeholder="Parámetro"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :disable="soloLectura"
              @filter="(val, update) => filtrarOpciones(val, update, 'parametros')"
              class="bg-white"
              :class="{
                'campo-correcto': item.estados?.parametro === 'correcto',
                'campo-incorrecto': item.estados?.parametro === 'incorrecto',
                'campo-vacio': item.estadosVacios?.parametro
              }"
              borderless
            >
              <template v-if="item.estados?.parametro === 'incorrecto'" v-slot:after>
                <q-icon name="warning" class="text-negative" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Localización (oculto para síndromes) -->
          <div v-if="!esSindrome" class="col-12 col-md q-pa-xs">
            <q-select
              dense
              v-model="item.localizacion"
              :options="opciones.localizacion"
              placeholder="Localización"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :disable="soloLectura"
              @filter="(val, update) => filtrarOpciones(val, update, 'localizacion')"
              class="bg-white"
              :class="{
                'campo-correcto': item.estados?.localizacion === 'correcto',
                'campo-incorrecto': item.estados?.localizacion === 'incorrecto',
                'campo-vacio': item.estadosVacios?.localizacion
              }"
              borderless
            >
              <template v-if="item.estados?.localizacion === 'incorrecto'" v-slot:after>
                <q-icon name="warning" class="text-negative" size="xs" />
              </template>
            </q-select>
          </div>

          <!-- Estado (iconos de correcto/incorrecto por campo) -->
          <div class="col-auto q-pa-xs text-center estado-icon">
            <!-- Botón eliminar siempre visible a menos que sea solo lectura -->
            <q-btn
              v-if="!soloLectura"
              icon="delete"
              flat
              round
              dense
              color="red"
              @click="eliminar(index)"
              class="q-mr-xs"
            />

            <!-- Icono de información para filas parcialmente correctas -->
            <q-icon
              v-if="item.estados && esCamposMezclados(item)"
              name="info"
              color="amber-9"
              size="24px"
              class="q-ml-sm cursor-pointer"
            >
              <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                <div class="text-caption q-pa-xs">
                  ¡Campo parcialmente correcto! <br>
                  Algunos campos están correctos, pero otros están incompletos o incorrectos.
                </div>
              </q-tooltip>
            </q-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center" v-if="!soloLectura && (!model.length || model.length < 15)">
      <q-btn
        color="primary"
        icon="add"
        :label="`AÑADIR ${tituloFormateado}`"
        @click="agregar"
        class="q-py-sm"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  titulo: {
    type: String,
    default: "Elemento"
  },
  opciones: {
    type: Object,
    default: () => ({
      manifestaciones: [],
      caracteristicas: [],
      parametros: [],
      localizacion: [],
    }),
  },
  soloLectura: {
    type: Boolean,
    default: false,
  },
  tipo: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Computed para manejar el título de forma segura
const tituloFormateado = computed(() => {
  if (props.titulo && typeof props.titulo === 'string') {
    return props.titulo.toUpperCase();
  }
  return "ELEMENTO";
});

// Computed para verificar si es síndrome
const esSindrome = computed(() => {
  const tituloLower = props.titulo ? props.titulo.toLowerCase() : '';
  const tipoLower = props.tipo ? props.tipo.toLowerCase() : '';

  return tituloLower.includes('síndrome') ||
         tituloLower.includes('sindromes') ||
         tipoLower === 'sindrome' ||
         tipoLower === 'síndromes';
});

function agregar() {
  if (esSindrome.value) {
    // Para síndromes, solo agregamos manifestación
    model.value.push({
      manifestacion: "",
      estados: {
        manifestacion: null
      }
    });
  } else {
    // Para signos y síntomas, agregamos todos los campos
    model.value.push({
      manifestacion: "",
      caracteristica: "",
      parametro: "",
      localizacion: "",
      estados: {
        manifestacion: null,
        caracteristica: null,
        parametro: null,
        localizacion: null
      }
    });
  }
}

function eliminar(index) {
  model.value.splice(index, 1);
}

function filtrarOpciones(val, update, tipo) {
  if (!val || val.length < 2) {
    update(() => {
      // Si no hay texto de búsqueda, mostrar todas las opciones
      // Limitado a 15 para evitar listas muy largas
      return props.opciones[tipo]?.slice(0, 15) || [];
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    // Filtrar opciones que contienen el texto buscado
    return (props.opciones[tipo] || []).filter(
      v => v.toLowerCase().indexOf(needle) > -1
    );
  });
}

// Función para calcular el estado visual de la fila completa
function calcularEstadoFila(item) {
  if (!item.estados) return {};

  // Para síndromes solo hay manifestación
  if (esSindrome.value) {
    return {
      'fila-correcta': item.estados.manifestacion === 'correcto',
      'fila-incorrecta': item.estados.manifestacion === 'incorrecto'
    };
  }

  // Para signos y síntomas verificamos todos los campos
  const todosCorrectos = item.estados.manifestacion === 'correcto' &&
                       item.estados.caracteristica === 'correcto' &&
                       item.estados.parametro === 'correcto' &&
                       item.estados.localizacion === 'correcto';

  const todoIncorrecto = item.estados.manifestacion === 'incorrecto' &&
                       item.estados.caracteristica === 'incorrecto' &&
                       item.estados.parametro === 'incorrecto' &&
                       item.estados.localizacion === 'incorrecto';

  // Si hay campos mezclados (algunos correctos y otros incorrectos)
  const camposMezclados = !todosCorrectos && !todoIncorrecto &&
                         (item.estados.manifestacion === 'correcto' ||
                          item.estados.caracteristica === 'correcto' ||
                          item.estados.parametro === 'correcto' ||
                          item.estados.localizacion === 'correcto');

  return {
    'fila-correcta': todosCorrectos,
    'fila-incorrecta': todoIncorrecto,
    'fila-parcial': camposMezclados
  };
}

function esCamposMezclados(item) {
  if (!item.estados || esSindrome.value) return false;

  const todosCorrectos = item.estados.manifestacion === 'correcto' &&
                        item.estados.caracteristica === 'correcto' &&
                        item.estados.parametro === 'correcto' &&
                        item.estados.localizacion === 'correcto';

  const todoIncorrecto = item.estados.manifestacion === 'incorrecto' &&
                        item.estados.caracteristica === 'incorrecto' &&
                        item.estados.parametro === 'incorrecto' &&
                        item.estados.localizacion === 'incorrecto';

  return !todosCorrectos && !todoIncorrecto;
}
</script>

<style scoped>
.q-select :deep(.q-field__native) {
  padding: 0 8px;
}

/* Mejoras estéticas para el componente */
.q-select {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.q-select:hover {
  background-color: #f5f5f5;
}

.bg-grey-1 {
  transition: all 0.3s ease;
}

.bg-grey-1:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09) !important;
}

/* Estilos mejorados para respuestas correctas e incorrectas */
.respuesta-correcta {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border: 1px solid rgba(76, 175, 80, 0.5) !important;
  border-left: 4px solid #4caf50 !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15) !important;
}

.respuesta-correcta:hover {
  background-color: rgba(76, 175, 80, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2) !important;
}

.respuesta-incorrecta {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border: 1px solid rgba(244, 67, 54, 0.5) !important;
  border-left: 4px solid #f44336 !important;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.15) !important;
}

.respuesta-incorrecta:hover {
  background-color: rgba(244, 67, 54, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(244, 67, 54, 0.2) !important;
}

/* Estilos mejorados para los campos de elementos clínicos */
.campo-correcto {
  border: 2px solid #4caf50 !important;
  background-color: rgba(76, 175, 80, 0.05) !important;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.campo-correcto::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: #4caf50;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  z-index: 2;
}

.campo-incorrecto {
  border: 2px solid #f44336 !important;
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.campo-incorrecto::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: #f44336;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  z-index: 2;
}

/* Estilos para campos vacíos pero requeridos */
.campo-incorrecto.campo-vacio::before {
  content: '⚠ Campo requerido';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 10px;
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
  padding: 2px 8px;
  text-align: center;
  z-index: 3;
}

/* Estilos para el icono de estado */
.estado-icon {
  min-width: 40px;
}

/* Estilos para las filas */
.fila-correcta {
  background-color: rgba(76, 175, 80, 0.05) !important;
  border-left: 4px solid #4caf50 !important;
}

.fila-incorrecta {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 4px solid #f44336 !important;
}

.fila-parcial {
  background-color: rgba(255, 152, 0, 0.05) !important;
  border-left: 4px solid #ff9800 !important;
}
</style>
