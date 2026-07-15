const translatedErrorPatterns: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Identifiants incorrects. Verifiez votre email et votre mot de passe.'],
  [/email not confirmed/i, "Votre email n'est pas encore confirme."],
  [/authentication required/i, 'Connexion requise pour continuer.'],
  [/jwt.*expired|invalid jwt|refresh token/i, 'Votre session a expire. Reconnectez-vous.'],
  [/only active parents can create child transactions/i, 'Seul un parent actif peut ajouter ou retirer des euros.'],
  [/only active parents can scan qr codes/i, 'Seul un parent actif peut scanner un QR code enfant.'],
  [/amount must be greater than zero/i, 'Le montant doit etre superieur a zero.'],
  [/description is required/i, 'La description est obligatoire.'],
  [/invalid transaction type/i, 'Type de transaction invalide.'],
  [/insufficient child balance/i, 'Solde insuffisant pour effectuer ce retrait.'],
  [/child account not found for this family/i, "Ce compte enfant n'appartient pas a votre famille."],
  [/balances must be changed through create_child_transaction/i, 'Le solde ne peut etre modifie que par une transaction securisee.'],
  [/transactions are immutable/i, 'Les transactions ne peuvent pas etre modifiees.'],
  [/profile security fields cannot be changed/i, "Le role et la famille ne peuvent pas etre modifies depuis l'interface."],
  [/row-level security|violates row-level security/i, "Action non autorisee pour votre compte KidBank."],
  [/duplicate key/i, 'Cette donnee existe deja.'],
  [/network|failed to fetch/i, 'Connexion a Supabase impossible. Verifiez votre reseau.'],
]

function rawMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : ''
  }

  return typeof error === 'string' ? error : ''
}

export function toFrenchErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  const message = rawMessage(error).trim()

  for (const [pattern, translation] of translatedErrorPatterns) {
    if (pattern.test(message)) {
      return translation
    }
  }

  if (message.length === 0) {
    return fallback
  }

  if (/supabase|postgres|postgrest|database|fetch|auth/i.test(message)) {
    return fallback
  }

  return message
}

export function throwFrenchError(error: unknown, fallback?: string): never {
  throw new Error(toFrenchErrorMessage(error, fallback))
}
