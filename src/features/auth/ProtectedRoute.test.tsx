// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AuthProfile } from './authService'
import { AuthContext, type AuthContextValue } from './authContext'
import { ProtectedRoute } from './ProtectedRoute'

function makeProfile(role: AuthProfile['role']): AuthProfile {
  return {
    id: `${role}-profile`,
    familyId: 'family-demo',
    fullName: role === 'parent' ? 'Sophie Martin' : 'Lucas Martin',
    firstName: role === 'parent' ? 'Sophie' : 'Lucas',
    role,
    avatarUrl: null,
    isActive: true,
  }
}

function renderWithAuth(route: string, profile: AuthProfile, allowedRoles: AuthProfile['role'][]) {
  const authValue: AuthContextValue = {
    session: null,
    profile,
    isLoading: false,
    authError: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    hasRole: (role) => profile.role === role,
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path={route} element={<div>Route protegee</div>} />
          </Route>
          <Route path="/parent/dashboard" element={<div>Accueil parent</div>} />
          <Route path="/child/dashboard" element={<div>Accueil enfant</div>} />
          <Route path="/login" element={<div>Connexion</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('interdit une route parent a un enfant', () => {
    renderWithAuth('/parent/dashboard', makeProfile('child'), ['parent'])

    expect(screen.getByText('Accueil enfant')).toBeInTheDocument()
    expect(screen.queryByText('Route protegee')).not.toBeInTheDocument()
  })

  it('interdit une route enfant a un parent', () => {
    renderWithAuth('/child/dashboard', makeProfile('parent'), ['child'])

    expect(screen.getByText('Accueil parent')).toBeInTheDocument()
    expect(screen.queryByText('Route protegee')).not.toBeInTheDocument()
  })
})
