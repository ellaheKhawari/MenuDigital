import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { ApiError, errMsg } from '../../api/http'
import { loginSchema } from '../../schemas'
import { useAuth } from '../../store/authStore'
import { btnPrimary, card, input } from '../../components/ui/styles'
import type { z } from 'zod'
export default function Login(){
  const {admin,set}=useAuth(); const nav=useNavigate()
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<z.infer<typeof loginSchema>>({resolver:zodResolver(loginSchema)})
  const [show,setShow]=useState(false), [err,setErr]=useState(''), [wait,setWait]=useState(0)
  useEffect(()=>{ if(wait<=0) return; const t=setTimeout(()=>setWait(wait-1),1000); return()=>clearTimeout(t) },[wait])
  if(admin) return <Navigate to="/admin" replace/>
  const submit=handleSubmit(async v=>{ setErr('')
    try{const r=await adminApi.login(v);set(r.admin,r.csrfToken);nav('/admin')}
    catch(e){ if(e instanceof ApiError&&e.status===429){setWait(e.retryAfter??60);setErr('تلاش‌های ناموفق زیاد بود.')} else setErr(errMsg(e)) }})
  return <main dir="rtl" className="grid min-h-screen place-items-center bg-stone-100 p-4"><form onSubmit={submit} className={`${card} w-full max-w-sm space-y-4`} noValidate>
    <h1 className="text-2xl font-black">ورود به پنل مدیریت</h1>
    <label className="block"><span className="mb-1 block font-bold">ایمیل</span><input type="email" autoComplete="username" className={input} {...register('email')}/><small className="text-red-700">{errors.email?.message}</small></label>
    <label className="block"><span className="mb-1 block font-bold">رمز عبور</span><div className="flex gap-2"><input type={show?'text':'password'} autoComplete="current-password" className={input} {...register('password')}/>
      <button type="button" onClick={()=>setShow(!show)} className="min-h-11 shrink-0 px-2 font-bold text-teal-800">{show?'مخفی':'نمایش'}</button></div><small className="text-red-700">{errors.password?.message}</small></label>
    {err&&<p role="alert" className="font-bold text-red-700">{err}{wait>0&&` ${new Intl.NumberFormat('fa-IR').format(wait)} ثانیه صبر کن.`}</p>}
    <button className={`${btnPrimary} w-full`} disabled={isSubmitting||wait>0}>{isSubmitting?'در حال ورود…':'ورود'}</button></form></main>
}
