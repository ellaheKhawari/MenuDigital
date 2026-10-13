import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../api/admin'
import { errMsg } from '../api/http'
import type { AdminCategory, AdminItem } from '../types/admin'
export const useCategories=()=>useQuery({queryKey:['categories'],queryFn:adminApi.categories})
export const useItems=()=>useQuery({queryKey:['items'],queryFn:adminApi.items})
// به‌روزرسانی خوش‌بینانه با rollback و toast خطا
export function useOptimistic<V,T>(key:string,fn:(v:V)=>Promise<unknown>,apply:(old:T[],v:V)=>T[]){
  const qc=useQueryClient()
  return useMutation({mutationFn:fn,
    onMutate:async(v:V)=>{await qc.cancelQueries({queryKey:[key]});const prev=qc.getQueryData<T[]>([key]);qc.setQueryData<T[]>([key],o=>o?apply(o,v):o);return {prev}},
    onError:(e,_v,ctx)=>{qc.setQueryData([key],ctx?.prev);toast.error(errMsg(e))},
    onSettled:()=>{qc.invalidateQueries({queryKey:[key]})}})
}
export const usePatchItem=()=>useOptimistic<{id:number;patch:Partial<AdminItem>},AdminItem>('items',
  ({id,patch})=>'isAvailable' in patch&&Object.keys(patch).length===1?adminApi.setAvailability(id,!!patch.isAvailable):adminApi.updateItem(id,patch),
  (o,{id,patch})=>o.map(i=>i.id===id?{...i,...patch}:i))
export const usePatchCategory=()=>useOptimistic<{id:number;patch:Partial<AdminCategory>},AdminCategory>('categories',
  ({id,patch})=>adminApi.updateCategory(id,patch),(o,{id,patch})=>o.map(c=>c.id===id?{...c,...patch}:c))
export const useReorderCategories=()=>useOptimistic<number[],AdminCategory>('categories',ids=>adminApi.reorderCategories(ids),
  (o,ids)=>ids.map(id=>o.find(c=>c.id===id)!).filter(Boolean))
export const useReorderItems=()=>useOptimistic<{categoryId:number;ids:number[]},AdminItem>('items',({categoryId,ids})=>adminApi.reorderItems(categoryId,ids),
  (o,{categoryId,ids})=>[...o.filter(i=>i.categoryId!==categoryId),...ids.map(id=>o.find(i=>i.id===id)!).filter(Boolean)])
export const move=(ids:number[],id:number,d:-1|1)=>{const a=[...ids],i=a.indexOf(id),j=i+d;if(j<0||j>=a.length)return a;[a[i],a[j]]=[a[j],a[i]];return a}
