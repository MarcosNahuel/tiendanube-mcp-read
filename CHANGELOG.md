# Changelog

Todas las versiones de `@traid/tiendanube-mcp-read` en orden inverso.

## [1.0.0] — 2026-04-17

### Added
- Release inicial con 10 tools read-only
- Auth con header `Authentication: bearer` (spec oficial TN)
- User-Agent configurable con email de contacto
- Compatibilidad con Tienda Nube Argentina y Nuvemshop Brasil
- SKILL.md con frontmatter YAML para distribución en marketplaces

### Tools (10, todas lectura)
- `list_products` — productos con filtros
- `get_product` — detalle por id o SKU
- `list_orders` — órdenes con filtros
- `get_order` — detalle completo
- `list_customers` — clientes con búsqueda
- `get_customer` — detalle con direcciones
- `list_categories` — categorías con filtro parent
- `get_store_info` — info de la tienda
- `list_coupons` — cupones de descuento
- `list_webhooks` — hooks registrados

### Notes
- Subset estrictamente read-only del paquete comercial `@traid/tiendanube-mcp`.
- Sin write-back: no incluye `update_product`, `update_order_status`, `create_coupon`.
- Primer MCP de Tienda Nube publicado en npm bajo licencia MIT (los 2 community en Python no tienen licencia).
