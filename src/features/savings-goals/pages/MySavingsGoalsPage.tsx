import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import { Box, Stack } from '@mui/material'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { SavingsGoalCard } from '../../../components/common/SavingsGoalCard'
import { useChildren } from '../../children/hooks/useChildren'
import { useSavingsGoals } from '../hooks/useSavingsGoals'

export function MySavingsGoalsPage() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const goalsQuery = useSavingsGoals(child?.id)
  const goals = goalsQuery.data ?? []

  if (childrenQuery.isLoading || goalsQuery.isLoading || !child) {
    return <PageSkeleton rows={2} />
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mes objectifs"
        title="Mon epargne"
        description="Suis ta progression et le montant restant pour chaque objectif."
      />
      {goals.length === 0 ? (
        <EmptyState title="Aucun objectif d'epargne." description="Demande a un parent de creer un objectif." icon={<SavingsRoundedIcon />} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          {goals.map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} />
          ))}
        </Box>
      )}
    </Stack>
  )
}
