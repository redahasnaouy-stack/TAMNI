export const whatsappNumber = '212617571113';
export const instagram = 'https://www.instagram.com/tamni_streetwear/';
export function orderUrl({product,size,color,quantity=1,notes='',fileName='',price,customer}) {
 const text=`Salam TAMNI ! Je souhaite ${fileName ? 'personnaliser' : 'commander'} :${customer?`\n\nClient : ${customer.name}\nTéléphone : ${customer.phone}\nVille : ${customer.city}\n`:''}\nProduit : ${product}\nTaille souhaitée : ${size}\nCouleur souhaitée : ${color}\nQuantité : ${quantity}${price?`\nPrix unitaire : ${price} DH\nSous-total : ${price*quantity} DH (hors livraison et broderie)`:""}${notes ? `\nDétails : ${notes}` : ''}${fileName ? `\nMon fichier : ${fileName}\nJe vais joindre mon design à cette conversation.` : ''}\nMerci de me confirmer le prix et la disponibilité.`;
 return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
