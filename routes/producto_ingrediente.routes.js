// routes/producto_ingrediente.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { getPool } from '../config/db.js';
import { handleValidation } from './validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ProductoIngrediente
 *   description: Relación muchos a muchos entre productos e ingredientes
 */

// GET todos
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT pi.id,
             pi.producto_id,
             p.nombre AS producto,
             pi.ingrediente_id,
             i.nombre AS ingrediente,
             pi.cantidad_usada,
             pi.created_at,
             pi.updated_at
      FROM producto_ingrediente pi
      JOIN productos p ON pi.producto_id = p.id
      JOIN ingredientes i ON pi.ingrediente_id = i.id
      ORDER BY pi.id DESC
    `);
    res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error listando relaciones' });
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
        `
        SELECT pi.id,
               pi.producto_id,
               p.nombre AS producto,
               pi.ingrediente_id,
               i.nombre AS ingrediente,
               pi.cantidad_usada,
               pi.created_at,
               pi.updated_at
        FROM producto_ingrediente pi
        JOIN productos p ON pi.producto_id = p.id
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE pi.id = ?
        `,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ ok: false, message: 'Relación no encontrada' });
      }

      res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error obteniendo relación' });
    }
  }
);

// POST
router.post(
  '/',
  body('producto_id').isInt(),
  body('ingrediente_id').isInt(),
  body('cantidad_usada').isFloat({ gt: 0 }),
  handleValidation,
  async (req, res) => {
    try {
      const { producto_id, ingrediente_id, cantidad_usada } = req.body;
      const pool = await getPool();

      const [result] = await pool.query(
        `
        INSERT INTO producto_ingrediente (producto_id, ingrediente_id, cantidad_usada)
        VALUES (?, ?, ?)
        `,
        [producto_id, ingrediente_id, cantidad_usada]
      );

      const [rows] = await pool.query(
        `
        SELECT pi.id,
               pi.producto_id,
               p.nombre AS producto,
               pi.ingrediente_id,
               i.nombre AS ingrediente,
               pi.cantidad_usada,
               pi.created_at,
               pi.updated_at
        FROM producto_ingrediente pi
        JOIN productos p ON pi.producto_id = p.id
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE pi.id = ?
        `,
        [result.insertId]
      );

      res.status(201).json({ ok: true, message: 'Relación creada', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error insertando relación' });
    }
  }
);

// PUT
router.put(
  '/:id',
  param('id').isInt(),
  body('producto_id').optional().isInt(),
  body('ingrediente_id').optional().isInt(),
  body('cantidad_usada').optional().isFloat({ gt: 0 }),
  handleValidation,
  async (req, res) => {
    try {
      const id = req.params.id;
      const bodyData = req.body;
      const sets = [];
      const values = [];

      if (bodyData.producto_id !== undefined) {
        sets.push('producto_id = ?');
        values.push(bodyData.producto_id);
      }
      if (bodyData.ingrediente_id !== undefined) {
        sets.push('ingrediente_id = ?');
        values.push(bodyData.ingrediente_id);
      }
      if (bodyData.cantidad_usada !== undefined) {
        sets.push('cantidad_usada = ?');
        values.push(bodyData.cantidad_usada);
      }

      if (sets.length === 0) {
        return res.status(400).json({ ok: false, message: 'Nada para actualizar' });
      }

      values.push(id);

      const pool = await getPool();
      const [result] = await pool.query(
        `
        UPDATE producto_ingrediente
        SET ${sets.join(', ')}
        WHERE id = ?
        `,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Relación no encontrada' });
      }

      const [rows] = await pool.query(
        `
        SELECT pi.id,
               pi.producto_id,
               p.nombre AS producto,
               pi.ingrediente_id,
               i.nombre AS ingrediente,
               pi.cantidad_usada,
               pi.created_at,
               pi.updated_at
        FROM producto_ingrediente pi
        JOIN productos p ON pi.producto_id = p.id
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE pi.id = ?
        `,
        [id]
      );

      res.json({ ok: true, message: 'Relación actualizada', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error actualizando relación' });
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
      const [result] = await pool.query(
        'DELETE FROM producto_ingrediente WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Relación no encontrada' });
      }

      res.json({ ok: true, message: 'Relación eliminada' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error eliminando relación' });
    }
  }
);

export default router;