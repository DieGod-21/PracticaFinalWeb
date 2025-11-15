import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Igual que tu versión, detecta rutas *.js
const routesGlob = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Restaurante – Categorías, Productos e Ingredientes',
      version: '1.0.0',
      description: `
        API en Node.js + Express + MySQL.
        Incluye CRUD para:
        - categorias
        - productos
        - ingredientes
        - producto_ingrediente

        Desarrollado para práctica previa al examen final.
      `
    },

    servers: [
      { url: '/', description: 'Servidor actual (Render o Local)' }
    ],

    components: {
      schemas: {
        Categoria: {
          type: 'object',
          required: ['nombre'],
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Hamburguesas' },
            created_at: { type: 'string', example: '2025-02-14T12:00:00.000Z' },
            updated_at: { type: 'string', example: '2025-02-14T12:00:00.000Z' }
          }
        },

        Producto: {
          type: 'object',
          required: ['categoria_id', 'nombre', 'precio'],
          properties: {
            id: { type: 'integer', example: 10 },
            categoria_id: { type: 'integer', example: 1 },
            categoria: { type: 'string', example: 'Hamburguesas' },
            nombre: { type: 'string', example: 'Cheeseburger Especial' },
            descripcion: { type: 'string', example: 'Carne y queso con salsa especial' },
            precio: { type: 'number', example: 45.50 },
            disponible: { type: 'boolean', example: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },

        Ingrediente: {
          type: 'object',
          required: ['nombre'],
          properties: {
            id: { type: 'integer', example: 5 },
            nombre: { type: 'string', example: 'Queso amarillo' },
            perecedero: { type: 'boolean', example: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },

        ProductoIngrediente: {
          type: 'object',
          required: ['producto_id', 'ingrediente_id', 'cantidad_usada'],
          properties: {
            id: { type: 'integer', example: 20 },
            producto_id: { type: 'integer', example: 10 },
            producto: { type: 'string', example: 'Cheeseburger Especial' },
            ingrediente_id: { type: 'integer', example: 5 },
            ingrediente: { type: 'string', example: 'Queso amarillo' },
            cantidad_usada: { type: 'number', example: 0.25 },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  },

  apis: [routesGlob] // Igualito a tu versión original
});