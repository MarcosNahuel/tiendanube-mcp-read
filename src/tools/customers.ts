import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { tnFetch, tnFetchWithMeta } from '../client.js'
import type { TNCustomer } from '../types.js'

export function registerListCustomers(server: McpServer) {
  server.tool(
    'list_customers',
    'Lista clientes de la tienda con filtros por búsqueda de texto, email exacto y rango de fecha. Soporta paginación (per_page máx 200, default 30).',
    {
      q: z.string().optional().describe('Texto de búsqueda (nombre, email, identificación).'),
      email: z.string().email().optional().describe('Match exacto por email.'),
      created_at_min: z.string().optional(),
      created_at_max: z.string().optional(),
      updated_at_min: z.string().optional(),
      since_id: z.number().optional().describe('Retornar clientes con id mayor al indicado.'),
      page: z.number().min(1).optional(),
      per_page: z.number().min(1).max(200).optional(),
    },
    async (args) => {
      const { data: customers, totalCount } = await tnFetchWithMeta<TNCustomer[]>(
        '/customers',
        { params: args as Record<string, string | number | boolean | undefined> }
      )

      if (!customers || customers.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No se encontraron clientes con los filtros indicados.' }] }
      }

      const summary = customers.map(c => ({
        id: c.id,
        nombre: c.name,
        email: c.email,
        telefono: c.phone,
        identificacion: c.identification,
        total_gastado: `${c.total_spent_currency} ${c.total_spent}`,
        ultima_orden: c.last_order_id,
        acepta_marketing: c.accepts_marketing,
        activo: c.active,
        creado: c.created_at,
      }))

      return {
        content: [{
          type: 'text' as const,
          text: `${summary.length} clientes${totalCount ? ` (de ${totalCount} total)` : ''}:\n\n` +
            JSON.stringify(summary, null, 2),
        }],
      }
    }
  )
}

export function registerGetCustomer(server: McpServer) {
  server.tool(
    'get_customer',
    'Obtiene un cliente completo por id, incluyendo dirección default y datos de facturación.',
    {
      id: z.number().describe('ID del cliente.'),
    },
    async ({ id }) => {
      const customer = await tnFetch<TNCustomer>(`/customers/${id}`)

      return {
        content: [{
          type: 'text' as const,
          text: `Cliente ${customer.id}:\n\n${JSON.stringify(customer, null, 2)}`,
        }],
      }
    }
  )
}
