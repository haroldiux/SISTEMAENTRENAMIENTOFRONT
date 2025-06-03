// src/composables/useDashboard.js
import { ref } from "vue";
import { api } from "src/boot/axios";

export function useDashboard(tipoUsuario = null) {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

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
      }

      console.log("Llamando a endpoint:", endpoint); // Para debug

      const response = await api.get(endpoint);

      console.log("Respuesta del dashboard:", response.data); // Para debug

      if (response.data.success) {
        data.value = response.data.data;
      } else {
        error.value = response.data.message || "Error al cargar el dashboard";
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
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    data,
    fetchDashboard,
  };
}
