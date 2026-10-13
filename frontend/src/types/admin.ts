export interface Admin { id:number; email:string }
export interface AdminCategory { id:number; title:string; isActive:boolean; itemCount:number }
export interface AdminItem { id:number; categoryId:number; title:string; description:string|null; price:number; image:string|null; isAvailable:boolean; isFeatured:boolean }
export interface AdminSettings { name:string; phone:string|null; address:string|null; instagram:string|null; workingHours:string|null; logo:string|null; themeColor:string }
