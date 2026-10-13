import { z } from 'zod'
import { toLatinDigits } from '../lib/format'
export const loginSchema=z.object({email:z.string().trim().email('ایمیل معتبر نیست').max(190),password:z.string().min(1,'رمز را وارد کن')})
export const categorySchema=z.object({title:z.string().trim().min(1,'عنوان لازم است').max(100,'حداکثر ۱۰۰ کاراکتر')})
const priceOk=(v:string)=>{const n=Number(toLatinDigits(v).replace(/[,٬\s]/g,''));return Number.isInteger(n)&&n>=1&&n<=99999999}
export const itemSchema=z.object({
  categoryId:z.string().min(1,'دسته را انتخاب کن'),
  title:z.string().trim().min(1,'نام لازم است').max(120,'حداکثر ۱۲۰ کاراکتر'),
  description:z.string().max(500,'حداکثر ۵۰۰ کاراکتر'),
  price:z.string().refine(priceOk,'قیمت باید عدد صحیح بین ۱ تا ۹۹٬۹۹۹٬۹۹۹ باشد'),
  isAvailable:z.boolean(),isFeatured:z.boolean()})
export type ItemForm=z.infer<typeof itemSchema>
export const parsePrice=(v:string)=>Number(toLatinDigits(v).replace(/[,٬\s]/g,''))
export const settingsSchema=z.object({
  name:z.string().trim().min(1,'نام لازم است').max(100),
  phone:z.string().regex(/^([0-9+\-\s()]{5,20})?$/,'شماره معتبر نیست'),
  address:z.string().max(255),
  instagram:z.string().transform(v=>v.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/^@/,'').replace(/[/?].*$/,'')).pipe(z.string().regex(/^([A-Za-z0-9._]{1,30})?$/,'فقط نام کاربری اینستاگرام')),
  workingHours:z.string().max(255),
  themeColor:z.string().regex(/^#[0-9a-fA-F]{6}$/,'رنگ معتبر نیست')})
export type SettingsForm=z.input<typeof settingsSchema>
export const passwordSchema=z.object({currentPassword:z.string().min(1,'رمز فعلی را وارد کن'),newPassword:z.string().min(10,'حداقل ۱۰ کاراکتر')})
  .refine(v=>v.newPassword!==v.currentPassword,{message:'رمز جدید باید با رمز فعلی فرق کند',path:['newPassword']})
