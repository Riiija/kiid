import AddRoundedIcon from '@mui/icons-material/AddRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { useAuth } from '../../auth/useAuth'
import { family, parentUser } from '../../../mocks/currentUser'
import type { ChildAccount } from '../../../types/child'
import { useChildren } from '../../children/hooks/useChildren'

export function FamilySettingsPage() {
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()
  const childrenQuery = useChildren()
  const fetchedMembers = childrenQuery.data ?? []
  const [familyName, setFamilyName] = useState(family.name)
  const [localMembers, setLocalMembers] = useState<ChildAccount[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [targetChild, setTargetChild] = useState<ChildAccount | null>(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [allowAvatarEdit, setAllowAvatarEdit] = useState(true)
  const [confirmLargeWithdrawals, setConfirmLargeWithdrawals] = useState(true)
  const members = localMembers.length > 0 ? localMembers : fetchedMembers

  function createChild() {
    const trimmedName = newChildName.trim()

    if (trimmedName.length === 0) {
      return
    }

    const child: ChildAccount = {
      id: `child-${Date.now()}`,
      profileId: `profile-${Date.now()}`,
      familyId: family.id,
      firstName: trimmedName,
      fullName: `${trimmedName} Martin`,
      avatarInitials: trimmedName.slice(0, 2).toUpperCase(),
      avatarColor: '#4169E1',
      balance: 0,
      weeklyDelta: 0,
      qrToken: crypto.randomUUID(),
      isActive: true,
      canEditAvatar: allowAvatarEdit,
      mainGoalId: '',
    }

    setLocalMembers((current) => [...(current.length > 0 ? current : fetchedMembers), child])
    setCreateOpen(false)
    setNewChildName('')
    setSnackbar('Compte enfant cree en mode demonstration.')
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Parametres"
        title="Reglages de la famille"
        description="Modifiez les informations familiales et les preferences generales."
        actions={
          <Button variant="outlined" color="secondary" startIcon={<LogoutRoundedIcon />} onClick={() => setLogoutOpen(true)}>
            Deconnexion
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5 }}>
        <Stack spacing={2.5}>
          <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h2">Famille</Typography>
                <TextField label="Nom de la famille" value={familyName} onChange={(event) => setFamilyName(event.target.value)} fullWidth />
                <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => setSnackbar('Nom de famille enregistre en mode demonstration.')}>
                  Enregistrer
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="h2">Membres</Typography>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>
                Creer un enfant
              </Button>
            </Stack>
            {childrenQuery.isLoading ? (
              <PageSkeleton rows={2} />
            ) : members.length === 0 ? (
              <EmptyState title="Ajoutez votre premier enfant." description="Les comptes enfants apparaitront dans cette liste." />
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                {members.map((child) => (
                  <Card key={child.id} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: child.avatarColor, fontWeight: 900 }}>{child.avatarInitials}</Avatar>
                          <Stack>
                            <Typography variant="h3">{child.firstName}</Typography>
                            <Typography color="text.secondary">{child.isActive ? 'Actif' : 'Desactive'}</Typography>
                          </Stack>
                        </Stack>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<PersonOffRoundedIcon />}
                          onClick={() => setTargetChild(child)}
                        >
                          Desactiver
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h2">Parent</Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: parentUser.avatarColor, fontWeight: 900 }}>{parentUser.avatarInitials}</Avatar>
                  <Stack>
                    <Typography variant="h3">{profile?.fullName ?? parentUser.fullName}</Typography>
                    <Typography color="text.secondary">{parentUser.email}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h2">Preferences</Typography>
                <FormControlLabel
                  control={<Switch checked={allowAvatarEdit} onChange={(event) => setAllowAvatarEdit(event.target.checked)} />}
                  label="Autoriser les enfants a modifier leur avatar"
                />
                <FormControlLabel
                  control={
                    <Switch checked={confirmLargeWithdrawals} onChange={(event) => setConfirmLargeWithdrawals(event.target.checked)} />
                  }
                  label="Confirmation avant retrait important"
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Creer un compte enfant</DialogTitle>
        <DialogContent>
          <TextField
            label="Prenom"
            value={newChildName}
            onChange={(event) => setNewChildName(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={createChild} disabled={newChildName.trim().length === 0}>
            Creer
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={targetChild !== null}
        title="Desactiver le compte enfant"
        description={targetChild ? `${targetChild.firstName} ne pourra plus se connecter dans cette simulation.` : ''}
        confirmLabel="Desactiver"
        confirmColor="warning"
        onCancel={() => setTargetChild(null)}
        onConfirm={() => {
          if (targetChild) {
            setLocalMembers((current) => {
              const baseMembers = current.length > 0 ? current : fetchedMembers
              return baseMembers.map((child) => (child.id === targetChild.id ? { ...child, isActive: false } : child))
            })
            setSnackbar('Compte enfant desactive en mode demonstration.')
            setTargetChild(null)
          }
        }}
      />
      <ConfirmDialog
        open={logoutOpen}
        title="Confirmer la deconnexion"
        description="Vous serez redirige vers la page de connexion de demonstration."
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
