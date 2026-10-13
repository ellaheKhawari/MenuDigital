// فرض: ساختار پاسخ GET /public/menu طبق بخش ۶ نقشه‌ی راه. اگر فرق دارد فقط همین فایل را اصلاح کن.
export interface MenuItem { id:number; title:string; description:string|null; price:number; image:string|null; thumb:string|null; isAvailable:boolean; isFeatured:boolean }
export interface Category { id:number; title:string; items:MenuItem[] }
export interface Settings { name:string; logo:string|null; phone:string|null; instagram:string|null; address:string|null; workingHours:string|null; themeColor:string }
export interface MenuResponse { generatedAt:string; settings:Settings; categories:Category[] }
