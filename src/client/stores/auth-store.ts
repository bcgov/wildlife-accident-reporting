import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { config } from '@/lib/config'
import { keycloak } from '@/lib/keycloak'

const SITEMINDER_BACKED_IDPS = [
  'idir',
  'bceidbasic',
  'bceidbusiness',
  'bceidboth',
]

type AuthState = {
  initialized: boolean
  authenticated: boolean
  initialize: (authenticated: boolean) => void
  login: (redirectUri?: string) => void
  logout: () => void
  getToken: () => string | undefined
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      initialized: false,
      authenticated: false,

      initialize: (authenticated) => set({ initialized: true, authenticated }),

      login: (redirectUri) => {
        keycloak.login({
          redirectUri: redirectUri ?? window.location.origin,
        })
      },

      logout: () => {
        const idp = keycloak.tokenParsed?.identity_provider
        if (typeof idp !== 'string' || !SITEMINDER_BACKED_IDPS.includes(idp)) {
          keycloak.logout({ redirectUri: window.location.origin })
          return
        }
        // SiteMinder cookie isn't cleared by keycloak.logout() for these IDPs.
        const keycloakLogout =
          `${config.keycloakUrl}/realms/${config.keycloakRealm}` +
          `/protocol/openid-connect/logout` +
          `?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}` +
          `&client_id=${encodeURIComponent(config.keycloakClientId)}` +
          (keycloak.idToken
            ? `&id_token_hint=${encodeURIComponent(keycloak.idToken)}`
            : '')
        window.location.href =
          `${config.siteminderLogoutUrl}?retnow=1` +
          `&returl=${encodeURIComponent(keycloakLogout)}`
      },

      getToken: () => keycloak.token,
    }),
    { name: 'auth-store' },
  ),
)
