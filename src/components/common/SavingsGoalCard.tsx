import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import type { SavingsGoal } from '../../types/savingsGoal'
import { formatKidCoins, formatLongDate, getProgressPercent } from '../../utils/formatters'
import { goalStatusLabels } from '../../utils/labels'

type SavingsGoalCardProps = {
  goal: SavingsGoal
  childName?: string
}

export function SavingsGoalCard({ goal, childName }: SavingsGoalCardProps) {
  const progress = getProgressPercent(goal.currentAmount, goal.targetAmount)
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: 'rgba(109, 93, 251, 0.12)' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
            <Stack spacing={0.5}>
              <Typography variant="h3">{goal.name}</Typography>
              {childName ? <Typography color="text.secondary">{childName}</Typography> : null}
            </Stack>
            <Chip
              label={goalStatusLabels[goal.status]}
              color={goal.status === 'completed' ? 'success' : goal.status === 'cancelled' ? 'default' : 'primary'}
            />
          </Stack>
          <Typography color="text.secondary">{goal.description}</Typography>
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Progression
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 850 }}>
                {progress} %
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 12, borderRadius: 999, backgroundColor: 'rgba(109, 93, 251, 0.1)' }}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 850 }}>
              {formatKidCoins(goal.currentAmount)} / {formatKidCoins(goal.targetAmount)}
            </Typography>
            <Typography color="text.secondary">Reste {formatKidCoins(remaining)}</Typography>
          </Stack>
          {goal.targetDate ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <CalendarMonthRoundedIcon fontSize="small" />
              <Typography variant="body2">Date cible: {formatLongDate(goal.targetDate)}</Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
