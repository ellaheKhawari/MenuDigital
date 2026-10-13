import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../store/authStore'
const tabs=[{to:'/admin/items',t:'آیتم‌ها'},{to:'/admin/categories',t:'دسته‌ها'},{to:'/admin/settings',t:'تنظیمات'}]
const link=({isActive}:{isActive:boolean})=>`flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 font-bold md:flex-none md:justify-start ${isActive?'bg-teal-700 text-white':'text-stone-800 hover:bg-stone-200'}`
export default function AdminLayout(){
  const nav=useNavigate(), qc=useQueryClient(), clear=useAuth(s=>s.clear)
  const [online,setOnline]=useState(navigator.onLine)
  useEffect(()=>{const a=()=>setOnline(true),b=()=>setOnline(false);addEventListener('online',a);addEventListener('offline',b);return()=>{removeEventListener('online',a);removeEventListener('offline',b)}},[])
  const out=async()=>{try{await adminApi.logout()}finally{clear();qc.clear();nav('/admin/login')}}
  return <div dir="rtl" className="min-h-screen bg-stone-100 text-stone-900 md:flex">
    <aside className="hidden w-60 shrink-0 flex-col gap-1 bg-white p-4 md:flex">
      <NavLink to="/admin" end className={link}>داشبورد</NavLink>{tabs.map(x=><NavLink key={x.to} to={x.to} className={link}>{x.t}</NavLink>)}
      <a href="/" target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-xl px-3 font-bold text-stone-800 hover:bg-stone-200">پیش‌نمایش منو</a>
      <button onClick={out} className="mt-auto min-h-11 rounded-xl px-3 text-start font-bold text-red-700 hover:bg-red-50">خروج</button></aside>
    <div className="flex-1 pb-24 md:pb-8">
      {!online&&<div role="alert" className="bg-amber-200 p-3 text-center font-bold">برای استفاده از پنل به اینترنت نیاز دارید</div>}
      <div className="mx-auto max-w-3xl p-4"><Outlet/></div></div>
    <nav aria-label="پنل مدیریت" className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      {tabs.map(x=><NavLink key={x.to} to={x.to} className={link}>{x.t}</NavLink>)}
      <a href="/" target="_blank" rel="noreferrer" className="flex min-h-11 flex-1 items-center justify-center rounded-xl font-bold text-stone-800">پیش‌نمایش</a></nav></div>
}
