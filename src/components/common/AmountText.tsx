import { Typography, type TypographyProps } from '@mui/material'
import { formatKidCoins } from '../../utils/formatters'

type AmountTextProps = {
  amount: number
  showSign?: boolean
  fontWeight?: number
  variant?: TypographyProps['variant']
}

export function AmountText({ amount, showSign = false, fontWeight, variant }: AmountTextProps) {
  const color = amount < 0 ? 'error.main' : amount > 0 && showSign ? 'success.main' : 'text.primary'

  return (
    <Typography variant={variant} sx={{ color, fontWeight }}>
      {formatKidCoins(amount, showSign)}
    </Typography>
  )
}
