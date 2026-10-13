import { useEffect, useRef, type ReactNode } from 'react'
import { btnDanger, btnGhost } from './styles'
export const Spinner=()=><div role="status" aria-label="در حال بارگذاری" className="mx-auto my-16 h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-teal-700"/>
export const Skeleton=({n=4}:{n?:number})=><div aria-busy="true" className="space-y-3">{Array.from({length:n},(_,i)=><div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-200"/>)}</div>
export const EmptyState=({text,children}:{text:string;children?:ReactNode})=><div className="py-12 text-center text-stone-600"><p className="mb-3">{text}</p>{children}</div>
export function Switch({checked,onChange,label}:{checked:boolean;onChange:(v:boolean)=>void;label:string}){
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={()=>onChange(!checked)} className="relative h-11 w-14 shrink-0">
    <span className={`absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-full transition-colors ${checked?'bg-teal-700':'bg-stone-400'}`}/>
    <span className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all ${checked?'right-1.5':'right-7'}`}/></button>
}
export function ConfirmDialog({open,title,message,confirmText='حذف',onConfirm,onCancel}:{open:boolean;title:string;message:string;confirmText?:string;onConfirm:()=>void;onCancel:()=>void}){
  const r=useRef<HTMLDialogElement>(null)
  useEffect(()=>{const d=r.current;if(!d)return;if(open&&!d.open)d.showModal();if(!open&&d.open)d.close()},[open])
  return <dialog ref={r} onCancel={onCancel} className="m-auto w-[90%] max-w-sm rounded-2xl p-5 backdrop:bg-black/50" dir="rtl">
    <h2 className="mb-2 text-lg font-black">{title}</h2><p className="mb-5 text-stone-700">{message}</p>
    <div className="flex gap-2"><button className={btnDanger} onClick={onConfirm}>{confirmText}</button><button className={btnGhost} onClick={onCancel}>انصراف</button></div></dialog>
}
