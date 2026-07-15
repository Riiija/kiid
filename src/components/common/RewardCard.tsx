import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded'
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { Reward } from '../../types/reward'
import { formatKidCoins } from '../../utils/formatters'

type RewardCardProps = {
  reward: Reward
  childBalance?: number
  mode: 'parent' | 'child'
  onEdit?: (reward: Reward) => void
  onToggle?: (reward: Reward) => void
  onRequest?: (reward: Reward) => void
  onApprove?: (reward: Reward) => void
}

export function RewardCard({ reward, childBalance, mode, onEdit, onToggle, onRequest, onApprove }: RewardCardProps) {
  const canAfford = childBalance === undefined || childBalance >= reward.cost

  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: 'rgba(109, 93, 251, 0.12)' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Stack
                aria-hidden="true"
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'warning.main',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                }}
              >
                <EmojiEventsRoundedIcon />
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="h3">{reward.name}</Typography>
                <Typography sx={{ fontWeight: 850 }}>{formatKidCoins(reward.cost)}</Typography>
              </Stack>
            </Stack>
            <Chip label={reward.isActive ? 'Active' : 'Inactive'} color={reward.isActive ? 'success' : 'default'} />
          </Stack>
          <Typography color="text.secondary">{reward.description}</Typography>
          {mode === 'parent' ? (
            <Typography color="text.secondary">
              {reward.pendingClaims} demande{reward.pendingClaims > 1 ? 's' : ''} en attente
            </Typography>
          ) : (
            <Typography color={canAfford ? 'success.main' : 'text.secondary'}>
              {canAfford ? 'Disponible avec ton solde' : "Encore un peu d'epargne"}
            </Typography>
          )}
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {mode === 'parent' ? (
              <>
                <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit?.(reward)}>
                  Modifier
                </Button>
                <Button color="secondary" variant="outlined" startIcon={<ToggleOffRoundedIcon />} onClick={() => onToggle?.(reward)}>
                  {reward.isActive ? 'Desactiver' : 'Activer'}
                </Button>
                {reward.pendingClaims > 0 ? (
                  <Button variant="contained" startIcon={<CheckCircleRoundedIcon />} onClick={() => onApprove?.(reward)}>
                    Valider
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<SendRoundedIcon />}
                disabled={!reward.isActive || !canAfford}
                onClick={() => onRequest?.(reward)}
              >
                Demander
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
