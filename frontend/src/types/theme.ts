import type { ComponentType, ReactNode } from 'react'
import type { Category, MenuItem, Settings } from './menu'
export interface ThemeConfig { name:string }
export interface Slots {
  CafeHeader: ComponentType<{ settings:Settings }>
  CategoryNav: ComponentType<{ categories:Category[]; activeId:number|null; onSelect:(id:number)=>void }>
  // قرارداد: باید <section id={`cat-${id}`} data-category-id={id}> رندر کند
  CategorySection: ComponentType<{ category:Category; children:ReactNode }>
  ItemCard: ComponentType<{ item:MenuItem }>
  SearchBar: ComponentType<{ value:string; onChange:(v:string)=>void }>
  MenuFooter: ComponentType<{ settings:Settings }>
  StaleBanner: ComponentType<{ onRetry:()=>void }>
}
export interface Theme { config:ThemeConfig; slots:Partial<Slots> }
