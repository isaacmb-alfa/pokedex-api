# Documento de Requisitos — Mejoras UI/UX de la Pokédex

## Introducción

Este documento describe las mejoras de interfaz y experiencia de usuario a implementar en la Pokédex web existente (HTML + Tailwind CSS CDN + Vanilla JS). El proyecto consume la PokéAPI y actualmente presenta funcionalidades básicas de listado, filtrado por tipo, búsqueda y modal de detalle. Las 11 mejoras identificadas se agrupan en dos categorías: UX (experiencia de usuario) y UI (interfaz visual).

---

## Glosario

- **Pokédex**: La aplicación web descrita en `index.html`, `script.js` y `style.css`.
- **Card**: Elemento visual `<div>` que representa a un Pokémon en el grid principal.
- **Skeleton Card**: Marcador de posición animado que ocupa el espacio de una Card mientras sus datos se están cargando.
- **Shimmer**: Efecto de brillo deslizante que se aplica sobre el Skeleton Card para indicar carga activa.
- **Filtro de Tipo**: Botón de la barra de navegación (`btn-header`) que filtra el listado por tipo de Pokémon.
- **Botón Activo**: Estado visual de un Filtro de Tipo que indica cuál es el filtro actualmente seleccionado.
- **Error Card**: Elemento visual que reemplaza al `alert()` nativo para mostrar mensajes de error dentro del grid.
- **Botón "Cargar Más"**: Elemento `#load-more` que solicita la siguiente página de Pokémon a la PokéAPI.
- **Debounce**: Técnica que retrasa la ejecución de una función hasta que el usuario haya dejado de interactuar.
- **Modal**: Panel superpuesto (`#myModal`) que muestra los detalles completos de un Pokémon al hacer clic en su Card.
- **Sprite Shiny**: Imagen alternativa de un Pokémon con su coloración especial ("variocolor").
- **Badge de Tipo**: Etiqueta visual con el color del tipo (`tipo`) que se muestra dentro del Modal.
- **Barra de Stat**: Elemento visual horizontal cuya longitud y color representan el valor de un stat base del Pokémon.
- **PokéAPI**: API REST pública en `https://pokeapi.co/api/v2/` utilizada como fuente de datos.

---

## Requisitos

### Requisito 1 — Skeleton Cards con efecto shimmer durante la carga

**Historia de usuario:** Como usuario, quiero ver indicadores visuales de carga mientras los Pokémon se están obteniendo de la PokéAPI, para que la aplicación no parezca rota o vacía.

#### Criterios de Aceptación

1. WHEN el sistema inicia una petición a la PokéAPI, THE Pokédex SHALL insertar en `#pokemon-container` un conjunto de Skeleton Cards en lugar de mostrar el grid vacío.
2. WHILE una petición a la PokéAPI esté en curso, THE Pokédex SHALL aplicar el efecto Shimmer sobre cada Skeleton Card mediante una animación CSS de degradado deslizante.
3. WHEN la petición a la PokéAPI finaliza con éxito, THE Pokédex SHALL reemplazar todos los Skeleton Cards por las Cards reales de los Pokémon recibidos.
4. IF la petición a la PokéAPI falla, THEN THE Pokédex SHALL reemplazar los Skeleton Cards por una Error Card.
5. THE Pokédex SHALL mostrar un número de Skeleton Cards igual al límite de resultados esperados (12 por defecto).

---

### Requisito 2 — Botón activo en el filtro de tipo

**Historia de usuario:** Como usuario, quiero saber qué filtro de tipo tengo seleccionado en la navegación, para no perder el contexto de lo que estoy viendo.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en un Filtro de Tipo, THE Pokédex SHALL aplicar al botón pulsado una clase CSS `active` que lo diferencie visualmente del resto.
2. WHEN se aplica la clase `active` a un Filtro de Tipo, THE Pokédex SHALL remover la clase `active` de cualquier otro Filtro de Tipo que la tuviera previamente.
3. THE Pokédex SHALL definir la clase `active` en `style.css` con un estilo que incluya al menos: borde resaltado, opacidad plena y sombra diferenciada respecto al estado normal.
4. WHEN el usuario hace clic en "Ver todos", THE Pokédex SHALL aplicar la clase `active` al botón "Ver todos" y removerla del resto.

---

### Requisito 3 — Error Card con botón "Reintentar"

**Historia de usuario:** Como usuario, quiero ver un mensaje de error claro dentro del grid con la opción de reintentar, para no depender de `alert()` del navegador ni perder la interacción visual.

#### Criterios de Aceptación

1. IF una petición a la PokéAPI retorna un error de red o un código de estado HTTP distinto de 200, THEN THE Pokédex SHALL insertar una Error Card en `#pokemon-container` en lugar de llamar a `alert()` o `console.error()`.
2. THE Error Card SHALL contener un texto descriptivo del error ocurrido y un botón con la etiqueta "Reintentar".
3. WHEN el usuario hace clic en el botón "Reintentar" de la Error Card, THE Pokédex SHALL repetir la última petición fallida a la PokéAPI.
4. IF la búsqueda por nombre o ID no encuentra ningún Pokémon, THEN THE Pokédex SHALL mostrar una Error Card con el mensaje "No se encontró el Pokémon. Inténtalo nuevamente." en lugar del `alert()` existente.
5. THE Pokédex SHALL remover la clase `disabled` y los atributos de bloqueo del botón "Ver todos" después de mostrar la Error Card.

---

### Requisito 4 — Ocultar el botón "Cargar Más" al filtrar por tipo

**Historia de usuario:** Como usuario, quiero que el botón "Cargar Más" desaparezca cuando estoy viendo un filtro por tipo, para no confundirme al intentar cargar más resultados en un listado ya completo.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en un Filtro de Tipo distinto de "Ver todos", THE Pokédex SHALL ocultar el botón `#load-more` del DOM aplicando `display: none` o la clase `hidden` de Tailwind.
2. WHEN el usuario hace clic en "Ver todos", THE Pokédex SHALL volver a mostrar el botón `#load-more`.
3. WHILE el Botón "Cargar Más" está oculto, THE Pokédex SHALL mantener deshabilitado el evento `click` del botón `#load-more`.

---

### Requisito 5 — Debounce en el formulario de búsqueda

**Historia de usuario:** Como usuario, quiero que al enviar el formulario de búsqueda no se lancen peticiones duplicadas si presiono "Buscar" varias veces seguidas, para reducir llamadas innecesarias a la PokéAPI.

#### Criterios de Aceptación

1. THE Pokédex SHALL implementar una función `debounce` con un tiempo de espera de 300 ms aplicada al manejador del evento `submit` del formulario `#search-form`.
2. WHEN el usuario envía el formulario `#search-form` varias veces en un intervalo inferior a 300 ms, THE Pokédex SHALL ejecutar la petición a la PokéAPI una única vez al término de dicho intervalo.
3. WHEN el campo `#search-input` está vacío al enviar el formulario, THE Pokédex SHALL ignorar el evento sin realizar ninguna petición a la PokéAPI.

---

### Requisito 6 — Color de fondo de la Card según el tipo principal del Pokémon

**Historia de usuario:** Como usuario, quiero que cada Card tenga el color de fondo correspondiente al tipo principal del Pokémon, para identificar visualmente el tipo sin leer el texto.

#### Criterios de Aceptación

1. WHEN la función `imprimirPokemones` genera una Card, THE Pokédex SHALL asignar al elemento `<div>` raíz de la Card una clase CSS cuyo fondo corresponda al color de la variable CSS del tipo principal (`data.types[0].type.name`).
2. THE Pokédex SHALL definir en `style.css` clases de fondo para cada uno de los 18 tipos existentes, reutilizando las variables CSS `--type-*` ya declaradas.
3. THE Pokédex SHALL ajustar el color del texto de la Card para garantizar contraste legible sobre el fondo de tipo aplicado, usando las mismas reglas de color (`clr-black` / `clr-white`) ya presentes para los badges de tipo.

---

### Requisito 7 — Animación fade-in en las Cards

**Historia de usuario:** Como usuario, quiero que las Cards aparezcan con una transición suave al cargarse, para que la experiencia visual sea más fluida y profesional.

#### Criterios de Aceptación

1. WHEN una Card es añadida al DOM en `#pokemon-container`, THE Pokédex SHALL aplicar a dicha Card una animación CSS `fadeIn` de duración 400 ms con easing `ease-out`.
2. THE Pokédex SHALL definir el keyframe `@keyframes fadeIn` en `style.css` con inicio en `opacity: 0; transform: translateY(12px)` y fin en `opacity: 1; transform: translateY(0)`.
3. THE Pokédex SHALL aplicar la animación mediante la clase `card-fade-in` añadida a cada Card en `imprimirPokemones`.

---

### Requisito 8 — Hover más pronunciado en las Cards

**Historia de usuario:** Como usuario, quiero una retroalimentación visual más clara al pasar el cursor sobre una Card, para percibir claramente que es un elemento interactuable.

#### Criterios de Aceptación

1. WHEN el usuario sitúa el cursor sobre una Card, THE Pokédex SHALL aplicar a dicha Card una transformación `scale(1.05)` y elevar la sombra a `0 8px 24px rgba(0,0,0,0.18)`.
2. THE Pokédex SHALL definir esta transición en `style.css` con `transition: transform 0.2s ease, box-shadow 0.2s ease` en el selector de la Card.
3. THE Pokédex SHALL aplicar el cursor `pointer` a las Cards para indicar que son elementos clicables.

---

### Requisito 9 — Botón activo resaltado visualmente en el nav

> **Nota:** Este requisito es complementario al Requisito 2 y especifica los valores visuales concretos del estilo activo.

**Historia de usuario:** Como usuario, quiero que el botón del filtro activo tenga un resalte visual inequívoco basado en el color del tipo seleccionado, para distinguirlo a primera vista.

#### Criterios de Aceptación

1. THE Pokédex SHALL definir la clase `btn-header.active` en `style.css` con `outline: 3px solid currentColor`, `opacity: 1` y `font-weight: 800`.
2. WHEN el Filtro de Tipo activo corresponde a un tipo concreto (e.g. `fire`), THE Pokédex SHALL preservar el color de fondo del tipo en el botón activo sin sobreescribirlo.
3. THE Pokédex SHALL garantizar que el botón "Ver todos" en estado `active` muestre una diferenciación visual equivalente usando el color de acento `#3b82f6` (blue-500 de Tailwind).

---

### Requisito 10 — Modal rediseñado estilo Pokédex

**Historia de usuario:** Como usuario, quiero que el modal de detalle muestre toda la información relevante del Pokémon con un diseño visual enriquecido al estilo Pokédex, para obtener una experiencia de consulta completa y atractiva.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en una Card, THE Pokédex SHALL mostrar el Modal con: imagen oficial (`front_default` del artwork oficial), sprite Shiny (`front_shiny`), nombre, ID, tipos en Badge de Tipo, stats base como Barra de Stat y lista de habilidades.
2. THE Pokédex SHALL mostrar en el Modal los primeros 10 movimientos del Pokémon como lista, obtenidos de `data.moves`.
3. THE Pokédex SHALL colorear cada Barra de Stat en `style.css` usando un color diferenciado por nombre de stat: `hp` (verde), `attack` (rojo), `defense` (azul), `special-attack` (naranja), `special-defense` (cian), `speed` (amarillo).
4. THE Pokédex SHALL calcular el ancho de cada Barra de Stat como `(base_stat / 255) * 100` porcentaje, redondeado a un decimal.
5. WHEN el Modal se abre, THE Pokédex SHALL establecer el color de fondo de la cabecera del Modal según el tipo principal del Pokémon, usando las variables CSS `--type-*` ya definidas.
6. THE Pokédex SHALL mostrar cada tipo del Pokémon en el Modal como un Badge de Tipo con el color correspondiente de la variable CSS `--type-*`.
7. IF la imagen oficial no está disponible (`null`), THEN THE Pokédex SHALL mostrar como fallback el sprite estándar del Pokémon (`data.sprites.front_default`).

---

### Requisito 11 — Animación de entrada suave del Modal

**Historia de usuario:** Como usuario, quiero que el modal aparezca con una transición de entrada fluida, para que la apertura no sea abrupta.

#### Criterios de Aceptación

1. WHEN el Modal se abre, THE Pokédex SHALL reproducir una animación CSS `modalEntrada` de duración 300 ms con easing `ease-out` sobre el elemento `.modal-content`.
2. THE Pokédex SHALL definir el keyframe `@keyframes modalEntrada` en `style.css` con inicio en `opacity: 0; transform: scale(0.9) translateY(-20px)` y fin en `opacity: 1; transform: scale(1) translateY(0)`.
3. WHEN el Modal se cierra, THE Pokédex SHALL reproducir la animación inversa `modalSalida` de duración 200 ms antes de aplicar `display: none`.
4. THE Pokédex SHALL aplicar `transform-origin: center top` al elemento `.modal-content` para que la animación parta desde la parte superior del panel.
