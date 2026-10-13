import type { MenuResponse } from '../types/menu'
const BASE=import.meta.env.VITE_API_BASE ?? '/api'
export async function getMenu():Promise<MenuResponse>{
  if(import.meta.env.DEV && import.meta.env.VITE_MOCK_MENU==='true'){
    return (await import('../mocks/menu.sample.json')).default as MenuResponse
  }
  const r=await fetch(`${BASE}/public/menu`,{cache:'no-store'})
  if(!r.ok) throw new Error('HTTP '+r.status)
  return r.json()
}
