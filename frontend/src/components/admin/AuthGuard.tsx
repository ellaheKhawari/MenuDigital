import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../store/authStore'
import { Spinner } from '../ui'
export default function AuthGuard(){
  const {admin,set}=useAuth(); const [ready,setReady]=useState(!!admin); const asked=useRef(false)
  useEffect(()=>{ if(admin||asked.current) return; asked.current=true
    adminApi.me().then(r=>set(r.admin,r.csrfToken)).catch(()=>{}).finally(()=>setReady(true)) },[admin,set])
  if(!ready) return <Spinner/>
  return admin?<Outlet/>:<Navigate to="/admin/login" replace/>
}
