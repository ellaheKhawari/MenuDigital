// محاسبه‌ی --primary و مشتقاتش در JS (بدون color-mix برای اندروید قدیمی)
const lum=(h:string)=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
const mix=(h:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*(1-t)+255*t).toString(16).padStart(2,'0')).join('')
export function brandVars(hex:string){
  if(!/^#[0-9a-f]{6}$/i.test(hex)) return {}
  const L=lum(hex), onBlack=(L+.05)/.05, onWhite=1.05/(L+.05)
  return {'--primary':hex,'--primary-fg':onBlack>onWhite?'#000':'#fff','--primary-soft':mix(hex,.88)} as Record<string,string>
}
