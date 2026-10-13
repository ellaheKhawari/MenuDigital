import { useEffect, useState } from 'react'
export function useActiveCategory(deps:unknown[]){
  const [id,setId]=useState<number|null>(null)
  useEffect(()=>{
    const els=document.querySelectorAll<HTMLElement>('[data-category-id]')
    const io=new IntersectionObserver(es=>{for(const e of es) if(e.isIntersecting) setId(Number((e.target as HTMLElement).dataset.categoryId))},{rootMargin:'-40% 0px -55% 0px'})
    els.forEach(e=>io.observe(e)); return()=>io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps)
  return id
}
