// Navegadores embutidos de apps (Instagram, Facebook, Messenger, TikTok) usam
// webviews que costumam bloquear a conexão com a API da rifa. Detectamos o
// contexto para avisar o visitante e ensinar a abrir o link no navegador.

export type InAppBrowserApp = 'instagram' | 'facebook' | 'messenger' | 'tiktok'

export type InAppBrowserPlatform = 'android' | 'ios' | 'other'

export interface InAppBrowserInfo {
  app: InAppBrowserApp
  label: string
  platform: InAppBrowserPlatform
  browserName: string
}

const APPS: { app: InAppBrowserApp; label: string; pattern: RegExp }[] = [
  // Messenger vem antes: o UA dele também contém os tokens do Facebook.
  {
    app: 'messenger',
    label: 'Messenger',
    pattern: /FBAN\/(Messenger|Orca)|MessengerForiOS|Orca-Android/i,
  },
  { app: 'facebook', label: 'Facebook', pattern: /FBAN|FBAV|FB_IAB|FB4A|FBIOS|FBLite/i },
  { app: 'instagram', label: 'Instagram', pattern: /Instagram/i },
  { app: 'tiktok', label: 'TikTok', pattern: /musical_ly|TikTok|BytedanceWebview|trill_/i },
]

function readUserAgent() {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent
}

function buildInfo(
  app: InAppBrowserApp,
  label: string,
  platform: InAppBrowserPlatform,
): InAppBrowserInfo {
  return {
    app,
    label,
    platform,
    browserName: platform === 'ios' ? 'Safari' : platform === 'android' ? 'Chrome' : 'navegador',
  }
}

export function detectInAppBrowser(userAgent = readUserAgent()): InAppBrowserInfo | null {
  // Atalho de desenvolvimento: `?inapp=instagram` (ou `&platform=ios`) permite
  // conferir o aviso sem abrir o link dentro do app.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const forced = params.get('inapp')
    const candidate = forced ? APPS.find((app) => app.app === forced) : null
    if (candidate) {
      const platform = params.get('platform') === 'ios' ? 'ios' : 'android'
      return buildInfo(candidate.app, candidate.label, platform)
    }
  }

  const match = APPS.find((candidate) => candidate.pattern.test(userAgent))
  if (!match) return null

  const platform: InAppBrowserPlatform = /Android/i.test(userAgent)
    ? 'android'
    : /iPhone|iPad|iPod|iOS/i.test(userAgent)
      ? 'ios'
      : 'other'

  return buildInfo(match.app, match.label, platform)
}

export function fillInAppBrowserCopy(template: string, info: InAppBrowserInfo) {
  return template.replace(/\{app\}/g, info.label).replace(/\{browser\}/g, info.browserName)
}
