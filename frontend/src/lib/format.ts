export const formatPrice=(n:number)=>new Intl.NumberFormat('fa-IR').format(n)+' تومان'
export const toLatinDigits=(s:string)=>s.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
