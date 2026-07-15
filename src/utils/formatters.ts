export function formatKidCoins(amount: number, includeSign = false) {
  const formatter = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    signDisplay: includeSign ? 'always' : 'auto',
  })

  return `${formatter.format(amount)} €`
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getProgressPercent(currentAmount: number, targetAmount: number) {
  if (targetAmount <= 0) {
    return 0
  }

  return Math.min(100, Math.round((currentAmount / targetAmount) * 100))
}
