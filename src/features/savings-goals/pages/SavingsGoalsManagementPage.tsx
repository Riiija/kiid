import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import { Alert, Box, Button, Card, CardContent, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../../components/common/EmptyState'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { SavingsGoalCard } from '../../../components/common/SavingsGoalCard'
import { useChildren } from '../../children/hooks/useChildren'
import { useSavingsGoals } from '../hooks/useSavingsGoals'

export function SavingsGoalsManagementPage() {
  const childrenQuery = useChildren()
  const goalsQuery = useSavingsGoals()
  const children = childrenQuery.data ?? []
  const [childFilter, setChildFilter] = useState('all')
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const goals = useMemo(
    () => (goalsQuery.data ?? []).filter((goal) => childFilter === 'all' || goal.childId === childFilter),
    [childFilter, goalsQuery.data],
  )

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Objectifs"
        title="Objectifs d'epargne"
        description="Suivez les montants cibles, la progression et les statuts par enfant."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setSnackbar("Creation d'objectif simulee.")}>
            Nouvel objectif
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Typography color="text.secondary">Objectifs affiches</Typography>
            <Typography variant="h2">{goals.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Typography color="text.secondary">Montant actuel</Typography>
            <Typography variant="h2">{totalCurrent} KidCoins</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Typography color="text.secondary">Montant cible</Typography>
            <Typography variant="h2">{totalTarget} KidCoins</Typography>
          </CardContent>
        </Card>
      </Box>

      <TextField
        select
        label="Filtrer par enfant"
        value={childFilter}
        onChange={(event) => setChildFilter(event.target.value)}
        sx={{ maxWidth: 360 }}
      >
        <MenuItem value="all">Tous les enfants</MenuItem>
        {children.map((child) => (
          <MenuItem key={child.id} value={child.id}>
            {child.firstName}
          </MenuItem>
        ))}
      </TextField>

      {childrenQuery.isLoading || goalsQuery.isLoading ? (
        <PageSkeleton rows={3} />
      ) : goals.length === 0 ? (
        <EmptyState title="Aucun objectif d'epargne." description="Ajoutez un objectif pour suivre la progression." icon={<SavingsRoundedIcon />} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          {goals.map((goal) => {
            const child = children.find((item) => item.id === goal.childId)

            return <SavingsGoalCard key={goal.id} goal={goal} childName={child?.firstName} />
          })}
        </Box>
      )}

      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity="info" variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
