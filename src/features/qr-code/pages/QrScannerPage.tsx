import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CameraswitchRoundedIcon from '@mui/icons-material/CameraswitchRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import { Alert, Box, Button, Card, CardContent, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { ChildCard } from '../../../components/common/ChildCard'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { KidCoinActionDialog, type KidCoinActionPayload, type KidCoinOperation } from '../../../components/common/KidCoinActionDialog'
import { PageHeader } from '../../../components/common/PageHeader'
import { useChildren } from '../../children/hooks/useChildren'
import { findChildByQrToken } from '../../children/services/childrenService'
import { getMainGoalForChild } from '../../../mocks/savingsGoals'
import type { ChildAccount } from '../../../types/child'
import { formatKidCoins } from '../../../utils/formatters'
import { toFrenchErrorMessage } from '../../../utils/errors'
import { useCreateChildTransaction } from '../../transactions/hooks/useTransactions'

type SnackbarState = {
  message: string
  severity: 'success' | 'info' | 'error'
}

export function QrScannerPage() {
  const childrenQuery = useChildren()
  const createTransaction = useCreateChildTransaction()
  const children = childrenQuery.data ?? []
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'ready' | 'error'>('idle')
  const [manualToken, setManualToken] = useState('')
  const [detectedChild, setDetectedChild] = useState<ChildAccount | null>(null)
  const [operation, setOperation] = useState<KidCoinOperation | null>(null)
  const [pendingDebit, setPendingDebit] = useState<KidCoinActionPayload | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  async function detectToken(token: string) {
    try {
      const child = await findChildByQrToken(token)
      setDetectedChild(child ?? null)
      setSnackbar({
        message: child ? `${child.firstName} detecte.` : 'Token QR invalide pour cette famille.',
        severity: child ? 'success' : 'info',
      })
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Impossible de lire ce QR code.'), severity: 'error' })
    }
  }

  async function applyAction(payload: KidCoinActionPayload) {
    const signedAmount = payload.operation === 'credit' ? payload.amount : -payload.amount

    if (payload.child.balance + signedAmount < 0) {
      setSnackbar({ message: 'Solde insuffisant pour effectuer ce retrait.', severity: 'error' })
      setPendingDebit(null)
      setOperation(null)
      return
    }

    try {
      const transaction = await createTransaction.mutateAsync({
        childAccountId: payload.child.id,
        amount: payload.amount,
        transactionType: payload.operation,
        description: payload.description,
      })

      setDetectedChild((current) => current && current.id === payload.child.id ? { ...current, balance: transaction.balanceAfter } : current)
      setSnackbar({
        message: `${payload.operation === 'credit' ? 'Ajout' : 'Retrait'} de ${formatKidCoins(payload.amount)} pour ${payload.child.firstName}.`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({ message: toFrenchErrorMessage(error, 'Operation KidCoins impossible.'), severity: 'error' })
    } finally {
      setPendingDebit(null)
      setOperation(null)
    }
  }

  function handleAction(payload: KidCoinActionPayload) {
    if (payload.operation === 'debit') {
      setPendingDebit(payload)
      setOperation(null)
      return
    }

    void applyAction(payload)
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Scanner"
        title="Scanner un QR code"
        description="Interface mockee: le scan verifie un token local et ne retourne que les enfants de la famille."
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5 }}>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  minHeight: 280,
                  borderRadius: 4,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'common.white',
                  background: 'linear-gradient(135deg, #1F2937 0%, #4169E1 100%)',
                }}
              >
                <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', px: 3 }}>
                  <QrCodeScannerRoundedIcon sx={{ fontSize: 56 }} />
                  <Typography variant="h2" color="inherit">
                    Zone camera mockee
                  </Typography>
                  <Typography sx={{ opacity: 0.8 }}>
                    {cameraStatus === 'ready'
                      ? 'Pret a scanner un QR code KidBank.'
                      : cameraStatus === 'error'
                        ? 'Camera indisponible, utilisez la saisie manuelle.'
                      : "Demandez l'autorisation camera pour commencer."}
                  </Typography>
                </Stack>
              </Box>
              {cameraStatus === 'error' ? <Alert severity="warning">Camera indisponible en mode demonstration.</Alert> : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button variant="contained" startIcon={<CameraswitchRoundedIcon />} onClick={() => setCameraStatus('ready')}>
                  Autoriser la camera
                </Button>
                <Button
                  variant="outlined"
                  disabled={children.length === 0}
                  onClick={() => {
                    if (children[0]) {
                      void detectToken(`kidbank://child/${children[0].qrToken}`)
                    }
                  }}
                >
                  Simuler Lucas
                </Button>
                <Button variant="outlined" color="warning" onClick={() => setCameraStatus('error')}>
                  Camera indisponible
                </Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <TextField
                  label="Token manuel"
                  value={manualToken}
                  onChange={(event) => setManualToken(event.target.value)}
                  placeholder="kidbank://child/..."
                  fullWidth
                />
                <Button variant="outlined" onClick={() => void detectToken(manualToken)}>
                  Verifier
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Typography variant="h2">Enfant detecte</Typography>
          {detectedChild ? (
            <ChildCard
              child={detectedChild}
              goal={getMainGoalForChild(detectedChild.id, detectedChild.mainGoalId)}
              onAdd={() => setOperation('credit')}
              onWithdraw={() => setOperation('debit')}
            />
          ) : (
            <EmptyState title="Aucun enfant detecte" description="Scannez un QR code ou saisissez un token manuel." />
          )}
          {detectedChild ? (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOperation('credit')} fullWidth>
                Ajouter
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<RemoveRoundedIcon />} onClick={() => setOperation('debit')} fullWidth>
                Retirer
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      <KidCoinActionDialog
        open={operation !== null}
        operation={operation ?? 'credit'}
        childOptions={detectedChild ? [detectedChild] : children}
        selectedChild={detectedChild ?? undefined}
        onClose={() => setOperation(null)}
        onSubmit={handleAction}
      />
      <ConfirmDialog
        open={pendingDebit !== null}
        title="Confirmer le retrait"
        description={pendingDebit ? `Retirer ${formatKidCoins(pendingDebit.amount)} du compte de ${pendingDebit.child.firstName} ?` : ''}
        confirmLabel="Retirer"
        confirmColor="warning"
        onCancel={() => setPendingDebit(null)}
        onConfirm={() => {
          if (pendingDebit) {
            void applyAction(pendingDebit)
          }
        }}
      />
      <Snackbar open={snackbar !== null} autoHideDuration={2600} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.severity ?? 'info'} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
