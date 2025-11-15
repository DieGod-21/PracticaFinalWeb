// routes/productos.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { getPool } from '../config/db.js';
import { handleValidation } from './validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: CRUD para productos del restaurante
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required: [categoria_id, nombre, precio]
 *       properties:
 *         id:
 *           type: integer
 *         categoria_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *           format: float
 *         disponible:
 *           type: boolean
 */

// GET /api/productos
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT p.id, p.categoria_id, c.nombre AS categoria,
             p.nombre, p.descripcion, p.precio, p.disponible,
             p.created_at, p.updated_at
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error listando productos' });
  }
});

// GET /api/productos/:id
router.get(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        `
        SELECT p.id, p.categoria_id, c.nombre AS categoria,
               p.nombre, p.descripcion, p.precio, p.disponible,
               p.created_at, p.updated_at
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
        `,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
      }

      res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error obteniendo producto' });
    }
  }
);

// POST /api/productos
router.post(
  '/',
  body('categoria_id').isInt(),
  body('nombre').isString().notEmpty(),
  body('precio').isFloat(),
  body('descripcion').optional().isString(),
  body('disponible').optional().isBoolean(),
  handleValidation,
  async (req, res) => {
    try {
      const { categoria_id, nombre, descripcion, precio, disponible } = req.body;
      const pool = await getPool();

      const [result] = await pool.query(
        `
        INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible)
        VALUES (?, ?, ?, ?, ?)
        `,
        [categoria_id, nombre, descripcion ?? null, precio, disponible ?? 1]
      );

      const [rows] = await pool.query(
        `
        SELECT p.id, p.categoria_id, c.nombre AS categoria,
               p.nombre, p.descripcion, p.precio, p.disponible,
               p.created_at, p.updated_at
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
        `,
        [result.insertId]
      );

      res.status(201).json({ ok: true, message: 'Producto creado', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error insertando producto' });
    }
  }
);

// PUT /api/productos/:id
router.put(
  '/:id',
  param('id').isInt(),
  body('categoria_id').optional().isInt(),
  body('nombre').optional().isString().notEmpty(),
  body('precio').optional().isFloat(),
  body('descripcion').optional().isString(),
  body('disponible').optional().isBoolean(),
  handleValidation,
  async (req, res) => {
    try {
      const id = req.params.id;
      const bodyData = req.body;

      const allowedFields = ['categoria_id', 'nombre', 'descripcion', 'precio', 'disponible'];
      const sets = [];
      const values = [];

      for (const field of allowedFields) {
        if (bodyData[field] !== undefined) {
          sets.push(`${field} = ?`);
          // boolean -> tinyint conversion
          if (field === 'disponible') {
            values.push(bodyData[field] ? 1 : 0);
          } else {
            values.push(bodyData[field]);
          }
        }
      }

      if (sets.length === 0) {
        return res.status(400).json({ ok: false, message: 'Nada para actualizar' });
      }

      values.push(id);

      const pool = await getPool();
      const [result] = await pool.query(
        `
        UPDATE productos
        SET ${sets.join(', ')}
        WHERE id = ?
        `,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
      }

      const [rows] = await pool.query(
        `
        SELECT p.id, p.categoria_id, c.nombre AS categoria,
               p.nombre, p.descripcion, p.precio, p.disponible,
               p.created_at, p.updated_at
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
        `,
        [id]
      );

      res.json({ ok: true, message: 'Producto actualizado', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error actualizando producto' });
    }
  }
);

// DELETE /api/productos/:id
router.delete(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const id = req.params.id;
      const pool = await getPool();

      const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
      }

      res.json({ ok: true, message: 'Producto eliminado' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error eliminando producto' });
    }
  }
);

export default router;