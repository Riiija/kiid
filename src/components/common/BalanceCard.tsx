import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { ChildAccount } from '../../types/child'
import { formatKidCoins } from '../../utils/formatters'

type BalanceCardProps = {
  child: ChildAccount
  showQrAction?: boolean
}

export function BalanceCard({ child, showQrAction = false }: BalanceCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        color: 'common.white',
        border: 0,
        background: 'linear-gradient(135deg, #6D5DFB 0%, #4169E1 68%, #22C55E 130%)',
        boxShadow: '0 18px 46px rgba(65, 105, 225, 0.28)',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.22)', fontWeight: 900 }}>
              {child.avatarInitials}
            </Avatar>
            <Stack>
              <Typography sx={{ opacity: 0.82 }}>{child.firstName}</Typography>
              <Typography variant="h1" color="inherit">
                {formatKidCoins(child.balance)}
              </Typography>
            </Stack>
          </Stack>
          {showQrAction ? (
            <Button
              component={RouterLink}
              to="/child/qr-code"
              variant="contained"
              color="inherit"
              startIcon={<QrCode2RoundedIcon />}
              sx={{ color: 'primary.main', backgroundColor: 'common.white' }}
            >
              Mon QR code
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
