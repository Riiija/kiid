import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { BalanceCard } from '../../../components/common/BalanceCard'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { RewardCard } from '../../../components/common/RewardCard'
import { SavingsGoalCard } from '../../../components/common/SavingsGoalCard'
import { TransactionList } from '../../../components/common/TransactionList'
import { useChildren } from '../../children/hooks/useChildren'
import { useRewards } from '../../rewards/hooks/useRewards'
import { useSavingsGoals } from '../../savings-goals/hooks/useSavingsGoals'
import { useTransactions } from '../../transactions/hooks/useTransactions'

export function ChildDashboardPage() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const transactionsQuery = useTransactions(child?.id)
  const goalsQuery = useSavingsGoals(child?.id)
  const rewardsQuery = useRewards()
  const childTransactions = transactionsQuery.data ?? []
  const goals = goalsQuery.data ?? []
  const mainGoal = goals[0]
  const affordableRewards = (rewardsQuery.data ?? []).filter((reward) => child && reward.isActive && reward.cost <= child.balance)

  if (childrenQuery.isLoading || !child) {
    return <PageSkeleton rows={3} />
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: child.avatarColor, width: 56, height: 56, color: 'common.white', fontWeight: 900 }}>
            {child.avatarInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1">Salut {child.firstName}</Typography>
            <Typography color="text.secondary">Tes KidCoins sont prets.</Typography>
          </Box>
        </Stack>
      </Stack>

      <BalanceCard child={child} showQrAction />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' }, gap: 2.5 }}>
        {mainGoal ? (
          <SavingsGoalCard goal={mainGoal} />
        ) : (
          <EmptyState title="Aucun objectif d'epargne." description="Demande a un parent de creer un objectif." icon={<SavingsRoundedIcon />} />
        )}

        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <EmojiEventsRoundedIcon color="warning" />
                <Typography variant="h2">Recompenses disponibles</Typography>
              </Stack>
              {affordableRewards.length === 0 ? (
                <EmptyState title="Aucune recompense disponible." description="Continue a economiser des KidCoins." />
              ) : (
                <Stack spacing={1.25}>
                  {affordableRewards.slice(0, 2).map((reward) => (
                    <RewardCard key={reward.id} reward={reward} mode="child" childBalance={child.balance} />
                  ))}
                </Stack>
              )}
              <Button component={RouterLink} to="/child/rewards" variant="contained">
                Voir toutes les recompenses
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="h2">Derniere transaction</Typography>
          <Button component={RouterLink} to="/child/qr-code" startIcon={<QrCode2RoundedIcon />}>
            QR Code
          </Button>
        </Stack>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <TransactionList transactions={childTransactions.slice(0, 2)} />
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  )
}
