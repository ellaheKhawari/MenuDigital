import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { errMsg } from '../../api/http'
import PriceInlineEdit from '../../components/admin/PriceInlineEdit'
import { ConfirmDialog, EmptyState, Skeleton, Switch } from '../../components/ui'
import { btnGhost, btnPrimary, card, input } from '../../components/ui/styles'
import { move, useCategories, useItems, usePatchItem, useReorderItems } from '../../hooks/useAdminData'
import { normalizeFa } from '../../lib/persian'
import type { AdminItem } from '../../types/admin'
export default function Items(){
  const qc=useQueryClient(), cats=useCategories(), items=useItems(), patch=usePatchItem(), reorder=useReorderItems()
  const [q,setQ]=useState(''), [off,setOff]=useState(false), [del,setDel]=useState<AdminItem|null>(null)
  const remove=useMutation({mutationFn:(id:number)=>adminApi.deleteItem(id),onSuccess:()=>{setDel(null);qc.invalidateQueries({queryKey:['items']});qc.invalidateQueries({queryKey:['categories']});toast.success('آیتم حذف شد')},onError:e=>toast.error(errMsg(e))})
  if(cats.isLoading||items.isLoading) return <Skeleton/>
  if(cats.isError||items.isError) return <EmptyState text="دریافت اطلاعات ناموفق بود."><button className={btnGhost} onClick={()=>{cats.refetch();items.refetch()}}>تلاش دوباره</button></EmptyState>
  if(!cats.data?.length) return <EmptyState text="اول یک دسته بساز."><Link to="/admin/categories" className={`${btnPrimary} inline-flex items-center`}>اولین دسته را بساز</Link></EmptyState>
  const n=normalizeFa(q)
  return <div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-2xl font-black">آیتم‌ها</h1><Link to="/admin/items/new" className={`${btnPrimary} inline-flex items-center`}>آیتم جدید</Link></div>
    <div className="flex gap-2"><input type="search" className={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو" aria-label="جستجو در آیتم‌ها"/>
      <button aria-pressed={off} className={off?btnPrimary:btnGhost} onClick={()=>setOff(!off)}>ناموجودها</button></div>
    {cats.data.map(c=>{ const all=(items.data??[]).filter(i=>i.categoryId===c.id), ids=all.map(i=>i.id)
      const list=all.filter(i=>(!n||normalizeFa(i.title).includes(n))&&(!off||!i.isAvailable)); if((n||off)&&!list.length) return null
      return <details key={c.id} open className={card}><summary className="min-h-11 cursor-pointer text-lg font-black">{c.title}{!c.isActive&&<small className="mr-2 font-normal text-stone-500">(غیرفعال)</small>}</summary>
        {!list.length&&<p className="py-3 text-stone-600">آیتمی نیست.</p>}
        <ul className="divide-y">{list.map(i=><li key={i.id} className="flex flex-wrap items-center gap-2 py-2">
          <div className="flex flex-col"><button aria-label="بالا" className="min-h-6 px-2" onClick={()=>reorder.mutate({categoryId:c.id,ids:move(ids,i.id,-1)})}>▲</button><button aria-label="پایین" className="min-h-6 px-2" onClick={()=>reorder.mutate({categoryId:c.id,ids:move(ids,i.id,1)})}>▼</button></div>
          <Link to={`/admin/items/${i.id}`} className={`min-w-0 flex-1 font-bold ${i.isAvailable?'':'text-stone-500'}`}>{i.title}</Link>
          <PriceInlineEdit price={i.price} onSave={p=>patch.mutate({id:i.id,patch:{price:p}})}/>
          <Switch checked={i.isAvailable} label={`موجود بودن ${i.title}`} onChange={v=>patch.mutate({id:i.id,patch:{isAvailable:v}})}/>
          <button className="min-h-11 px-2 font-bold text-red-700" onClick={()=>setDel(i)}>حذف</button></li>)}</ul></details>})}
    <ConfirmDialog open={!!del} title="حذف آیتم" message={`«${del?.title??''}» حذف می‌شه.`} onConfirm={()=>del&&remove.mutate(del.id)} onCancel={()=>setDel(null)}/></div>
}
