import db from '@/data/menus-octubre-2026.json';

export const school = db.school;
export const menus = db.days;
export const menuTypes = db.menuTypes;
export const alerts = db.reviewFlags;
export const disclaimer = db.disclaimer;
export const dates = Object.keys(db.days).sort();
export const allergens = {
  1:{name:'Gluten',icon:'🌾'}, 2:{name:'Crustáceos',icon:'🦐'},
  3:{name:'Huevo',icon:'🥚'}, 4:{name:'Pescado',icon:'🐟'},
  5:{name:'Cacahuetes',icon:'🥜'}, 6:{name:'Soja',icon:'🫘'},
  7:{name:'Leche',icon:'🥛'}, 8:{name:'Frutos de cáscara',icon:'🌰'},
  9:{name:'Apio',icon:'🌿'}, 10:{name:'Mostaza',icon:'🟡'},
  11:{name:'Sésamo',icon:'🌱'}, 12:{name:'Altramuces',icon:'🌼'},
  13:{name:'Sulfitos',icon:'🧴'}, 14:{name:'Moluscos',icon:'🐚'},
};
export function dateInCanaries(date=new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Atlantic/Canary'}).formatToParts(date);
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
export function firstDateToShow(today=dateInCanaries()) {
  if(menus[today])return today;
  const next=dates.find(d=>d>=today);
  return next||today; // The month is unavailable: show a clear empty-state, not stale food.
}
export function formatDate(key,options={weekday:'long',day:'numeric',month:'long'}) {
  return new Intl.DateTimeFormat('es-ES',options).format(new Date(`${key}T12:00:00Z`));
}
export function getWeek(date) {
  const d=new Date(`${date}T12:00:00Z`);
  const offset=(d.getUTCDay()+6)%7;
  d.setUTCDate(d.getUTCDate()-offset);
  return Array.from({length:5},(_,i)=>{const copy=new Date(d);copy.setUTCDate(d.getUTCDate()+i);return copy.toISOString().slice(0,10)});
}
export function addDays(iso,increment) {
  const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+increment);
  return d.toISOString().slice(0,10);
}
export function mealCategory(dish) {
 if(!dish)return 'otro';
 const n=dish.name.toLocaleLowerCase('es');
 if(/lentej|potaje|jud[ií]a|alubia|garbanzo/.test(n))return 'legumbres';
 if(/pasta|macarron|arroz|paella|fideo|pizza/.test(n))return 'cereales';
 if(/crema|pur[eé]|sopa|minestrone|verdura|ensalada|hortaliza|br[oó]coli/.test(n))return 'verduras';
 return 'otro';
}
export function proteinCategory(meal) {
 const n=[meal?.second?.name,meal?.side?.name].filter(Boolean).join(' ').toLowerCase();
 const fish=/merluza|at[uú]n|dorado|pescado|salm[oó]n|bacalao/.test(n);
 const meat=/pollo|pavo|carne|cerdo|lomo|jam[oó]n|bacon|bondiola|bolo[nñ]esa|chopsuey/.test(n);
 const egg=/huevo|tortilla/.test(n);
 if([fish,meat,egg].filter(Boolean).length>1)return 'mixto';
 return fish?'pescado':meat?'carne':egg?'huevo':'otro';
}
/** Complementary dinner suggestions transcribed from the printed PDF matrix. */
export function dinnerSuggestion(meal) {
 if(!meal)return null;
 const first=mealCategory(meal.first),protein=proteinCategory(meal);
 let family=first;
 if(first==='verduras' && mealCategory(meal.second)==='cereales')family='cereales';
 if(first==='verduras' && mealCategory(meal.second)==='legumbres')family='legumbres';
 // The provider's matrix gives exact combinations for vegetables, legumes, and pasta/rice.
 const source=family==='cereales'?'Pasta o arroz':family==='legumbres'?'Legumbres':family==='verduras'?'Verduras':null;
 if(!source||!['huevo','carne','pescado'].includes(protein))return null;
 const label=protein==='huevo'?'Huevo':protein==='carne'?'Carne':'Pescado';
 const value=protein==='huevo'?(family==='cereales'?'Verduras + carne':family==='legumbres'?'Verduras + carne':'Pasta o arroz + carne'):
 protein==='carne'?'Pescado':'Huevo';
 const examples=value==='Pescado'?['Pescado al horno con verduras','Merluza a la plancha y ensalada']:
 value==='Huevo'?['Tortilla francesa con tomate','Revuelto de verduras y huevo']:
 value==='Verduras + carne'?['Salteado de verduras con pavo','Ensalada variada y pollo']:
 ['Arroz con verduras y pollo','Pasta con tomate y pavo'];
 return {because:`${source} + ${label}`,recommended:value,examples};
}
export function foodKind(dish){
 if(!dish)return 'unknown';
 const n=dish.name.toLowerCase();
 if(/crema|pur[eé]|sopa|caldo/.test(n))return 'soup';
 if(/pasta|macarron|espiral|fideo/.test(n))return 'pasta';
 if(/paella|arroz/.test(n))return 'rice';
 if(/lentej|garbanzo|alubia|jud[ií]a|potaje|berro/.test(n))return 'stew';
 if(/ensalada|verdura|crudité/.test(n))return 'salad';
 if(/pollo|pavo|lomo|cerdo|bondiola|carne/.test(n))return 'meat';
 if(/merluza|dorado|at[uú]n|pescado/.test(n))return 'fish';
 if(/tortilla|huevo/.test(n))return 'egg';
 if(/pizza/.test(n))return 'pizza';
 if(/yogur/.test(n))return 'yogurt';
 if(/fruta/.test(n))return 'fruit';
 if(/pan/.test(n))return 'bread';
 return 'food';
}
export function emojiFor(dish){
 return ({soup:'🥣',pasta:'🍝',rice:'🥘',stew:'🍲',salad:'🥗',meat:'🍗',fish:'🐟',egg:'🍳',pizza:'🍕',yogurt:'🥛',fruit:'🍎',bread:'🥖',food:'🍽️',unknown:'🍽️'})[foodKind(dish)];
}
