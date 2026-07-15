import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import { Alert, Box, Button, Card, CardContent, Chip, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { RewardCard } from '../../../components/common/RewardCard'
import { RewardFormDialog } from '../../../components/common/RewardFormDialog'
import type { Reward, RewardClaim } from '../../../types/reward'
import { formatDateLabel } from '../../../utils/formatters'
import { rewardClaimStatusLabels } from '../../../utils/labels'
import { toFrenchErrorMessage } from '../../../utils/errors'
import { useChildren } from '../../children/hooks/useChildren'
import { useReviewRewardClaim, useRewardClaims, useRewards, useSaveReward } from '../hooks/useRewards'

type SnackbarState = {
  message: string
  severity: 'success' | 'error'
}

export function RewardsManagementPage() {
  const childrenQuery = useChildren()
  const rewardsQuery = useRewards()
  const rewardClaimsQuery = useRewardClaims()
  const saveReward = useSaveReward()
  const reviewRewardClaim = useReviewRewardClaim()
  const children = childrenQuery.data ?? []
  const [localRewards, setLocalRewards] = useState<Reward[]>([])
  const [editingReward, setEditingReward] = useState<Reward | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [toggleReward, setToggleReward] = useState<Reward | null>(null)
  const [approvalClaim, setApprovalClaim] = useState<RewardClaim | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  const rewardClaims = rewardClaimsQuery.data ?? []
  const baseRewards = rewardsQuery.data ?? []
  const enrichedRewards = baseRewards.map((reward) => ({
    ...reward,
    pendingClaims: rewardClaims.filter((claim) => claim.rewardId === reward.id && claim.status === 'pending').length,
  }))
  const rewards = localRewards.length > 0 ? localRewards : enrichedRewards
  const pendingClaims = rewardClaims.filter((claim) => claim.status === 'pending')

  async function handleSave(reward: Reward) {
    try {
      const savedReward = await saveReward.mutateAsync(reward)
      setLocalRewards((currentRewards) => {
        const baseRewards = currentRewards.length > 0 ? currentRewards : rewards
        const exists = baseRewards.some((item) => item.id === reward.id || item.id === savedReward.id)

        return exists
          ? baseRewards.map((item) => (item.id === reward.id || item.id === savedReward.id ? savedReward : item))
          : [savedReward, ...baseRewards]
      })
      setFormOpen(false)
      setEditingReward(undefined)
      setSnackbar({ message: 'Recompense enregistree.', severity: 'success' })
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, "Impossible d'enregistrer cette recompense."), severity: 'error' })
    }
  }

  async function confirmToggleReward() {
    if (!toggleReward) {
      return
    }

    try {
      const savedReward = await saveReward.mutateAsync({ ...toggleReward, isActive: !toggleReward.isActive })
      setLocalRewards((currentRewards) => {
        const baseRewards = currentRewards.length > 0 ? currentRewards : rewards
        return baseRewards.map((reward) => (reward.id === savedReward.id ? savedReward : reward))
      })
      setSnackbar({ message: 'Statut de recompense mis a jour.', severity: 'success' })
      setToggleReward(null)
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Impossible de modifier cette recompense.'), severity: 'error' })
    }
  }

  async function confirmApproval() {
    if (!approvalClaim) {
      return
    }

    try {
      await reviewRewardClaim.mutateAsync({
        claimId: approvalClaim.id,
        status: 'approved',
        comment: 'Validee depuis KidBank.',
      })
      setSnackbar({ message: 'Demande de recompense validee.', severity: 'success' })
      setApprovalClaim(null)
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Impossible de valider cette demande.'), severity: 'error' })
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Recompenses"
        title="Catalogue familial"
        description="Creez, modifiez et desactivez les recompenses disponibles contre des KidCoins."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditingReward(undefined)
              setFormOpen(true)
            }}
          >
            Creer
          </Button>
        }
      />

      {childrenQuery.isLoading || rewardsQuery.isLoading || rewardClaimsQuery.isLoading ? <PageSkeleton rows={3} /> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h2">Liste des recompenses</Typography>
          {rewards.length === 0 ? (
            <EmptyState title="Aucune recompense disponible." description="Creez votre premiere recompense familiale." />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  mode="parent"
                  onEdit={(targetReward) => {
                    setEditingReward(targetReward)
                    setFormOpen(true)
                  }}
                  onToggle={(targetReward) => setToggleReward(targetReward)}
                  onApprove={(targetReward) => {
                    setApprovalClaim(pendingClaims.find((claim) => claim.rewardId === targetReward.id) ?? null)
                  }}
                />
              ))}
            </Box>
          )}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h2">Demandes en attente</Typography>
          {pendingClaims.length === 0 ? (
            <EmptyState title="Aucune demande" description="Les demandes de recompense apparaitront ici." />
          ) : (
            pendingClaims.map((claim) => {
              const reward = rewards.find((item) => item.id === claim.rewardId)
              const child = children.find((item) => item.id === claim.childId)

              return (
                <Card key={claim.id} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="h3">{reward?.name ?? 'Recompense'}</Typography>
                        <Chip label={rewardClaimStatusLabels[claim.status]} color="warning" />
                      </Stack>
                      <Typography color="text.secondary">
                        {child?.firstName ?? 'Enfant'} - demande le {formatDateLabel(claim.requestedAt)}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<EmojiEventsRoundedIcon />}
                        onClick={() => setApprovalClaim(claim)}
                      >
                        Valider
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })
          )}
        </Stack>
      </Box>}

      <RewardFormDialog
        open={formOpen}
        reward={editingReward}
        onClose={() => {
          setFormOpen(false)
          setEditingReward(undefined)
        }}
        onSave={(reward) => void handleSave(reward)}
      />
      <ConfirmDialog
        open={toggleReward !== null}
        title={toggleReward?.isActive ? 'Desactiver la recompense' : 'Activer la recompense'}
        description={toggleReward ? `${toggleReward.name} sera ${toggleReward.isActive ? 'masquee' : 'visible'} pour les enfants.` : ''}
        confirmLabel={toggleReward?.isActive ? 'Desactiver' : 'Activer'}
        confirmColor={toggleReward?.isActive ? 'warning' : 'primary'}
        onCancel={() => setToggleReward(null)}
        onConfirm={() => void confirmToggleReward()}
      />
      <ConfirmDialog
        open={approvalClaim !== null}
        title="Valider une recompense"
        description={
          approvalClaim
            ? `Confirmer la validation de ${rewards.find((reward) => reward.id === approvalClaim.rewardId)?.name ?? 'cette recompense'} ?`
            : ''
        }
        confirmLabel="Valider"
        onCancel={() => setApprovalClaim(null)}
        onConfirm={() => void confirmApproval()}
      />
      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.severity ?? 'success'} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
