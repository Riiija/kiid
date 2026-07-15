import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material'
import { EmptyState } from './EmptyState'
import { AmountText } from './AmountText'
import type { ChildAccount } from '../../types/child'
import type { KidTransaction } from '../../types/transaction'
import { formatDateLabel } from '../../utils/formatters'
import { transactionTypeLabels } from '../../utils/labels'

type TransactionListProps = {
  transactions: KidTransaction[]
  childAccounts?: ChildAccount[]
  emptyTitle?: string
  emptyDescription?: string
}

export function TransactionList({
  transactions,
  childAccounts = [],
  emptyTitle = 'Aucune transaction pour le moment.',
  emptyDescription = "Les mouvements apparaitront ici des qu'ils seront crees.",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <List disablePadding>
      {transactions.map((transaction) => {
        const child = childAccounts.find((item) => item.id === transaction.childId)
        const childName = child?.firstName ?? 'Enfant'

        return (
          <ListItem
            key={transaction.id}
            disableGutters
            sx={{
              py: 1.35,
              pr: { xs: 10, sm: 13 },
              borderBottom: '1px solid rgba(31, 41, 55, 0.08)',
              '&:last-of-type': {
                borderBottom: 0,
              },
            }}
            secondaryAction={
              <Stack sx={{ alignItems: 'flex-end' }}>
                <AmountText amount={transaction.amount} showSign variant="body2" fontWeight={850} />
                <Typography variant="caption" color="text.secondary">
                  {formatDateLabel(transaction.createdAt)}
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: transaction.amount >= 0 ? 'success.main' : 'error.main' }}>
                {childName.slice(0, 1)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 800 }}>{transaction.description}</Typography>}
              secondary={`${childName} - ${transactionTypeLabels[transaction.type]} - solde apres ${transaction.balanceAfter}`}
            />
          </ListItem>
        )
      })}
    </List>
  )
}
