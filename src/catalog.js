export const products = [
 {id:'palestine-tee',name:'Palestine — Heritage',type:'tshirts',label:'T-shirt oversize',design:'palestine',color:'#202020',tag:'LA SÉLECTION TAMNI'},
 {id:'darwish',name:'Darwish — Poésie libre',type:'hoodies',label:'Hoodie oversize',design:'darwish',color:'#493125',tag:'COUP DE CŒUR'},
 {id:'angel',name:'Angel — After dark',type:'hoodies',label:'Hoodie oversize',design:'angel',color:'#222222',tag:''},
 {id:'palestine-hoodie',name:'Palestine — Heritage',type:'hoodies',label:'Hoodie oversize',design:'palestine',color:'#242424',tag:''},
 {id:'anime',name:'Anime — Silent power',type:'hoodies',label:'Hoodie oversize',design:'anime',color:'#202020',tag:'ANIME CULTURE'},
];
export const whatsappNumber = '212617571113';
export const instagram = 'https://www.instagram.com/tamni_streetwear/';
export function orderUrl({product,size,color,quantity=1,notes='',fileName=''}) {
 const text=`Salam TAMNI ! Je souhaite ${fileName ? 'personnaliser' : 'commander'} :\nProduit : ${product}\nTaille souhaitée : ${size}\nCouleur souhaitée : ${color}\nQuantité : ${quantity}${notes ? `\nDétails : ${notes}` : ''}${fileName ? `\nMon fichier : ${fileName}\nJe vais joindre mon design à cette conversation.` : ''}\nMerci de me confirmer le prix et la disponibilité.`;
 return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
