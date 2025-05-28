// src/composables/useFiltro.js

export function useFiltros() {
  function filtrar(val, update, lista) {
    // Asegurarnos de que val sea un string y normalizar
    const filtro = (val || "").toLowerCase();

    // Realizar el filtrado
    update(() => {
      // Si no hay filtro, devolver toda la lista
      if (!filtro) return lista;

      // Filtrar la lista según el tipo de elementos
      return lista.filter((el) => {
        // Manejo de casos null o undefined
        if (el == null) return false;

        // Si es string, filtrar directamente
        if (typeof el === 'string') {
          return el.toLowerCase().includes(filtro);
        }

        // Si es objeto, buscar en propiedades comunes
        if (typeof el === 'object') {
          if (el.nombre) return el.nombre.toLowerCase().includes(filtro);
          if (el.parametro) return el.parametro.toLowerCase().includes(filtro);
          if (el.clasificacion) return el.clasificacion.toLowerCase().includes(filtro);

          // Buscar en todas las propiedades de tipo string
          return Object.values(el).some(valor =>
            typeof valor === 'string' && valor.toLowerCase().includes(filtro)
          );
        }

        // Si no es string ni objeto, convertir a string
        return String(el).toLowerCase().includes(filtro);
      });
    });
  }

  return { filtrar };
}
