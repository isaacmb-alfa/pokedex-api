# Plan de Implementación: Mejoras UI/UX de la Pokédex

## Descripción General

Implementación incremental de 11 mejoras de UI/UX sobre la Pokédex existente (HTML + Tailwind CSS CDN + Vanilla JS). Cada tarea modifica uno o más de los tres archivos principales: `style.css`, `script.js` e `index.html`. Las tareas se ordenan para que cada paso sea funcional por sí solo y se integre con el anterior.

---

## Tareas

- [x] 1. Introducir el estado centralizado y utilidades base en `script.js`
  - [x] 1.1 Declarar el objeto `appState` con las propiedades `lastUrl`, `activeFilter`, `isTypeFilter`, `expectedCount`, `retryCallback` e `isFetching`
    - Sustituye las variables sueltas `nextUrl` e `isFetching` existentes
    - _Requisitos: 1.5, 2.1, 4.1, 5.1_
  - [x] 1.2 Implementar la función utilitaria `debounce(fn, delay)` en `script.js`
    - Función pura con cierre de temporizador interno
    - _Requisitos: 5.1, 5.2, 5.3_
  - [ ]* 1.3 Escribir test de propiedad para `debounce`
    - **Propiedad 6: El debounce garantiza una única petición por ráfaga de envíos**
    - **Valida: Requisitos 5.1, 5.2**

- [x] 2. Implementar Skeleton Cards con efecto Shimmer (Requisito 1)
  - [x] 2.1 Añadir las clases CSS `skeleton-card`, `.skeleton`, `.skeleton-img`, `.skeleton-text`, `.skeleton-text-sm` y la animación `@keyframes shimmer` con la clase `.shimmer` en `style.css`
    - _Requisitos: 1.1, 1.2_
  - [x] 2.2 Crear las funciones `mostrarSkeletons(count)` y `eliminarSkeletons()` en `script.js`
    - `mostrarSkeletons` inserta `count` skeleton cards en `#pokemon-container`
    - `eliminarSkeletons` elimina todos los nodos con clase `skeleton-card`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 2.3 Integrar `mostrarSkeletons` y `eliminarSkeletons` en `fetchPokemonData`: llamar a `mostrarSkeletons` al inicio y a `eliminarSkeletons` antes de renderizar o mostrar el error
    - _Requisitos: 1.1, 1.3, 1.4_
  - [ ]* 2.4 Escribir test de propiedad para los Skeleton Cards
    - **Propiedad 1: Los Skeleton Cards coinciden con el límite esperado**
    - **Valida: Requisitos 1.5**
  - [ ]* 2.5 Escribir test de propiedad para el reemplazo de Skeleton Cards por Cards reales
    - **Propiedad 2: Las Cards reales reemplazan a los Skeleton Cards**
    - **Valida: Requisitos 1.3**

- [x] 3. Implementar filtro activo en la navegación (Requisitos 2 y 9)
  - [x] 3.1 Añadir las reglas CSS `.btn-header.active` y `#ver-todos.active` en `style.css`
    - `outline: 3px solid currentColor`, `opacity: 1`, `font-weight: 800`, `box-shadow` diferenciada
    - `#ver-todos.active` usa `outline-color: #3b82f6`
    - _Requisitos: 2.3, 9.1, 9.2, 9.3_
  - [x] 3.2 Crear la función `setFiltroActivo(id)` en `script.js`, conectarla al listener de `botonesHeader` y activar "Ver todos" al cargar la página
    - Elimina la clase `active` de todos los botones y la añade al botón con el `id` recibido
    - Actualiza `appState.activeFilter`
    - _Requisitos: 2.1, 2.2, 2.4, 9.1, 9.2, 9.3_
  - [ ]* 3.3 Escribir test de propiedad para la exclusividad del filtro activo
    - **Propiedad 3: Exclusividad del filtro activo**
    - **Valida: Requisitos 2.1, 2.2, 2.4**

- [x] 4. Checkpoint — Skeleton, filtro activo y estado centralizado verificados ✅

- [x] 5. Implementar Error Card con botón "Reintentar" (Requisito 3)
  - [x] 5.1 Crear la función `mostrarErrorCard(mensaje, retryFn)` en `script.js`
    - Elimina skeletons y limpia el contenedor antes de insertar la Error Card
    - Asigna `appState.retryCallback` y registra el listener del botón "Reintentar"
    - Elimina el atributo `disabled` del botón `#ver-todos`
    - _Requisitos: 3.1, 3.2, 3.3, 3.5_
  - [x] 5.2 Sustituir todos los bloques `catch` de `fetchPokemonData` y `searchPokemon` para que invoquen `mostrarErrorCard` en lugar de `alert()` o `console.error()`
    - Incluye el caso de búsqueda sin resultados (Requisito 3.4)
    - _Requisitos: 3.1, 3.4_
  - [ ]* 5.3 Escribir test de propiedad para la Error Card
    - **Propiedad 4: Error Card reemplaza al alert nativo**
    - **Valida: Requisitos 3.1, 3.2**

- [x] 6. Implementar visibilidad del botón "Cargar Más" según el filtro (Requisito 4)
  - [x] 6.1 Crear las funciones `ocultarCargarMas()` y `mostrarCargarMas()` en `script.js`
    - `ocultarCargarMas` añade la clase `hidden` a `#load-more` y pone `appState.isTypeFilter = true`
    - `mostrarCargarMas` elimina la clase `hidden` y pone `appState.isTypeFilter = false`
    - _Requisitos: 4.1, 4.2, 4.3_
  - [x] 6.2 Conectar `ocultarCargarMas` y `mostrarCargarMas` al listener de `botonesHeader`
    - Llamar a `ocultarCargarMas` para filtros de tipo y a `mostrarCargarMas` para "Ver todos"
    - _Requisitos: 4.1, 4.2_
  - [ ]* 6.3 Escribir test de propiedad para la visibilidad del botón "Cargar Más"
    - **Propiedad 5: El botón "Cargar Más" se oculta al filtrar por tipo**
    - **Valida: Requisitos 4.1**

- [x] 7. Conectar el debounce al formulario de búsqueda (Requisito 5)
  - [x] 7.1 Crear `debouncedSearch` aplicando la función `debounce` sobre `searchPokemon` con 300 ms
  - [x] 7.2 Actualizar el listener del formulario `#search-form` para invocar `debouncedSearch` en lugar de `searchPokemon` directamente
    - Ignora el evento si el campo `#search-input` está vacío
    - _Requisitos: 5.1, 5.2, 5.3_

- [x] 8. Implementar color de fondo de Cards por tipo y animación fadeIn (Requisitos 6 y 7)
  - [x] 8.1 Añadir las 18 clases `{tipo}-bg` con `background-color` y `color` correspondientes en `style.css`, reutilizando las variables `--type-*` ya declaradas
    - _Requisitos: 6.1, 6.2, 6.3_
  - [x] 8.2 Añadir el keyframe `@keyframes fadeIn` y la clase `.card-fade-in` en `style.css`
    - Inicio: `opacity: 0; transform: translateY(12px)` — fin: `opacity: 1; transform: translateY(0)`; duración 400 ms, `ease-out`
    - _Requisitos: 7.1, 7.2, 7.3_
  - [x] 8.3 Modificar `imprimirPokemones` en `script.js` para asignar `{tipoPrincipal}-bg` y `card-fade-in` a `card.className`
    - _Requisitos: 6.1, 7.3_
  - [ ]* 8.4 Escribir test de propiedad para la clase de color de la Card
    - **Propiedad 7: La clase de color de la Card coincide con el tipo principal**
    - **Valida: Requisitos 6.1**
  - [ ]* 8.5 Escribir test de propiedad para la clase fadeIn en las Cards
    - **Propiedad 8: Cada Card recibe la clase de animación fadeIn**
    - **Valida: Requisitos 7.3**

- [x] 9. Implementar hover pronunciado en las Cards (Requisito 8)
  - [x] 9.1 Añadir al selector `.pokemon-card` en `style.css` las reglas `transition: transform 0.2s ease, box-shadow 0.2s ease` y `cursor: pointer`
    - _Requisitos: 8.2, 8.3_
  - [x] 9.2 Añadir el selector `.pokemon-card:hover` en `style.css` con `transform: scale(1.05)` y `box-shadow: 0 8px 24px rgba(0,0,0,0.18)`
    - _Requisitos: 8.1_

- [x] 10. Checkpoint — Cards, animaciones y hover verificados ✅

- [x] 11. Rediseñar el Modal estilo Pokédex (Requisito 10)
  - [x] 11.1 Actualizar la estructura HTML del Modal en `index.html`: añadir `#modal-header` con las imágenes (`#modal-img-oficial`, `#modal-img-shiny`), título, tipos y contenedor de stats/habilidades/movimientos en `#modal-body`
    - _Requisitos: 10.1, 10.2_
  - [x] 11.2 Añadir las reglas CSS para las Barras de Stat en `style.css`: selector genérico `.stat-bar` más los colores diferenciados por nombre de stat (`hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`)
    - _Requisitos: 10.3_
  - [x] 11.3 Refactorizar la función `showModal` en `script.js`:
    - Extraer `fetchPokemonDetail(pokemonId)` como función auxiliar reutilizable
    - Poblar `#modal-header` con imagen (con fallback), sprite shiny, nombre, ID y badges de tipo
    - Establecer `background-color` de `#modal-header` con `var(--type-{tipoPrincipal})`
    - Calcular el ancho de las Barras de Stat como `((base_stat / 255) * 100).toFixed(1)`
    - Renderizar lista de habilidades y primeros 10 movimientos de `data.moves`
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  - [ ]* 11.4 Escribir test de propiedad para el contenido del Modal
    - **Propiedad 9: El Modal contiene todos los elementos requeridos del Pokémon**
    - **Valida: Requisitos 10.1, 10.2**
  - [ ]* 11.5 Escribir test de propiedad para el cálculo del ancho de las Barras de Stat
    - **Propiedad 10: El cálculo del ancho de las Barras de Stat es correcto**
    - **Valida: Requisitos 10.4**
  - [ ]* 11.6 Escribir test de propiedad para el color de cabecera del Modal
    - **Propiedad 11: El color de cabecera del Modal coincide con el tipo principal del Pokémon**
    - **Valida: Requisitos 10.5, 10.6**

- [x] 12. Implementar animación de entrada y salida del Modal (Requisito 11)
  - [x] 12.1 Añadir los keyframes `@keyframes modalEntrada` y `@keyframes modalSalida` en `style.css`, junto con las clases `.modal-content.modal-entrada` y `.modal-content.modal-salida`
    - `transform-origin: center top`
    - Entrada: 300 ms `ease-out`; salida: 200 ms `ease-out`
    - _Requisitos: 11.1, 11.2, 11.4_
  - [x] 12.2 Crear las funciones `abrirModal()` y `cerrarModal()` en `script.js`
    - `abrirModal` elimina `modal-salida`, añade `modal-entrada` y pone `display: block`
    - `cerrarModal` elimina `modal-entrada`, añade `modal-salida` y oculta el modal al terminar `animationend` (listener `{ once: true }`)
    - _Requisitos: 11.1, 11.3_
  - [x] 12.3 Conectar `abrirModal` al final de `showModal` y `cerrarModal` a los listeners de cierre (botón `.close` y clic en el overlay)
    - _Requisitos: 11.1, 11.3_

- [x] 13. Checkpoint final — Modal rediseñado y animaciones verificados ✅

---

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia los requisitos concretos para trazabilidad completa.
- Los checkpoints intermedios garantizan validación incremental y evitan regresiones.
- Los tests de propiedad verifican las garantías universales definidas en el documento de diseño.
- Los tests unitarios validan ejemplos concretos y casos borde.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1", "3.2"] },
    { "id": 3, "tasks": ["2.4", "2.5", "3.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1", "7.1"] },
    { "id": 5, "tasks": ["5.3", "6.2", "6.3", "7.2", "8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3", "9.1", "9.2"] },
    { "id": 7, "tasks": ["8.4", "8.5", "11.1", "11.2"] },
    { "id": 8, "tasks": ["11.3", "12.1"] },
    { "id": 9, "tasks": ["11.4", "11.5", "11.6", "12.2"] },
    { "id": 10, "tasks": ["12.3"] }
  ]
}
```
