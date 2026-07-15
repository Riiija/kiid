import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Card, CardContent, InputAdornment, MenuItem, Stack, TextField } from '@mui/material'
import { useChildren } from '../../features/children/hooks/useChildren'
import type { TransactionFiltersState, TransactionType } from '../../types/transaction'
import { transactionTypeLabels } from '../../utils/labels'

type TransactionFiltersProps = {
  filters: TransactionFiltersState
  onChange: (filters: TransactionFiltersState) => void
  hideChildFilter?: boolean
}

const transactionTypes: TransactionType[] = ['credit', 'debit', 'reward', 'adjustment', 'saving']

export function TransactionFilters({ filters, onChange, hideChildFilter = false }: TransactionFiltersProps) {
  const childrenQuery = useChildren()
  const children = childrenQuery.data ?? []

  return (
    <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          {hideChildFilter ? null : (
            <TextField
              select
              label="Enfant"
              value={filters.childId}
              onChange={(event) => onChange({ ...filters, childId: event.target.value })}
              fullWidth
            >
              <MenuItem value="all">Tous les enfants</MenuItem>
              {children.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.firstName}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            label="Type"
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value })}
            fullWidth
          >
            <MenuItem value="all">Tous les types</MenuItem>
            {transactionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {transactionTypeLabels[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Periode"
            value={filters.period}
            onChange={(event) => onChange({ ...filters, period: event.target.value })}
            fullWidth
          >
            <MenuItem value="all">Toute la periode</MenuItem>
            <MenuItem value="week">7 derniers jours</MenuItem>
            <MenuItem value="month">30 derniers jours</MenuItem>
          </TextField>
          <TextField
            label="Recherche"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
