import { useState } from 'react'
import { toast } from 'sonner'
import { formatPrice } from '../../lib/format'
import { itemSchema, parsePrice } from '../../schemas'
export default function PriceInlineEdit({price,onSave}:{price:number;onSave:(n:number)=>void}){
  const [edit,setEdit]=useState(false); const [v,setV]=useState('')
  const save=()=>{ setEdit(false); if(!v||parsePrice(v)===price) return
    const ok=itemSchema.shape.price.safeParse(v); if(!ok.success){toast.error(ok.error.issues[0].message);return}
    onSave(parsePrice(v)) }
  if(!edit) return <button className="min-h-11 font-black text-teal-800" onClick={()=>{setV(String(price));setEdit(true)}} aria-label="ویرایش قیمت">{formatPrice(price)}</button>
  return <input autoFocus inputMode="numeric" value={v} onChange={e=>setV(e.target.value)} onBlur={save}
    onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){setV('');setEdit(false)}}} aria-label="قیمت به تومان" className="h-11 w-32 rounded-xl border border-teal-700 px-2 text-center"/>
}
