import './tokens.css'
import BeanIcon from '../../components/ui/BeanIcon'
import { formatPrice } from '../../lib/format'
import type { Theme } from '../../types/theme'
const dotted={borderColor:'var(--border)',borderStyle:'dotted'} as const
const tag='mr-2 rounded-full px-2.5 text-xs font-bold align-middle'
const ferea:Theme={config:{name:'ferea'},slots:{
  CafeHeader:({settings})=><header className="flex items-center justify-between border-b-[1.5px] py-4" style={dotted}><div className="flex items-center gap-2 text-xl font-black tracking-wide" style={{color:'var(--primary)'}}><BeanIcon/>{settings.name}</div><span className="text-sm" style={{color:'var(--muted)'}}>{settings.workingHours}</span></header>,
  CategoryNav:({categories,activeId,onSelect})=><nav aria-label="دسته‌بندی منو" className="mt-5 p-5" style={{background:'var(--surface)',borderRadius:'var(--radius)'}}>
    <h2 className="mb-3 border-b-2 border-dashed pb-3 text-xl font-black" style={{color:'var(--primary)',borderColor:'var(--muted)'}}>دسته‌بندی</h2>
    <div className="flex flex-col gap-1">{categories.map(c=><button key={c.id} onClick={()=>onSelect(c.id)} aria-pressed={c.id===activeId} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-start font-bold" style={{color:'var(--primary)',background:c.id===activeId?'var(--bg)':'transparent'}}><BeanIcon className="h-5 w-5"/>{c.title}</button>)}</div></nav>,
  CategorySection:({category,children})=><section id={`cat-${category.id}`} data-category-id={category.id} className="mt-10 scroll-mt-4"><h2 className="text-3xl font-black leading-tight" style={{color:'var(--primary)'}}>{category.title}</h2>{children}</section>,
  ItemCard:({item})=><article className={`border-b-[1.5px] pb-4 pt-5 ${item.isAvailable?'':'opacity-50'}`} style={dotted}>
    <div className="grid h-48 place-items-center overflow-hidden" style={{background:'var(--primary-soft)',color:'var(--surface)',borderRadius:'var(--radius)'}}>
      {item.thumb?<img src={item.thumb} width={400} height={300} loading="lazy" decoding="async" alt="" className="h-full w-full object-cover"/>:<BeanIcon className="h-16 w-16"/>}</div>
    <h3 className="mt-4 text-2xl font-black" style={{color:'var(--primary)'}}>{item.title}
      {item.isFeatured&&<span className={tag} style={{background:'var(--surface)',color:'var(--text)'}}>پیشنهاد ویژه</span>}
      {!item.isAvailable&&<span className={tag} style={{background:'var(--surface)',color:'var(--text)'}}>ناموجود</span>}</h3>
    {item.description&&<p className="mb-3 line-clamp-2 text-sm" style={{color:'var(--muted)'}}>{item.description}</p>}
    <b style={{color:'var(--primary)'}}>{formatPrice(item.price)}</b></article>,
  SearchBar:({value,onChange})=><input type="search" inputMode="search" value={value} onChange={e=>onChange(e.target.value)} placeholder="جستجو در منو" aria-label="جستجو در منو" className="mt-4 h-12 w-full rounded-full border-[1.5px] px-5 font-semibold" style={{background:'var(--primary-soft)',borderColor:'var(--surface)'}}/>,
}}
export default ferea
