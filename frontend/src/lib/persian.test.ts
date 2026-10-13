import { describe, expect, it } from 'vitest'
import { normalizeFa } from './persian'
describe('normalizeFa', () => {
  it('ي→ی و ك→ک', () => expect(normalizeFa('كاپوچينو')).toBe('کاپوچینو'))
  it('نیم‌فاصله و اعراب حذف می‌شود', () => expect(normalizeFa('توت‌ها')).toBe('توتها'))
  it('رقم فارسی و عربی یکی می‌شود', () => expect(normalizeFa('وی۶۰')).toBe(normalizeFa('وی٦٠')))
  it('فاصله‌های اضافه و حروف بزرگ', () => expect(normalizeFa('  V60   Pour ')).toBe('v60 pour'))
})
