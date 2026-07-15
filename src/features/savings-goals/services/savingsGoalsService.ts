import { savingsGoals as mockSavingsGoals } from '../../../mocks/savingsGoals'
import type { SavingsGoal } from '../../../types/savingsGoal'
import { supabase } from '../../../lib/supabase'
import { isUuid } from '../../../utils/uuid'
import { throwFrenchError } from '../../../utils/errors'

type SavingsGoalRow = {
  id: string
  child_account_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  status: 'active' | 'completed' | 'cancelled'
}

function mapSavingsGoalRow(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    childId: row.child_account_id,
    name: row.name,
    description: row.description ?? '',
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date ?? undefined,
    status: row.status,
  }
}

export async function listSavingsGoals(childAccountId?: string): Promise<SavingsGoal[]> {
  if (!supabase) {
    return childAccountId ? mockSavingsGoals.filter((goal) => goal.childId === childAccountId) : mockSavingsGoals
  }

  let query = supabase
    .from('savings_goals')
    .select('id, child_account_id, name, description, target_amount, current_amount, target_date, status')
    .order('created_at', { ascending: false })

  if (childAccountId) {
    query = query.eq('child_account_id', childAccountId)
  }

  const { data, error } = await query.returns<SavingsGoalRow[]>()

  if (error) {
    throwFrenchError(error, "Impossible de charger les objectifs d'epargne.")
  }

  return data.map(mapSavingsGoalRow)
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  if (!supabase) {
    return goal
  }

  const payload = {
    ...(isUuid(goal.id) ? { id: goal.id } : {}),
    child_account_id: goal.childId,
    name: goal.name,
    description: goal.description,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    target_date: goal.targetDate ?? null,
    status: goal.status,
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .upsert(payload)
    .select('id, child_account_id, name, description, target_amount, current_amount, target_date, status')
    .single()
    .returns<SavingsGoalRow>()

  if (error) {
    throwFrenchError(error, "Impossible d'enregistrer l'objectif d'epargne.")
  }

  return mapSavingsGoalRow(data)
}
