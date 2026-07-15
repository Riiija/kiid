import LockRoundedIcon from '@mui/icons-material/LockRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { KidBankLogo } from '../../../components/common/KidBankLogo'
import { type LoginFormValues, loginSchema } from '../../../lib/validations'
import { isSupabaseConfigured } from '../../../lib/supabase'
import { useAuth } from '../useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'parent@kidbank.local',
      password: 'demo',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setLoginError(null)

    try {
      const profile = await signIn(values.email, values.password)
      navigate(profile.role === 'parent' ? '/parent/dashboard' : '/child/dashboard')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Connexion impossible.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        alignItems: 'center',
        py: 4,
        background:
          'linear-gradient(145deg, rgba(109, 93, 251, 0.12) 0%, rgba(65, 105, 225, 0.08) 45%, rgba(34, 197, 94, 0.08) 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Stack spacing={1.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <KidBankLogo />
            <Typography variant="h1">Bienvenue dans KidBank</Typography>
            <Typography color="text.secondary">
              {isSupabaseConfigured
                ? 'Connectez-vous avec votre compte Supabase Auth.'
                : 'Mode mock: parent@kidbank.local ou child@kidbank.local.'}
            </Typography>
          </Stack>

          <Card component="section" variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.16)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
                {loginError ? <Alert severity="error">{loginError}</Alert> : null}
                {!isSupabaseConfigured ? (
                  <Alert severity="info">
                    Supabase n'est pas encore configure: la connexion utilise le fallback mock local.
                  </Alert>
                ) : null}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                      disabled={isSubmitting}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mot de passe"
                      type="password"
                      autoComplete="current-password"
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      disabled={isSubmitting}
                      fullWidth
                    />
                  )}
                />
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <LockRoundedIcon /> : <LoginRoundedIcon />}
                >
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>
                <Link href="#" underline="hover" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Mot de passe oublie
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
