<template>
  <div class="q-pa-sm q-mb-md">
    <div class="text-subtitle1 text-weight-bold q-mb-sm">TRATAMIENTO</div>
    <q-card flat bordered>
      <q-card-section class="q-pa-md">
        <!-- Filas de tratamientos -->
        <div v-for="(fila, filaIndex) in tratamientos" :key="filaIndex" class="row q-col-gutter-sm items-center q-mb-sm"
          :data-index="filaIndex">
          <!-- Medicamento -->
          <div class="col">
            <div class="row no-wrap items-center">
              <div class="col">
                <q-select outlined dense v-model="fila.medicamento" :options="opcionesMedicamentosFiltradas"
                  label="Medicamento" use-input hide-selected fill-input input-debounce="0"
                  @filter="filtrarMedicamentos" :disable="soloLectura"
                  @update:model-value="actualizarMedicamentoId(filaIndex, $event)">
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
                <q-btn round dense flat icon="add" color="primary" size="sm"
                  @click="mostrarModalNuevoMedicamento(filaIndex)" :disable="soloLectura" />
              </div>
            </div>
          </div>

          <!-- Dosis -->
          <div class="col">
            <div class="row no-wrap items-center">
              <div class="col">
                <q-select outlined dense v-model="fila.dosis" :options="opcionesDosisFiltradas" label="Dosis" use-input
                  hide-selected fill-input input-debounce="0" @filter="filtrarDosis" :disable="soloLectura"
                  @update:model-value="actualizarDosisId(filaIndex, $event)">
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
                <q-btn round dense flat icon="add" color="primary" size="sm" @click="mostrarModalNuevaDosis(filaIndex)"
                  :disable="soloLectura" />
              </div>
            </div>
          </div>

          <!-- Frecuencia -->
          <div class="col">
            <div class="row no-wrap items-center">
              <div class="col">
                <q-select outlined dense v-model="fila.frecuencia" :options="opcionesFrecuenciaFiltradas"
                  label="Frecuencia" use-input hide-selected fill-input input-debounce="0" @filter="filtrarFrecuencia"
                  :disable="soloLectura" @update:model-value="actualizarFrecuenciaId(filaIndex, $event)">
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
                <q-btn round dense flat icon="add" color="primary" size="sm"
                  @click="mostrarModalNuevaFrecuencia(filaIndex)" :disable="soloLectura" />
              </div>
            </div>
          </div>

          <!-- Duración -->
          <div class="col">
            <div class="row no-wrap items-center">
              <div class="col">
                <q-select outlined dense v-model="fila.duracion" :options="opcionesDuracionFiltradas" label="Duración"
                  use-input hide-selected fill-input input-debounce="0" @filter="filtrarDuracion" :disable="soloLectura"
                  @update:model-value="actualizarDuracionId(filaIndex, $event)">
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
                <q-btn round dense flat icon="add" color="primary" size="sm"
                  @click="mostrarModalNuevaDuracion(filaIndex)" :disable="soloLectura" />
              </div>
            </div>
          </div>

          <!-- Botón eliminar fila -->
          <div class="col-auto">
            <q-btn round flat color="negative" icon="delete" size="sm" @click="eliminarFila(filaIndex)"
              :disable="soloLectura" />
          </div>
        </div>

        <!-- Botón para añadir tratamiento -->
        <div class="q-mt-md" v-if="!soloLectura">
          <q-btn outline color="primary" icon="add" label="AÑADIR TRATAMIENTO" @click="agregarNuevaFila" />
        </div>

        <!-- Mensaje cuando no hay tratamientos -->
        <div v-if="tratamientos.length === 0" class="text-center q-pa-md text-grey-6">
          <q-icon name="medication" size="2em" class="q-mb-sm" />
          <div>No hay tratamientos agregados</div>
          <div class="text-caption">Los tratamientos son opcionales para el caso clínico</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modal para nuevo medicamento -->
    <q-dialog v-model="modalNuevoMedicamento" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nuevo Medicamento</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="nuevoMedicamento" label="Nombre del medicamento" autofocus
            @keyup.enter="guardarNuevoMedicamento" class="text-uppercase" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="modalNuevoMedicamento = false" />
          <q-btn flat label="Guardar" color="primary" @click="guardarNuevoMedicamento"
            :disable="!nuevoMedicamento.trim()" :loading="guardandoMedicamento" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para nueva dosis -->
    <q-dialog v-model="modalNuevaDosis" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nueva Dosis</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="nuevaDosis" label="Descripción de dosis" autofocus @keyup.enter="guardarNuevaDosis"
            class="text-uppercase" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="modalNuevaDosis = false" />
          <q-btn flat label="Guardar" color="primary" @click="guardarNuevaDosis" :disable="!nuevaDosis.trim()"
            :loading="guardandoDosis" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para nueva frecuencia -->
    <q-dialog v-model="modalNuevaFrecuencia" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nueva Frecuencia</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="nuevaFrecuencia" label="Descripción de frecuencia" autofocus
            @keyup.enter="guardarNuevaFrecuencia" class="text-uppercase" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="modalNuevaFrecuencia = false" />
          <q-btn flat label="Guardar" color="primary" @click="guardarNuevaFrecuencia" :disable="!nuevaFrecuencia.trim()"
            :loading="guardandoFrecuencia" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para nueva duración -->
    <q-dialog v-model="modalNuevaDuracion" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nueva Duración</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="nuevaDuracion" label="Descripción de duración" autofocus
            @keyup.enter="guardarNuevaDuracion" class="text-uppercase" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="modalNuevaDuracion = false" />
          <q-btn flat label="Guardar" color="primary" @click="guardarNuevaDuracion" :disable="!nuevaDuracion.trim()"
            :loading="guardandoDuracion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  soloLectura: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Array de tratamientos - Usamos directamente modelValue
const tratamientos = computed({
  get: () => props.modelValue || [],
  set: (value) => emit("update:modelValue", value),
});

// Opciones disponibles
const opcionesMedicamentos = ref([]);
const opcionesDosis = ref([]);
const opcionesFrecuencia = ref([]);
const opcionesDuracion = ref([]);

// Opciones filtradas
const opcionesMedicamentosFiltradas = ref([]);
const opcionesDosisFiltradas = ref([]);
const opcionesFrecuenciaFiltradas = ref([]);
const opcionesDuracionFiltradas = ref([]);

// Maps para obtener IDs
const medicamentosMap = ref({});
const dosisMap = ref({});
const frecuenciasMap = ref({});
const duracionesMap = ref({});

// Modales para agregar nuevos elementos
const modalNuevoMedicamento = ref(false);
const modalNuevaDosis = ref(false);
const modalNuevaFrecuencia = ref(false);
const modalNuevaDuracion = ref(false);

// Estados de carga
const guardandoMedicamento = ref(false);
const guardandoDosis = ref(false);
const guardandoFrecuencia = ref(false);
const guardandoDuracion = ref(false);

// Valores para nuevos elementos
const nuevoMedicamento = ref("");
const nuevaDosis = ref("");
const nuevaFrecuencia = ref("");
const nuevaDuracion = ref("");

// Índice de la fila actual que se está modificando
const filaActual = ref(0);

// Cargar datos iniciales
onMounted(async () => {
  await Promise.all([
    cargarMedicamentos(),
    cargarDosis(),
    cargarFrecuencias(),
    cargarDuraciones(),
  ]);
});

// Funciones para cargar datos desde API
async function cargarMedicamentos() {
  try {
    const { data } = await api.get("/medicamentos");
    opcionesMedicamentos.value = data.map((m) => m.nombre);
    opcionesMedicamentosFiltradas.value = [...opcionesMedicamentos.value];
    medicamentosMap.value = {};
    data.forEach(m => medicamentosMap.value[m.nombre] = m.id);
    return true;
  } catch (error) {
    console.error("Error al cargar medicamentos:", error);
    return false;
  }
}

async function cargarDosis() {
  try {
    const { data } = await api.get("/dosis");
    opcionesDosis.value = data.map((d) => d.descripcion);
    opcionesDosisFiltradas.value = [...opcionesDosis.value];
    dosisMap.value = {};
    data.forEach(d => dosisMap.value[d.descripcion] = d.id);
    return true;
  } catch (error) {
    console.error("Error al cargar dosis:", error);
    return false;
  }
}

async function cargarFrecuencias() {
  try {
    const { data } = await api.get("/frecuencias");
    opcionesFrecuencia.value = data.map((f) => f.descripcion);
    opcionesFrecuenciaFiltradas.value = [...opcionesFrecuencia.value];
    frecuenciasMap.value = {};
    data.forEach(f => frecuenciasMap.value[f.descripcion] = f.id);
    return true;
  } catch (error) {
    console.error("Error al cargar frecuencias:", error);
    return false;
  }
}

async function cargarDuraciones() {
  try {
    const { data } = await api.get("/duraciones");
    opcionesDuracion.value = data.map((d) => d.descripcion);
    opcionesDuracionFiltradas.value = [...opcionesDuracion.value];
    duracionesMap.value = {};
    data.forEach(d => duracionesMap.value[d.descripcion] = d.id);
    return true;
  } catch (error) {
    console.error("Error al cargar duraciones:", error);
    return false;
  }
}

// Funciones para filtrar opciones en los selects
function filtrarMedicamentos(val, update) {
  update(() => {
    if (val === '') {
      opcionesMedicamentosFiltradas.value = opcionesMedicamentos.value;
    } else {
      const needle = val.toLowerCase();
      opcionesMedicamentosFiltradas.value = opcionesMedicamentos.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
}

function filtrarDosis(val, update) {
  update(() => {
    if (val === '') {
      opcionesDosisFiltradas.value = opcionesDosis.value;
    } else {
      const needle = val.toLowerCase();
      opcionesDosisFiltradas.value = opcionesDosis.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
}

function filtrarFrecuencia(val, update) {
  update(() => {
    if (val === '') {
      opcionesFrecuenciaFiltradas.value = opcionesFrecuencia.value;
    } else {
      const needle = val.toLowerCase();
      opcionesFrecuenciaFiltradas.value = opcionesFrecuencia.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
}

function filtrarDuracion(val, update) {
  update(() => {
    if (val === '') {
      opcionesDuracionFiltradas.value = opcionesDuracion.value;
    } else {
      const needle = val.toLowerCase();
      opcionesDuracionFiltradas.value = opcionesDuracion.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
}

// Funciones para actualizar IDs cuando se selecciona un valor
function actualizarMedicamentoId(filaIndex, valor) {
  if (tratamientos.value[filaIndex]) {
    tratamientos.value[filaIndex].medicamento_id = medicamentosMap.value[valor] || null;
  }
}

function actualizarDosisId(filaIndex, valor) {
  if (tratamientos.value[filaIndex]) {
    tratamientos.value[filaIndex].dosis_id = dosisMap.value[valor] || null;
  }
}

function actualizarFrecuenciaId(filaIndex, valor) {
  if (tratamientos.value[filaIndex]) {
    tratamientos.value[filaIndex].frecuencia_id = frecuenciasMap.value[valor] || null;
  }
}

function actualizarDuracionId(filaIndex, valor) {
  if (tratamientos.value[filaIndex]) {
    tratamientos.value[filaIndex].duracion_id = duracionesMap.value[valor] || null;
  }
}

// Funciones para mostrar modales
function mostrarModalNuevoMedicamento(filaIndex) {
  filaActual.value = filaIndex;
  nuevoMedicamento.value = "";
  modalNuevoMedicamento.value = true;
}

function mostrarModalNuevaDosis(filaIndex) {
  filaActual.value = filaIndex;
  nuevaDosis.value = "";
  modalNuevaDosis.value = true;
}

function mostrarModalNuevaFrecuencia(filaIndex) {
  filaActual.value = filaIndex;
  nuevaFrecuencia.value = "";
  modalNuevaFrecuencia.value = true;
}

function mostrarModalNuevaDuracion(filaIndex) {
  filaActual.value = filaIndex;
  nuevaDuracion.value = "";
  modalNuevaDuracion.value = true;
}

// Funciones para guardar nuevos elementos
async function guardarNuevoMedicamento() {
  const valor = nuevoMedicamento.value.trim().toUpperCase();
  if (!valor) return;

  guardandoMedicamento.value = true;

  try {
    const response = await api.post('/medicamentos', { nombre: valor });

    // Actualizar la lista de opciones y el map
    if (!opcionesMedicamentos.value.includes(valor)) {
      opcionesMedicamentos.value.push(valor);
      opcionesMedicamentosFiltradas.value = [...opcionesMedicamentos.value];
      medicamentosMap.value[valor] = response.data.medicamento.id;
    }

    // Actualizar el valor en la fila actual
    if (tratamientos.value[filaActual.value]) {
      tratamientos.value[filaActual.value].medicamento = valor;
      tratamientos.value[filaActual.value].medicamento_id = response.data.medicamento.id;
    }

    modalNuevoMedicamento.value = false;

    $q.notify({
      color: "positive",
      message: "Medicamento guardado correctamente",
      icon: "check",
    });
  } catch (error) {
    console.error("Error al guardar medicamento:", error);
    $q.notify({
      color: "negative",
      message: "Error al guardar medicamento",
      icon: "error",
    });
  } finally {
    guardandoMedicamento.value = false;
  }
}

async function guardarNuevaDosis() {
  const valor = nuevaDosis.value.trim().toUpperCase();
  if (!valor) return;

  guardandoDosis.value = true;

  try {
    const response = await api.post('/dosis', { descripcion: valor });

    if (!opcionesDosis.value.includes(valor)) {
      opcionesDosis.value.push(valor);
      opcionesDosisFiltradas.value = [...opcionesDosis.value];
      dosisMap.value[valor] = response.data.dosis.id;
    }

    if (tratamientos.value[filaActual.value]) {
      tratamientos.value[filaActual.value].dosis = valor;
      tratamientos.value[filaActual.value].dosis_id = response.data.dosis.id;
    }

    modalNuevaDosis.value = false;

    $q.notify({
      color: "positive",
      message: "Dosis guardada correctamente",
      icon: "check",
    });
  } catch (error) {
    console.error("Error al guardar dosis:", error);
    $q.notify({
      color: "negative",
      message: "Error al guardar dosis",
      icon: "error",
    });
  } finally {
    guardandoDosis.value = false;
  }
}

async function guardarNuevaFrecuencia() {
  const valor = nuevaFrecuencia.value.trim().toUpperCase();
  if (!valor) return;

  guardandoFrecuencia.value = true;

  try {
    const response = await api.post('/frecuencias', { descripcion: valor });

    if (!opcionesFrecuencia.value.includes(valor)) {
      opcionesFrecuencia.value.push(valor);
      opcionesFrecuenciaFiltradas.value = [...opcionesFrecuencia.value];
      frecuenciasMap.value[valor] = response.data.frecuencia.id;
    }

    if (tratamientos.value[filaActual.value]) {
      tratamientos.value[filaActual.value].frecuencia = valor;
      tratamientos.value[filaActual.value].frecuencia_id = response.data.frecuencia.id;
    }

    modalNuevaFrecuencia.value = false;

    $q.notify({
      color: "positive",
      message: "Frecuencia guardada correctamente",
      icon: "check",
    });
  } catch (error) {
    console.error("Error al guardar frecuencia:", error);
    $q.notify({
      color: "negative",
      message: "Error al guardar frecuencia",
      icon: "error",
    });
  } finally {
    guardandoFrecuencia.value = false;
  }
}

async function guardarNuevaDuracion() {
  const valor = nuevaDuracion.value.trim().toUpperCase();
  if (!valor) return;

  guardandoDuracion.value = true;

  try {
    const response = await api.post('/duraciones', { descripcion: valor });

    if (!opcionesDuracion.value.includes(valor)) {
      opcionesDuracion.value.push(valor);
      opcionesDuracionFiltradas.value = [...opcionesDuracion.value];
      duracionesMap.value[valor] = response.data.duracion.id;
    }

    if (tratamientos.value[filaActual.value]) {
      tratamientos.value[filaActual.value].duracion = valor;
      tratamientos.value[filaActual.value].duracion_id = response.data.duracion.id;
    }

    modalNuevaDuracion.value = false;

    $q.notify({
      color: "positive",
      message: "Duración guardada correctamente",
      icon: "check",
    });
  } catch (error) {
    console.error("Error al guardar duración:", error);
    $q.notify({
      color: "negative",
      message: "Error al guardar duración",
      icon: "error",
    });
  } finally {
    guardandoDuracion.value = false;
  }
}

// Agregar una nueva fila al formulario
function agregarNuevaFila() {
  const nuevosTratamientos = [...tratamientos.value];
  nuevosTratamientos.push({
    medicamento: null,
    dosis: null,
    frecuencia: null,
    duracion: null,
    medicamento_id: null,
    dosis_id: null,
    frecuencia_id: null,
    duracion_id: null,
  });

  tratamientos.value = nuevosTratamientos;
}

// Eliminar una fila específica
function eliminarFila(index) {
  const nuevosTratamientos = [...tratamientos.value];
  nuevosTratamientos.splice(index, 1);
  tratamientos.value = nuevosTratamientos;
}

// Métodos públicos
defineExpose({
  eliminarTodos: () => {
    tratamientos.value = [];
  },
  // Método para obtener datos con IDs para enviar al backend
  obtenerDatosParaEnvio: () => {
    return tratamientos.value
      .filter(t => t.medicamento && t.dosis && t.frecuencia && t.duracion)
      .map(t => ({
        medicamento_id: medicamentosMap.value[t.medicamento] || t.medicamento_id,
        dosis_id: dosisMap.value[t.dosis] || t.dosis_id,
        frecuencia_id: frecuenciasMap.value[t.frecuencia] || t.frecuencia_id,
        duracion_id: duracionesMap.value[t.duracion] || t.duracion_id,
      }));
  }
});
</script>

<style scoped>
/* Estilo para las filas y select */
.q-select {
  min-width: 150px;
}

.text-uppercase input {
  text-transform: uppercase;
}

/* Animación para las filas */
.row.items-center {
  transition: all 0.3s ease;
}

.row.items-center:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

/* Estilo para el mensaje de vacío */
.text-center {
  padding: 2rem;
}
</style>
