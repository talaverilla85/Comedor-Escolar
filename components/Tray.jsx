import {familyImage} from '@/lib/image-categories';

/**
 * One reusable tray, never a pre-rendered tray photograph per calendar day.
 * Liquid first courses use a well-shaped surface mask: no floating circular bowl.
 * Solid courses stay within the lower-left well and never cross the cutlery channel.
 * Food images are illustrative ONLY; alérgenos are always read from the PDF data.
 */
export default function Tray({meal,red,onSelect,menuType}) {
  if (!meal) return null;
  const image = (dish, slot) => familyImage(dish,slot,menuType);
  const first = image(meal.first,'first');
  const second = image(meal.second,'second');
  const dessert = image(meal.dessert,'dessert');
  const name = (meal.second?.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const bulk = /pasta|macarron|arroz|paella|pizza|tortilla|revuelto/.test(name);
  const sides = [];
  if (/ensalada|crudite/.test(name) || /ensalada|crudite/.test(meal.side?.name || '')) sides.push('/assets/ensalada.png');
  if (/papa|patata/.test(name) || /papa|patata/.test(meal.side?.name || '')) sides.push('/assets/papas.png');
  if (!sides.length && meal.side) {
    const src = image(meal.side,'side');
    if(src) sides.push(src);
  }
  const surface = first?.startsWith('/assets/') ?
    first.replace('/assets/','/assets-clean/surface-') : null;
  const select = (dish,label) => () => onSelect(dish,label);
  const alternate = (event,src) => {
    if(event.currentTarget.src.endsWith(src)) return;
    event.currentTarget.src = src;
  };

  return <div className="tray-stage">
    <div className="mi-bandeja-photo" style={{aspectRatio:'533/298'}} role="group"
      aria-label={('Bandeja orientativa: ' + meal.first.name + ', ' + meal.second.name)}>
      <img
        src={red?'/assets-clean/bandeja-roja.png':'/assets-clean/bandeja-azul.png'}
        onError={e=>alternate(e,red?'/assets/bandeja-roja.png':'/assets/bandeja-azul.png')}
        className="photo-tray-base" alt="" aria-hidden="true"/>

      <button className="photo-tray-hit tray-water-target" type="button"
        onClick={select({name:'Agua',allergens:[],isWater:true},'Bebida')}
        aria-label="Agua">
        <img src="/assets/vaso.png" alt=""/>
      </button>

      {surface ? <>
        <svg className="photo-tray-liquid" viewBox="0 0 533 298" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <clipPath id="tray-well-first">
              <path d="M 313 28 C 328 20 360 20 454 22 C 479 24 492 41 492 65 L 492 110 C 489 139 474 151 445 151 L 341 147 C 317 146 303 130 291 105 C 280 78 286 47 313 28 Z"/>
            </clipPath>
          </defs>
          <image href={surface} x="283" y="20" width="212" height="134"
            preserveAspectRatio="xMidYMid slice" clipPath="url(#tray-well-first)"/>
        </svg>
        <button className="photo-tray-hit tray-first-target tray-liquid-hit" type="button"
          onClick={select(meal.first,'Primer plato')}
          aria-label={('Primer plato: ' + meal.first.name)}/>
      </> :
      <button className="photo-tray-hit tray-first-target tray-first-solid" type="button"
        onClick={select(meal.first,'Primer plato')}
        aria-label={('Primer plato: ' + meal.first.name)}>
        {first ? <img src={first} alt=""/> : <span>1º</span>}
      </button>}

      <button className="photo-tray-hit tray-second-target" type="button"
        onClick={select(meal.second,'Segundo plato')}
        aria-label={('Segundo plato: ' + meal.second.name)}>
        {sides.map((src,index)=><img key={src+index} className={'tray-inside-side side-'+index}
          src={src} alt=""/>)}
        {second ? <img src={second} className={'tray-main-food ' + (bulk ? 'bulk':'protein')}
          alt=""/> : <span>2º</span>}
      </button>

      <button className="photo-tray-hit tray-dessert-target" type="button"
        onClick={select(meal.dessert,'Postre')}
        aria-label={('Postre: ' + (meal.dessert?.name||'No especificado'))}>
        {dessert ? <img src={dessert} alt=""/> : <span>Postre</span>}
      </button>
      <img className="photo-tray-bread" src="/assets-clean/pan.png"
        onError={e=>alternate(e,'/assets/pan.png')} alt="" aria-hidden="true"/>
      <img className="photo-tray-cutlery" src="/assets-clean/cubiertos.png"
        onError={e=>alternate(e,'/assets/cubiertos.png')} alt="" aria-hidden="true"/>
    </div>
    <p className="tray-hint">Toca un compartimento para consultar los alérgenos</p>
  </div>;
}
