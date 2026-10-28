/** Fotos orientativas reutilizables por categoría, nunca fuente de información de alérgenos. */
export function familyImage(dish,slot='first',menuType='basal'){
 const n=(dish?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(!n)return null;
 const src=(key)=>`/assets/${key}.png`;
 if(slot==='dessert')return /yogur/.test(n)?src('yogur'):src('fruta');
 if(slot==='bread')return src('pan');
 if(slot==='side')return /papa/.test(n)?src('papas'):src('ensalada');
 if(/crema|pure/.test(n))return src(/calabacin|brocoli|acelga|espinaca|verde/.test(n)?'crema-verde':'crema-naranja');
 if(/lenteja/.test(n))return src('lentejas');
 if(/garbanzo/.test(n) && /potaje|sopa|estofad/.test(n))return src('garbanzos');
 if(/judia|alubia/.test(n))return src('judias');
 if(/potaje|berros|estofado de verduras/.test(n))return src('potaje-verduras');
 if(/sopa/.test(n) && /pescado/.test(n))return src('sopa-pescado');
 if(/sopa/.test(n) && /pollo|fideos/.test(n))return src('sopa-pollo');
 if(/sopa|minestrone/.test(n))return src('sopa-vegetal');
 if(/caldo/.test(n))return src('caldo-arroz');
 if(/pasta|macarron|espiral/.test(n)){
   if(/nata|aurora|carbonara|calabacin/.test(n)){
     return menuType.includes('lacteo') ? null : src('pasta-cremosa');
   }
   return src('pasta-tomate');
 }
 if(/pizza/.test(n))return menuType.includes('lacteo')||/sin queso/.test(n)?null:src('pizza');
 if(/paella|arroz/.test(n))return src('arroz-paella');
 if(/tortilla/.test(n))return menuType.includes('huevo')||/harina de garbanzo/.test(n)?null:src('tortilla');
 if(/atun/.test(n))return src('atun');
 if(/merluza|dorado|pescado|filete de /.test(n))return src('pescado-blanco');
 if(/chopsuey|pavo/.test(n))return src('pavo');
 if(/pollo|muslo/.test(n))return src('pollo');
 if(/cerdo|lomo|bondiola|carne fiesta/.test(n))return src('cerdo');
 if(/ensalada|crudite|hortaliza|verdura/.test(n))return src('ensalada');
 if(/papa/.test(n))return src('papas');
 return null;
}
