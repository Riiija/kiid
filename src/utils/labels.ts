import type { GoalStatus } from '../types/savingsGoal'
import type { TransactionType } from '../types/transaction'
import type { RewardClaimStatus } from '../types/reward'

export const transactionTypeLabels: Record<TransactionType, string> = {
  credit: 'Credit',
  debit: 'Debit',
  reward: 'Recompense',
  adjustment: 'Ajustement',
  saving: 'Epargne',
}

export const rewardClaimStatusLabels: Record<RewardClaimStatus, string> = {
  pending: 'En attente',
  approved: 'Acceptee',
  rejected: 'Refusee',
  completed: 'Terminee',
}

export const goalStatusLabels: Record<GoalStatus, string> = {
  active: 'En cours',
  completed: 'Termine',
  cancelled: 'Annule',
}
