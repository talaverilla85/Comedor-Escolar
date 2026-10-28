#!/usr/bin/env python3
"""Extract October 2026 ALBI school menus from the supplied PDF.

The basal sheet has its own printed layout and is curated below; the nine
adapted spreadsheets share an aligned layout parsed by coordinates. All imported
allergen codes reflect the document, not independent dietary certification.
"""
import json, re, sys
from pathlib import Path
import fitz

SOURCE=Path(sys.argv[1] if len(sys.argv)>1 else 'MENU-OCTUBRE-VEINTE-DE-ENERO.pdf')
OUT=Path(sys.argv[2] if len(sys.argv)>2 else 'data/menus-octubre-2026.json')

TYPES=[
 {'id':'basal','label':'Menú basal','description':'Menú ordinario','page':1,'kind':'normal'},
 {'id':'sin-pescado','label':'Sin pescado','description':'Adaptación sin pescado','page':2,'kind':'allergy'},
 {'id':'sin-cerdo','label':'Sin cerdo','description':'Adaptación sin cerdo','page':3,'kind':'preference'},
 {'id':'sin-frutos-secos','label':'Sin frutos secos','description':'Adaptación por frutos secos','page':4,'kind':'allergy'},
 {'id':'sin-lacteos','label':'Sin lácteos / PLV','description':'Sin proteína de leche de vaca','page':5,'kind':'allergy'},
 {'id':'sin-pescado-marisco','label':'Sin pescado ni marisco','description':'Adaptación sin pescado ni marisco','page':6,'kind':'allergy'},
 {'id':'sin-huevo','label':'Sin huevo','description':'Adaptación sin huevo','page':7,'kind':'allergy'},
 {'id':'sin-gluten','label':'Sin gluten','description':'Adaptación sin gluten','page':8,'kind':'allergy'},
 {'id':'sin-gluten-lacteos-huevo','label':'Sin gluten, lácteos ni huevo','description':'Adaptación combinada','page':9,'kind':'allergy'},
 {'id':'sin-lacteos-marisco','label':'Sin lácteos, moluscos ni crustáceos','description':'Adaptación combinada','page':10,'kind':'allergy'}
]
DATES=[5,6,7,8,9,12,13,14,15,16,19,20,21,22,23,26,27,28,29,30]
# first, second, accompaniment, kcal, prot, carbs, fats
BASAL={
5:['Lentejas compuestas con arroz integral (1,13)','Tacos de atún en adobo con ensalada (4,13)','',633,32,51,31],
6:['Crema de zanahoria (13)','Macarrones con salsa aurora y bacon (9,13)','',459,11,66,15],
7:['Puré de brócoli (13)','Pollo con papas al ajillo (13)','',515,28,55,24],
8:['Potaje de verduras (9,13)','Tortilla española con ensalada (3,13)','',473,14,64,15],
9:['Sopa de fideos, pollo y garbanzos (1,3,9)','Bondiola de cerdo en adobo con ensalada (13)','',618,33,39,35],
13:['Sopa de pescado con arroz (4,13)','Muslo de pollo al tomillo con ensalada','',477,19,74,15],
14:['Crema de calabaza con manzana asada','Pasta integral con salsa boloñesa (1,3,9,13)','',451,27,43,17],
15:['Potaje de berros con judías pintas','Filete de dorado con ajo y perejil con ensalada (4,13)','',479,13,77,11],
16:['Crema de puerro y zanahoria (13)','Arroz con papas, tomate y huevo (3,13)','',535,37,45,22],
19:['Puré de hortalizas (13)','Pasta con nata y calabacín (1,3,6,7)','',416,8,71,9],
20:['Potaje de alubias blancas (13)','Dorado al horno con ensalada','',566,31,61,19],
21:['Crema de acelgas (13)','Tortilla paisana con ensalada (3,13)','',457,13,59,16],
22:['Caldo de arroz y huevo (1,3,9,10,11)','Lomo de cerdo en salsa de cebolla y manzana con papa emperejilada (13)','',542,32,66,14],
23:['Sopa de pollo y fideos (1,3,9)','Pizza de jamón y orégano con ensalada (1,6,7,11)','',481,26,61,13],
26:['Sopa minestrone (9)','Merluza a la portuguesa con papa sancochada y ensalada (4,13)','',437,19,75,4],
27:['Crema de calabacín (13)','Pasta integral con tomate y huevo picado (1,3,4,6,9,10,13)','',473,20,71,10],
28:['Potaje de garbanzos (13)','Chopsuey de pavo con ensalada (6,9)','',482,36,56,10],
29:['Crema de zanahoria con pera asada (13)','Paella mixta (4,9,13)','',528,14,74,17],
30:['Potaje de judías pintas (13)','Cerdo con papas estilo "Carne fiesta" (9,13)','',622,44,50,24]
}

def make_dish(raw):
 raw=re.sub(r'\b(?:CGC24|GU_CGC24|GU)\b','',raw,flags=re.I).replace('_',' ')
 codes=[]
 for match in re.finditer(r'\(([\d,\s]+)\)',raw):
  for n in re.findall(r'\d+',match.group(1)):
   if 1 <= int(n) <=14 and int(n) not in codes:codes.append(int(n))
 raw=re.sub(r'\(([\d,\s]+)\)','',raw)
 raw=re.sub(r'\s+',' ',raw).strip(' .;,-')
 raw=raw.replace('PAPA SANCOHADAS','Papas sancochadas').replace('SANCOHADO','sancochado')
 if not raw:return None
 return {'name':raw[0].upper()+raw[1:].lower() if raw.isupper() else raw,'allergens':codes}

def norm(raw):
 raw=re.sub(r'\s+',' ',raw).strip()
 return re.sub(r'\bCGC24\b','',raw,flags=re.I).strip()

def page_section(pg, x0,x1,ya,yb):
 vals=[]
 for x0w,y0w,x1w,y1w,word,*_ in pg:
  xc=(x0w+x1w)/2
  if x0<=xc<x1 and ya-0.3<=y0w<yb-0.3:
   vals.append((round(y0w,1),x0w,word))
 lines=[]
 for yy,xx,word in sorted(vals):
  if not lines or abs(lines[-1][0]-yy)>2:lines.append([yy,[(xx,word)]])
  else:lines[-1][1].append((xx,word))
 return norm(' '.join(' '.join(w for _,w in sorted(words)) for _,words in lines))

def adapt_page(pg, idx):
 rec={}
 words=pg.get_text('words')
 xs=[41,145,253,359,464,568]
 for wi in range(4):
  offset=10.4 if idx==5 else 0
  y=64+wi*139.35+offset
  for ci in range(5):
   day=DATES[wi*5+ci]
   if day==12:continue
   xl,xr=xs[ci:ci+2]
   first=page_section(words,xl,xr,y-1,y+27.5)
   second=page_section(words,xl,xr,y+27.5,y+51.5)
   side=page_section(words,xl,xr,y+51.5,y+81)
   dessert=page_section(words,xl,xr,y+81,y+101)
   bread=page_section(words,xl,xr,y+101,y+116)
   statswords=sorted([w for w in words if 40<w[0]<570 and abs(w[1]-(182.5+wi*139.35+offset)) < 1.2],key=lambda w:w[0])
   stat=' '.join(w[4] for w in statswords)
   ms=list(re.finditer(r'P\s*(\d+)\s*HC\s*(\d+)\s*G\s*(\d+)\s*KCAL\s*(\d+)',stat,re.I))
   statindex=ci if wi!=1 else ci-1
   m=ms[statindex] if 0<=statindex<len(ms) else None
   nutr={'kcal':int(m.group(4)),'protein':int(m.group(1)),'carbs':int(m.group(2)),'fat':int(m.group(3))} if m else None
   # Rows are printed separately in 2-5. Entire dish text kept even if irregular.
   rec[day]={'first':make_dish(first),'second':make_dish(second),
             'side':make_dish(side),'dessert':make_dish(dessert),
             'bread':make_dish(bread),'nutrition':nutr,'sourcePage':idx+1}
 return rec

doc=fitz.open(SOURCE)
assert len(doc)==10, 'PDF layout differs from the approved 10-page menu'
menus={}
for day,values in BASAL.items():
 first,second,side,kcal,p,c,f=values
 menus[f'2026-10-{day:02}']={'basal':{'first':make_dish(first),'second':make_dish(second),'side':make_dish(side),
 'dessert':make_dish('Yogur natural (7)' if day in [9,16,23,30] else 'Fruta'),
 'bread':make_dish('Pan integral (1)' if day in [7,14,21,28,9,16,23,30] else 'Pan (1)'),
 'nutrition':{'kcal':kcal,'protein':p,'carbs':c,'fat':f},'sourcePage':1}}
for i in range(1,10):
 for day,data in adapt_page(doc[i],i).items():
  menus[f'2026-10-{day:02}'][TYPES[i]['id']]=data

# Data inconsistencies between the basal and the adapted documents should be
# reviewed against the food provider's authoritative allergen matrix.
flags=[
 {'date':'2026-10-27','type':'basal','message':'El menú basal declara pescado en la pasta (alérgeno 4), mientras las adaptaciones para el mismo plato no lo hacen. Confirmar con el comedor.'},
 {'date':'2026-10-09','type':'sin-huevo','message':'La sopa descrita como «sin gluten» conserva alérgenos 1 y 3 impresos en el PDF; verificar con el comedor.'},
]

# Flag adaptations in which the PDF still declares a formally excluded allergen.
excluded_by_type={
 'sin-pescado':{4}, 'sin-frutos-secos':{5,8}, 'sin-lacteos':{7},
 'sin-pescado-marisco':{2,4,14}, 'sin-huevo':{3}, 'sin-gluten':{1},
 'sin-gluten-lacteos-huevo':{1,3,7}, 'sin-lacteos-marisco':{2,7,14}
}
for date,all_modes in menus.items():
 for type_id,excluded in excluded_by_type.items():
  meal=all_modes[type_id]
  conflicts=[]
  for part in ('first','second','side','dessert','bread'):
   item=meal[part]
   if item:
    hits=set(item['allergens'])&excluded
    if hits:conflicts.append(f"{item['name']} (alérgeno(s) {','.join(map(str,sorted(hits)))})")
  if conflicts: flags.append({
   'date':date,'type':type_id,
   'message':'IMPORTANTE: la adaptación marcada en el PDF contiene códigos de alérgenos que parecen incompatibles: '
             +'; '.join(conflicts)+'. Contactar con el comedor antes de confiar en este menú.'
  })

result={'school':'CEIP Veinte de Enero','provider':'ALBI Canarias', 'month':'2026-10', 'source':'MENU-OCTUBRE-VEINTE-DE-ENERO.pdf',
 'menuTypes':TYPES, 'closedDates':['2026-10-12'], 'days':menus, 'reviewFlags':flags,
 'disclaimer':'Información transcrita del menú facilitado por el comedor. Puede sufrir modificaciones. Para alergias, confirmar siempre con el centro y el proveedor.'}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'Extracted {len(menus)} dates, {sum(len(d) for d in menus.values())} combinations.')
for key in ['2026-10-26','2026-10-27','2026-10-28']:
 print('\n',key)
 for k,v in menus[key].items():print(k, '=>',v['first'],v['second'],v['side'],v['nutrition'])
