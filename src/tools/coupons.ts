import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { tnFetchWithMeta } from '../client.js'
import type { TNCoupon } from '../types.js'

export function registerListCoupons(server: McpServer) {
  server.tool(
    'list_coupons',
    'Lista los cupones de descuento. Filtros por código, validez, tipo y rango de fechas de vigencia.',
    {
      q: z.string().optional().describe('Búsqueda por código.'),
      valid: z.boolean().optional().describe('Solo cupones válidos.'),
      discount_type: z.enum(['percentage', 'absolute', 'shipping']).optional(),
      includes_shipping: z.boolean().optional(),
      min_start_date: z.string().optional(),
      max_end_date: z.string().optional(),
      page: z.number().min(1).optional(),
      per_page: z.number().min(1).max(200).optional(),
    },
    async (args) => {
      const { data: coupons, totalCount } = await tnFetchWithMeta<TNCoupon[]>(
        '/coupons',
        { params: args as Record<string, string | number | boolean | undefined> }
      )

      if (!coupons || coupons.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No se encontraron cupones.' }] }
      }

      const summary = coupons.map(c => ({
        id: c.id,
        codigo: c.code,
        tipo: c.type,
        valor: c.value,
        valido: c.valid,
        usos: `${c.used}${c.max_uses ? `/${c.max_uses}` : ''}`,
        min_compra: c.min_price,
        incluye_envio: c.includes_shipping,
        inicio: c.start_date,
        fin: c.end_date,
        solo_primera_compra: c.first_consumer_purchase,
      }))

      return {
        content: [{
          type: 'text' as const,
          text: `${summary.length} cupones${totalCount ? ` (de ${totalCount} total)` : ''}:\n\n` +
            JSON.stringify(summary, null, 2),
        }],
      }
    }
  )
}
