'use client';
import { useEffect, useMemo, useState } from 'react';
import {
 ArrowRight,BookOpen,CalendarDays,Check,ChevronDown,ChevronLeft,ChevronRight,
 CircleAlert,CloudSun,Info,ShieldAlert,ShieldCheck,Utensils,X,Share2,Flame,Beef,Wheat,Droplets,CalendarRange
} from 'lucide-react';
import Tray from '@/components/Tray';
import {dishImage} from '@/lib/dish-images';
import { school, menus, menuTypes, allergens, alerts, disclaimer, dates,
  firstDateToShow, dateInCanaries, formatDate, getWeek, addDays, dinnerSuggestion, emojiFor } from '@/lib/menu';

function AllergenPill({id}) {
 const a=allergens[id];if(!a)return null;
 return <span className="allergen-pill"><span className="allergen-icon" aria-hidden="true">{a.icon}</span>{a.name}</span>;
}
function findSpecialNotice(date,type) {return alerts.filter(a=>a.date===date&&(a.type===type||a.type==='all'));}
const DOW=['L','M','X','J','V'];

export default function Home() {
 const [date,setDate]=useState('2026-10-27');
 const [type,setType]=useState('basal');
 const [dialog,setDialog]=useState(null);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [monthOpen,setMonthOpen]=useState(false);
 const [toast,setToast]=useState('');
 const [mounted,setMounted]=useState(false);
 useEffect(()=>{
   setMounted(true);setDate(firstDateToShow());
   const stored=window.localStorage.getItem('mi-bandeja-menu');
   if(menuTypes.some(m=>m.id===stored))setType(stored);
   if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
 },[]);
 const chooseType=(next)=>{setType(next);setSettingsOpen(false);if(typeof window!=='undefined')localStorage.setItem('mi-bandeja-menu',next)};
 const menuType=menuTypes.find(m=>m.id===type)||menuTypes[0];
 const meal=menus[date]?.[type]||null;
 const isToday=mounted&&date===dateInCanaries();
 const week=useMemo(()=>getWeek(date),[date]);
 const weekRange=useMemo(()=>{
   const first=week[0],last=week[4];
   const a=Number(first.slice(8)),b=Number(last.slice(8));
   const ma=formatDate(first,{month:'long'}),mb=formatDate(last,{month:'long'});
   const ya=first.slice(0,4),yb=last.slice(0,4);
   if(ma===mb && ya===yb)return `Semana del ${a} al ${b} de ${mb}`;
   if(ya===yb)return `Semana del ${a} de ${ma} al ${b} de ${mb}`;
   return `Semana del ${a} de ${ma} de ${ya} al ${b} de ${mb} de ${yb}`;
 },[week]);
 const red=menuType.kind==='allergy';
 const dinner=useMemo(()=>dinnerSuggestion(meal),[meal]);
 const notices=findSpecialNotice(date,type);
 const mealAllergens=meal?Array.from(new Set(['first','second','side','dessert','bread'].flatMap(k=>meal[k]?.allergens||[]))).sort((a,b)=>a-b):[];
 function jump(day){setDate(day);setDialog(null);}
 function goToWeek(direction){
   const targetWeek=getWeek(addDays(date,direction*7));
   const selectedIndex=week.indexOf(date);
   const sameWeekday=targetWeek[selectedIndex<0?0:selectedIndex];
   const target=menus[sameWeekday]?sameWeekday:(targetWeek.find(d=>menus[d])||targetWeek[0]);
   jump(target);
 }
 async function shareMenu(){
   const title=`Mi Bandeja · ${formatDate(date)}`;
   const text=`${school}\n${formatDate(date)} · ${menuType.label}\n1º ${meal?.first?.name||'-'}\n2º ${meal?.second?.name||'-'}\n${meal?.side?.name||''}`;
   try{
    if(navigator.share)await navigator.share({title,text,url:location.origin});
    else {await navigator.clipboard.writeText(text+'\n'+location.href);setToast('Menú copiado');setTimeout(()=>setToast(''),3000)}
   }catch(e){if(e?.name!=='AbortError')setToast('No se pudo compartir')}
 }
 function viewDish(dish,label){if(dish)setDialog({dish,label})}
 return (
 <div className="page-bg">
   <header className="site-header">
     <div className="header-inner">
       <a href="/" className="brand" aria-label="Mi Bandeja inicio"><span className="brand-symbol">🍽️</span><span><strong>Mi<span className="brand-blue">Bandeja</span></strong><small>Comer bien empieza por saber qué hay</small></span></a>
       <button className="school-selector" type="button" onClick={()=>setSettingsOpen(true)}><span className="school-icon">🏫</span><span><small>Nuestro cole</small><b>{school}</b></span><ChevronDown size={16}/></button>
     </div>
   </header>
   <main className="app-container">
     <section className="intro">
       <div><div className="eyebrow"><span className="eyebrow-dot"/> MENÚ ESCOLAR · OCTUBRE 2026</div><h1>¿Qué comemos <em>hoy?</em> <span className="heading-sparkle">✦</span></h1><p>Descubre lo que come tu peque cada día.</p></div>
       <div className="intro-sticker"><span>🥕</span><span>¡A comer!</span></div>
     </section>
     <div className="app-grid">
       <div className="main-column">
         <section className="menu-panel" aria-label="Menú del día">
           <div className="menu-topline">
             <div className="menu-top-left"><button type="button" className="icon-shell calendar-trigger" onClick={()=>setMonthOpen(v=>!v)} aria-expanded={monthOpen} aria-controls="menu-calendar-picker" aria-label="Elegir una fecha" title="Elegir una fecha"><CalendarDays size={21}/></button><div><span className="section-kicker">EN LA BANDEJA</span><h2>{formatDate(date)}</h2></div></div>
             <span className={`day-chip ${isToday?'chip-today':''}`}>{isToday?'● Hoy':meal?'Menú publicado':date.endsWith('-12')?'Festivo':'Sin menú publicado'}</span>
           </div>
           {monthOpen&&<div className="date-picker-wrap" id="menu-calendar-picker"><label htmlFor="selected-day">Ir a una fecha</label><input id="selected-day" type="date" value={date} onChange={e=>{if(e.target.value){jump(e.target.value);setMonthOpen(false)}}}/><button type="button" onClick={()=>{jump(firstDateToShow());setMonthOpen(false)}}>Volver a hoy</button></div>
           <nav className="week-navigation" aria-label="Cambiar de semana">
             <button type="button" className="week-nav-arrow" onClick={()=>goToWeek(-1)}
               aria-label="Semana anterior" title="Semana anterior"><ChevronLeft size={20}/></button>
             <div className="week-navigation-label" aria-live="polite">
               <CalendarRange size={17} aria-hidden="true"/>
               <strong>{weekRange}</strong>
             </div>
             <button type="button" className="week-nav-arrow" onClick={()=>goToWeek(1)}
               aria-label="Semana siguiente" title="Semana siguiente"><ChevronRight size={20}/></button>
           </nav>
           <div className="week-strip" role="group" aria-label={weekRange}>
             {week.map((day,i)=>{
               const hasMenu=!!menus[day],active=day===date;
               return <button type="button" key={day} className={`week-day ${active?'week-active':''} ${!hasMenu?'week-empty':''}`} onClick={()=>jump(day)} aria-pressed={active} title={!hasMenu?'Menú no publicado':'Ver menú'}><span>{DOW[i]}</span><strong>{Number(day.slice(-2))}</strong><i>{hasMenu?'•':'–'}</i></button>
             })}
           </div>
           <div className="menu-mode-bar">
             <span className={`mode-small-icon ${red?'red-icon':''}`}>{red?<ShieldAlert size={19}/>:<Utensils size={19}/>}</span>
             <div className="mode-info"><span>TIPO DE MENÚ</span><strong>{menuType.label}</strong></div>
             <button className="change-menu-btn" type="button" onClick={()=>setSettingsOpen(true)}>Cambiar <ChevronDown size={16}/></button>
           </div>
           {meal? <>
             <Tray meal={meal} red={red} date={date} menuType={type} onSelect={viewDish}/>
             <div className="plate-labels">
               <button className="plate-name" onClick={()=>viewDish(meal.first,'Primer plato')}><span className="course-badge course-1">01</span><span><small>PRIMER PLATO</small><b>{meal.first.name}</b></span><ChevronRight size={17}/></button>
               <button className="plate-name" onClick={()=>viewDish(meal.second,'Segundo plato')}><span className="course-badge course-2">02</span><span><small>SEGUNDO PLATO</small><b>{meal.second.name}</b>{meal.side&&<span className="side-label">Con {meal.side.name.toLowerCase()}</span>}</span><ChevronRight size={17}/></button>
             </div>
             <div className="dessert-strip"><span className="dessert-symbol">🍎</span><span><small>POSTRE · PAN</small><strong>{meal.dessert?.name||'No especificado'} · {meal.bread?.name||'No especificado'}</strong></span><button onClick={()=>viewDish(meal.dessert,'Postre')} aria-label="Ver postre"><Info size={18}/></button></div>
             <div className="menu-actions"><button onClick={shareMenu}><Share2 size={17}/> Compartir menú</button></div>
           </>:<div className="no-menu"><span>📭</span><h3>{date==='2026-10-12'?'Hoy no hay comedor':'No tenemos publicado este día'}</h3><p>{date==='2026-10-12'?'El calendario del comedor marca este día como festivo.':'Todavía no tenemos un menú publicado para esta fecha.'}</p><button onClick={()=>jump(dates.at(-1))}>Ver último menú publicado <ArrowRight size={16}/></button></div>}
         </section>
       </div>
       <aside className="side-column">
         {meal&&<>
           <section className="side-card nutrition-card"><div className="side-card-heading"><div className="feature-icon feature-peach"><Flame size={20}/></div><div><span className="section-kicker">DATOS DEL COMEDOR</span><h3>Aporte nutricional</h3></div></div>
             <div className="main-calories"><strong>{meal.nutrition.kcal}</strong><span>kcal<br/><small>por menú completo</small></span></div>
             <div className="macro-stats"><div><span className="macro-icon protein-icon"><Beef size={17}/></span><strong>{meal.nutrition.protein}<small>g</small></strong><span>Proteínas</span></div><div><span className="macro-icon carb-icon"><Wheat size={17}/></span><strong>{meal.nutrition.carbs}<small>g</small></strong><span>Hidratos</span></div><div><span className="macro-icon fat-icon"><Droplets size={17}/></span><strong>{meal.nutrition.fat}<small>g</small></strong><span>Grasas</span></div></div>
             <p className="card-fine">Valores facilitados por el comedor; pueden variar según las raciones.</p>
           </section>
           <section className="side-card allergens-card"><div className="side-card-heading"><div className="feature-icon feature-blue"><ShieldCheck size={20}/></div><div><span className="section-kicker">INFORMACIÓN IMPORTANTE</span><h3>Alérgenos del menú</h3></div></div>
             <div className="allergen-list">{mealAllergens.length?mealAllergens.map(id=><AllergenPill id={id} key={id}/>):<p>No figuran alérgenos declarados en este menú.</p>}</div>
             <p className="card-fine">La ausencia de un símbolo no garantiza ausencia de trazas.</p>
             {notices.map((n,i)=><div className="warning-note" key={i}><CircleAlert size={18}/><span>{n.message}</span></div>)}
           </section>
           <section className="side-card dinner-card"><div className="side-card-heading"><div className="feature-icon feature-mint"><CloudSun size={21}/></div><div><span className="section-kicker">PARA COMPLETAR EL DÍA</span><h3>¿Y esta noche?</h3></div></div>
             {dinner?<><div className="dinner-logic"><span>Si al mediodía come</span><strong>{dinner.because}</strong><span className="arrow-down">↓</span><span>Se recomienda cenar</span><strong className="dinner-answer">{dinner.recommended}</strong></div><div className="dinner-examples"><span>💡 IDEAS SENCILLAS</span><ul>{dinner.examples.map(x=><li key={x}>{x}</li>)}</ul></div><p className="card-fine">Orientación general del menú escolar, no una regla rígida: adapta la cena al apetito y necesidades de tu peque.</p></>:<><p className="no-specific-dinner">No hay una recomendación específica para esta combinación. Puedes completar el día con verduras y fuentes variadas de proteína y energía.</p><p className="card-fine"></p></>}
           </section>
         </>}
         <section className="family-note"><span>🌱</span><div><strong>Comer también es aprender</strong><p>Una mirada rápida al menú nos ayuda a planificar el resto del día en familia.</p></div></section>
       </aside>
     </div>
     <footer className="footer"><span>Hecho con cariño para las familias 💙</span><span>CEIP Veinte de Enero</span><button onClick={()=>setSettingsOpen(true)}>Preferencias</button></footer>
   </main>
   {settingsOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSettingsOpen(false)}}><section className="dialog settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="dialog-close" onClick={()=>setSettingsOpen(false)} aria-label="Cerrar"><X size={20}/></button><span className="dialog-head-icon">👨‍👩‍👧‍👦</span><h2 id="settings-title">¿Qué menú tiene tu peque?</h2><p>Elige el menú asignado por el colegio. Lo recordaremos en este dispositivo.</p><div className="option-list">{menuTypes.map(m=><button type="button" key={m.id} className={`menu-option ${type===m.id?'is-selected':''}`} onClick={()=>chooseType(m.id)}><span className={`option-symbol ${m.kind==='allergy'?'alert-symbol':''}`}>{m.kind==='allergy'?<ShieldAlert size={21}/>:<Utensils size={21}/>}</span><span><strong>{m.label}</strong><small>{m.description}</small></span>{type===m.id&&<Check size={19}/>}</button>)}</div><div className="settings-disclaimer"><ShieldCheck size={19}/>Solo selecciona un menú especial si el colegio lo tiene confirmado. Los datos de la web no sustituyen las indicaciones del personal del comedor.</div></section></div>}
   {dialog&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setDialog(null)}}><section className="dialog dish-dialog" role="dialog" aria-modal="true" aria-labelledby="dish-title"><button className="dialog-close" onClick={()=>setDialog(null)} aria-label="Cerrar"><X size={20}/></button><div className="dish-hero">{dishImage(dialog.dish,dialog.label==='Primer plato'?'first':'second',meal)?<img className="dish-detail-photo" src={dishImage(dialog.dish,dialog.label==='Primer plato'?'first':'second',meal)} alt={`Imagen orientativa de ${dialog.dish.name}`}/>:<span className="dish-detail-no-photo">{dialog.dish.name}</span>}</div><span className="section-kicker">{dialog.label.toUpperCase()}</span><h2 id="dish-title">{dialog.dish.name}</h2><h3>Alérgenos declarados</h3><div className="allergen-list">{dialog.dish.allergens?.length?dialog.dish.allergens.map(a=><AllergenPill id={a} key={a}/>):<span className="no-declared">No figuran alérgenos declarados en este apartado.</span>}</div><div className="settings-disclaimer"><CircleAlert size={19}/>{dialog.dish.isWater?'El comedor recomienda agua como bebida.':'Los alérgenos declarados pueden no incluir trazas. Ante una alergia, confirma siempre con el centro.'}</div><button className="dialog-done" onClick={()=>setDialog(null)}>Entendido</button></section></div>}
   {toast&&<div className="toast" role="status">{toast}</div>}
 </div>
 );
}
