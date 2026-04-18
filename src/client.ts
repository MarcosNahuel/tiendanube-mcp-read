// HTTP client para la API de Tienda Nube / Nuvemshop con rate limiting y retry.
//
// Notas de la API:
// - Header de auth: "Authentication: bearer <token>" (OJO: NO "Authorization")
// - User-Agent obligatorio con email de contacto: "MyApp (contact@example.com)"
// - Base URL: https://api.tiendanube.com/v1/{store_id}/
// - Rate limit: varía por plan. Aplicamos retry con backoff ante 429.

import { getAccessToken, getStoreId, getUserAgent } from './auth.js'
import type { TNError } from './types.js'

const TN_API_BASE = 'https://api.tiendanube.com/v1'
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown> | unknown[]
  params?: Record<string, string | number | boolean | undefined>
}

export interface TNResponse<T> {
  data: T
  totalCount?: number
  linkHeader?: string | null
}

export async function tnFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data } = await tnFetchWithMeta<T>(path, options)
  return data
}

export async function tnFetchWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<TNResponse<T>> {
  const { method = 'GET', body, params } = options
  const storeId = getStoreId()

  // Construir URL
  let url = `${TN_API_BASE}/${storeId}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = getAccessToken()

      const response = await fetch(url, {
        method,
        headers: {
          Authentication: `bearer ${token}`,
          'User-Agent': getUserAgent(),
          'Content-Type': 'application/json',
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })

      // Rate limit: respetar X-Rate-Limit-Reset si está presente, sino backoff
      if (response.status === 429) {
        const reset = response.headers.get('x-rate-limit-reset')
        const waitMs = reset ? parseInt(reset) : RETRY_DELAY_MS * (attempt + 1)
        console.error(`[tn-mcp] Rate limited. Esperando ${waitMs}ms...`)
        await sleep(waitMs)
        continue
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as TNError | null
        const msg = formatTNError(errorData) || `HTTP ${response.status}`
        throw new Error(`Error API TN: ${msg} [${method} ${path}]`)
      }

      // Algunas respuestas (POST /orders/{id}/close) pueden devolver body vacío
      const totalCount = response.headers.get('x-total-count')
      const linkHeader = response.headers.get('link')
      const text = await response.text()
      const data = text ? (JSON.parse(text) as T) : (undefined as unknown as T)

      return {
        data,
        totalCount: totalCount ? parseInt(totalCount) : undefined,
        linkHeader,
      }
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES && isRetryable(error as Error)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1))
        continue
      }
      throw error
    }
  }

  throw lastError || new Error('Error inesperado en tnFetch')
}

function formatTNError(err: TNError | null): string | null {
  if (!err) return null
  if (typeof err.message === 'string') return err.message
  if (err.message && typeof err.message === 'object') {
    // TN devuelve errores de validación como { field: ["msg1", "msg2"] }
    return Object.entries(err.message)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
      .join(' | ')
  }
  if (err.description) return err.description
  return null
}

function isRetryable(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('econnreset') ||
    msg.includes('timeout')
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper: escoger el primer valor de un objeto multilenguaje (TN devuelve { es, pt, en })
export function pickLocalized(
  value: Record<string, string> | string | null | undefined,
  preferredLang = 'es'
): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[preferredLang]) return value[preferredLang]
  const firstKey = Object.keys(value)[0]
  return firstKey ? value[firstKey] : ''
}
