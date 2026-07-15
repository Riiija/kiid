import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { Avatar, Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AmountText } from './AmountText'
import type { ChildAccount } from '../../types/child'
import type { SavingsGoal } from '../../types/savingsGoal'
import { getProgressPercent } from '../../utils/formatters'

type ChildCardProps = {
  child: ChildAccount
  goal?: SavingsGoal
  onAdd?: (child: ChildAccount) => void
  onWithdraw?: (child: ChildAccount) => void
}

export function ChildCard({ child, goal, onAdd, onWithdraw }: ChildCardProps) {
  const progress = goal ? getProgressPercent(goal.currentAmount, goal.targetAmount) : 0

  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: 'rgba(109, 93, 251, 0.12)' }}>
      <CardContent>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: child.avatarColor,
                color: 'common.white',
                width: 48,
                height: 48,
                fontWeight: 850,
              }}
            >
              {child.avatarInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h3">{child.firstName}</Typography>
              <AmountText amount={child.balance} variant="body1" fontWeight={800} />
            </Box>
          </Stack>

          {goal ? (
            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {goal.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {progress} %
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(109, 93, 251, 0.1)' }}
              />
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to={`/parent/children/${child.id}`}
              variant="outlined"
              startIcon={<VisibilityRoundedIcon />}
              sx={{ flex: '1 1 150px' }}
            >
              Voir
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ flex: '1 1 112px' }} onClick={() => onAdd?.(child)}>
              Ajouter
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RemoveRoundedIcon />}
              sx={{ flex: '1 1 112px' }}
              onClick={() => onWithdraw?.(child)}
            >
              Retirer
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
