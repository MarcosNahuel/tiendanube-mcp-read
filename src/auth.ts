// Auth de Tienda Nube / Nuvemshop.
// Los access tokens NO expiran hasta que se genera uno nuevo o el usuario desinstala la app,
// por eso alcanza con leer TN_ACCESS_TOKEN del env. No implementamos OAuth interactivo:
// el token se obtiene afuera (CLI, n8n, portal de partners) y se inyecta como env var.

import type { TNConfig } from './types.js'

export function getConfig(): TNConfig {
  const storeId = process.env.TN_STORE_ID || ''
  const accessToken = process.env.TN_ACCESS_TOKEN || ''
  const appName = process.env.TN_APP_NAME || 'traid-mcp'
  const contactEmail = process.env.TN_CONTACT_EMAIL || 'contacto@traid.agency'

  return { storeId, accessToken, appName, contactEmail }
}

export function getAccessToken(): string {
  const { accessToken } = getConfig()
  if (!accessToken) {
    throw new Error(
      'Configurá TN_ACCESS_TOKEN (access token de Tienda Nube obtenido vía OAuth authorization code). ' +
      'Los tokens de TN no expiran: obtenelo una sola vez desde partners.tiendanube.com y guardalo.'
    )
  }
  return accessToken
}

export function getStoreId(): string {
  const { storeId } = getConfig()
  if (!storeId) {
    throw new Error(
      'Configurá TN_STORE_ID (el user_id que devuelve el endpoint /apps/authorize/token, ' +
      'o el ID que ves en https://www.tiendanube.com/admin/account).'
    )
  }
  return storeId
}

export function getUserAgent(): string {
  const { appName, contactEmail } = getConfig()
  return `${appName} (${contactEmail})`
}
