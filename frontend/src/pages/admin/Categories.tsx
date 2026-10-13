import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { errMsg } from '../../api/http'
import { ConfirmDialog, EmptyState, Skeleton, Switch } from '../../components/ui'
import { btnGhost, btnPrimary, card, input } from '../../components/ui/styles'
import { move, useCategories, usePatchCategory, useReorderCategories } from '../../hooks/useAdminData'
import { categorySchema } from '../../schemas'
import type { AdminCategory } from '../../types/admin'
export default function Categories(){
  const qc=useQueryClient(), {data,isLoading,isError,refetch}=useCategories(), patch=usePatchCategory(), reorder=useReorderCategories()
  const [title,setTitle]=useState(''), [del,setDel]=useState<AdminCategory|null>(null)
  const refresh=()=>{qc.invalidateQueries({queryKey:['categories']});qc.invalidateQueries({queryKey:['items']})}
  const add=useMutation({mutationFn:()=>adminApi.createCategory({title:title.trim().replace(/\s+/g,' ')}),onSuccess:()=>{setTitle('');refresh();toast.success('دسته ساخته شد')},onError:e=>toast.error(errMsg(e))})
  const remove=useMutation({mutationFn:(id:number)=>adminApi.deleteCategory(id),onSuccess:()=>{setDel(null);refresh();toast.success('دسته حذف شد')},onError:e=>toast.error(errMsg(e))})
  const submit=(e:React.FormEvent)=>{e.preventDefault();const r=categorySchema.safeParse({title});if(!r.success)toast.error(r.error.issues[0].message);else add.mutate()}
  const ids=data?.map(c=>c.id)??[]
  return <div className="space-y-4"><h1 className="text-2xl font-black">دسته‌ها</h1>
    <form onSubmit={submit} className="flex gap-2"><input className={input} value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان دسته‌ی جدید" aria-label="عنوان دسته‌ی جدید"/><button className={btnPrimary} disabled={add.isPending}>افزودن</button></form>
    {isLoading&&<Skeleton/>}
    {isError&&<EmptyState text="دریافت دسته‌ها ناموفق بود."><button className={btnGhost} onClick={()=>refetch()}>تلاش دوباره</button></EmptyState>}
    {data?.length===0&&<EmptyState text="هنوز دسته‌ای نساخته‌ای."/>}
    <ul className="space-y-2">{data?.map((c,i)=><li key={c.id} className={`${card} flex items-center gap-2`}>
      <div className="flex flex-col"><button aria-label="بالا" disabled={i===0} className="min-h-6 px-2 disabled:opacity-30" onClick={()=>reorder.mutate(move(ids,c.id,-1))}>▲</button><button aria-label="پایین" disabled={i===data.length-1} className="min-h-6 px-2 disabled:opacity-30" onClick={()=>reorder.mutate(move(ids,c.id,1))}>▼</button></div>
      <input key={c.title} defaultValue={c.title} aria-label="عنوان دسته" className="h-11 min-w-0 flex-1 rounded-xl bg-transparent px-2 font-bold focus:bg-stone-100"
        onBlur={e=>{const v=e.target.value.trim().replace(/\s+/g,' ');if(v===c.title)return;const r=categorySchema.safeParse({title:v});if(!r.success){toast.error(r.error.issues[0].message);e.target.value=c.title}else patch.mutate({id:c.id,patch:{title:v}})}}/>
      <span className="text-sm text-stone-600">{new Intl.NumberFormat('fa-IR').format(c.itemCount)} آیتم</span>
      <Switch checked={c.isActive} label={`فعال بودن ${c.title}`} onChange={v=>patch.mutate({id:c.id,patch:{isActive:v}})}/>
      <button className="min-h-11 px-2 font-bold text-red-700" onClick={()=>setDel(c)}>حذف</button></li>)}</ul>
    <ConfirmDialog open={!!del} title="حذف دسته" message={del?`این دسته و ${new Intl.NumberFormat('fa-IR').format(del.itemCount)} آیتم (و عکس‌هاشون) حذف می‌شن.`:''} onConfirm={()=>del&&remove.mutate(del.id)} onCancel={()=>setDel(null)}/></div>
}
