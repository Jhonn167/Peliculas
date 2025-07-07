const formPelicula = document.getElementById('form-pelicula');
const formVista = document.getElementById('form-vista');
const listaPeliculas = document.getElementById('lista-peliculas');
const selectPeliculas = document.getElementById('pelicula-select');
const OMDB_API_KEY = '4febde18';

// Cargar opciones del selector
async function cargarOpcionesPeliculas() {
  try {
    const res = await fetch('http://localhost:3000/api/peliculas');
    if (!res.ok) throw new Error('Error al obtener películas');
    const peliculas = await res.json();

    selectPeliculas.innerHTML = '';
    peliculas.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id_pelicula;
      option.textContent = p.titulo;
      selectPeliculas.appendChild(option);
    });
  } catch (error) {
    console.error('❌ Error al llenar selector:', error);
  }
}

// Registrar película
formPelicula.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  let anio = parseInt(document.getElementById('anio').value) || null;
  let director = document.getElementById('director').value.trim();
  const genero = document.getElementById('genero').value.trim();
  const sinopsis = document.getElementById('sinopsis').value.trim();
  let imagen_url = '';

  try {
    const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${OMDB_API_KEY}`);
    const omdbData = await omdbRes.json();
    console.log('🔎 OMDb:', omdbData);

    if (omdbData.Response === 'True') {
      imagen_url = omdbData.Poster !== 'N/A' ? omdbData.Poster : 'https://via.placeholder.com/300x450?text=Sin+imagen';
      if (!anio && !isNaN(parseInt(omdbData.Year))) anio = parseInt(omdbData.Year);
      if (!director && omdbData.Director !== 'N/A') director = omdbData.Director;
    } else {
      imagen_url = 'https://via.placeholder.com/300x450?text=Sin+imagen';
    }
  } catch (error) {
    console.warn('⚠️ Error OMDb:', error);
    imagen_url = 'https://via.placeholder.com/300x450?text=Sin+imagen';
  }

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return alert('⚠️ Debes iniciar sesión');

  const nuevaPelicula = {
    titulo, anio, genero, director, sinopsis, imagen_url,
    id_usuario: usuario.id_usuario
  };

  try {
    const res = await fetch('http://localhost:3000/api/peliculas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaPelicula)
    });
    if (!res.ok) throw new Error('No se pudo guardar');

    alert('🎬 Película guardada');
    formPelicula.reset();
    obtenerPeliculas();
    cargarOpcionesPeliculas();
  } catch (error) {
    console.error('❌ Guardar película:', error);
    alert('Error al guardar película');
  }
});

// Registrar visualización
formVista.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idPelicula = selectPeliculas.value;
  const vista = {
    fecha_vista: document.getElementById('fecha').value,
    calificacion: parseInt(document.getElementById('calificacion').value),
    comentario: document.getElementById('comentario').value
  };

  try {
    const res = await fetch(`http://localhost:3000/api/peliculas/${idPelicula}/vista`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vista)
    });

    if (!res.ok) throw new Error('Error al guardar visualización');

    alert('✅ Visualización guardada');
    formVista.reset();
    obtenerPeliculas();
  } catch (error) {
    console.error('❌ Visualización:', error);
    alert('No se pudo guardar visualización');
  }
});

// Mostrar películas con visualizaciones
async function obtenerPeliculas() {
  try {
    const res = await fetch('http://localhost:3000/api/peliculas');
    if (!res.ok) throw new Error('Error al obtener películas');
    const peliculas = await res.json();

    listaPeliculas.innerHTML = '';
    peliculas.forEach(p => {
      const div = document.createElement('div');
      div.className = 'pelicula-card';
      div.innerHTML = `
        ${p.imagen_url ? `<img src="${p.imagen_url}" alt="${p.titulo}" style="max-width:100%; border-radius:4px;">` : ''}
        <h3>${p.titulo} (${p.anio ?? 'Sin año'})</h3>
        <p><strong>Género:</strong> ${p.genero}</p>
        <p><strong>Director:</strong> ${p.director || 'Desconocido'}</p>
        <p><strong>Sinopsis:</strong> ${p.sinopsis}</p>
        <div class="vistas">Cargando visualizaciones...</div>
      `;
      listaPeliculas.appendChild(div);

      fetch(`http://localhost:3000/api/peliculas/${p.id_pelicula}/vistas`)
        .then(res => res.json())
        .then(vistas => {
          const vistaDiv = div.querySelector('.vistas');
          if (vistas.length === 0) {
            vistaDiv.textContent = 'Sin visualizaciones aún.';
          } else {
            vistaDiv.innerHTML = '<h4>Visualizaciones:</h4><ul>' +
              vistas.map(v => `
                <li>📅 ${v.fecha_vista} — ⭐ ${v.calificacion}/10
                ${v.comentario ? `<br><em>${v.comentario}</em>` : ''}</li>
              `).join('') + '</ul>';
          }
        })
        .catch(() => {
          div.querySelector('.vistas').textContent = '❌ Error al cargar visualizaciones';
        });
    });
  } catch (error) {
    console.error('❌ Error al cargar películas:', error);
  }
}

// Registro de usuario
document.getElementById('form-registro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = {
    nombre: document.getElementById('nombre').value,
    correo: document.getElementById('correo-registro').value,
    contraseña: document.getElementById('contraseña-registro').value
  };

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('usuario', JSON.stringify(data));
      alert('✅ Registro exitoso');
    } else {
      alert('❌ ' + (data.error || 'Registro fallido'));
    }
  } catch (error) {
    console.error('❌ Error en registro:', error);
  }
});

// Login de usuario
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const credenciales = {
    correo: document.getElementById('correo-login').value,
    contraseña: document.getElementById('contraseña-login').value
  };

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });

    const data = await res.json();
    if (!res.ok) {
      alert('❌ ' + (data.error || 'Login fallido'));
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(data));
    alert('✅ Bienvenido ' + data.nombre);
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
});

// Al iniciar
window.addEventListener('DOMContentLoaded', () => {
  obtenerPeliculas();
  cargarOpcionesPeliculas();
});