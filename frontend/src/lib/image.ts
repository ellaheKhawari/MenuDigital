// فشرده‌سازی سمت مرورگر قبل از آپلود (WebP، حداکثر ۱۶۰۰px)
export async function compressImage(file:File,opaque:boolean,max=1600,q=0.82):Promise<Blob>{
  const bmp=await createImageBitmap(file); const s=Math.min(1,max/Math.max(bmp.width,bmp.height))
  const c=document.createElement('canvas'); c.width=Math.round(bmp.width*s); c.height=Math.round(bmp.height*s)
  const x=c.getContext('2d')!; if(opaque){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}
  x.drawImage(bmp,0,0,c.width,c.height)
  return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('compress')),'image/webp',q))
}
export const toFileName=(s:string|null)=>s?s.split('/').pop()??null:null
