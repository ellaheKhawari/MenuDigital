import { describe, expect, it } from 'vitest'
import { brandVars } from './theme'
describe('brandVars', () => {
  it('رنگ تیره → متن سفید', () => expect(brandVars('#6e3416')['--primary-fg']).toBe('#fff'))
  it('رنگ روشن → متن سیاه', () => expect(brandVars('#ffe9a8')['--primary-fg']).toBe('#000'))
  it('رنگ نامعتبر → هیچ متغیری', () => expect(brandVars('red')).toEqual({}))
  it('primary-soft روشن‌تر از primary', () => expect(brandVars('#6e3416')['--primary-soft']).toMatch(/^#[0-9a-f]{6}$/))
})
