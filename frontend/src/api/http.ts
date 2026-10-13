import { toast } from 'sonner'
import { useAuth } from '../store/authStore'
export class ApiError extends Error{
  constructor(public status:number,message:string,public errors?:Record<string,string>,public retryAfter?:number){super(message)}
}
export const errMsg=(e:unknown)=>e instanceof ApiError?e.message:'ارتباط با سرور برقرار نشد'
const BASE=import.meta.env.VITE_API_BASE ?? '/api'
const OVERRIDE=import.meta.env.VITE_USE_METHOD_OVERRIDE==='true'
const MOCK=import.meta.env.DEV && import.meta.env.VITE_MOCK_MENU==='true'
export async function http<T=void>(method:string,path:string,body?:unknown):Promise<T>{
  if(MOCK){ const {mockHttp}=await import('./mockAdmin'); return (await mockHttp(method,path,body)) as T }
  const headers:Record<string,string>={Accept:'application/json'}
  let m=method
  const csrf=useAuth.getState().csrf
  if(method!=='GET'&&csrf) headers['X-CSRF-Token']=csrf
  if(OVERRIDE&&['PUT','PATCH','DELETE'].includes(method)){headers['X-HTTP-Method-Override']=method;m='POST'}
  let b:BodyInit|undefined
  if(body instanceof FormData) b=body
  else if(body!==undefined){headers['Content-Type']='application/json';b=JSON.stringify(body)}
  const r=await fetch(BASE+path,{method:m,headers,body:b,credentials:'same-origin',cache:'no-store'})
  if(r.status===204) return undefined as T
  const j=await r.json().catch(()=>null)
  if(!r.ok){
    if(r.status===401&&path!=='/auth/login'){ if(useAuth.getState().admin) toast.error('نشست شما منقضی شد'); useAuth.getState().clear() }
    throw new ApiError(r.status,j?.message??'خطای ناشناخته',j?.errors,Number(r.headers.get('Retry-After'))||undefined)
  }
  return j.data as T
}
