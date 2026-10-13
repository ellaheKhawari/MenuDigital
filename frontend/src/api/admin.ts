import { http } from './http'
import type { Admin, AdminCategory, AdminItem, AdminSettings } from '../types/admin'
type Sess={admin:Admin;csrfToken:string}
export const adminApi={
  login:(b:{email:string;password:string})=>http<Sess>('POST','/auth/login',b),
  logout:()=>http('POST','/auth/logout'),
  me:()=>http<Sess>('GET','/auth/me'),
  changePassword:(b:{currentPassword:string;newPassword:string})=>http('PATCH','/admin/password',b),
  categories:()=>http<AdminCategory[]>('GET','/admin/categories'),
  createCategory:(b:{title:string;isActive?:boolean})=>http<AdminCategory>('POST','/admin/categories',b),
  updateCategory:(id:number,b:Partial<Pick<AdminCategory,'title'|'isActive'>>)=>http<AdminCategory>('PATCH',`/admin/categories/${id}`,b),
  deleteCategory:(id:number)=>http('DELETE',`/admin/categories/${id}`),
  reorderCategories:(ids:number[])=>http('PUT','/admin/categories/reorder',{ids}),
  items:()=>http<AdminItem[]>('GET','/admin/items'),
  item:(id:number)=>http<AdminItem>('GET',`/admin/items/${id}`),
  createItem:(b:Omit<AdminItem,'id'>)=>http<AdminItem>('POST','/admin/items',b),
  updateItem:(id:number,b:Partial<Omit<AdminItem,'id'>>)=>http<AdminItem>('PATCH',`/admin/items/${id}`,b),
  setAvailability:(id:number,isAvailable:boolean)=>http<AdminItem>('PATCH',`/admin/items/${id}/availability`,{isAvailable}),
  deleteItem:(id:number)=>http('DELETE',`/admin/items/${id}`),
  reorderItems:(categoryId:number,ids:number[])=>http('PUT','/admin/items/reorder',{categoryId,ids}),
  upload:(file:Blob,type:'item'|'logo')=>{const f=new FormData();f.append('file',file,'upload.webp');f.append('type',type);return http<{image:string}>('POST','/admin/upload',f)},
  settings:()=>http<AdminSettings>('GET','/admin/settings'),
  updateSettings:(b:Partial<AdminSettings>)=>http<AdminSettings>('PATCH','/admin/settings',b),
}
