import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../../types/user'
import { useAuth } from './useAuth'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  publicOnly?: boolean
}

function getHomePath(role: UserRole) {
  return role === 'parent' ? '/parent/dashboard' : '/child/dashboard'
}

export function ProtectedRoute({ allowedRoles, publicOnly = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { profile, isLoading, authError, signOut } = useAuth()

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress aria-label="Chargement de la session" />
      </Box>
    )
  }

  if (publicOnly && profile) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  if (!publicOnly && !profile) {
    if (authError && authError !== 'Mode mock: variables Supabase absentes.') {
      return (
        <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', p: 2 }}>
          <Card sx={{ maxWidth: 480 }}>
            <CardContent>
              <Stack spacing={2}>
                <Alert severity="error">{authError}</Alert>
                <Typography color="text.secondary">
                  Le profil KidBank est manquant, incomplet ou l'utilisateur est desactive.
                </Typography>
                <Button variant="contained" onClick={() => void signOut()}>
                  Retour connexion
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!publicOnly && profile && !profile.isActive) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 480 }}>
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="warning">Ce compte KidBank est desactive.</Alert>
              <Button variant="contained" onClick={() => void signOut()}>
                Se deconnecter
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (!publicOnly && profile && allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  return <Outlet />
}
