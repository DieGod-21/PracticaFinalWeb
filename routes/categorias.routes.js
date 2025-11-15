// routes/categorias.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { getPool } from '../config/db.js';
import { handleValidation } from './validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Endpoints para la tabla categorias
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: Hamburguesas
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Lista todas las categorías
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Listado de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT id, nombre, created_at, updated_at
      FROM categorias
      ORDER BY id DESC
    `);
    res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error listando categorías' });
  }
});


/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
 */
router.get(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        'SELECT id, nombre, created_at, updated_at FROM categorias WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
      }
      res.json({ ok: true, message: 'Consulta realizada correctamente', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error obteniendo categoría' });
    }
  }
);


/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 */
router.post(
  '/',
  body('nombre').isString().notEmpty(),
  handleValidation,
  async (req, res) => {
    try {
      const { nombre } = req.body;
      const pool = await getPool();
      const [result] = await pool.query(
        'INSERT INTO categorias (nombre) VALUES (?)',
        [nombre]
      );

      const [rows] = await pool.query(
        'SELECT id, nombre, created_at, updated_at FROM categorias WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({ ok: true, message: 'Categoría creada', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error insertando categoría' });
    }
  }
);


/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualiza una categoría
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
 */
router.put(
  '/:id',
  param('id').isInt(),
  body('nombre').optional().isString().notEmpty(),
  handleValidation,
  async (req, res) => {
    try {
      const id = req.params.id;
      const { nombre } = req.body;

      if (nombre === undefined) {
        return res.status(400).json({ ok: false, message: 'Nada para actualizar' });
      }

      const pool = await getPool();
      const [result] = await pool.query(
        'UPDATE categorias SET nombre = ? WHERE id = ?',
        [nombre, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
      }

      const [rows] = await pool.query(
        'SELECT id, nombre, created_at, updated_at FROM categorias WHERE id = ?',
        [id]
      );

      res.json({ ok: true, message: 'Categoría actualizada', data: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error actualizando categoría' });
    }
  }
);


/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 */
router.delete(
  '/:id',
  param('id').isInt(),
  handleValidation,
  async (req, res) => {
    try {
      const pool = await getPool();
      const [result] = await pool.query('DELETE FROM categorias WHERE id = ?', [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
      }

      res.json({ ok: true, message: 'Categoría eliminada' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error eliminando categoría' });
    }
  }
);

export default router;