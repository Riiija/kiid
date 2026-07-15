import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { family, parentUser } from '../../mocks/currentUser'
import type { Reward } from '../../types/reward'

type RewardFormDialogProps = {
  open: boolean
  reward?: Reward
  onClose: () => void
  onSave: (reward: Reward) => void
}

export function RewardFormDialog({ open, reward, onClose, onSave }: RewardFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('20')

  useEffect(() => {
    if (open) {
      setName(reward?.name ?? '')
      setDescription(reward?.description ?? '')
      setCost(String(reward?.cost ?? 20))
    }
  }, [open, reward])

  const numericCost = Number(cost)
  const isValid = name.trim().length > 0 && Number.isFinite(numericCost) && numericCost > 0

  function handleSave() {
    if (!isValid) {
      return
    }

    onSave({
      id: reward?.id ?? `reward-${Date.now()}`,
      familyId: family.id,
      name: name.trim(),
      description: description.trim() || 'Nouvelle recompense familiale.',
      cost: numericCost,
      icon: reward?.icon ?? 'emoji_events',
      isActive: reward?.isActive ?? true,
      createdBy: parentUser.fullName,
      pendingClaims: reward?.pendingClaims ?? 0,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{reward ? 'Modifier la recompense' : 'Creer une recompense'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={name.length > 0 && name.trim().length === 0}
            helperText={name.length > 0 && name.trim().length === 0 ? 'Le nom de la recompense est obligatoire.' : ' '}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label="Cout en €"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
            error={cost.length > 0 && numericCost <= 0}
            helperText={cost.length > 0 && numericCost <= 0 ? 'Le cout doit etre superieur a zero.' : ' '}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" disabled={!isValid} onClick={handleSave} startIcon={<EmojiEventsRoundedIcon />}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
