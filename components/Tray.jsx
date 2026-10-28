import {familyImage} from '@/lib/image-categories';
/** Bandeja original: cuatro huecos, vaso arriba izquierda, primer plato arriba derecha,
 * segundo plato abajo izquierda, postre abajo derecha y cubiertos diagonales.
 * Las imágenes son orientativas. Nunca se infieren ingredientes ni alérgenos a partir de ellas.
 */
export default function Tray({meal,red,onSelect,menuType}){
 if(!meal)return null;
 const item=(dish,slot)=>familyImage(dish,slot,menuType);
 const first=item(meal.first,'first');
 const second=item(meal.second,'second');
 const side=item(meal.side,'side');
 const dessert=item(meal.dessert,'dessert');
 return <div className="tray-stage">
  <div className="mi-bandeja-photo" style={{aspectRatio:'533/298'}} role="group" aria-label={`Bandeja ilustrativa: ${meal.first.name}, ${meal.second.name}`}>
   <img src={red?'/assets/bandeja-roja.png':'/assets/bandeja-azul.png'} className="photo-tray-base" alt="" aria-hidden="true" />
   <button className="photo-tray-hit tray-water-target" type="button" onClick={()=>onSelect({name:'Agua',allergens:[]},'Bebida')} aria-label="Vaso de agua"><img src="/assets/vaso.png" alt=""/></button>
   <button className="photo-tray-hit tray-first-target" type="button" onClick={()=>onSelect(meal.first,'Primer plato')} aria-label={`Primer plato: ${meal.first.name}`}>{first?<img src={first} alt=""/>:<span>1º</span>}</button>
   <button className="photo-tray-hit tray-second-target" type="button" onClick={()=>onSelect(meal.second,'Segundo plato')} aria-label={`Segundo plato: ${meal.second.name}`}>{second?<img src={second} alt=""/>:<span>2º</span>}</button>
   {side&&<img className="photo-tray-side" src={side} alt="" aria-hidden="true"/>}
   <button className="photo-tray-hit tray-dessert-target" type="button" onClick={()=>onSelect(meal.dessert,'Postre')} aria-label={`Postre: ${meal.dessert?.name||'No especificado'}`}>{dessert?<img src={dessert} alt=""/>:<span>Postre</span>}</button>
   <img className="photo-tray-bread" src="/assets/pan.png" alt="" aria-hidden="true" />
   <img className="photo-tray-cutlery" src="/assets/cubiertos.png" alt="" aria-hidden="true" />
  </div>
  <p className="tray-hint">Toca cada compartimento para consultar su plato y alérgenos</p>
 </div>;
}
