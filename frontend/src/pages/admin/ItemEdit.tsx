import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { ApiError, errMsg } from '../../api/http'
import ImageUploader from '../../components/admin/ImageUploader'
import { Spinner } from '../../components/ui'
import { btnGhost, btnPrimary, card, input } from '../../components/ui/styles'
import { useCategories } from '../../hooks/useAdminData'
import { toFileName } from '../../lib/image'
import { itemSchema, parsePrice, type ItemForm } from '../../schemas'
export default function ItemEdit(){
  const {id}=useParams(); const nav=useNavigate(), qc=useQueryClient(), cats=useCategories()
  const editing=!!id
  const item=useQuery({queryKey:['item',id],queryFn:()=>adminApi.item(Number(id)),enabled:editing})
  const {register,handleSubmit,reset,watch,setError,formState:{errors,isDirty,isSubmitting}}=useForm<ItemForm>({resolver:zodResolver(itemSchema),defaultValues:{categoryId:'',title:'',description:'',price:'',isAvailable:true,isFeatured:false}})
  const [image,setImage]=useState<string|null>(null), [imgDirty,setImgDirty]=useState(false)
  useEffect(()=>{ if(item.data){const i=item.data;reset({categoryId:String(i.categoryId),title:i.title,description:i.description??'',price:String(i.price),isAvailable:i.isAvailable,isFeatured:i.isFeatured});setImage(toFileName(i.image))} },[item.data,reset])
  useEffect(()=>{ const h=(e:BeforeUnloadEvent)=>{if(isDirty||imgDirty)e.preventDefault()}; addEventListener('beforeunload',h); return()=>removeEventListener('beforeunload',h) },[isDirty,imgDirty])
  if((editing&&item.isLoading)||cats.isLoading) return <Spinner/>
  const submit=handleSubmit(async v=>{
    const body={categoryId:Number(v.categoryId),title:v.title.trim().replace(/\s+/g,' '),description:v.description.trim()||null,price:parsePrice(v.price),image,isAvailable:v.isAvailable,isFeatured:v.isFeatured}
    try{ editing?await adminApi.updateItem(Number(id),body):await adminApi.createItem(body)
      qc.invalidateQueries({queryKey:['items']});qc.invalidateQueries({queryKey:['categories']});qc.removeQueries({queryKey:['item',id]})
      reset(v);setImgDirty(false);toast.success('ذخیره شد');nav('/admin/items')
    }catch(e){ if(e instanceof ApiError&&e.errors) Object.entries(e.errors).forEach(([k,m])=>setError(k as keyof ItemForm,{message:m})); toast.error(errMsg(e)) }})
  const len=watch('description')?.length??0
  return <form onSubmit={submit} noValidate className={`${card} space-y-4`}><h1 className="text-2xl font-black">{editing?'ویرایش آیتم':'آیتم جدید'}</h1>
    <label className="block"><span className="mb-1 block font-bold">دسته</span><select className={input} {...register('categoryId')}><option value="">انتخاب کن</option>{cats.data?.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><small className="text-red-700">{errors.categoryId?.message}</small></label>
    <label className="block"><span className="mb-1 block font-bold">نام</span><input className={input} {...register('title')}/><small className="text-red-700">{errors.title?.message}</small></label>
    <label className="block"><span className="mb-1 block font-bold">توضیحات</span><textarea rows={3} className="w-full rounded-xl border border-stone-300 p-3" {...register('description')}/><small className="text-stone-600">{new Intl.NumberFormat('fa-IR').format(len)} / ۵۰۰</small> <small className="text-red-700">{errors.description?.message}</small></label>
    <label className="block"><span className="mb-1 block font-bold">قیمت (تومان)</span><input inputMode="numeric" className={input} {...register('price')}/><small className="text-red-700">{errors.price?.message}</small></label>
    <div><span className="mb-1 block font-bold">عکس</span><ImageUploader type="item" value={image} onChange={v=>{setImage(v);setImgDirty(true)}}/></div>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" {...register('isAvailable')}/>موجود است</label>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" {...register('isFeatured')}/>پیشنهاد ویژه</label>
    <div className="flex gap-2"><button className={btnPrimary} disabled={isSubmitting}>{isSubmitting?'در حال ذخیره…':'ذخیره'}</button><button type="button" className={btnGhost} onClick={()=>nav('/admin/items')}>انصراف</button></div></form>
}
