// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChildAccount } from '../../../types/child'
import { findChildByQrToken } from '../../children/services/childrenService'
import { QrScannerPage } from './QrScannerPage'

type ScannerSuccessCallback = (decodedText: string) => void
type ScannerErrorCallback = () => undefined
type ScannerStart = (
  cameraId: string,
  config: unknown,
  successCallback: ScannerSuccessCallback,
  errorCallback: ScannerErrorCallback,
) => Promise<null>

const html5QrcodeMocks = vi.hoisted(() => ({
  clear: vi.fn<() => void>(),
  getCameras: vi.fn<() => Promise<Array<{ id: string; label: string }>>>(),
  start: vi.fn<ScannerStart>(),
  stop: vi.fn<() => Promise<void>>(),
}))

const hookMocks = vi.hoisted(() => ({
  useChildren: vi.fn<() => { data: ChildAccount[]; isLoading: boolean }>(),
  useCreateChildTransaction: vi.fn<() => { mutateAsync: () => Promise<{ balanceAfter: number }> }>(),
}))

vi.mock('html5-qrcode', () => {
  class Html5Qrcode {
    isScanning = false

    constructor(readonly elementId: string) {}

    async start(
      cameraId: string,
      config: unknown,
      successCallback: ScannerSuccessCallback,
      errorCallback: ScannerErrorCallback,
    ) {
      this.isScanning = true
      return html5QrcodeMocks.start(cameraId, config, successCallback, errorCallback)
    }

    async stop() {
      this.isScanning = false
      return html5QrcodeMocks.stop()
    }

    clear() {
      html5QrcodeMocks.clear()
    }

    static getCameras() {
      return html5QrcodeMocks.getCameras()
    }
  }

  return { Html5Qrcode }
})

vi.mock('../../children/hooks/useChildren', () => ({
  useChildren: hookMocks.useChildren,
}))

vi.mock('../../transactions/hooks/useTransactions', () => ({
  useCreateChildTransaction: hookMocks.useCreateChildTransaction,
}))

vi.mock('../../children/services/childrenService', () => ({
  findChildByQrToken: vi.fn(),
}))

const child: ChildAccount = {
  id: 'child-lucas',
  profileId: 'profile-lucas',
  familyId: 'family-demo',
  firstName: 'Lucas',
  fullName: 'Lucas Martin',
  avatarInitials: 'LM',
  avatarColor: '#6D5DFB',
  balance: 120,
  weeklyDelta: 12,
  qrToken: 'qr-lucas',
  isActive: true,
  canEditAvatar: true,
  mainGoalId: '',
}

describe('QrScannerPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    html5QrcodeMocks.getCameras.mockResolvedValue([{ id: 'camera-back', label: 'Back camera' }])
    html5QrcodeMocks.start.mockResolvedValue(null)
    html5QrcodeMocks.stop.mockResolvedValue()
    hookMocks.useChildren.mockReturnValue({ data: [child], isLoading: false })
    hookMocks.useCreateChildTransaction.mockReturnValue({
      mutateAsync: vi.fn<() => Promise<{ balanceAfter: number }>>().mockResolvedValue({ balanceAfter: 130 }),
    })
    vi.mocked(findChildByQrToken).mockResolvedValue(child)
  })

  it('demarre le vrai scanner camera', async () => {
    render(<QrScannerPage />)

    expect(screen.queryByText('Zone camera mockee')).not.toBeInTheDocument()
    expect(screen.queryByText('Simuler Lucas')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /demarrer le scan/i }))

    await waitFor(() => expect(html5QrcodeMocks.getCameras).toHaveBeenCalled())
    await waitFor(() => expect(html5QrcodeMocks.start).toHaveBeenCalled())

    expect(html5QrcodeMocks.start.mock.calls[0]?.[0]).toBe('camera-back')
    expect(screen.getByText('Placez le QR code enfant dans le cadre.')).toBeInTheDocument()
  })

  it('arrete le scanner apres lecture du QR code', async () => {
    render(<QrScannerPage />)

    await userEvent.click(screen.getByRole('button', { name: /demarrer le scan/i }))
    await waitFor(() => expect(html5QrcodeMocks.start).toHaveBeenCalled())

    const successCallback = html5QrcodeMocks.start.mock.calls[0]?.[2]

    await act(async () => {
      successCallback?.('kidbank://child/qr-lucas')
    })

    await waitFor(() => expect(html5QrcodeMocks.stop).toHaveBeenCalled())
    await waitFor(() => expect(findChildByQrToken).toHaveBeenCalledWith('kidbank://child/qr-lucas'))
    expect(await screen.findByText('Lucas detecte.')).toBeInTheDocument()
  })
})
