import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import { Alert, Box, Card, CardContent, Chip, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { RewardCard } from '../../../components/common/RewardCard'
import type { Reward } from '../../../types/reward'
import { formatDateLabel } from '../../../utils/formatters'
import { rewardClaimStatusLabels } from '../../../utils/labels'
import { toFrenchErrorMessage } from '../../../utils/errors'
import { useChildren } from '../../children/hooks/useChildren'
import { useRequestReward, useRewardClaims, useRewards } from '../hooks/useRewards'

type SnackbarState = {
  message: string
  severity: 'success' | 'error'
}

export function MyRewardsPage() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const rewardsQuery = useRewards()
  const rewardClaimsQuery = useRewardClaims(child?.id)
  const requestReward = useRequestReward()
  const [requestedReward, setRequestedReward] = useState<Reward | null>(null)
  const [requestedIds, setRequestedIds] = useState<string[]>([])
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  if (childrenQuery.isLoading || rewardsQuery.isLoading || rewardClaimsQuery.isLoading || !child) {
    return <PageSkeleton rows={3} />
  }

  const activeChild = child
  const rewards = rewardsQuery.data ?? []
  const activeRewards = rewards.filter((reward) => reward.isActive)
  const claims = rewardClaimsQuery.data ?? []

  async function confirmRequestReward() {
    if (!requestedReward) {
      return
    }

    try {
      await requestReward.mutateAsync({
        rewardId: requestedReward.id,
        childAccountId: activeChild.id,
      })
      setRequestedIds((current) => [requestedReward.id, ...current])
      setSnackbar({ message: 'Demande de recompense envoyee.', severity: 'success' })
      setRequestedReward(null)
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Impossible de demander cette recompense.'), severity: 'error' })
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mes recompenses"
        title="Choisir une recompense"
        description="Tu peux demander une recompense si ton solde le permet."
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h2">Disponibles</Typography>
          {activeRewards.length === 0 ? (
            <EmptyState title="Aucune recompense disponible." description="Reviens plus tard, un parent peut en ajouter." />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              {activeRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  mode="child"
                  childBalance={activeChild.balance}
                  onRequest={(targetReward) => setRequestedReward(targetReward)}
                />
              ))}
            </Box>
          )}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h2">Mes demandes</Typography>
          {claims.length === 0 && requestedIds.length === 0 ? (
            <EmptyState title="Aucune demande" description="Tes demandes de recompense apparaitront ici." icon={<EmojiEventsRoundedIcon />} />
          ) : (
            <>
              {requestedIds.map((rewardId) => {
                const reward = rewards.find((item) => item.id === rewardId)

                return reward ? (
                  <Card key={rewardId} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h3">{reward.name}</Typography>
                        <Chip label="En attente" color="warning" sx={{ alignSelf: 'flex-start' }} />
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null
              })}
              {claims.map((claim) => {
                const reward = rewards.find((item) => item.id === claim.rewardId)

                return reward ? (
                  <Card key={claim.id} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h3">{reward.name}</Typography>
                        <Typography color="text.secondary">Demande du {formatDateLabel(claim.requestedAt)}</Typography>
                        <Chip label={rewardClaimStatusLabels[claim.status]} sx={{ alignSelf: 'flex-start' }} />
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null
              })}
            </>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        open={requestedReward !== null}
        title="Demander cette recompense"
        description={requestedReward ? `Envoyer une demande pour ${requestedReward.name} ?` : ''}
        confirmLabel="Demander"
        onCancel={() => setRequestedReward(null)}
        onConfirm={() => void confirmRequestReward()}
      />
      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.severity ?? 'success'} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
