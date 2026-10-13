// فقط dev (VITE_MOCK_MENU=true): بک‌اند ساختگی در حافظه. ایمیل و رمز دلخواه قبول می‌شود.
import menu from '../mocks/menu.sample.json'
import { ApiError } from './http'
import type { AdminCategory, AdminItem, AdminSettings } from '../types/admin'
let cats:AdminCategory[]=menu.categories.map(c=>({id:c.id,title:c.title,isActive:true,itemCount:0}))
let items:AdminItem[]=menu.categories.flatMap(c=>c.items.map(i=>({id:i.id,categoryId:c.id,title:i.title,description:i.description,price:i.price,image:null,isAvailable:i.isAvailable,isFeatured:i.isFeatured})))
let settings:AdminSettings={name:menu.settings.name,phone:menu.settings.phone,address:menu.settings.address,instagram:menu.settings.instagram,workingHours:menu.settings.workingHours,logo:null,themeColor:menu.settings.themeColor}
let nextId=100
const sess=()=>({admin:{id:1,email:'admin@example.com'},csrfToken:'mock'})
const order=<T extends {id:number}>(list:T[],ids:number[])=>ids.map(id=>list.find(x=>x.id===id)!).filter(Boolean)
export async function mockHttp(method:string,path:string,body:any):Promise<unknown>{
  await new Promise(r=>setTimeout(r,120))
  const [p]=path.split('?'); const seg=p.split('/'); const id=Number(seg[3])
  if(p==='/auth/login'){sessionStorage.setItem('mock-admin','1');return sess()}
  if(p==='/auth/logout'){sessionStorage.removeItem('mock-admin');return}
  if(p==='/auth/me'){ if(!sessionStorage.getItem('mock-admin')) throw new ApiError(401,'نشست معتبر نیست'); return sess() }
  if(p==='/admin/password') return
  if(p==='/admin/upload') return {image:'a'.repeat(24)+'.webp'}
  if(p==='/admin/settings'){ if(method==='PATCH') settings={...settings,...body}; return settings }
  if(p==='/admin/categories/reorder'){cats=order(cats,body.ids);return}
  if(p==='/admin/items/reorder'){items=[...items.filter(i=>i.categoryId!==body.categoryId),...order(items,body.ids)];return}
  if(seg[2]==='categories'){
    if(method==='GET') return cats.map(c=>({...c,itemCount:items.filter(i=>i.categoryId===c.id).length}))
    if(method==='POST'){const c={id:nextId++,title:body.title,isActive:body.isActive??true,itemCount:0};cats=[...cats,c];return c}
    if(method==='PATCH'){cats=cats.map(c=>c.id===id?{...c,...body}:c);return cats.find(c=>c.id===id)}
    if(method==='DELETE'){cats=cats.filter(c=>c.id!==id);items=items.filter(i=>i.categoryId!==id);return}
  }
  if(seg[2]==='items'){
    if(method==='GET') return id?items.find(i=>i.id===id):items
    if(method==='POST'){const i={...body,id:nextId++};items=[...items,i];return i}
    if(method==='PATCH'){items=items.map(i=>i.id===id?{...i,...body}:i);return items.find(i=>i.id===id)}
    if(method==='DELETE'){items=items.filter(i=>i.id!==id);return}
  }
  throw new ApiError(404,'مسیر پیدا نشد')
}
