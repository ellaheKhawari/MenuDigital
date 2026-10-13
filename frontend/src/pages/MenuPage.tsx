import { useEffect, useMemo, useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useActiveCategory } from '../hooks/useActiveCategory'
import { useTheme } from '../hooks/useTheme'
import { brandVars } from '../lib/theme'
import { normalizeFa } from '../lib/persian'
import { cafeConfig } from '../config/cafe.config'
export default function MenuPage(){
  const {data,status,stale,retry}=useMenu()
  const {name,slots:S}=useTheme()
  const [q,setQ]=useState(''), [dq,setDq]=useState('')
  useEffect(()=>{const t=setTimeout(()=>setDq(q),150);return()=>clearTimeout(t)},[q])
  const cats=useMemo(()=>{
    if(!data) return []
    const n=normalizeFa(dq); if(!n) return data.categories
    const items=data.categories.flatMap(c=>c.items).filter(i=>normalizeFa(i.title+' '+(i.description??'')).includes(n))
    return items.length?[{id:-1,title:'نتایج جستجو',items}]:[]
  },[data,dq])
  const active=useActiveCategory([cats])
  useEffect(()=>{ if(data) document.querySelector('meta[name=theme-color]')?.setAttribute('content',data.settings.themeColor) },[data])
  const go=(id:number)=>document.getElementById(`cat-${id}`)?.scrollIntoView({behavior:'smooth'})
  return <div data-theme={name} style={data?brandVars(data.settings.themeColor):undefined}><div className="mx-auto max-w-[520px] px-5 pb-12">
    {status==='loading'&&<div className="py-24 text-center" role="status" aria-busy="true">در حال بارگذاری منو…</div>}
    {status==='error'&&<div className="py-24 text-center"><p>دریافت منو ناموفق بود.</p><button onClick={retry} className="mt-3 min-h-11 font-bold underline">تلاش دوباره</button></div>}
    {data&&<>
      <S.CafeHeader settings={{...data.settings,name:data.settings.name||cafeConfig.fallbackName}}/>
      <S.CategoryNav categories={data.categories} activeId={active} onSelect={go}/>
      <S.SearchBar value={q} onChange={setQ}/>
      {stale&&<S.StaleBanner onRetry={retry}/>}
      <main>{cats.length?cats.map(c=><S.CategorySection key={c.id} category={c}>{c.items.map(i=><S.ItemCard key={i.id} item={i}/>)}</S.CategorySection>):<p className="py-12 text-center">موردی یافت نشد.</p>}</main>
      <S.MenuFooter settings={data.settings}/>
    </>}
  </div></div>
}
