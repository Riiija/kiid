import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CameraswitchRoundedIcon from '@mui/icons-material/CameraswitchRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded'
import { Alert, Box, Button, Card, CardContent, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { Html5Qrcode, type CameraDevice, type Html5QrcodeCameraScanConfig } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import { ChildCard } from '../../../components/common/ChildCard'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { KidCoinActionDialog, type KidCoinActionPayload, type KidCoinOperation } from '../../../components/common/KidCoinActionDialog'
import { PageHeader } from '../../../components/common/PageHeader'
import { getMainGoalForChild } from '../../../mocks/savingsGoals'
import type { ChildAccount } from '../../../types/child'
import { formatKidCoins } from '../../../utils/formatters'
import { toFrenchErrorMessage } from '../../../utils/errors'
import { useChildren } from '../../children/hooks/useChildren'
import { findChildByQrToken } from '../../children/services/childrenService'
import { useCreateChildTransaction } from '../../transactions/hooks/useTransactions'

type SnackbarState = {
  message: string
  severity: 'success' | 'info' | 'error'
}

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'scanning' | 'error'

const scannerElementId = 'kidbank-parent-qr-scanner'

const cameraScanConfig: Html5QrcodeCameraScanConfig = {
  fps: 10,
  qrbox: { width: 240, height: 240 },
  aspectRatio: 1,
  disableFlip: false,
}

function getPreferredCamera(cameras: CameraDevice[]): CameraDevice | null {
  return cameras.find((camera) => /back|rear|environment|arriere/i.test(camera.label)) ?? cameras[0] ?? null
}

function toCameraErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (!message || message === 'undefined') {
    return "Impossible d'ouvrir la camera. Verifiez les autorisations du navigateur."
  }

  if (/notallowed|permission|denied/i.test(message)) {
    return 'Autorisation camera refusee. Autorisez la camera dans le navigateur puis relancez le scan.'
  }

  if (/notfound|no camera|requested device not found|devices not found/i.test(message)) {
    return 'Aucune camera detectee sur cet appareil.'
  }

  if (/notreadable|trackstarterror|could not start|in use/i.test(message)) {
    return 'La camera est deja utilisee par une autre application.'
  }

  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Le scan camera exige HTTPS, sauf en local sur localhost.'
  }

  return "Impossible d'ouvrir la camera. Utilisez la saisie manuelle si le probleme persiste."
}

function getCameraStatusLabel(status: CameraStatus) {
  switch (status) {
    case 'requesting':
      return 'Autorisation camera en cours...'
    case 'ready':
      return 'Camera prete. Relancez le scan quand vous voulez.'
    case 'scanning':
      return 'Placez le QR code enfant dans le cadre.'
    case 'error':
      return 'Camera indisponible. La saisie manuelle reste disponible.'
    case 'idle':
    default:
      return 'Appuyez sur Demarrer le scan pour autoriser la camera.'
  }
}

export function QrScannerPage() {
  const childrenQuery = useChildren()
  const createTransaction = useCreateChildTransaction()
  const children = childrenQuery.data ?? []
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanLockRef = useRef(false)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [detectedChild, setDetectedChild] = useState<ChildAccount | null>(null)
  const [operation, setOperation] = useState<KidCoinOperation | null>(null)
  const [pendingDebit, setPendingDebit] = useState<KidCoinActionPayload | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current

      if (scanner?.isScanning) {
        void scanner.stop().finally(() => {
          scanner.clear()
          scannerRef.current = null
        })
      } else {
        scanner?.clear()
        scannerRef.current = null
      }
    }
  }, [])

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

  async function stopScanner(nextStatus?: CameraStatus) {
    const scanner = scannerRef.current

    try {
      if (scanner?.isScanning) {
        await scanner.stop()
      }
      scanner?.clear()
    } catch (error) {
      setCameraError(toCameraErrorMessage(error))
    } finally {
      scannerRef.current = null

      if (nextStatus) {
        setCameraStatus(nextStatus)
      }
    }
  }

  async function startScanner(cameraIdOverride?: string) {
    setCameraStatus('requesting')
    setCameraError(null)
    scanLockRef.current = false

    try {
      await stopScanner()
      const availableCameras = cameras.length > 0 ? cameras : await Html5Qrcode.getCameras()

      if (availableCameras.length === 0) {
        throw new Error('No camera found')
      }

      setCameras(availableCameras)

      const requestedCamera = cameraIdOverride
        ? availableCameras.find((camera) => camera.id === cameraIdOverride)
        : availableCameras.find((camera) => camera.id === selectedCameraId)
      const camera = requestedCamera ?? getPreferredCamera(availableCameras)

      if (!camera) {
        throw new Error('No camera found')
      }

      setSelectedCameraId(camera.id)

      const scanner = new Html5Qrcode(scannerElementId)
      scannerRef.current = scanner

      await scanner.start(
        camera.id,
        cameraScanConfig,
        (decodedText) => {
          void handleScanResult(decodedText)
        },
        () => undefined,
      )
      setCameraStatus('scanning')
    } catch (error) {
      await stopScanner()
      setCameraStatus('error')
      setCameraError(toCameraErrorMessage(error))
    }
  }

  async function handleScanResult(decodedText: string) {
    if (scanLockRef.current) {
      return
    }

    scanLockRef.current = true

    try {
      await stopScanner('ready')
      await detectToken(decodedText)
    } finally {
      scanLockRef.current = false
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
        description="Ouvrez la camera, scannez le QR code d'un enfant, puis ajoutez ou retirez des KidCoins."
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5 }}>
        <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 300, sm: 360 },
                  borderRadius: 4,
                  color: 'common.white',
                  background: 'linear-gradient(135deg, #1F2937 0%, #4169E1 100%)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  id={scannerElementId}
                  sx={{
                    minHeight: { xs: 300, sm: 360 },
                    '& video': {
                      minHeight: { xs: 300, sm: 360 },
                      objectFit: 'cover',
                      width: '100% !important',
                    },
                    '& canvas': {
                      display: 'none',
                    },
                  }}
                />
                {cameraStatus !== 'scanning' ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      px: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Stack spacing={1} sx={{ alignItems: 'center' }}>
                      <QrCodeScannerRoundedIcon sx={{ fontSize: 56 }} />
                      <Typography variant="h2" color="inherit">
                        Scanner camera
                      </Typography>
                      <Typography sx={{ maxWidth: 420, opacity: 0.84 }}>{getCameraStatusLabel(cameraStatus)}</Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 16,
                      bottom: 16,
                      left: 16,
                      borderRadius: 3,
                      bgcolor: 'rgba(17, 24, 39, 0.72)',
                      px: 2,
                      py: 1.25,
                    }}
                  >
                    <Typography color="inherit" sx={{ fontWeight: 700 }}>
                      {getCameraStatusLabel(cameraStatus)}
                    </Typography>
                  </Box>
                )}
              </Box>
              {cameraError ? <Alert severity="warning">{cameraError}</Alert> : null}
              {cameras.length > 0 ? (
                <TextField
                  select
                  label="Camera"
                  value={selectedCameraId}
                  onChange={(event) => setSelectedCameraId(event.target.value)}
                  disabled={cameraStatus === 'requesting' || cameraStatus === 'scanning'}
                  fullWidth
                >
                  {cameras.map((camera) => (
                    <MenuItem key={camera.id} value={camera.id}>
                      {camera.label || 'Camera disponible'}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button
                  variant="contained"
                  startIcon={<CameraswitchRoundedIcon />}
                  disabled={cameraStatus === 'requesting' || cameraStatus === 'scanning'}
                  onClick={() => {
                    void startScanner()
                  }}
                >
                  {cameraStatus === 'requesting' ? 'Ouverture...' : 'Demarrer le scan'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<StopCircleRoundedIcon />}
                  disabled={cameraStatus !== 'scanning'}
                  onClick={() => {
                    void stopScanner('ready')
                  }}
                >
                  Arreter
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
                <Button variant="outlined" disabled={manualToken.trim().length === 0} onClick={() => void detectToken(manualToken.trim())}>
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
