// routes/ingredientes.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { getPool } from '../config/db.js';
import { handleValidation } from './validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ingredientes
 *   description: CRUD para ingredientes
 */

// GET todos
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT id, nombre, perecedero, created_at, updated_at
      FROM ingredientes
      ORDER BY id DESC
    `);
    res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error listando ingredientes' });
  }
});

// GET por id
router.get(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        'SELECT id, nombre, perecedero, created_at, updated_at FROM ingredientes WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ ok: false, message: 'Ingrediente no encontrado' });
      }

      res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error obteniendo ingrediente' });
    }
  }
);

// POST
router.post(
  '/',
  body('nombre').isString().notEmpty(),
  body('perecedero').optional().isBoolean(),
  handleValidation,
  async (req, res) => {
    try {
      const { nombre, perecedero } = req.body;
      const pool = await getPool();

      const [result] = await pool.query(
        'INSERT INTO ingredientes (nombre, perecedero) VALUES (?, ?)',
        [nombre, perecedero !== undefined ? (perecedero ? 1 : 0) : 1]
      );

      const [rows] = await pool.query(
        'SELECT id, nombre, perecedero, created_at, updated_at FROM ingredientes WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({ ok: true, message: 'Ingrediente creado', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error insertando ingrediente' });
    }
  }
);

// PUT
router.put(
  '/:id',
  param('id').isInt(),
  body('nombre').optional().isString().notEmpty(),
  body('perecedero').optional().isBoolean(),
  handleValidation,
  async (req, res) => {
    try {
      const id = req.params.id;
      const bodyData = req.body;
      const sets = [];
      const values = [];

      if (bodyData.nombre !== undefined) {
        sets.push('nombre = ?');
        values.push(bodyData.nombre);
      }
      if (bodyData.perecedero !== undefined) {
        sets.push('perecedero = ?');
        values.push(bodyData.perecedero ? 1 : 0);
      }

      if (sets.length === 0) {
        return res.status(400).json({ ok: false, message: 'Nada para actualizar' });
      }

      values.push(id);

      const pool = await getPool();
      const [result] = await pool.query(
        `UPDATE ingredientes SET ${sets.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Ingrediente no encontrado' });
      }

      const [rows] = await pool.query(
        'SELECT id, nombre, perecedero, created_at, updated_at FROM ingredientes WHERE id = ?',
        [id]
      );

      res.json({ ok: true, message: 'Ingrediente actualizado', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error actualizando ingrediente' });
    }
  }
);

// DELETE
router.delete(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const pool = await getPool();
      const [result] = await pool.query('DELETE FROM ingredientes WHERE id = ?', [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Ingrediente no encontrado' });
      }

      res.json({ ok: true, message: 'Ingrediente eliminado' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error eliminando ingrediente' });
    }
  }
);

export default router;