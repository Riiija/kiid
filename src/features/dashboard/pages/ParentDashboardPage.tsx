import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import WalletRoundedIcon from '@mui/icons-material/WalletRounded'
import { Alert, Box, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ChildCard } from '../../../components/common/ChildCard'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { KidCoinActionDialog, type KidCoinActionPayload, type KidCoinOperation } from '../../../components/common/KidCoinActionDialog'
import { MetricCard } from '../../../components/common/MetricCard'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { TransactionList } from '../../../components/common/TransactionList'
import { useChildren } from '../../children/hooks/useChildren'
import { parentUser } from '../../../mocks/currentUser'
import { useRewards, useRewardClaims } from '../../rewards/hooks/useRewards'
import { useSavingsGoals } from '../../savings-goals/hooks/useSavingsGoals'
import { useCreateChildTransaction, useTransactions } from '../../transactions/hooks/useTransactions'
import type { ChildAccount } from '../../../types/child'
import { formatKidCoins } from '../../../utils/formatters'
import { toFrenchErrorMessage } from '../../../utils/errors'

type PendingDebit = KidCoinActionPayload | null
type SnackbarState = {
  message: string
  severity: 'success' | 'error'
}

export function ParentDashboardPage() {
  const childrenQuery = useChildren()
  const transactionsQuery = useTransactions()
  const rewardsQuery = useRewards()
  const rewardClaimsQuery = useRewardClaims()
  const goalsQuery = useSavingsGoals()
  const createTransaction = useCreateChildTransaction()
  const children = childrenQuery.data ?? []
  const rewardClaims = rewardClaimsQuery.data ?? []
  const savingsGoals = goalsQuery.data ?? []
  const transactions = transactionsQuery.data ?? []
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [dialogOperation, setDialogOperation] = useState<KidCoinOperation | null>(null)
  const [selectedChild, setSelectedChild] = useState<ChildAccount | undefined>(undefined)
  const [pendingDebit, setPendingDebit] = useState<PendingDebit>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  const displayedChildren = children.map((child) => ({ ...child, balance: balances[child.id] ?? child.balance }))
  const totalBalance = displayedChildren.reduce((sum, child) => sum + child.balance, 0)
  const pendingRewards = rewardClaims.filter((claim) => claim.status === 'pending').length
  const recentTransactions = transactions.slice(0, 4)
  const isLoading =
    childrenQuery.isLoading ||
    transactionsQuery.isLoading ||
    rewardsQuery.isLoading ||
    rewardClaimsQuery.isLoading ||
    goalsQuery.isLoading

  function openAction(operation: KidCoinOperation, child?: ChildAccount) {
    setSelectedChild(child)
    setDialogOperation(operation)
  }

  async function applyAction(payload: KidCoinActionPayload) {
    const signedAmount = payload.operation === 'credit' ? payload.amount : -payload.amount
    const currentBalance = balances[payload.child.id] ?? payload.child.balance

    if (currentBalance + signedAmount < 0) {
      setSnackbar({ message: 'Solde insuffisant pour effectuer ce retrait.', severity: 'error' })
      setDialogOperation(null)
      setSelectedChild(undefined)
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

      setBalances((currentBalances) => ({
        ...currentBalances,
        [payload.child.id]: transaction.balanceAfter,
      }))
      setSnackbar({
        message: `${payload.operation === 'credit' ? 'Ajout' : 'Retrait'} de ${formatKidCoins(payload.amount)} pour ${payload.child.firstName}.`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Operation en euros impossible.'), severity: 'error' })
    } finally {
      setDialogOperation(null)
      setSelectedChild(undefined)
      setPendingDebit(null)
    }
  }

  function handleActionSubmit(payload: KidCoinActionPayload) {
    if (payload.operation === 'debit') {
      setPendingDebit(payload)
      setDialogOperation(null)
      return
    }

    void applyAction(payload)
  }

  return (
    <Stack spacing={3.5}>
      <PageHeader
        eyebrow="Espace parent"
        title={`Bonjour ${parentUser.firstName}`}
        description="Vue rapide des soldes, objectifs et demandes de recompenses."
        actions={
          <>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openAction('credit')}>
              Ajouter
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<RemoveRoundedIcon />} onClick={() => openAction('debit')}>
              Retirer
            </Button>
            <Button component={RouterLink} to="/parent/scan" variant="outlined" startIcon={<QrCodeScannerRoundedIcon />}>
              Scanner
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <MetricCard label="Solde total" value={formatKidCoins(totalBalance)} icon={<WalletRoundedIcon />} accentColor="#6D5DFB" />
        <MetricCard label="Enfants" value={String(displayedChildren.length)} icon={<SavingsRoundedIcon />} accentColor="#22C55E" />
        <MetricCard label="Demandes" value={String(pendingRewards)} icon={<EmojiEventsRoundedIcon />} accentColor="#F59E0B" />
      </Box>

      {isLoading ? <PageSkeleton rows={3} /> : <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(320px, 0.85fr)' },
          gap: 2.5,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="h2">Enfants</Typography>
            <Button component={RouterLink} to="/parent/savings" endIcon={<SavingsRoundedIcon />}>
              Objectifs
            </Button>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            {displayedChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                goal={savingsGoals.find((goal) => goal.childId === child.id)}
                onAdd={(targetChild) => openAction('credit', targetChild)}
                onWithdraw={(targetChild) => openAction('debit', targetChild)}
              />
            ))}
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="h2">Derniers mouvements</Typography>
            <Button component={RouterLink} to="/parent/transactions">
              Voir tout
            </Button>
          </Stack>
          <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
            <CardContent>
              <TransactionList transactions={recentTransactions} childAccounts={displayedChildren} />
            </CardContent>
          </Card>
          <Card
            variant="outlined"
            sx={{
              borderColor: 'rgba(65, 105, 225, 0.14)',
              background: 'linear-gradient(135deg, rgba(109, 93, 251, 0.1), rgba(34, 197, 94, 0.08))',
            }}
          >
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h3">Raccourci recompenses</Typography>
                <Typography color="text.secondary">
                  {pendingRewards} demande{pendingRewards > 1 ? 's' : ''} a verifier.
                </Typography>
                <Button component={RouterLink} to="/parent/rewards" variant="contained" startIcon={<EmojiEventsRoundedIcon />}>
                  Ouvrir
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>}

      <KidCoinActionDialog
        open={dialogOperation !== null}
        operation={dialogOperation ?? 'credit'}
        childOptions={displayedChildren}
        selectedChild={selectedChild}
        onClose={() => {
          setDialogOperation(null)
          setSelectedChild(undefined)
        }}
        onSubmit={handleActionSubmit}
      />
      <ConfirmDialog
        open={pendingDebit !== null}
        title="Confirmer le retrait"
        description={
          pendingDebit
            ? `Retirer ${formatKidCoins(pendingDebit.amount)} du compte de ${pendingDebit.child.firstName} ?`
            : ''
        }
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
