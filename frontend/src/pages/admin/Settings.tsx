import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { ApiError, errMsg } from '../../api/http'
import ImageUploader from '../../components/admin/ImageUploader'
import { Spinner } from '../../components/ui'
import { btnPrimary, card, input } from '../../components/ui/styles'
import { useTheme } from '../../hooks/useTheme'
import { toFileName } from '../../lib/image'
import { brandVars } from '../../lib/theme'
import { passwordSchema, settingsSchema, type SettingsForm } from '../../schemas'
export default function Settings(){
  const qc=useQueryClient(), {data}=useQuery({queryKey:['settings'],queryFn:adminApi.settings}), {name,slots:S}=useTheme()
  const f=useForm<SettingsForm>({resolver:zodResolver(settingsSchema)}), [logo,setLogo]=useState<string|null>(null)
  const p=useForm<{currentPassword:string;newPassword:string}>({resolver:zodResolver(passwordSchema)})
  useEffect(()=>{ if(data){f.reset({name:data.name,phone:data.phone??'',address:data.address??'',instagram:data.instagram??'',workingHours:data.workingHours??'',themeColor:data.themeColor});setLogo(toFileName(data.logo))} },[data,f])
  if(!data) return <Spinner/>
  const color=f.watch('themeColor')
  const save=f.handleSubmit(async raw=>{ const v=settingsSchema.parse(raw)
    try{await adminApi.updateSettings({...v,phone:v.phone||null,address:v.address||null,instagram:v.instagram||null,workingHours:v.workingHours||null,logo});qc.invalidateQueries({queryKey:['settings']});toast.success('تنظیمات ذخیره شد')}
    catch(e){ if(e instanceof ApiError&&e.errors) Object.entries(e.errors).forEach(([k,m])=>f.setError(k as keyof SettingsForm,{message:m})); toast.error(errMsg(e)) }})
  const pass=p.handleSubmit(async v=>{ try{await adminApi.changePassword(v);p.reset();toast.success('رمز تغییر کرد')}catch(e){toast.error(errMsg(e))} })
  const F=({k,label,dir}:{k:keyof SettingsForm;label:string;dir?:string})=><label className="block"><span className="mb-1 block font-bold">{label}</span><input dir={dir} className={input} {...f.register(k)}/><small className="text-red-700">{f.formState.errors[k]?.message as string}</small></label>
  return <div className="space-y-6"><h1 className="text-2xl font-black">تنظیمات</h1>
    <form onSubmit={save} noValidate className={`${card} space-y-4`}>
      <F k="name" label="نام کافه"/><F k="phone" label="تلفن" dir="ltr"/><F k="address" label="آدرس"/><F k="instagram" label="اینستاگرام (فقط نام کاربری)" dir="ltr"/><F k="workingHours" label="ساعت کاری"/>
      <div><span className="mb-1 block font-bold">لوگو</span><ImageUploader type="logo" value={logo} onChange={setLogo}/></div>
      <label className="block"><span className="mb-1 block font-bold">رنگ برند</span><input type="color" className="h-11 w-24" {...f.register('themeColor')}/></label>
      <div><span className="mb-1 block font-bold">پیش‌نمایش کارت</span><div data-theme={name} style={brandVars(color||data.themeColor)} className="rounded-2xl p-3"><S.ItemCard item={{id:0,title:'آیتم نمونه',description:'توضیح کوتاه آیتم',price:120000,image:null,thumb:null,isAvailable:true,isFeatured:true}}/></div></div>
      <button className={btnPrimary} disabled={f.formState.isSubmitting}>ذخیره‌ی تنظیمات</button></form>
    <form onSubmit={pass} noValidate className={`${card} space-y-4`}><h2 className="text-lg font-black">تغییر رمز</h2>
      <label className="block"><span className="mb-1 block font-bold">رمز فعلی</span><input type="password" autoComplete="current-password" className={input} {...p.register('currentPassword')}/><small className="text-red-700">{p.formState.errors.currentPassword?.message}</small></label>
      <label className="block"><span className="mb-1 block font-bold">رمز جدید (حداقل ۱۰ کاراکتر)</span><input type="password" autoComplete="new-password" className={input} {...p.register('newPassword')}/><small className="text-red-700">{p.formState.errors.newPassword?.message}</small></label>
      <button className={btnPrimary}>تغییر رمز</button></form></div>
}
