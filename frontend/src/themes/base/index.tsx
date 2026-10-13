import './tokens.css'
import { formatPrice } from '../../lib/format'
import type { Theme } from '../../types/theme'
const base:Theme={config:{name:'base'},slots:{
  CafeHeader:({settings})=><header className="py-5"><h1 className="text-2xl font-black" style={{color:'var(--primary)'}}>{settings.name}</h1><p className="text-sm" style={{color:'var(--muted)'}}>{settings.workingHours}</p></header>,
  CategoryNav:({categories,activeId,onSelect})=><nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto py-2" style={{background:'var(--bg)'}}>{categories.map(c=><button key={c.id} onClick={()=>onSelect(c.id)} aria-pressed={c.id===activeId} className="min-h-11 shrink-0 rounded-full px-4 font-bold" style={c.id===activeId?{background:'var(--primary)',color:'var(--primary-fg)'}:{background:'var(--surface)'}}>{c.title}</button>)}</nav>,
  CategorySection:({category,children})=><section id={`cat-${category.id}`} data-category-id={category.id} className="mt-6 scroll-mt-16"><h2 className="mb-2 text-xl font-black">{category.title}</h2>{children}</section>,
  ItemCard:({item})=><article className={`flex justify-between gap-3 border-b py-3 ${item.isAvailable?'':'opacity-50'}`} style={{borderColor:'var(--border)'}}><div><h3 className="font-bold">{item.title}{!item.isAvailable&&<small> (ناموجود)</small>}</h3><p className="line-clamp-2 text-sm" style={{color:'var(--muted)'}}>{item.description}</p></div><b className="whitespace-nowrap">{formatPrice(item.price)}</b></article>,
  SearchBar:({value,onChange})=><input type="search" value={value} onChange={e=>onChange(e.target.value)} placeholder="جستجو در منو" aria-label="جستجو در منو" className="h-12 w-full rounded-full px-5" style={{background:'var(--surface)'}}/>,
  MenuFooter:({settings})=><footer className="mt-10 border-t py-4 text-sm" style={{borderColor:'var(--border)',color:'var(--muted)'}}>{settings.phone&&<a href={`tel:${settings.phone}`}>{settings.phone}</a>} {settings.address}</footer>,
  StaleBanner:({onRetry})=><div role="status" className="my-3 rounded-xl p-3 text-sm" style={{background:'var(--surface)'}}>دریافت قیمت‌های جدید ناموفق بود؛ ممکن است قیمت‌ها به‌روز نباشند. <button onClick={onRetry} className="min-h-11 font-bold underline">تلاش دوباره</button></div>,
}}
export default base
