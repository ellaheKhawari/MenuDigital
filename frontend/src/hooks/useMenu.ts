import { useCallback, useEffect, useRef, useState } from 'react'
import { getMenu } from '../api/client'
import { cafeConfig } from '../config/cafe.config'
import type { MenuResponse } from '../types/menu'
export function useMenu(){
  const [data,setData]=useState<MenuResponse|null>(null)
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading')
  const [stale,setStale]=useState(false)
  const last=useRef(0), has=useRef(false)
  const load=useCallback(async()=>{
    try{const d=await getMenu();setData(d);has.current=true;last.current=Date.now();setStale(false);setStatus('ready')}
    catch{ if(has.current) setStale(true); else setStatus('error') }
  },[])
  useEffect(()=>{
    load()
    const vis=()=>{ if(document.visibilityState==='visible'&&Date.now()-last.current>cafeConfig.refreshAfterMs) load() }
    document.addEventListener('visibilitychange',vis); window.addEventListener('online',load)
    return()=>{document.removeEventListener('visibilitychange',vis);window.removeEventListener('online',load)}
  },[load])
  const retry=useCallback(()=>{ if(!has.current) setStatus('loading'); load() },[load])
  return {data,status,stale,retry}
}
