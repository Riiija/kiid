import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserRole } from '../../types/user'
import {
  fetchCurrentProfile,
  getInitialAuthState,
  signInWithEmailPassword,
  signOutUser,
  type AuthProfile,
} from './authService'
import { AuthContext, type AuthContextValue } from './authContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    getInitialAuthState()
      .then((snapshot) => {
        if (!isMounted) {
          return
        }

        setSession(snapshot.session)
        setProfile(snapshot.profile)
        setAuthError(snapshot.error)
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setAuthError(error instanceof Error ? error.message : 'Erreur de restauration de session.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession?.user.id) {
        setProfile(null)
        return
      }

      fetchCurrentProfile(nextSession.user.id)
        .then((nextProfile) => {
          setProfile(nextProfile)
          setAuthError(nextProfile ? null : 'Profil KidBank incomplet.')
        })
        .catch((error: unknown) => {
          setAuthError(error instanceof Error ? error.message : 'Erreur de recuperation du profil.')
        })
    })

    return () => {
      isMounted = false
      subscription?.data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      authError,
      async signIn(email: string, password: string) {
        const snapshot = await signInWithEmailPassword(email, password)

        if (!snapshot.profile) {
          setSession(snapshot.session)
          setProfile(null)
          setAuthError(snapshot.error ?? 'Profil KidBank incomplet.')
          throw new Error(snapshot.error ?? 'Profil KidBank incomplet.')
        }

        setSession(snapshot.session)
        setProfile(snapshot.profile)
        setAuthError(snapshot.error)

        return snapshot.profile
      },
      async signOut() {
        await signOutUser()
        setSession(null)
        setProfile(null)
        setAuthError(null)
      },
      hasRole(role: UserRole) {
        return profile?.role === role
      },
    }),
    [authError, isLoading, profile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
