import { describe, expect, it } from 'vitest'
import { formatPrice, toLatinDigits } from './format'
describe('format', () => {
  it('قیمت با رقم فارسی و «تومان»', () => {
    const s = formatPrice(1250000)
    expect(s).toContain('تومان')
    expect(s).toMatch(/[۰-۹]/)
    expect(s.replace(/[^۰-۹]/g, '')).toBe('۱۲۵۰۰۰۰')
  })
  it('تبدیل ارقام فارسی و عربی به لاتین', () => {
    expect(toLatinDigits('۱۲۳٤٥٦')).toBe('123456')
  })
})
