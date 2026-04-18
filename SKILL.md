---
name: tiendanube-mcp-read
description: Read-only MCP server for Tienda Nube / Nuvemshop — products, orders, customers, categories, coupons, webhooks. Zero write risk.
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - TN_STORE_ID
        - TN_ACCESS_TOKEN
      bins:
        - node
    primaryEnv: TN_ACCESS_TOKEN
    emoji: "🛍️"
    homepage: https://github.com/MarcosNahuel/tiendanube-mcp-read
---

# Tienda Nube / Nuvemshop — Read-Only MCP Server

Read-only MCP server for Tienda Nube (Argentina) and Nuvemshop (Brazil). 10 tools for safe data access — dashboards, analytics, LLM exploration without write risk.

Strict subset of [@traid/tiendanube-mcp](https://github.com/MarcosNahuel/tiendanube-mcp). No `update_*`, no `create_*` — zero possibility of accidental writes to the store.

## Setup

```
TN_STORE_ID=1234567
TN_ACCESS_TOKEN=...
TN_APP_NAME=my-app                 # optional
TN_CONTACT_EMAIL=me@example.com    # optional
```

Access tokens from Tienda Nube do not expire until the app is uninstalled or a new token is issued.

## Tools (10, all read)

- **list_products** — Filters by stock, price, category, published, date range
- **get_product** — Full detail by ID or SKU
- **list_orders** — Filters by status, payment, shipping, date
- **get_order** — Full detail with customer, items, tracking
- **list_customers** — Search by name/email/identification
- **get_customer** — With default address and billing info
- **list_categories** — Filter by parent or handle
- **get_store_info** — Store settings (plan, currency, domains)
- **list_coupons** — Filter by validity and type
- **list_webhooks** — Hooks registered by your app

## Why read-only

- **Zero write risk** — even if the LLM hallucinates a tool like `update_price`, it doesn't exist
- **Safe for dashboards** and LLM-driven data exploration
- **Stable API** — as we add write-back tools to the full package, this one stays backward-compatible

## Upgrade path

Need write-back? Use the full package [@traid/tiendanube-mcp](https://github.com/MarcosNahuel/tiendanube-mcp) with 13 tools including `update_product`, `update_order_status`, `create_coupon`.

## License

MIT — by [TRAID](https://traid.ai)
