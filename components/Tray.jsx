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

  const liquidFamilies = /\/(?:crema-naranja|crema-verde|lentejas|garbanzos|judias|potaje-verduras|sopa-vegetal|sopa-pollo|sopa-pescado|caldo-arroz)\.png$/;
  const firstPhoto = first && liquidFamilies.test(first) ? surface : first;
  const secondPhoto = second?.replace('/assets/','/assets-clean/');
  const firstWell = 'M 303 30 C 318 23 376 24 444 24 C 478 24 491 39 491 66 L 491 113 C 489 136 475 152 448 152 L 346 152 C 318 151 302 133 292 111 L 275 83 C 266 61 280 39 303 30 Z';
  const secondWell = 'M 59 131 C 82 122 159 125 185 125 C 215 124 237 141 249 159 L 278 203 C 290 223 275 244 254 252 C 228 263 161 266 99 267 C 64 267 42 247 42 218 L 42 161 C 42 144 48 134 59 131 Z';
  const foodSides = sides.map(src=>src.replace('/assets/','/assets-clean/'));
  return <div className="tray-stage">
    <div className="mi-bandeja-photo tray-photo-open" style={{aspectRatio:'533/298'}} role="group"
      aria-label={'Bandeja orientativa: '+meal.first.name+', '+meal.second.name}>
      <svg viewBox="0 0 533 298" preserveAspectRatio="none" className="tray-open-svg" aria-hidden="true">
        <defs>
          <path id="tray-first-open-shape" d={firstWell}/>
          <path id="tray-second-open-shape" d={secondWell}/>
          <clipPath id="tray-first-open-clip"><use href="#tray-first-open-shape"/></clipPath>
          <clipPath id="tray-second-open-clip"><use href="#tray-second-open-shape"/></clipPath>
          <mask id="tray-photo-holes" maskUnits="userSpaceOnUse" x="0" y="0" width="533" height="298">
            <rect width="533" height="298" fill="white"/>
            <use href="#tray-first-open-shape" fill="black"/>
            <use href="#tray-second-open-shape" fill="black"/>
          </mask>
          <linearGradient id="tray-food-depth" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={red?'#b96b6b':'#4985ba'}/>
            <stop offset=".25" stopColor={red?'#d08c8c':'#6aaee0'}/>
            <stop offset="1" stopColor={red?'#edc2c2':'#afd7ee'}/>
          </linearGradient>
        </defs>
        {/* Primer y segundo: las fotografías ocupan el hueco por DEBAJO de la bandeja. */}
        <use href="#tray-first-open-shape" fill="url(#tray-food-depth)"/>
        {firstPhoto
          ? <image href={firstPhoto} x="267" y="19" width="233" height="144"
              preserveAspectRatio="xMidYMid slice" clipPath="url(#tray-first-open-clip)"/>
          : <text x="376" y="99" fontSize="23" fontWeight="800" textAnchor="middle" fill="#eaf3fb">1º</text>}
        <use href="#tray-second-open-shape" fill="url(#tray-food-depth)"/>
        {secondPhoto
          ? <image href={secondPhoto} x={bulk?'42':'55'} y="127"
              width={bulk?'237':'185'} height={bulk?'145':'137'}
              preserveAspectRatio={bulk?'xMidYMid slice':'xMidYMid meet'}
              clipPath="url(#tray-second-open-clip)"/>
          : <text x="159" y="210" fontSize="23" fontWeight="800" textAnchor="middle" fill="#eaf3fb">2º</text>}
        {!bulk && foodSides.map((src,i)=><image key={src+i} href={src}
          x={i===0?159:202} y={i===0?157:193}
          width={i===0?123:78} height={i===0?103:69}
          preserveAspectRatio="xMidYMid meet" clipPath="url(#tray-second-open-clip)"/>)}
        {/* Fotografía auténtica de la bandeja por encima, con los dos huecos perforados. */}
        <image href={red?'/assets-clean/bandeja-roja.png':'/assets-clean/bandeja-azul.png'}
          width="533" height="298" preserveAspectRatio="none" mask="url(#tray-photo-holes)"/>
        <use href="#tray-first-open-shape" fill="none" stroke={red?'#ad6468':'#488cbd'} strokeWidth="5" opacity=".55"/>
        <use href="#tray-first-open-shape" fill="none" stroke={red?'#ffdfdf':'#dcf2ff'} strokeWidth="2.7"/>
        <use href="#tray-second-open-shape" fill="none" stroke={red?'#ad6468':'#488cbd'} strokeWidth="5" opacity=".55"/>
        <use href="#tray-second-open-shape" fill="none" stroke={red?'#ffdfdf':'#dcf2ff'} strokeWidth="2.7"/>
        {/* Cubiertos dibujados en la capa fija de la bandeja. No son una foto flotante. */}
        <g transform="translate(142 45) rotate(-36 80 80)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke="#a9b9c9" strokeWidth="10">
            <path d="M44 31V52 M54 31V52 M64 31V52 M54 33V126 M105 62V126"/>
            <ellipse cx="105" cy="44" rx="17" ry="25" fill="#e4ebf0"/>
          </g>
          <g stroke="#eaf2f7" strokeWidth="3">
            <path d="M44 31V49 M54 31V49 M64 31V49 M54 55V123 M102 69V122"/>
            <path d="M97 27C106 23 114 32 115 40"/>
          </g>
        </g>
      </svg>
      <button className="photo-tray-hit tray-water-target tray-water-bigger" type="button"
        onClick={select({name:'Agua',allergens:[],isWater:true},'Bebida')} aria-label="Agua">
        <img src="/assets/vaso.png" alt=""/>
      </button>
      <button className="tray-open-first-hit" type="button"
        onClick={select(meal.first,'Primer plato')}
        aria-label={'Primer plato: '+meal.first.name}/>
      <button className="tray-open-second-hit" type="button"
        onClick={select(meal.second,'Segundo plato')}
        aria-label={'Segundo plato: '+meal.second.name}/>
      {/* Postre y pan: exactamente los mismos elementos y posiciones de la versión anterior. */}
      <button className="photo-tray-hit tray-dessert-target" type="button"
        onClick={select(meal.dessert,'Postre')}
        aria-label={'Postre: '+(meal.dessert?.name||'No especificado')}>
        {dessert ? <img src={dessert} alt=""/> : <span>Postre</span>}
      </button>
      <img className="photo-tray-bread" src="/assets-clean/pan.png"
        onError={e=>alternate(e,'/assets/pan.png')} alt="" aria-hidden="true"/>
    </div>
    <p className="tray-hint">Toca un compartimento para consultar los alérgenos</p>
  </div>;
}
