import { create } from 'zustand'
import type { Admin } from '../types/admin'
// توکن CSRF و ادمین فقط در حافظه (نه localStorage)
interface S { admin:Admin|null; csrf:string|null; set:(a:Admin,c:string)=>void; clear:()=>void }
export const useAuth=create<S>(s=>({admin:null,csrf:null,set:(admin,csrf)=>s({admin,csrf}),clear:()=>s({admin:null,csrf:null})}))
