import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { getPool } from './config/db.js';

import categoriasRouter from './routes/categorias.routes.js';
import productosRouter from './routes/productos.routes.js';
import ingredientesRouter from './routes/ingredientes.routes.js';
import productoIngredienteRouter from './routes/producto_ingrediente.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE CORS (IMPORTANTE PARA RENDER + FRONTEND) ---
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://DieGod-21.github.io",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs-json', (_req, res) => res.json(swaggerSpec));

// Rutas API
app.use('/api/categorias', categoriasRouter);
app.use('/api/productos', productosRouter);
app.use('/api/ingredientes', ingredientesRouter);
app.use('/api/producto-ingrediente', productoIngredienteRouter);

// Health
app.get('/health', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', db: false });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});