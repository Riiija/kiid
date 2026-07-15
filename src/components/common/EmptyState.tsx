import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon = <InboxRoundedIcon />, action }: EmptyStateProps) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.14)' }}>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 2 }}>
          <Stack
            aria-hidden="true"
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              backgroundColor: 'rgba(109, 93, 251, 0.1)',
            }}
          >
            {icon}
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="h3">{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Stack>
          {action}
        </Stack>
      </CardContent>
    </Card>
  )
}
