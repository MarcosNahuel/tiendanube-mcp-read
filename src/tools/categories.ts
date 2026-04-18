import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { tnFetch, tnFetchWithMeta, pickLocalized } from '../client.js'
import type { TNCategory } from '../types.js'

export function registerListCategories(server: McpServer) {
  server.tool(
    'list_categories',
    'Lista las categorías de la tienda. Permite filtrar por categoría padre (parent_id=null para las raíz) y handle.',
    {
      parent_id: z.number().optional().describe('ID de la categoría padre. 0 para categorías raíz.'),
      handle: z.string().optional().describe('Handle (URL-friendly) exacto.'),
      language: z.string().optional().describe('Idioma para búsqueda por handle (ej: es, pt).'),
      since_id: z.number().optional(),
      page: z.number().min(1).optional(),
      per_page: z.number().min(1).max(200).optional(),
    },
    async (args) => {
      const { data: categories, totalCount } = await tnFetchWithMeta<TNCategory[]>(
        '/categories',
        { params: args as Record<string, string | number | boolean | undefined> }
      )

      if (!categories || categories.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No se encontraron categorías con los filtros indicados.' }] }
      }

      const summary = categories.map(c => ({
        id: c.id,
        nombre: pickLocalized(c.name),
        handle: pickLocalized(c.handle),
        padre: c.parent,
        visibilidad: c.visibility,
        subcategorias: c.subcategories?.length ?? 0,
        google_shopping: c.google_shopping_category,
      }))

      return {
        content: [{
          type: 'text' as const,
          text: `${summary.length} categorías${totalCount ? ` (de ${totalCount} total)` : ''}:\n\n` +
            JSON.stringify(summary, null, 2),
        }],
      }
    }
  )
}
