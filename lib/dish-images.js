// Fotografías gastronómicas orientativas: solo se muestran cuando la elaboración coincide.
export function dishImage(dish, slot, meal) {
  const name=(dish?.name||'').toLocaleLowerCase('es');
  const side=(meal?.side?.name||'').toLocaleLowerCase('es');
  const clean=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (slot==='first') {
    if (/crema de calabacin/.test(clean)) return '/images/crema-calabacin.webp';
    if (/potaje de judias pintas|potaje de judias\b/.test(clean)) return '/images/judias-pintas.webp';
    if (/potaje de garbanzos/.test(clean)) return '/images/garbanzos.webp';
  }
  if (slot==='second') {
    if (/carne fiesta|cerdo fiesta|cerdo con papas estilo/.test(clean)) return '/images/carne-fiesta.webp';
    if (/chopsuey de pavo/.test(clean)) return '/images/chopsuey-pavo.webp';
    if (/pasta integral/.test(clean) && /tomate|napolitana/.test(clean) && (/huevo/.test(clean) || /huevo/.test(side))) return '/images/pasta-tomate-huevo.webp';
  }
  return null;
}
