import { describe, expect, it } from 'vitest'
import { loginSchema } from './validations'

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'sophie@kidbank.local',
      password: 'demo',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email and an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'sophie',
      password: '',
    })

    expect(result.success).toBe(false)
  })
})
