const botonesHeader = document.querySelectorAll('.btn-header');
const container = document.getElementById('pokemon-container');

let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=0';
async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.pokemon) {
            displayPokemon(data.pokemon, true);
        } else {
            displayPokemon(data.results);
        }
        nextUrl = data.next;
    } catch (error) {
        console.error('Error:', error);
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
                imprimirPokemones(data);
            } else {
                const response = await fetch(pokemon.url);
                data = await response.json();
                imprimirPokemones(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

}

function imprimirPokemones(data) {
    let tipos = data.types.map(type => `<p class="${type.type.name} text-sm uppercase tipo">${type.type.name}</p>`);
    tipos = tipos.join('');
    // console.log(tipos);

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow-md';
    const imagen = data.sprites.other["official-artwork"].front_default || data.sprites.other["official-artwork"].front_shiny || data.sprites.other.home.front_default;
    // console.log(data);


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
                <p class="stat">${data.height} m</p>
                <p class="stat">${data.weight} KG</p>
              </div>
              </a>
              </div>
            `;

    container.appendChild(card);
    // console.log(container.children.length);

}
document.getElementById('load-more').addEventListener('click', () => {
    if (nextUrl) {
        fetchPokemonData(nextUrl);
    } else {
        alert('No hay más Pokémon para cargar');
    }
});
fetchPokemonData(nextUrl);


botonesHeader.forEach(boton => boton.addEventListener('click', (e) => {
    // console.log(e.currentTarget.id);
    if (e.currentTarget.id === 'ver-todos') {
        limpiarHTML();
        fetchPokemonData('https://pokeapi.co/api/v2/pokemon?limit=12&offset=0');
        return;
    }
    let url = `https://pokeapi.co/api/v2/type/${e.currentTarget.id}`;
    fetchPokemonData(url);
}));

function limpiarHTML() {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
async function searchPokemon(query) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        const data = await response.json();

        document.getElementById('pokemon-container').innerHTML = '';
        console.log([data]);

        imprimirPokemones(data);
    } catch (error) {
        console.error('Error:', error);
        alert('No se encontró el Pokémon. Inténtalo nuevamente.');
    }
}
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    if (query) { searchPokemon(query); }
});

// Mostrar el modal 
async function showModal(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();
        const modal = document.getElementById('myModal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = ` 
        <p><strong>ID:</strong> ${data.id}</p> 
        <p><strong>Nombre:</strong> ${data.name}</p> 
        <p><strong>Altura:</strong> ${data.height} m</p> 
        <p><strong>Peso:</strong> ${data.weight} kg</p> 
        <p><strong>Stats:</strong></p> 
        <ul> ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')} </ul> `; 
        modal.style.display = "block";
    } catch (error) { console.error('Error:', error); }
} // Cerrar el modal 
const span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    const modal = document.getElementById('myModal');
    modal.style.display = "none";
}
window.onclick = function (event) { const modal = document.getElementById('myModal'); if (event.target == modal) { modal.style.display = "none"; } }