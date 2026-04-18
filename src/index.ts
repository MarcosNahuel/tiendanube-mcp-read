#!/usr/bin/env node

// MCP Server Tienda Nube / Nuvemshop — versión read-only (10 tools).
// Subset estricto de lectura de @traid/tiendanube-mcp. Sin write-back.
// Ideal para analítica, reporting, dashboards y consumo con LLMs sin riesgo.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { registerListProducts, registerGetProduct } from './tools/products.js'
import { registerListOrders, registerGetOrder } from './tools/orders.js'
import { registerListCustomers, registerGetCustomer } from './tools/customers.js'
import { registerListCategories } from './tools/categories.js'
import { registerGetStoreInfo } from './tools/store.js'
import { registerListCoupons } from './tools/coupons.js'
import { registerListWebhooks } from './tools/webhooks.js'

const server = new McpServer({
  name: 'tiendanube-read',
  version: '1.0.0',
})

// 10 tools read-only
registerListProducts(server)
registerGetProduct(server)
registerListOrders(server)
registerGetOrder(server)
registerListCustomers(server)
registerGetCustomer(server)
registerListCategories(server)
registerGetStoreInfo(server)
registerListCoupons(server)
registerListWebhooks(server)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[tn-mcp-read] Server iniciado — 10 tools read-only disponibles')
}

main().catch((error) => {
  console.error('[tn-mcp-read] Error fatal:', error)
  process.exit(1)
})
