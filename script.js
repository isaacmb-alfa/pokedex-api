const botonesHeader = document.querySelectorAll('.btn-header');
const container = document.getElementById('pokemon-container');
const botonVerTodos = document.getElementById('ver-todos');

const appState = {
    lastUrl: 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=0',
    nextUrl: 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=0',
    activeFilter: 'ver-todos',
    isTypeFilter: false,
    expectedCount: 12,
    retryCallback: null
};

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mostrarSkeletons(count = appState.expectedCount) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card bg-white p-4 rounded-lg shadow-md';
        skeleton.innerHTML = `
            <div class="skeleton skeleton-img shimmer"></div>
            <div class="skeleton skeleton-text shimmer"></div>
            <div class="skeleton skeleton-text-sm shimmer"></div>
        `;
        container.appendChild(skeleton);
    }
}

function eliminarSkeletons() {
    container.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

function setFiltroActivo(id) {
    botonesHeader.forEach(btn => btn.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    appState.activeFilter = id;
}

function mostrarErrorCard(mensaje, retryFn) {
    eliminarSkeletons();
    container.innerHTML = '';
    appState.retryCallback = retryFn;
    const card = document.createElement('div');
    card.className = 'error-card col-span-4 text-center p-8';
    card.innerHTML = `
        <p class="error-mensaje text-red-500 text-lg mb-4">${mensaje}</p>
        <button id="btn-reintentar" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Reintentar</button>
    `;
    container.appendChild(card);
    document.getElementById('btn-reintentar')
        .addEventListener('click', () => {
            if (retryFn) retryFn();
        });
    botonVerTodos.removeAttribute('disabled');
}

function ocultarCargarMas() {
    document.getElementById('load-more').classList.add('hidden');
    appState.isTypeFilter = true;
}

function mostrarCargarMas() {
    document.getElementById('load-more').classList.remove('hidden');
    appState.isTypeFilter = false;
}

async function fetchPokemonData(url) {
    mostrarSkeletons();
    botonVerTodos.setAttribute('disabled', 'disabled');
    try {
        const response = await fetch(url);
        const data = await response.json();
        eliminarSkeletons();
        if (data.pokemon) {
            await displayPokemon(data.pokemon, true);
        } else {
            await displayPokemon(data.results);
        }
        appState.lastUrl = url;
        appState.nextUrl = data.next;
        appState.retryCallback = null;
    } catch (error) {
        eliminarSkeletons();
        mostrarErrorCard('Error al cargar los Pokémon. Verifica tu conexión.', () => fetchPokemonData(url));
    } finally {
        botonVerTodos.removeAttribute('disabled');
    }
}

async function displayPokemon(pokemons, isNested = false) {
    isNested ? limpiarHTML() : '';
    for (let pokemon of pokemons) {
        try {
            let data;
            if (isNested && pokemon.pokemon) {
                const response = await fetch(pokemon.pokemon.url);
                data = await response.json();
                await delay(100);
                imprimirPokemones(data);
            } else {
                const response = await fetch(pokemon.url);
                data = await response.json();
                await delay(100);
                imprimirPokemones(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function imprimirPokemones(data) {
    let tipos = data.types.map(type => `<p class="${type.type.name} text-sm uppercase tipo">${type.type.name}</p>`);
    tipos = tipos.join('');

    const card = document.createElement('div');
    const tipoPrincipal = data.types[0].type.name;
    card.className = `pokemon-card ${tipoPrincipal}-bg p-4 rounded-lg shadow-md card-fade-in`;
    const imagen = data.sprites.other["official-artwork"].front_default || data.sprites.other["official-artwork"].front_shiny || data.sprites.other.home.front_default || data.sprites.front_default;

    card.innerHTML = `
            <div class="pokemon">
            <a href="javascript:void(0);" onclick="showModal(${data.id})">
                <p class="pokemon-id-back">#${data.id}</p>
              <img class="pokemon-imagen w-full h-full object-cover mb-2 rounded-t-lg" src="${imagen}" alt="${data.name}">
              <div class="flex justify-content-center">
                <p class="text-sm text-gray-600 pokemon-id ms-4">#${data.id}</p>
                <h2 class="text-2xl font-bold uppercase mx-auto">${data.name}</h2>
              </div>
              <div class="pokemon-tipos mb-2">
                ${tipos}  
              </div>
              <div class="pokemon-stats mx-auto">
                <p class="stat">${(data.height / 10)} m</p>
                <p class="stat">${(data.weight / 10)} KG</p>
              </div>
              </a>
              </div>
            `;

    container.appendChild(card);
}

document.getElementById('load-more').addEventListener('click', () => {
    if (appState.nextUrl) {
        fetchPokemonData(appState.nextUrl);
    } else {
        mostrarErrorCard('No hay más Pokémon para cargar', null);
    }
});

fetchPokemonData(appState.lastUrl);

botonesHeader.forEach(boton => boton.addEventListener('click', (e) => {
    const id = e.currentTarget.id;
    setFiltroActivo(id);
    if (id === 'ver-todos') {
        mostrarCargarMas();
        fetchPokemonData('https://pokeapi.co/api/v2/pokemon?limit=12&offset=0');
        return;
    }
    ocultarCargarMas();
    let url = `https://pokeapi.co/api/v2/type/${id}`;
    fetchPokemonData(url);
}));

function limpiarHTML() {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

const debouncedSearch = debounce((query) => {
    if (!query.trim()) return;
    searchPokemon(query);
}, 300);

async function searchPokemon(query) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        if (!response.ok) throw new Error('No encontrado');
        const data = await response.json();
        eliminarSkeletons();
        container.innerHTML = '';
        imprimirPokemones(data);
    } catch (error) {
        eliminarSkeletons();
        mostrarErrorCard('No se encontró el Pokémon. Inténtalo nuevamente.', () => searchPokemon(query));
    }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    if (query.trim()) {
        mostrarSkeletons(1);
        debouncedSearch(query);
    }
});

async function fetchPokemonDetail(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!response.ok) throw new Error('Error al obtener datos del Pokémon');
    return response.json();
}

async function showModal(pokemonId) {
    try {
        const data = await fetchPokemonDetail(pokemonId);
        const tipoPrincipal = data.types[0].type.name;

        const modalHeader = document.getElementById('modal-header');
        modalHeader.style.backgroundColor = `var(--type-${tipoPrincipal})`;

        const imgSrc = data.sprites.other['official-artwork'].front_default
            ?? data.sprites.front_default;
        document.getElementById('modal-img-oficial').src = imgSrc;
        document.getElementById('modal-img-oficial').alt = data.name;

        const shinySrc = data.sprites.other['official-artwork'].front_shiny
            ?? data.sprites.front_shiny;
        if (shinySrc) {
            document.getElementById('modal-img-shiny').src = shinySrc;
            document.getElementById('modal-img-shiny').alt = `${data.name} shiny`;
        }

        document.getElementById('modal-title').textContent = `${data.name} #${data.id}`;

        const tiposContainer = document.getElementById('modal-tipos');
        tiposContainer.innerHTML = data.types.map(t =>
            `<span class="${t.type.name} text-sm uppercase tipo">${t.type.name}</span>`
        ).join('');

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="modal-stats">
                <h3 class="font-bold mb-2">Stats</h3>
                ${data.stats.map(stat => `
                    <div class="flex items-center gap-2 mb-1">
                        <span class="w-32 text-sm capitalize">${stat.stat.name.replace('-', ' ')}</span>
                        <span class="w-8 text-sm font-bold">${stat.base_stat}</span>
                        <div class="stat-bar flex-1 ${stat.stat.name}">
                            <div class="stat-bar-fill" style="width: ${((stat.base_stat / 255) * 100).toFixed(1)}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-abilities mt-4">
                <h3 class="font-bold mb-2">Abilities</h3>
                <ul class="list-disc list-inside">
                    ${data.abilities.map(a => `<li>${a.ability.name}</li>`).join('')}
                </ul>
            </div>
            <div class="modal-moves mt-4">
                <h3 class="font-bold mb-2">Moves (first 10)</h3>
                <ul class="list-disc list-inside">
                    ${data.moves.slice(0, 10).map(m => `<li>${m.move.name}</li>`).join('')}
                </ul>
            </div>
        `;

        abrirModal();
    } catch (error) {
        console.error('Error:', error);
    }
}

function abrirModal() {
    const modal = document.getElementById('myModal');
    const content = modal.querySelector('.modal-content');
    content.classList.remove('modal-salida');
    content.classList.add('modal-entrada');
    modal.style.display = 'block';
}

function cerrarModal() {
    const modal = document.getElementById('myModal');
    const content = modal.querySelector('.modal-content');
    content.classList.remove('modal-entrada');
    content.classList.add('modal-salida');
    content.addEventListener('animationend', () => {
        modal.style.display = 'none';
    }, { once: true });
}

const span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    cerrarModal();
}

window.onclick = function (event) {
    const modal = document.getElementById('myModal');
    if (event.target == modal) {
        cerrarModal();
    }
}
