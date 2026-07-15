export type GoalStatus = 'active' | 'completed' | 'cancelled'

export type SavingsGoal = {
  id: string
  childId: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  status: GoalStatus
  targetDate?: string
}
