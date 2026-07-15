import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { ChildAccount } from '../../types/child'

export type KidCoinOperation = 'credit' | 'debit'

export type KidCoinActionPayload = {
  child: ChildAccount
  operation: KidCoinOperation
  amount: number
  description: string
}

type KidCoinActionDialogProps = {
  open: boolean
  operation: KidCoinOperation
  childOptions: ChildAccount[]
  selectedChild?: ChildAccount
  onClose: () => void
  onSubmit: (payload: KidCoinActionPayload) => void
}

export function KidCoinActionDialog({
  open,
  operation,
  childOptions,
  selectedChild,
  onClose,
  onSubmit,
}: KidCoinActionDialogProps) {
  const [childId, setChildId] = useState(selectedChild?.id ?? childOptions[0]?.id ?? '')
  const [amount, setAmount] = useState(operation === 'credit' ? '20' : '10')
  const [description, setDescription] = useState(operation === 'credit' ? 'Bonus familial' : 'Retrait parent')

  useEffect(() => {
    if (open) {
      setChildId(selectedChild?.id ?? childOptions[0]?.id ?? '')
      setAmount(operation === 'credit' ? '20' : '10')
      setDescription(operation === 'credit' ? 'Bonus familial' : 'Retrait parent')
    }
  }, [childOptions, open, operation, selectedChild])

  const selectableChildren = selectedChild ? [selectedChild] : childOptions
  const selected = selectableChildren.find((child) => child.id === childId)
  const numericAmount = Number(amount)
  const isValid = Boolean(selected) && Number.isFinite(numericAmount) && numericAmount > 0 && description.trim().length > 0

  function handleSubmit() {
    if (!isValid || !selected) {
      return
    }

    onSubmit({
      child: selected,
      operation,
      amount: numericAmount,
      description: description.trim(),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{operation === 'credit' ? 'Ajouter des KidCoins' : 'Retirer des KidCoins'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Enfant"
            value={childId}
            onChange={(event) => setChildId(event.target.value)}
            disabled={Boolean(selectedChild)}
            fullWidth
          >
            {selectableChildren.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                {child.firstName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Montant"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
            error={amount.length > 0 && !isValid}
            helperText={amount.length > 0 && numericAmount <= 0 ? 'Le montant doit etre superieur a zero.' : ' '}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          color={operation === 'credit' ? 'primary' : 'secondary'}
          disabled={!isValid}
          onClick={handleSubmit}
          startIcon={operation === 'credit' ? <AddRoundedIcon /> : <RemoveRoundedIcon />}
        >
          {operation === 'credit' ? 'Ajouter' : 'Retirer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
