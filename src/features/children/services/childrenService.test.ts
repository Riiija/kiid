import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabase', () => ({
  supabase: null,
  requireSupabaseClient: () => {
    throw new Error("Supabase n'est pas configure.")
  },
}))

import { resetMockRuntimeStore } from '../../../mocks/mockRuntimeStore'
import { findChildByQrToken } from './childrenService'

describe('childrenService QR code', () => {
  beforeEach(() => {
    resetMockRuntimeStore()
  })

  it('lit un QR code enfant valide', async () => {
    const child = await findChildByQrToken('kidbank://child/6d2f2f34-aed4-4be1-97a7-5f4b2b8d3b90')

    expect(child?.firstName).toBe('Lucas')
  })

  it('retourne null pour un QR code inconnu', async () => {
    const child = await findChildByQrToken('kidbank://child/00000000-0000-4000-8000-000000000000')

    expect(child).toBeNull()
  })
})
