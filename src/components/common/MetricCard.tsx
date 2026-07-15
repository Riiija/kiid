import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type MetricCardProps = {
  label: string
  value: string
  icon: ReactNode
  accentColor?: string
}

export function MetricCard({ label, value, icon, accentColor = '#6D5DFB' }: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Stack
            aria-hidden="true"
            sx={{
              width: 48,
              height: 48,
              flex: '0 0 48px',
              borderRadius: 3,
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              backgroundColor: `${accentColor}16`,
            }}
          >
            {icon}
          </Stack>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h3" color="text.primary">
              {value}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
