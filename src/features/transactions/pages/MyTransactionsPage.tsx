import { Card, CardContent, Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { TransactionFilters } from '../../../components/common/TransactionFilters'
import { TransactionList } from '../../../components/common/TransactionList'
import type { TransactionFiltersState } from '../../../types/transaction'
import { useChildren } from '../../children/hooks/useChildren'
import { useTransactions } from '../hooks/useTransactions'

export function MyTransactionsPage() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const transactionsQuery = useTransactions(child?.id)
  const [filters, setFilters] = useState<TransactionFiltersState>({
    childId: 'self',
    type: 'all',
    period: 'all',
    search: '',
  })

  const filteredTransactions = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return (transactionsQuery.data ?? []).filter((transaction) => {
      const matchesType = filters.type === 'all' || transaction.type === filters.type
      const matchesSearch = search.length === 0 || transaction.description.toLowerCase().includes(search)

      return matchesType && matchesSearch
    })
  }, [filters.search, filters.type, transactionsQuery.data])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mes transactions"
        title="Mon historique"
        description="Toutes les operations affichees concernent uniquement ton compte."
      />
      <TransactionFilters filters={filters} onChange={setFilters} hideChildFilter />
      {childrenQuery.isLoading || transactionsQuery.isLoading || !child ? (
        <PageSkeleton rows={2} />
      ) : (
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <TransactionList transactions={filteredTransactions} />
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
