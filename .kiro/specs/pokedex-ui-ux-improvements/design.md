# Documento de Diseño Técnico — Mejoras UI/UX de la Pokédex

## Visión General

Este documento describe la arquitectura técnica y los componentes necesarios para implementar las 11 mejoras de UI/UX en la Pokédex web existente. El proyecto está construido con HTML, Tailwind CSS (CDN) y Vanilla JavaScript, consumiendo la PokéAPI.

Las mejoras se organizan en tres capas:
1. **Capa de presentación** — cambios en `style.css` e `index.html`
2. **Capa lógica** — cambios en `script.js`
3. **Capa de interacción** — nuevos manejadores de eventos y gestión de estado

---

## Arquitectura de Componentes

### Estado de la aplicación

Se introduce un objeto de estado centralizado en `script.js` para rastrear el contexto actual:

```javascript
const appState = {
  lastUrl: 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=0',
  activeFilter: 'ver-todos',     // ID del botón de filtro activo
  isTypeFilter: false,           // true cuando hay un filtro de tipo activo
  expectedCount: 12,             // número de skeleton cards a mostrar
  retryCallback: null            // función a ejecutar al hacer clic en "Reintentar"
};
```

Este objeto reemplaza las variables sueltas existentes (`nextUrl`, `isFetching`) y centraliza la gestión de estado.

---

## Componentes y Módulos

### Módulo 1: Skeleton Cards (Requisito 1)

**Responsabilidad:** Mostrar marcadores de posición animados mientras se cargan los datos.

**Funciones nuevas en `script.js`:**

```javascript
// Inserta N skeleton cards en el contenedor
function mostrarSkeletons(count = 12) { ... }

// Elimina todos los skeleton cards del contenedor
function eliminarSkeletons() { ... }
```

**Estructura HTML de un Skeleton Card:**

```html
<div class="skeleton-card bg-white p-4 rounded-lg shadow-md">
  <div class="skeleton skeleton-img shimmer"></div>
  <div class="skeleton skeleton-text shimmer"></div>
  <div class="skeleton skeleton-text-sm shimmer"></div>
</div>
```

**Clases CSS en `style.css`:**

```css
.skeleton-card { /* contenedor */ }
.skeleton { background-color: #e0e0e0; border-radius: 4px; }
.skeleton-img { width: 100%; height: 120px; }
.skeleton-text { height: 1rem; margin: 0.5rem 0; width: 70%; }
.skeleton-text-sm { height: 0.75rem; width: 50%; }

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Integración con el flujo existente:** La función `fetchPokemonData` llama a `mostrarSkeletons()` al inicio y a `eliminarSkeletons()` antes de renderizar o mostrar el error.

---

### Módulo 2: Filtro Activo en la Navegación (Requisitos 2 y 9)

**Responsabilidad:** Marcar visualmente el filtro de tipo seleccionado.

**Función nueva en `script.js`:**

```javascript
function setFiltroActivo(id) {
  botonesHeader.forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  appState.activeFilter = id;
}
```

**CSS en `style.css`:**

```css
.btn-header.active {
  outline: 3px solid currentColor;
  opacity: 1;
  font-weight: 800;
  box-shadow: 0 0 2rem rgba(0, 0, 0, .35);
}

#ver-todos.active {
  outline-color: #3b82f6;
}
```

---

### Módulo 3: Error Card con "Reintentar" (Requisito 3)

**Responsabilidad:** Reemplazar los `alert()` y `console.error()` con un elemento visual dentro del grid.

**Función nueva en `script.js`:**

```javascript
function mostrarErrorCard(mensaje, retryFn) {
  eliminarSkeletons();
  container.innerHTML = '';
  appState.retryCallback = retryFn;
  const card = document.createElement('div');
  card.className = 'error-card col-span-4 ...';
  card.innerHTML = `
    <p class="error-mensaje">${mensaje}</p>
    <button id="btn-reintentar" class="...">Reintentar</button>
  `;
  container.appendChild(card);
  document.getElementById('btn-reintentar')
    .addEventListener('click', () => retryFn());
  botonVerTodos.removeAttribute('disabled');
}
```

**Integración:** Todos los bloques `catch` de `fetchPokemonData` y `searchPokemon` invocan `mostrarErrorCard` en lugar de `alert()` o `console.error()`.

---

### Módulo 4: Visibilidad del botón "Cargar Más" (Requisito 4)

**Responsabilidad:** Ocultar/mostrar `#load-more` según el contexto del filtro.

**Funciones en `script.js`:**

```javascript
function ocultarCargarMas() {
  document.getElementById('load-more').classList.add('hidden');
  appState.isTypeFilter = true;
}

function mostrarCargarMas() {
  document.getElementById('load-more').classList.remove('hidden');
  appState.isTypeFilter = false;
}
```

**Integración:** El listener de `botonesHeader` llama a `ocultarCargarMas()` para filtros de tipo y `mostrarCargarMas()` para "Ver todos".

---

### Módulo 5: Debounce en el formulario de búsqueda (Requisito 5)

**Responsabilidad:** Evitar peticiones duplicadas por envíos rápidos del formulario.

**Función en `script.js`:**

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSearch = debounce((query) => {
  if (!query.trim()) return;
  searchPokemon(query);
}, 300);
```

**Integración:** El listener del formulario `#search-form` invoca `debouncedSearch` en lugar de `searchPokemon` directamente.

---

### Módulo 6: Color de fondo de Cards por tipo (Requisito 6)

**Responsabilidad:** Asignar dinámicamente la clase de color del tipo principal a cada Card.

**Cambio en `imprimirPokemones`:**

```javascript
const tipoPrincipal = data.types[0].type.name;
card.className = `${tipoPrincipal}-bg p-4 rounded-lg shadow-md card-fade-in`;
```

**CSS en `style.css`:**

```css
.normal-bg   { background-color: var(--type-normal);   color: var(--clr-black); }
.fire-bg     { background-color: var(--type-fire);     color: var(--clr-black); }
.water-bg    { background-color: var(--type-water);    color: var(--clr-white); }
.grass-bg    { background-color: var(--type-grass);    color: var(--clr-black); }
.electric-bg { background-color: var(--type-electric); color: var(--clr-black); }
.ice-bg      { background-color: var(--type-ice);      color: var(--clr-black); }
.fighting-bg { background-color: var(--type-fighting); color: var(--clr-white); }
.poison-bg   { background-color: var(--type-poison);   color: var(--clr-white); }
.ground-bg   { background-color: var(--type-ground);   color: var(--clr-black); }
.flying-bg   { background-color: var(--type-flying);   color: var(--clr-black); }
.psychic-bg  { background-color: var(--type-psychic);  color: var(--clr-black); }
.bug-bg      { background-color: var(--type-bug);      color: var(--clr-black); }
.rock-bg     { background-color: var(--type-rock);     color: var(--clr-black); }
.ghost-bg    { background-color: var(--type-ghost);    color: var(--clr-white); }
.dark-bg     { background-color: var(--type-dark);     color: var(--clr-white); }
.dragon-bg   { background-color: var(--type-dragon);   color: var(--clr-white); }
.steel-bg    { background-color: var(--type-steel);    color: var(--clr-black); }
.fairy-bg    { background-color: var(--type-fairy);    color: var(--clr-black); }
```

---

### Módulo 7: Animación fadeIn en las Cards (Requisito 7)

**Responsabilidad:** Aplicar una transición suave de aparición a cada Card.

**CSS en `style.css`:**

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-fade-in {
  animation: fadeIn 0.4s ease-out both;
}
```

**Integración:** La clase `card-fade-in` se incluye en `card.className` dentro de `imprimirPokemones` (ya contemplado en Módulo 6).

---

### Módulo 8: Hover pronunciado en las Cards (Requisito 8)

**Responsabilidad:** Añadir retroalimentación visual al pasar el cursor sobre las Cards.

**CSS en `style.css`:**

```css
.pokemon-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.pokemon-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
```

---

### Módulo 9: Modal rediseñado estilo Pokédex (Requisito 10)

**Responsabilidad:** Mostrar información detallada y enriquecida del Pokémon.

**Datos del Pokémon a mostrar:**
- Imagen oficial (`front_default` del artwork oficial), con fallback a `data.sprites.front_default`
- Sprite Shiny (`front_shiny`)
- Nombre e ID
- Tipos como Badges coloreados
- Stats base como Barras de Stat coloreadas
- Lista de habilidades
- Primeros 10 movimientos de `data.moves`

**Mapa de colores de stats:**

```javascript
const colorStats = {
  hp:              '#22c55e',  // verde
  attack:          '#ef4444',  // rojo
  defense:         '#3b82f6',  // azul
  'special-attack':  '#f97316',  // naranja
  'special-defense': '#06b6d4',  // cian
  speed:           '#eab308',  // amarillo
};
```

**Función de cálculo del ancho de barra:**

```javascript
// ancho porcentual redondeado a 1 decimal
const anchoPct = ((base_stat / 255) * 100).toFixed(1);
```

**Estructura HTML del Modal rediseñado:**

```html
<div id="myModal" class="modal">
  <div class="modal-content modal-entrada">
    <span class="close">&times;</span>
    <div id="modal-header" class="modal-header">
      <!-- Color de fondo dinámico según tipo principal -->
      <img id="modal-img-oficial" />
      <img id="modal-img-shiny" />
      <h2 id="modal-title"></h2>
      <div id="modal-tipos"></div>
    </div>
    <div id="modal-body">
      <!-- Stats, habilidades y movimientos -->
    </div>
  </div>
</div>
```

**Función `showModal` refactorizada:**

```javascript
async function showModal(pokemonId) {
  const data = await fetchPokemonDetail(pokemonId);
  const tipoPrincipal = data.types[0].type.name;
  // Cabecera con color dinámico
  document.getElementById('modal-header').style.backgroundColor =
    `var(--type-${tipoPrincipal})`;
  // Imagen con fallback
  const imgSrc = data.sprites.other['official-artwork'].front_default
    ?? data.sprites.front_default;
  // ... poblar el resto del modal
  abrirModal();
}
```

---

### Módulo 10: Animación de entrada/salida del Modal (Requisito 11)

**Responsabilidad:** Aplicar transiciones fluidas al abrir y cerrar el modal.

**CSS en `style.css`:**

```css
@keyframes modalEntrada {
  from { opacity: 0; transform: scale(0.9) translateY(-20px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}

@keyframes modalSalida {
  from { opacity: 1; transform: scale(1)   translateY(0); }
  to   { opacity: 0; transform: scale(0.9) translateY(-20px); }
}

.modal-content {
  transform-origin: center top;
}

.modal-content.modal-entrada {
  animation: modalEntrada 0.3s ease-out both;
}

.modal-content.modal-salida {
  animation: modalSalida 0.2s ease-out both;
}
```

**Funciones en `script.js`:**

```javascript
function abrirModal() {
  const modal    = document.getElementById('myModal');
  const content  = modal.querySelector('.modal-content');
  content.classList.remove('modal-salida');
  content.classList.add('modal-entrada');
  modal.style.display = 'block';
}

function cerrarModal() {
  const modal   = document.getElementById('myModal');
  const content = modal.querySelector('.modal-content');
  content.classList.remove('modal-entrada');
  content.classList.add('modal-salida');
  content.addEventListener('animationend', () => {
    modal.style.display = 'none';
  }, { once: true });
}
```

---

## Modelo de Datos

### Datos del Pokémon (PokéAPI)

Los datos relevantes de la respuesta de la PokéAPI se mapean de la siguiente manera:

| Campo en `data`                                          | Uso                              |
|----------------------------------------------------------|----------------------------------|
| `data.id`                                               | ID del Pokémon                   |
| `data.name`                                             | Nombre del Pokémon               |
| `data.types[0].type.name`                               | Tipo principal (color Card/Modal)|
| `data.sprites.other['official-artwork'].front_default`   | Imagen principal                 |
| `data.sprites.other['official-artwork'].front_shiny`     | Sprite shiny                     |
| `data.sprites.front_default`                            | Fallback de imagen               |
| `data.stats[].stat.name` + `data.stats[].base_stat`     | Stats base para barras           |
| `data.abilities[].ability.name`                         | Habilidades                      |
| `data.moves[0..9][].move.name`                          | Primeros 10 movimientos          |
| `data.height / 10`                                      | Altura en metros                 |
| `data.weight / 10`                                      | Peso en kilogramos               |

---

## Manejo de Errores

| Escenario                             | Comportamiento                                            |
|---------------------------------------|-----------------------------------------------------------|
| Error de red en `fetchPokemonData`    | `mostrarErrorCard(msg, () => fetchPokemonData(lastUrl))`  |
| Error 404 en `searchPokemon`          | `mostrarErrorCard('No se encontró el Pokémon. Inténtalo nuevamente.', lastSearchFn)` |
| Imagen oficial `null` en Card         | Fallback a `data.sprites.front_default`                   |
| Imagen oficial `null` en Modal        | Fallback a `data.sprites.front_default`                   |
| `nextUrl` es `null` al cargar más     | Mostrar Error Card con mensaje "No hay más Pokémon"       |

---

## Flujo de Petición Principal (Actualizado)

```
Usuario interactúa
    │
    ▼
setFiltroActivo(id)
    │
    ▼
mostrarSkeletons(12)  ←── inserta skeleton cards
    │
    ▼
fetchPokemonData(url)
    │
    ├── Éxito ──► eliminarSkeletons() → imprimirPokemones() (con card-fade-in)
    │
    └── Error ──► mostrarErrorCard(msg, retryFn)
```

---

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe cumplirse en todas las ejecuciones válidas del sistema — esencialmente, un enunciado formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables automáticamente.*

### Propiedad 1: Los Skeleton Cards coinciden con el límite esperado

*Para cualquier* llamada a `fetchPokemonData`, el número de skeleton cards insertados en `#pokemon-container` al inicio de la petición debe ser igual al límite configurado en `appState.expectedCount` (por defecto 12).

**Valida: Requisitos 1.5**

---

### Propiedad 2: Las Cards reales reemplazan a los Skeleton Cards

*Para cualquier* respuesta exitosa de la PokéAPI que contenga N pokémon, el contenedor `#pokemon-container` debe finalizar con exactamente N Cards reales y cero Skeleton Cards.

**Valida: Requisitos 1.3**

---

### Propiedad 3: Exclusividad del filtro activo

*Para cualquier* clic en un botón de la barra de navegación, exactamente un botón debe tener la clase `active` — el botón recién pulsado — y ningún otro botón del grupo debe tenerla simultáneamente.

**Valida: Requisitos 2.1, 2.2, 2.4**

---

### Propiedad 4: Error Card reemplaza al alert nativo

*Para cualquier* petición a la PokéAPI que falle (error de red o HTTP ≠ 200), el contenedor `#pokemon-container` debe contener exactamente una Error Card con un botón "Reintentar", y no debe producirse ninguna llamada a `window.alert()`.

**Valida: Requisitos 3.1, 3.2**

---

### Propiedad 5: El botón "Cargar Más" se oculta al filtrar por tipo

*Para cualquier* clic en un Filtro de Tipo distinto de "Ver todos", el elemento `#load-more` debe tener la clase `hidden` al finalizar el evento.

**Valida: Requisitos 4.1**

---

### Propiedad 6: Debounce garantiza una única petición por ráfaga de envíos

*Para cualquier* secuencia de N envíos del formulario `#search-form` producidos en un intervalo inferior a 300 ms con la misma consulta no vacía, la función `searchPokemon` debe ejecutarse exactamente 1 vez al expirar el intervalo.

**Valida: Requisitos 5.1, 5.2**

---

### Propiedad 7: La clase de color de la Card coincide con el tipo principal

*Para cualquier* objeto de datos de Pokémon, la clase CSS asignada al `<div>` raíz de la Card generada por `imprimirPokemones` debe ser `{tipoPrincipal}-bg`, donde `tipoPrincipal` es `data.types[0].type.name`.

**Valida: Requisitos 6.1**

---

### Propiedad 8: Cada Card recibe la clase de animación fadeIn

*Para cualquier* Card insertada en `#pokemon-container` mediante `imprimirPokemones`, dicha Card debe contener la clase CSS `card-fade-in`.

**Valida: Requisitos 7.3**

---

### Propiedad 9: El Modal contiene todos los elementos requeridos del Pokémon

*Para cualquier* Pokémon con datos válidos de la PokéAPI, al abrir su Modal, el contenido debe incluir: imagen oficial (o fallback), sprite shiny, nombre, ID, al menos un Badge de tipo, al menos una Barra de Stat, al menos una habilidad, y al menos un movimiento.

**Valida: Requisitos 10.1, 10.2**

---

### Propiedad 10: El cálculo del ancho de las Barras de Stat es correcto

*Para cualquier* valor de `base_stat` comprendido entre 0 y 255, el ancho porcentual calculado como `((base_stat / 255) * 100).toFixed(1)` debe producir un número entre `"0.0"` y `"100.0"` (ambos inclusive).

**Valida: Requisitos 10.4**

---

### Propiedad 11: El color de cabecera del Modal coincide con el tipo principal del Pokémon

*Para cualquier* Pokémon, el `background-color` del elemento `#modal-header` al abrir el Modal debe ser la variable CSS `--type-{tipoPrincipal}`, donde `tipoPrincipal` es `data.types[0].type.name`.

**Valida: Requisitos 10.5, 10.6**
