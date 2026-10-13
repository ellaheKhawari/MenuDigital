import { themes } from '../themes/registry'
import type { Slots, Theme } from '../types/theme'
export function useTheme():{name:string;slots:Slots}{
  const name=(import.meta.env.VITE_THEME as string)||'base'
  const active:Theme=themes[name]??themes.base
  return {name:active.config.name,slots:{...themes.base.slots,...active.slots} as Slots}
}
