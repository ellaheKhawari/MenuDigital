import { toLatinDigits } from './format'
export const normalizeFa=(s:string)=>toLatinDigits(s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u064B-\u0652\u0640\u200c]/g,'')).replace(/\s+/g,' ').trim().toLowerCase()
