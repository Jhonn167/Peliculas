const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json());

// ==========================
// 🔐 RUTAS DE USUARIOS
// ==========================

// Registro de usuario
app.post('/api/usuarios/registro', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, correo',
      [nombre, correo, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(400).json({ error: 'El correo ya está registrado' });
  }
});

// Login de usuario
app.post('/api/usuarios/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    const usuario = result.rows[0];

    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// 🎬 RUTAS DE PELÍCULAS
// ==========================

app.get('/api/peliculas', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.*, 
        ROUND(AVG(v.calificacion)::numeric, 1) AS calificacion_promedio,
        p.imagen_url
      FROM peliculas p
      LEFT JOIN vistas v ON v.id_pelicula = p.id_pelicula
      GROUP BY p.id_pelicula
      ORDER BY p.titulo;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener películas con promedio:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las películas' });
  }
});

app.post('/api/peliculas', async (req, res) => {
  const { titulo, anio, genero, director, sinopsis, imagen_url, id_usuario } = req.body;
  const result = await db.query(
    'INSERT INTO peliculas (titulo, anio, genero, director, sinopsis, imagen_url, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [titulo, anio, genero, director, sinopsis, imagen_url, id_usuario]
  );
  res.json(result.rows[0]);
});

// ==========================
// 🎥 RUTAS DE VISUALIZACIÓN
// ==========================

app.post('/api/peliculas/:id/vista', async (req, res) => {
  const { id } = req.params;
  const { fecha_vista, calificacion, comentario } = req.body;
  const result = await db.query(
    'INSERT INTO vistas (id_pelicula, fecha_vista, calificacion, comentario) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, fecha_vista, calificacion, comentario]
  );
  res.json(result.rows[0]);
});

app.get('/api/peliculas/:id/vistas', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM vistas WHERE id_pelicula = $1 ORDER BY fecha_vista DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener vistas:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las visualizaciones' });
  }
});

// ==========================
// 🩺 Verificar estado
// ==========================

app.get('/api/status', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});