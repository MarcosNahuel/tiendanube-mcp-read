import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { tnFetch, tnFetchWithMeta, pickLocalized } from '../client.js'
import type { TNProduct } from '../types.js'

export function registerListProducts(server: McpServer) {
  server.tool(
    'list_products',
    'Lista productos de la tienda con filtros por stock, precio, categoría, publicación y fecha. Soporta paginación (per_page máx 200, default 30).',
    {
      q: z.string().optional().describe('Texto de búsqueda (nombre, tags o SKU).'),
      category_id: z.number().optional().describe('Filtrar por categoría (id).'),
      published: z.boolean().optional().describe('true=publicados, false=ocultos.'),
      free_shipping: z.boolean().optional().describe('Productos con envío gratis.'),
      min_stock: z.number().optional().describe('Stock mínimo disponible.'),
      max_stock: z.number().optional().describe('Stock máximo disponible.'),
      created_at_min: z.string().optional().describe('Fecha creación desde (ISO 8601).'),
      created_at_max: z.string().optional().describe('Fecha creación hasta (ISO 8601).'),
      updated_at_min: z.string().optional().describe('Fecha última actualización desde (ISO 8601).'),
      page: z.number().min(1).optional().describe('Página (default 1).'),
      per_page: z.number().min(1).max(200).optional().describe('Resultados por página (default 30).'),
      sort_by: z.enum([
        'user',
        'price-ascending',
        'price-descending',
        'alpha-ascending',
        'alpha-descending',
        'created-at-ascending',
        'created-at-descending',
        'best-selling',
      ]).optional().describe('Orden de resultados.'),
    },
    async (args) => {
      const { data: products, totalCount } = await tnFetchWithMeta<TNProduct[]>(
        '/products',
        { params: args as Record<string, string | number | boolean | undefined> }
      )

      if (!products || products.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No se encontraron productos con los filtros indicados.' }] }
      }

      const summary = products.map(p => {
        const firstVariant = p.variants?.[0]
        return {
          id: p.id,
          nombre: pickLocalized(p.name),
          handle: pickLocalized(p.handle),
          publicado: p.published,
          precio: firstVariant?.price ?? null,
          precio_promocional: firstVariant?.promotional_price ?? null,
          stock: firstVariant?.stock ?? null,
          sku: firstVariant?.sku ?? null,
          variantes: p.variants?.length ?? 0,
          categorias: (p.categories ?? []).map(c => pickLocalized(c.name)),
          tags: p.tags,
          actualizado: p.updated_at,
        }
      })

      return {
        content: [{
          type: 'text' as const,
          text: `${summary.length} productos${totalCount ? ` (de ${totalCount} total)` : ''}:\n\n` +
            JSON.stringify(summary, null, 2),
        }],
      }
    }
  )
}

export function registerGetProduct(server: McpServer) {
  server.tool(
    'get_product',
    'Obtiene un producto completo por id (o por SKU si se pasa by_sku=true). Incluye variantes, imágenes y categorías.',
    {
      id: z.string().describe('ID del producto (o SKU si by_sku=true).'),
      by_sku: z.boolean().optional().describe('Si es true, se interpreta `id` como SKU de variante.'),
    },
    async ({ id, by_sku }) => {
      const path = by_sku ? `/products/sku/${encodeURIComponent(id)}` : `/products/${id}`
      const product = await tnFetch<TNProduct>(path)

      const detail = {
        id: product.id,
        nombre: pickLocalized(product.name),
        descripcion: pickLocalized(product.description),
        handle: pickLocalized(product.handle),
        publicado: product.published,
        marca: product.brand,
        tags: product.tags,
        envio_gratis: product.free_shipping,
        requiere_envio: product.requires_shipping,
        categorias: (product.categories ?? []).map(c => ({ id: c.id, nombre: pickLocalized(c.name) })),
        variantes: (product.variants ?? []).map(v => ({
          id: v.id,
          precio: v.price,
          precio_promocional: v.promotional_price,
          stock: v.stock,
          sku: v.sku,
          peso: v.weight,
          valores: v.values?.map(val => pickLocalized(val)),
        })),
        imagenes: (product.images ?? []).map(img => ({ id: img.id, src: img.src, posicion: img.position })),
        creado: product.created_at,
        actualizado: product.updated_at,
      }

      return {
        content: [{
          type: 'text' as const,
          text: `Producto ${product.id}:\n\n${JSON.stringify(detail, null, 2)}`,
        }],
      }
    }
  )
}
