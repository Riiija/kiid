import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { TransactionFilters } from '../../../components/common/TransactionFilters'
import { TransactionList } from '../../../components/common/TransactionList'
import type { TransactionFiltersState } from '../../../types/transaction'
import { useTransactions } from '../hooks/useTransactions'

const pageSize = 5

export function TransactionsPage() {
  const transactionsQuery = useTransactions()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<TransactionFiltersState>({
    childId: 'all',
    type: 'all',
    period: 'all',
    search: '',
  })

  const filteredTransactions = useMemo(() => {
    const now = new Date('2026-07-15T12:00:00.000Z').getTime()
    const periodDays = filters.period === 'week' ? 7 : filters.period === 'month' ? 30 : null
    const search = filters.search.trim().toLowerCase()

    return (transactionsQuery.data ?? []).filter((transaction) => {
      const matchesChild = filters.childId === 'all' || transaction.childId === filters.childId
      const matchesType = filters.type === 'all' || transaction.type === filters.type
      const matchesSearch = search.length === 0 || transaction.description.toLowerCase().includes(search)
      const matchesPeriod =
        periodDays === null || now - new Date(transaction.createdAt).getTime() <= periodDays * 24 * 60 * 60 * 1000

      return matchesChild && matchesType && matchesSearch && matchesPeriod
    })
  }, [filters, transactionsQuery.data])

  const visibleTransactions = filteredTransactions.slice(0, page * pageSize)

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Transactions"
        title="Historique familial"
        description="Filtrez les mouvements par enfant, type, periode ou description."
      />
      <TransactionFilters
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters)
          setPage(1)
        }}
      />
      {transactionsQuery.isLoading ? (
        <PageSkeleton rows={3} />
      ) : (
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <TransactionList transactions={visibleTransactions} />
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: visibleTransactions.length > 0 ? 2 : 0 }}>
              {visibleTransactions.length < filteredTransactions.length ? (
                <Button variant="outlined" startIcon={<ReceiptLongRoundedIcon />} onClick={() => setPage((current) => current + 1)}>
                  Afficher plus
                </Button>
              ) : visibleTransactions.length > 0 ? (
                <Typography color="text.secondary">Toutes les transactions filtrees sont affichees.</Typography>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
