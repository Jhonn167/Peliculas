const peliculas = [];
const vistas = [];

// Elementos del DOM
const formPelicula = document.getElementById('form-pelicula');
const formVista = document.getElementById('form-vista');
const selectPeliculas = document.getElementById('pelicula-select');
const listaPeliculas = document.getElementById('lista-peliculas');

// Evento para guardar una nueva película
formPelicula.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const nuevaPelicula = {
    id: peliculas.length + 1,
    titulo: document.getElementById('titulo').value,
    anio: document.getElementById('anio').value,
    genero: document.getElementById('genero').value,
    director: document.getElementById('director').value,
    sinopsis: document.getElementById('sinopsis').value,
    vistas: []
  };

  peliculas.push(nuevaPelicula);
  actualizarSelectPeliculas();
  mostrarPeliculas();
  formPelicula.reset();
});

// Evento para registrar una visualización
formVista.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const idPelicula = parseInt(selectPeliculas.value);
  const pelicula = peliculas.find(p => p.id === idPelicula);

  const nuevaVista = {
    fecha: document.getElementById('fecha').value,
    calificacion: parseInt(document.getElementById('calificacion').value),
    comentario: document.getElementById('comentario').value
  };

  if (nuevaVista.calificacion < 1 || nuevaVista.calificacion > 10) {
    alert("La calificación debe estar entre 1 y 10.");
    return;
  }

  pelicula.vistas.push(nuevaVista);
  mostrarPeliculas();
  formVista.reset();
});

// Actualiza el selector con las películas
function actualizarSelectPeliculas() {
  selectPeliculas.innerHTML = '';
  peliculas.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.titulo;
    selectPeliculas.appendChild(option);
  });
}

// Muestra todas las películas registradas y sus vistas
function mostrarPeliculas() {
  listaPeliculas.innerHTML = '';
  peliculas.forEach(p => {
    const div = document.createElement('div');
    div.classList.add('pelicula-card');

    div.innerHTML = `
      <h3>${p.titulo} (${p.anio})</h3>
      <p><strong>Género:</strong> ${p.genero}</p>
      <p><strong>Director:</strong> ${p.director}</p>
      <p><strong>Sinopsis:</strong> ${p.sinopsis}</p>
      <h4>Visualizaciones:</h4>
      ${p.vistas.length === 0 ? '<p>No hay visualizaciones registradas.</p>' : ''}
      <ul>
        ${p.vistas.map(v => `
          <li>
            ${v.fecha} — ⭐ ${v.calificacion}/10
            ${v.comentario ? `<br><em>${v.comentario}</em>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    listaPeliculas.appendChild(div);
  });
}