import { children as seedChildren } from './children'
import { rewardClaims as seedRewardClaims, rewards as seedRewards } from './rewards'
import { transactions as seedTransactions } from './transactions'
import type { ChildAccount } from '../types/child'
import type { Reward, RewardClaim, RewardClaimStatus } from '../types/reward'
import type { KidTransaction, TransactionType } from '../types/transaction'

type MockTransactionInput = {
  childAccountId: string
  amount: number
  transactionType: TransactionType
  description: string
}

let childStore: ChildAccount[] = seedChildren.map((child) => ({ ...child }))
let transactionStore: KidTransaction[] = seedTransactions.map((transaction) => ({ ...transaction }))
let rewardStore: Reward[] = seedRewards.map((reward) => ({ ...reward }))
let rewardClaimStore: RewardClaim[] = seedRewardClaims.map((claim) => ({ ...claim }))

function cloneChild(child: ChildAccount): ChildAccount {
  return { ...child }
}

function cloneTransaction(transaction: KidTransaction): KidTransaction {
  return { ...transaction }
}

function cloneReward(reward: Reward): Reward {
  return { ...reward }
}

function cloneRewardClaim(claim: RewardClaim): RewardClaim {
  return { ...claim }
}

function computePendingClaims(rewardId: string) {
  return rewardClaimStore.filter((claim) => claim.rewardId === rewardId && claim.status === 'pending').length
}

export function resetMockRuntimeStore() {
  childStore = seedChildren.map(cloneChild)
  transactionStore = seedTransactions.map(cloneTransaction)
  rewardStore = seedRewards.map(cloneReward)
  rewardClaimStore = seedRewardClaims.map(cloneRewardClaim)
}

export function listMockChildren() {
  return childStore.map(cloneChild)
}

export function getMockChild(childId: string) {
  return childStore.find((child) => child.id === childId) ?? null
}

export function getMockChildByQrToken(qrToken: string) {
  const normalizedToken = qrToken.replace('kidbank://child/', '').trim()
  return childStore.find((child) => child.qrToken === normalizedToken) ?? null
}

export function listMockTransactions(childAccountId?: string) {
  const transactions = childAccountId
    ? transactionStore.filter((transaction) => transaction.childId === childAccountId)
    : transactionStore

  return transactions.map(cloneTransaction)
}

export function recordMockTransaction(input: MockTransactionInput) {
  const childIndex = childStore.findIndex((child) => child.id === input.childAccountId)

  if (childIndex === -1) {
    throw new Error("Ce compte enfant n'appartient pas a votre famille.")
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Le montant doit etre superieur a zero.')
  }

  if (input.description.trim().length === 0) {
    throw new Error('La description est obligatoire.')
  }

  const child = childStore[childIndex]
  const signedAmount = input.transactionType === 'credit' || input.transactionType === 'adjustment'
    ? input.amount
    : -input.amount
  const balanceAfter = child.balance + signedAmount

  if (balanceAfter < 0) {
    throw new Error('Solde insuffisant pour effectuer ce retrait.')
  }

  const updatedChild = { ...child, balance: balanceAfter, weeklyDelta: child.weeklyDelta + signedAmount }
  childStore = childStore.map((item, index) => (index === childIndex ? updatedChild : item))

  const transaction: KidTransaction = {
    id: `mock-tx-${Date.now()}-${transactionStore.length + 1}`,
    childId: input.childAccountId,
    amount: signedAmount,
    type: input.transactionType,
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
    createdBy: 'Mode mock',
    balanceAfter,
  }

  transactionStore = [transaction, ...transactionStore]

  return cloneTransaction(transaction)
}

export function listMockRewards() {
  return rewardStore.map((reward) => ({
    ...reward,
    pendingClaims: computePendingClaims(reward.id),
  }))
}

export function saveMockReward(reward: Reward) {
  const rewardToSave = {
    ...reward,
    pendingClaims: computePendingClaims(reward.id),
  }
  const exists = rewardStore.some((item) => item.id === reward.id)
  rewardStore = exists
    ? rewardStore.map((item) => (item.id === reward.id ? rewardToSave : item))
    : [rewardToSave, ...rewardStore]

  return cloneReward(rewardToSave)
}

export function listMockRewardClaims(childAccountId?: string) {
  const claims = childAccountId
    ? rewardClaimStore.filter((claim) => claim.childId === childAccountId)
    : rewardClaimStore

  return claims.map(cloneRewardClaim)
}

export function requestMockReward(input: { rewardId: string; childAccountId: string }) {
  const reward = rewardStore.find((item) => item.id === input.rewardId)
  const child = childStore.find((item) => item.id === input.childAccountId)

  if (!reward || !reward.isActive) {
    throw new Error("Cette recompense n'est pas disponible.")
  }

  if (!child) {
    throw new Error("Ce compte enfant n'appartient pas a votre famille.")
  }

  if (child.balance < reward.cost) {
    throw new Error('Solde insuffisant pour demander cette recompense.')
  }

  const claim: RewardClaim = {
    id: `mock-claim-${Date.now()}-${rewardClaimStore.length + 1}`,
    rewardId: input.rewardId,
    childId: input.childAccountId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }

  rewardClaimStore = [claim, ...rewardClaimStore]

  return cloneRewardClaim(claim)
}

export function reviewMockRewardClaim(input: {
  claimId: string
  status: Exclude<RewardClaimStatus, 'pending'>
  comment?: string
}) {
  const claim = rewardClaimStore.find((item) => item.id === input.claimId)

  if (!claim) {
    throw new Error('Demande de recompense introuvable.')
  }

  const updatedClaim: RewardClaim = {
    ...claim,
    status: input.status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'Mode mock',
    comment: input.comment,
  }

  rewardClaimStore = rewardClaimStore.map((item) => (item.id === input.claimId ? updatedClaim : item))

  return cloneRewardClaim(updatedClaim)
}
