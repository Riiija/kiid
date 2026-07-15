// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}))

import { getInitialAuthState, signInWithEmailPassword, signOutUser } from './authService'

describe('authService mock login', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('connecte un parent demo et restaure sa session', async () => {
    const login = await signInWithEmailPassword('parent@kidbank.local', 'demo')

    expect(login.profile?.role).toBe('parent')
    expect(window.sessionStorage.getItem('kidbank-demo-email')).toBe('parent@kidbank.local')

    const restored = await getInitialAuthState()
    expect(restored.profile?.role).toBe('parent')
  })

  it('connecte un enfant demo', async () => {
    const login = await signInWithEmailPassword('child@kidbank.local', 'demo')

    expect(login.profile?.role).toBe('child')
    expect(login.profile?.firstName).toBe('Lucas')
  })

  it('nettoie la session demo a la deconnexion', async () => {
    await signInWithEmailPassword('parent@kidbank.local', 'demo')
    await signOutUser()

    expect(window.sessionStorage.getItem('kidbank-demo-email')).toBeNull()
    expect((await getInitialAuthState()).profile).toBeNull()
  })
})
