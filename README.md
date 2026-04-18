# @traid/tiendanube-mcp-read

MCP server **read-only** para [Tienda Nube / Nuvemshop](https://www.tiendanube.com). 10 tools de lectura para analítica, dashboards y consumo con LLMs sin riesgo.

Subset estricto del paquete completo [`@traid/tiendanube-mcp`](https://github.com/MarcosNahuel/tiendanube-mcp). Sin `update_*` ni `create_*` — cero posibilidad de escritura accidental en la tienda.

## Tools disponibles (10, todas lectura)

| Tool | Descripción |
|------|-------------|
| `list_products` | Lista productos con filtros (stock, precio, categoría, fecha) |
| `get_product` | Detalle de un producto por id o por SKU |
| `list_orders` | Lista órdenes con filtros (status, payment, shipping, fecha) |
| `get_order` | Detalle completo de una orden |
| `list_customers` | Lista clientes con búsqueda y filtros |
| `get_customer` | Detalle de un cliente |
| `list_categories` | Categorías con filtro por parent_id y handle |
| `get_store_info` | Info de la tienda (plan, moneda, dominios) |
| `list_coupons` | Lista cupones de descuento |
| `list_webhooks` | Lista webhooks registrados por la app |

## Setup

Tienda Nube usa OAuth 2.0 con el flujo authorization code. Los access tokens **no expiran**.

1. Obtené tu `TN_STORE_ID` y `TN_ACCESS_TOKEN` (ver [README del paquete full](https://github.com/MarcosNahuel/tiendanube-mcp#setup) para el flow completo, o pediselos al admin de tu tienda).
2. Configurá el MCP:

```json
{
  "mcpServers": {
    "tiendanube": {
      "command": "node",
      "args": ["path/to/tiendanube-mcp-read/dist/index.js"],
      "env": {
        "TN_STORE_ID": "1234567",
        "TN_ACCESS_TOKEN": "...",
        "TN_APP_NAME": "mi-app",
        "TN_CONTACT_EMAIL": "me@example.com"
      }
    }
  }
}
```

## Por qué usar el read-only

- **Zero riesgo** de escritura: aunque Claude alucine un tool name como `update_price`, no existe. La tienda nunca se toca.
- **Seguro para dashboards** y exploración de datos con LLMs.
- **Subset estable** — si agregamos tools de escritura en el full, el read se mantiene igual (compatible con v1.x).
- **Compatible con ambos** — Tienda Nube Argentina y Nuvemshop Brasil.

## Upgrade path

Si necesitás escritura (actualizar precios, stock, cancelar órdenes, crear cupones) usá el paquete completo [`@traid/tiendanube-mcp`](https://github.com/MarcosNahuel/tiendanube-mcp).

## Desarrollo

```bash
cd mcp/tiendanube-mcp-read
npm install
npm run build
npm run dev
```

## Licencia

MIT — por [TRAID](https://traid.ai)
