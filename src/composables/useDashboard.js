// src/composables/useDashboard.js
import { ref } from "vue";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";

export function useDashboard(tipoUsuario = null) {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);
  const $q = useQuasar();

  const fetchDashboard = async () => {
    loading.value = true;
    error.value = null;

    try {
      let endpoint = "/dashboard";

      // Determinar el endpoint según el tipo de usuario
      if (tipoUsuario === "ADMINISTRADOR") {
        endpoint = "/dashboard/admin";
      } else if (tipoUsuario === "DOCENTE") {
        endpoint = "/dashboard/docente";
      } else if (tipoUsuario === "ESTUDIANTE") {
        endpoint = "/dashboard/estudiante";
      }

      console.log("Llamando a endpoint:", endpoint); // Para debug

      const response = await api.get(endpoint);

      console.log("Respuesta del dashboard:", response.data); // Para debug

      if (response.data.success) {
        data.value = response.data.data;
      } else {
        error.value = response.data.message || "Error al cargar el dashboard";
        $q.notify({
          type: "negative",
          message: error.value,
          position: "top",
        });
      }
    } catch (err) {
      console.error("Error en fetchDashboard:", err); // Para debug

      if (err.response?.status === 401) {
        error.value = "No tienes autorización para acceder a este dashboard";
      } else if (err.response?.status === 403) {
        error.value = "No tienes permisos para acceder a este dashboard";
      } else if (err.response?.status === 404) {
        error.value = "Endpoint del dashboard no encontrado";
      } else {
        error.value =
          err.response?.data?.message || "Error al cargar el dashboard";
      }

      $q.notify({
        type: "negative",
        message: error.value,
        position: "top",
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene solo las evaluaciones pendientes (específico para estudiantes)
   */
  const fetchEvaluacionesPendientes = async () => {
    try {
      const response = await api.get('/estudiante/evaluaciones/pendientes');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al cargar evaluaciones');
      }
    } catch (err) {
      console.error('Error en fetchEvaluacionesPendientes:', err);
      $q.notify({
        type: 'negative',
        message: err.message || 'Error al cargar evaluaciones pendientes',
        position: 'top'
      });
      return [];
    }
  };

  /**
   * Obtiene el historial de casos resueltos (específico para estudiantes)
   */
  const fetchHistorialCasos = async () => {
    try {
      const response = await api.get('/estudiante/casos/historial');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al cargar historial');
      }
    } catch (err) {
      console.error('Error en fetchHistorialCasos:', err);
      $q.notify({
        type: 'negative',
        message: err.message || 'Error al cargar historial de casos',
        position: 'top'
      });
      return [];
    }
  };

  /**
   * Obtiene exámenes complementarios disponibles (específico para estudiantes)
   */
  const fetchExamenesComplementarios = async () => {
    try {
      const response = await api.get('/estudiante/examenes-complementarios');

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al cargar exámenes');
      }
    } catch (err) {
      console.error('Error en fetchExamenesComplementarios:', err);
      $q.notify({
        type: 'negative',
        message: err.message || 'Error al cargar exámenes complementarios',
        position: 'top'
      });
      return [];
    }
  };

  return {
    loading,
    error,
    data,
    fetchDashboard,
    // Métodos adicionales para el estudiante
    fetchEvaluacionesPendientes,
    fetchHistorialCasos,
    fetchExamenesComplementarios
  };
}
