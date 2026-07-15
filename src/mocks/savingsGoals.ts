import type { SavingsGoal } from '../types/savingsGoal'

export const savingsGoals: SavingsGoal[] = [
  {
    id: 'goal-bike',
    childId: 'lucas',
    name: 'Nouveau velo',
    description: 'Un velo bleu pour les sorties du week-end.',
    targetAmount: 180,
    currentAmount: 95,
    targetDate: '2026-09-15',
    status: 'active',
  },
  {
    id: 'goal-lego',
    childId: 'lucas',
    name: 'Grande boite de briques',
    description: 'Economiser pour une grande construction.',
    targetAmount: 75,
    currentAmount: 75,
    targetDate: '2026-08-01',
    status: 'completed',
  },
  {
    id: 'goal-game',
    childId: 'emma',
    name: 'Jeu video',
    description: 'Un jeu coop a choisir en famille.',
    targetAmount: 90,
    currentAmount: 52,
    targetDate: '2026-08-20',
    status: 'active',
  },
  {
    id: 'goal-headphones',
    childId: 'noah',
    name: 'Casque audio',
    description: 'Un casque solide pour les trajets.',
    targetAmount: 120,
    currentAmount: 36,
    targetDate: '2026-10-01',
    status: 'active',
  },
]

export function getGoalsByChildId(childId: string) {
  return savingsGoals.filter((goal) => goal.childId === childId)
}

export function getGoalById(goalId: string) {
  return savingsGoals.find((goal) => goal.id === goalId)
}

export function getMainGoalForChild(childId: string, mainGoalId: string) {
  return savingsGoals.find((goal) => goal.childId === childId && goal.id === mainGoalId)
}
