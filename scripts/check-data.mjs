import fs from 'node:fs';
const db=JSON.parse(fs.readFileSync(new URL('../data/menus-octubre-2026.json',import.meta.url)));
if(db.menuTypes.length!==10)throw new Error('Se esperaban 10 tipos de menú');
const valid=Object.keys(db.days).sort();
if(valid.length!==19)throw new Error(`Se esperaban 19 días con menú: ${valid.length}`);
let broken=[];
for(const date of valid){
 const day=db.days[date];
 for(const type of db.menuTypes){
  const m=day[type.id];
  if(!m?.first?.name||!m?.second?.name||!m?.nutrition)broken.push(`${date} ${type.id}: datos incompletos`);
  for(const field of ['first','second','side','dessert','bread'])for(const id of m?.[field]?.allergens||[]){if(id<1||id>14)broken.push(`${date} ${type.id}: alérgeno inválido ${id}`)}
 }
}
if(broken.length)throw new Error(broken.join('\n'));
console.log(`✓ ${valid.length} días · ${db.menuTypes.length} tipos · ${valid.length*db.menuTypes.length} menús validados`);
console.log('Advertencia: la validación de forma no sustituye la revisión alimentaria humana.');
