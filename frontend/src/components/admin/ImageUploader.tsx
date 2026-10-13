import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { errMsg } from '../../api/http'
import { compressImage } from '../../lib/image'
import { btnGhost } from '../ui/styles'
export default function ImageUploader({value,onChange,type}:{value:string|null;onChange:(file:string|null)=>void;type:'item'|'logo'}){
  const ref=useRef<HTMLInputElement>(null); const [busy,setBusy]=useState(false); const [local,setLocal]=useState<string|null>(null)
  const pick=async(f?:File)=>{ if(!f) return
    if(!/^image\//.test(f.type)){toast.error('فقط فایل تصویر');return}
    setBusy(true)
    try{const blob=await compressImage(f,type==='item'); setLocal(URL.createObjectURL(blob)); const r=await adminApi.upload(blob,type); onChange(r.image)}
    catch(e){toast.error(errMsg(e))} finally{setBusy(false)} }
  const src=local??(value?`/uploads/${value}`:null)
  return <div className="flex items-center gap-3">
    <div className="grid h-24 w-32 place-items-center overflow-hidden rounded-xl bg-stone-200 text-sm text-stone-600">{src?<img src={src} alt="" className="h-full w-full object-cover"/>:'بدون عکس'}</div>
    <div className="flex flex-col gap-2"><input ref={ref} type="file" accept="image/*" hidden onChange={e=>pick(e.target.files?.[0])}/>
      <button type="button" disabled={busy} className={btnGhost} onClick={()=>ref.current?.click()}>{busy?'در حال آپلود…':value||local?'تغییر عکس':'انتخاب عکس'}</button>
      {(value||local)&&<button type="button" className="min-h-11 text-sm font-bold text-red-700" onClick={()=>{onChange(null);setLocal(null)}}>حذف عکس</button>}</div></div>
}
