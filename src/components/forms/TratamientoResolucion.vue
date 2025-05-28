<template>
  <div class="q-pa-sm q-mb-md">
    <div class="text-subtitle1 text-weight-bold q-mb-sm">TRATAMIENTO</div>
    <q-card flat bordered>
      <q-card-section class="q-pa-md">
        <template v-if="showRows">
          <!-- Filas de tratamientos -->
          <div v-for="(fila, filaIndex) in filasVisibles" :key="filaIndex" class="q-mb-md tratamiento-fila"
            :class="{ 'fila-correcta': tieneEstadoCorrecto(fila), 'fila-incorrecta': tieneEstadoIncorrecto(fila) }">

            <!-- Contenedor principal que será responsive -->
            <div class="row q-col-gutter-sm items-start">

              <!-- Medicamento - toma todo el ancho en móvil -->
              <div class="col-12 col-sm-6 col-md-3 q-mb-sm">
                <label class="text-weight-medium q-mb-xs block">Medicamento</label>
                <div class="row no-wrap items-center">
                  <div class="col">
                    <q-select outlined dense v-model="fila.medicamento" :options="opcionesMed" use-input hide-selected
                      fill-input input-debounce="0" @filter="filtrarMedicamentos" :disable="soloLectura"
                      :class="{ 'campo-correcto': fila.estados?.medicamento === 'correcto', 'campo-incorrecto': fila.estados?.medicamento === 'incorrecto' }">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="q-ml-xs">
                    <q-btn round dense flat icon="close" color="grey-6" size="sm" @click.stop="fila.medicamento = null"
                      v-if="!soloLectura" />
                  </div>
                </div>
              </div>

              <!-- Dosis - toma todo el ancho en móvil -->
              <div class="col-12 col-sm-6 col-md-3 q-mb-sm">
                <label class="text-weight-medium q-mb-xs block">Dosis</label>
                <div class="row no-wrap items-center">
                  <div class="col">
                    <q-select outlined dense v-model="fila.dosis" :options="opcionesDos" use-input hide-selected
                      fill-input input-debounce="0" @filter="filtrarDosis" :disable="soloLectura"
                      :class="{ 'campo-correcto': fila.estados?.dosis === 'correcto', 'campo-incorrecto': fila.estados?.dosis === 'incorrecto' }">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="q-ml-xs">
                    <q-btn round dense flat icon="close" color="grey-6" size="sm" @click.stop="fila.dosis = null"
                      v-if="!soloLectura" />
                  </div>
                </div>
              </div>

              <!-- Frecuencia - toma todo el ancho en móvil -->
              <div class="col-12 col-sm-6 col-md-3 q-mb-sm">
                <label class="text-weight-medium q-mb-xs block">Frecuencia</label>
                <div class="row no-wrap items-center">
                  <div class="col">
                    <q-select outlined dense v-model="fila.frecuencia" :options="opcionesFrec" use-input hide-selected
                      fill-input input-debounce="0" @filter="filtrarFrecuencia" :disable="soloLectura"
                      :class="{ 'campo-correcto': fila.estados?.frecuencia === 'correcto', 'campo-incorrecto': fila.estados?.frecuencia === 'incorrecto' }">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="q-ml-xs">
                    <q-btn round dense flat icon="close" color="grey-6" size="sm" @click.stop="fila.frecuencia = null"
                      v-if="!soloLectura" />
                  </div>
                </div>
              </div>

              <!-- Duración - toma todo el ancho en móvil -->
              <div class="col-12 col-sm-6 col-md-3 q-mb-sm">
                <label class="text-weight-medium q-mb-xs block">Duración</label>
                <div class="row no-wrap items-center">
                  <div class="col">
                    <q-select outlined dense v-model="fila.duracion" :options="opcionesDur" use-input hide-selected
                      fill-input input-debounce="0" @filter="filtrarDuracion" :disable="soloLectura"
                      :class="{ 'campo-correcto': fila.estados?.duracion === 'correcto', 'campo-incorrecto': fila.estados?.duracion === 'incorrecto' }">
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="q-ml-xs">
                    <q-btn round dense flat icon="close" color="grey-6" size="sm" @click.stop="fila.duracion = null"
                      v-if="!soloLectura" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón eliminar fila (centrado en móvil) -->
            <div class="text-center q-mt-sm" v-if="!soloLectura">
              <q-btn round flat color="negative" icon="delete" size="sm" @click="eliminarFila(filaIndex)"
                :disable="soloLectura" />
            </div>

            <!-- Separador entre filas -->
            <q-separator class="q-mt-md" v-if="filaIndex < filasVisibles.length - 1" />
          </div>
        </template>

        <!-- Botón para añadir tratamiento: siempre visible -->
        <div class="text-center q-mt-md" v-if="!soloLectura">
          <q-btn class="añadir-btn" color="primary" icon-right="add" label="AÑADIR TRATAMIENTO"
            @click="agregarNuevaFila" :disable="soloLectura || filasAgregadas.length >= 15" />
        </div>

        <!-- Mensaje cuando no hay tratamientos -->
        <div v-if="!showRows && !soloLectura" class="text-center text-grey q-py-lg">
          <q-icon name="healing" size="48px" color="grey-5" />
          <div class="text-body1 q-mt-sm">No se han añadido tratamientos</div>
          <div class="text-caption">Haz clic en "AÑADIR TRATAMIENTO" para comenzar</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { computed, ref, watchEffect, reactive } from "vue";

const props = defineProps({
  modelValue: Array,
  soloLectura: Boolean,
  opcionesMedicamentos: Array,
  opcionesDosis: Array,
  opcionesFrecuencia: Array,
  opcionesDuracion: Array
});

const emit = defineEmits(["update:modelValue"]);
// bandera que controla cuándo renderizo las filas
const showRows = ref(false);

// Modelo de tratamientos (datos completos del backend)
const tratamientos = computed({
  get: () => props.modelValue || [],
  set: val => emit("update:modelValue", val)
});

// Control de filas visibles agregadas manualmente por el usuario
const filasAgregadas = reactive([]);

// Filas que se muestran al usuario (solo las que ha agregado manualmente)
const filasVisibles = computed(() => {
  // Durante la evaluación, mostrar todas las filas
  if (soloLecturaActivo.value) {
    return tratamientos.value;
  }
  // Durante la edición, mostrar solo las filas agregadas por el usuario
  return filasAgregadas;
});

// Determina si estamos en modo solo lectura (para evaluación)
const soloLecturaActivo = computed(() => props.soloLectura === true);

// Local copies para filtrado
const opcionesMed = ref([]);
const opcionesDos = ref([]);
const opcionesFrec = ref([]);
const opcionesDur = ref([]);

// Sincronizar con props
watchEffect(() => {
  opcionesMed.value = [...(props.opcionesMedicamentos || [])];
  opcionesDos.value = [...(props.opcionesDosis || [])];
  opcionesFrec.value = [...(props.opcionesFrecuencia || [])];
  opcionesDur.value = [...(props.opcionesDuracion || [])];
});

// Filtrado sencillo
function filtrarMedicamentos(val, update) {
  if (!val) {
    update(() => opcionesMed.value = [...props.opcionesMedicamentos]);
  } else {
    update(() => opcionesMed.value = props.opcionesMedicamentos.filter(v => v.toLowerCase().includes(val.toLowerCase())));
  }
}
function filtrarDosis(val, update) {
  if (!val) {
    update(() => opcionesDos.value = [...props.opcionesDosis]);
  } else {
    update(() => opcionesDos.value = props.opcionesDosis.filter(v => v.toLowerCase().includes(val.toLowerCase())));
  }
}
function filtrarFrecuencia(val, update) {
  if (!val) {
    update(() => opcionesFrec.value = [...props.opcionesFrecuencia]);
  } else {
    update(() => opcionesFrec.value = props.opcionesFrecuencia.filter(v => v.toLowerCase().includes(val.toLowerCase())));
  }
}
function filtrarDuracion(val, update) {
  if (!val) {
    update(() => opcionesDur.value = [...props.opcionesDuracion]);
  } else {
    update(() => opcionesDur.value = props.opcionesDuracion.filter(v => v.toLowerCase().includes(val.toLowerCase())));
  }
}

// Agregar/eliminar filas
function agregarNuevaFila() {
  // Activar visualización de filas si no estaba activa
  showRows.value = true;

  // Verificar que no excedamos el límite de 15 filas
  if (filasAgregadas.length >= 15) return;

  // Crear una nueva fila vacía
  const nuevaFila = {
    medicamento: null,
    dosis: null,
    frecuencia: null,
    duracion: null,
    estados: { medicamento: null, dosis: null, frecuencia: null, duracion: null }
  };

  // Agregar a las filas visibles del usuario
  filasAgregadas.push(nuevaFila);

  // Actualizar también el modelo completo
  const todasLasFilas = [...tratamientos.value];
  todasLasFilas.push(nuevaFila);
  tratamientos.value = todasLasFilas;
}

function eliminarFila(i) {
  // Eliminar de las filas visibles
  filasAgregadas.splice(i, 1);

  // También eliminar del modelo completo
  // Nota: esto puede necesitar ajustes según cómo se manejen los índices
  const lista = [...tratamientos.value];
  // Buscar la fila correspondiente en el modelo completo
  if (soloLecturaActivo.value) {
    // En modo evaluación, los índices son los mismos
    lista.splice(i, 1);
  } else {
    // En modo edición, necesitamos encontrar la fila correspondiente
    // Esta es una implementación simple; puede requerir ajustes
    lista.splice(lista.findIndex(f => f === filasAgregadas[i]), 1);
  }
  tratamientos.value = lista;

  // Si no quedan filas, ocultar la sección
  if (filasAgregadas.length === 0) {
    showRows.value = false;
  }
}
// Funciones auxiliares para comprobar el estado de una fila
function tieneEstadoCorrecto(fila) {
  if (!fila.estados) return false;
  return fila.estados.medicamento === 'correcto' &&
    fila.estados.dosis === 'correcto' &&
    fila.estados.frecuencia === 'correcto' &&
    fila.estados.duracion === 'correcto';
}

function tieneEstadoIncorrecto(fila) {
  if (!fila.estados) return false;
  return fila.estados.medicamento === 'incorrecto' ||
    fila.estados.dosis === 'incorrecto' ||
    fila.estados.frecuencia === 'incorrecto' ||
    fila.estados.duracion === 'incorrecto';
}

// Exponer métodos para evaluación
defineExpose({
  eliminarTodos: () => {
    // Limpiar todas las filas
    filasAgregadas.splice(0, filasAgregadas.length);
    tratamientos.value = [];
    showRows.value = false;
  },
  marcarEstados: (estadosPorFila) => {
    // En modo evaluación, mostrar todas las filas del backend
    showRows.value = true;

    // Copiar tratamientos del modelo a las filas visibles para la evaluación
    filasAgregadas.splice(0, filasAgregadas.length, ...tratamientos.value);

    // Aplicar estados a las filas
    estadosPorFila.forEach((e, idx) => {
      if (idx < tratamientos.value.length) {
        tratamientos.value[idx].estados = e;
      }
    });

    // Actualizar el modelo
    tratamientos.value = [...tratamientos.value];
  }
});
</script>

<style scoped>
/* Estilo para selects y contenedores */
.q-select {
  width: 100%;
}

.block {
  display: block;
}

/* Estilos para la evaluación */
.fila-correcta {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
  border-radius: 8px;
  padding: 12px;
}

.fila-incorrecta {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
  border-radius: 8px;
  padding: 12px;
}

.campo-correcto {
  border: 2px solid #4caf50 !important;
}

.campo-correcto :deep(.q-field__control) {
  background-color: rgba(76, 175, 80, 0.05) !important;
}

.campo-incorrecto {
  border: 2px solid #f44336 !important;
}

.campo-incorrecto :deep(.q-field__control) {
  background-color: rgba(244, 67, 54, 0.05) !important;
}

/* Estilos para el botón añadir */
.añadir-btn {
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.añadir-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

/* Animación para nueva fila */
.tratamiento-fila {
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
}

.tratamiento-fila:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Estilos responsivos */
@media (max-width: 599px) {
  .tratamiento-fila {
    padding: 12px 8px;
  }

  .añadir-btn {
    width: 100%;
  }
}
</style>
