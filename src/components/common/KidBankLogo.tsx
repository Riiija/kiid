import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import { Box, Typography } from '@mui/material'

type KidBankLogoProps = {
  compact?: boolean
}

export function KidBankLogo({ compact = false }: KidBankLogoProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        aria-hidden="true"
        sx={{
          width: compact ? 38 : 46,
          height: compact ? 38 : 46,
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          color: 'common.white',
          background: 'linear-gradient(135deg, #6D5DFB 0%, #4169E1 100%)',
          boxShadow: '0 14px 30px rgba(65, 105, 225, 0.28)',
        }}
      >
        <AccountBalanceWalletRoundedIcon fontSize={compact ? 'small' : 'medium'} />
      </Box>
      <Typography
        component="span"
        variant={compact ? 'h3' : 'h2'}
        color="text.primary"
        sx={{ fontWeight: 850 }}
      >
        KidBank
      </Typography>
    </Box>
  )
}
