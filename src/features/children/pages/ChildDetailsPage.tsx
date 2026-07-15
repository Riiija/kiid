import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import { Alert, Avatar, Box, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BalanceCard } from '../../../components/common/BalanceCard'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { KidCoinActionDialog, type KidCoinActionPayload, type KidCoinOperation } from '../../../components/common/KidCoinActionDialog'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { SavingsGoalCard } from '../../../components/common/SavingsGoalCard'
import { TransactionList } from '../../../components/common/TransactionList'
import { useRewardClaims, useRewards } from '../../rewards/hooks/useRewards'
import { useSavingsGoals } from '../../savings-goals/hooks/useSavingsGoals'
import { useCreateChildTransaction, useTransactions } from '../../transactions/hooks/useTransactions'
import { formatKidCoins } from '../../../utils/formatters'
import { rewardClaimStatusLabels } from '../../../utils/labels'
import { toFrenchErrorMessage } from '../../../utils/errors'
import { useChild } from '../hooks/useChildren'

type SnackbarState = {
  message: string
  severity: 'success' | 'error'
}

export function ChildDetailsPage() {
  const { childId } = useParams()
  const childQuery = useChild(childId)
  const child = childQuery.data ?? undefined
  const transactionsQuery = useTransactions(child?.id)
  const goalsQuery = useSavingsGoals(child?.id)
  const rewardsQuery = useRewards()
  const rewardClaimsQuery = useRewardClaims(child?.id)
  const createTransaction = useCreateChildTransaction()
  const [balanceOverride, setBalanceOverride] = useState<number | null>(null)
  const [operation, setOperation] = useState<KidCoinOperation | null>(null)
  const [pendingDebit, setPendingDebit] = useState<KidCoinActionPayload | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  useEffect(() => {
    setBalanceOverride(null)
  }, [childId])

  if (childQuery.isLoading) {
    return <PageSkeleton rows={3} />
  }

  if (!child) {
    return (
      <EmptyState
        title="Enfant introuvable"
        description="Ce compte enfant n'existe pas dans les donnees de demonstration."
        action={
          <Button component={RouterLink} to="/parent/dashboard" variant="contained" startIcon={<ArrowBackRoundedIcon />}>
            Retour
          </Button>
        }
      />
    )
  }

  const displayedChild = { ...child, balance: balanceOverride ?? child.balance }
  const childTransactions = transactionsQuery.data ?? []
  const childGoals = goalsQuery.data ?? []
  const childClaims = rewardClaimsQuery.data ?? []
  const rewards = rewardsQuery.data ?? []

  async function applyAction(payload: KidCoinActionPayload) {
    const signedAmount = payload.operation === 'credit' ? payload.amount : -payload.amount
    const currentBalance = balanceOverride ?? payload.child.balance

    if (currentBalance + signedAmount < 0) {
      setSnackbar({ message: 'Solde insuffisant pour effectuer ce retrait.', severity: 'error' })
      setOperation(null)
      setPendingDebit(null)
      return
    }

    try {
      const transaction = await createTransaction.mutateAsync({
        childAccountId: payload.child.id,
        amount: payload.amount,
        transactionType: payload.operation,
        description: payload.description,
      })

      setBalanceOverride(transaction.balanceAfter)
      setSnackbar({
        message: `${payload.operation === 'credit' ? 'Ajout' : 'Retrait'} de ${formatKidCoins(payload.amount)}.`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Operation KidCoins impossible.'), severity: 'error' })
    } finally {
      setOperation(null)
      setPendingDebit(null)
    }
  }

  function handleSubmit(payload: KidCoinActionPayload) {
    if (payload.operation === 'debit') {
      setPendingDebit(payload)
      setOperation(null)
      return
    }

    void applyAction(payload)
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Compte enfant"
        title={child.fullName}
        description="Profil, solde, objectifs et demandes de recompenses."
        actions={
          <>
            <Button component={RouterLink} to="/parent/dashboard" variant="outlined" startIcon={<ArrowBackRoundedIcon />}>
              Retour
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOperation('credit')}>
              Ajouter
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<RemoveRoundedIcon />} onClick={() => setOperation('debit')}>
              Retirer
            </Button>
          </>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' }, gap: 2.5 }}>
        <Stack spacing={2}>
          <BalanceCard child={displayedChild} />
          <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
            <CardContent>
              <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: child.avatarColor, fontWeight: 900 }}>
                  {child.avatarInitials}
                </Avatar>
                <Stack spacing={0.5}>
                  <Typography variant="h3">{child.firstName}</Typography>
                  <Typography color="text.secondary">Variation recente: {formatKidCoins(child.weeklyDelta, true)}</Typography>
                  <Typography color="text.secondary">
                    Avatar modifiable: {child.canEditAvatar ? 'oui' : 'non'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={2.5}>
          <Stack spacing={2}>
            <Typography variant="h2">Historique recent</Typography>
            <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
              <CardContent>
                <TransactionList transactions={childTransactions.slice(0, 4)} children={[displayedChild]} />
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h2">Objectifs d'epargne</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              {childGoals.map((goal) => (
                <SavingsGoalCard key={goal.id} goal={goal} />
              ))}
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h2">Recompenses demandees</Typography>
            {childClaims.length === 0 ? (
              <EmptyState title="Aucune demande" description="Les recompenses demandees par cet enfant apparaitront ici." />
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                {childClaims.map((claim) => {
                  const reward = rewards.find((item) => item.id === claim.rewardId)

                  return reward ? (
                    <Card key={claim.id} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography variant="h3">{reward.name}</Typography>
                          <Typography color="text.secondary">{rewardClaimStatusLabels[claim.status]}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ) : null
                })}
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>

      <KidCoinActionDialog
        open={operation !== null}
        operation={operation ?? 'credit'}
        childOptions={[displayedChild]}
        selectedChild={displayedChild}
        onClose={() => setOperation(null)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={pendingDebit !== null}
        title="Confirmer le retrait"
        description={pendingDebit ? `Retirer ${formatKidCoins(pendingDebit.amount)} du compte de ${child.firstName} ?` : ''}
        confirmLabel="Retirer"
        confirmColor="warning"
        onCancel={() => setPendingDebit(null)}
        onConfirm={() => {
          if (pendingDebit) {
            void applyAction(pendingDebit)
          }
        }}
      />
      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.severity ?? 'success'} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
