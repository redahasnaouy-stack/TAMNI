const endpoint='/.netlify/functions/tamni-api';
export async function managementApi(resource,{token,method='GET',data,id,signal}={}){
 const url=`${endpoint}?resource=${encodeURIComponent(resource)}${id?`&id=${encodeURIComponent(id)}`:''}`;
 const response=await fetch(url,{method,signal:signal||AbortSignal.timeout(12000),cache:'no-store',headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
 let result;try{result=await response.json()}catch{throw new Error('التخزين الخاص مازال ما تفعّلش. خاص نشر Netlify Functions.')}
 if(!response.ok)throw new Error(result.error||`تعذر تحميل البيانات (${response.status}).`);return result;
}
export async function recordCheckout(cart,customer,requestId){return managementApi('orders',{method:'POST',data:{requestId,customer,items:cart.map(x=>({id:x.product.id,size:x.size,color:x.color,quantity:x.quantity,embroidery:x.embroidery,text:x.text}))}})}
export function trackVisit(){try{let id=sessionStorage.getItem('tamni-visit-session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('tamni-visit-session',id)}const device=innerWidth<700?'mobile':innerWidth<1100?'tablet':'desktop';fetch(`${endpoint}?resource=visits`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:id,device}),keepalive:true}).catch(()=>{})}catch{}}
