import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { Alert, Avatar, Button, Card, CardContent, FormControlLabel, Snackbar, Stack, Switch, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { PageHeader } from '../../../components/common/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { children } from '../../../mocks/children'

export function ChildSettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const child = children[0]
  const [avatarEditable, setAvatarEditable] = useState(child.canEditAvatar)
  const [compactMode, setCompactMode] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mes reglages"
        title="Preferences"
        description="Ces reglages sont limites a ton espace enfant."
        actions={
          <Button variant="outlined" color="secondary" startIcon={<LogoutRoundedIcon />} onClick={() => setLogoutOpen(true)}>
            Deconnexion
          </Button>
        }
      />
      <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: child.avatarColor, width: 64, height: 64, fontWeight: 900 }}>{child.avatarInitials}</Avatar>
              <Stack>
                <Typography variant="h2">{child.fullName}</Typography>
                <Typography color="text.secondary">Compte enfant</Typography>
              </Stack>
            </Stack>
            <FormControlLabel
              control={<Switch checked={avatarEditable} onChange={(event) => setAvatarEditable(event.target.checked)} />}
              label="Modifier mon avatar si un parent l'autorise"
            />
            <FormControlLabel
              control={<Switch checked={compactMode} onChange={(event) => setCompactMode(event.target.checked)} />}
              label="Affichage compact"
            />
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => setSnackbar('Preferences enregistrees en mode demonstration.')}>
              Enregistrer
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={logoutOpen}
        title="Confirmer la deconnexion"
        description="Tu seras redirige vers la page de connexion de demonstration."
        confirmLabel="Se deconnecter"
        confirmColor="secondary"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          void signOut().then(() => navigate('/login'))
        }}
      />
      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity="success" variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
