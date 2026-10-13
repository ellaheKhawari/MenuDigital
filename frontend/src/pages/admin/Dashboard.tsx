import { Link } from 'react-router-dom'
import { Skeleton } from '../../components/ui'
import { card, btnPrimary } from '../../components/ui/styles'
import { useCategories, useItems } from '../../hooks/useAdminData'
export default function Dashboard(){
  const c=useCategories(), i=useItems()
  if(c.isLoading||i.isLoading) return <Skeleton n={3}/>
  const n=new Intl.NumberFormat('fa-IR').format
  const stats=[['دسته‌ها',c.data?.length??0],['آیتم‌ها',i.data?.length??0],['ناموجود',i.data?.filter(x=>!x.isAvailable).length??0]]
  return <div className="space-y-4"><h1 className="text-2xl font-black">داشبورد</h1>
    <div className="grid grid-cols-3 gap-3">{stats.map(([t,v])=><div key={t} className={`${card} text-center`}><div className="text-3xl font-black text-teal-800">{n(Number(v))}</div><div className="text-sm">{t}</div></div>)}</div>
    <div className="flex gap-2"><Link to="/admin/items/new" className={`${btnPrimary} inline-flex items-center`}>آیتم جدید</Link></div></div>
}
