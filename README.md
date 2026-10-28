# Mi Bandeja 🍽️

Web para ver el menú escolar del **CEIP Veinte de Enero (Gran Canaria)** con una bandeja interactiva, calendario, alérgenos y sugerencias para la cena.

## Primera versión

- Menú del día por defecto (horario de **Canarias**), si existe un menú publicado; en fines de semana de octubre, salta al siguiente día con menú.
- 10 tipos de menú, incluido el basal por defecto. La selección se guarda **solo en el dispositivo** (`localStorage`).
- Bandeja azul clara para el menú basal y roja para adaptaciones por alergias. Otras restricciones, como «sin cerdo», no se etiquetan automáticamente como alergias.
- Fotografía ilustrativa para algunos platos del 27 de octubre, tomada de la representación visual aprobada, e ilustraciones para el resto. No se pretende que sean fotos reales del comedor.
- Consulta de platos y alérgenos tocando las secciones; advertencias para declaraciones que necesitan confirmación.
- Calendario de días y selector de fecha, navegación a menús anteriores y posteriores.
- Aporte nutricional según el PDF: kcal, proteína, hidratos y grasas.
- Recomendaciones de cenas basadas **solo** en las combinaciones de la tabla del PDF. No son normas dietéticas individuales.
- Responsive, PWA con caché básica para uso sin conexión después de la primera visita, sin cuentas de usuario ni datos personales.

## Desarrollo

Necesitas Node.js 20 o superior:

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Comprueba los datos antes de crear una build:

```bash
npm run check-data
npm run build
```

## Publicación en Vercel

Importa este repositorio en Vercel. Detectará Next.js y realizará el build sin variables de entorno. Si Vercel solicita la configuración, usa `npm run build` como build y el preset **Next.js**.

## Procedencia y carga de datos

`data/menus-octubre-2026.json` contiene los menús del PDF entregado por la familia: `MENU-OCTUBRE-VEINTE-DE-ENERO.pdf` (10 páginas, octubre de 2026). La primera página (menú basal) está transcrita y revisada; las adaptaciones se extrajeron de las 9 páginas estructuradas restantes mediante `scripts/import_pdf.py`.

Puedes **reproducir esta extracción específica** poniendo el PDF original junto al proyecto y ejecutando:

```bash
python -m pip install pymupdf
python scripts/import_pdf.py MENU-OCTUBRE-VEINTE-DE-ENERO.pdf data/menus-octubre-2026.json
npm run check-data
```

**Importante:** El importador está adaptado al diseño exacto y a las fechas de este PDF de octubre de 2026; no admite automáticamente un mes nuevo ni otro formato. Antes de cargar un nuevo PDF se requerirán cambios y revisión humana. Un panel de administración para subir y validar nuevos documentos será una fase posterior. Nunca publiques alérgenos desde OCR sin verificar.

### Seguridad alimentaria

La aplicación **no certifica que un plato carezca de un alérgeno**. Reproduce lo que indica el documento, que puede contener errores o inconsistencias. Particularmente, el menú basal del **27 de octubre** incluye el alérgeno 4 (pescado) en la pasta mientras adaptaciones para platos equivalentes no lo incluyen. Esto se señala en la interfaz. Para cualquier alergia, sigue las pautas confirmadas por el centro y ALBI Canarias.

Los valores nutricionales son los publicados, no una valoración médica individual.

## Próximos pasos

1. Biblioteca fotográfica validada para **cada receta**, no reutilizar fotos incorrectas.
2. Importador por meses con validación y comparador de alérgenos; panel de administración privado.
3. Múltiples colegios, perfiles locales por hijo, historial y seguimiento de modificaciones del comedor.
4. Pruebas automatizadas de interfaz en varios tamaños tras instalar dependencias.

## Créditos

Información de comidas: CEIP Veinte de Enero / ALBI Canarias. Las imágenes son ilustrativas.

### Vista previa sin instalar Node

Abre `demo.html` en el navegador: contiene una demostración **autónoma** con los datos de octubre incrustados. Sirve para probar la selección de menú, el calendario, la bandeja y las cenas antes de desplegar Next.js. La aplicación que se publica normalmente se encuentra en `app/`.

## Cambios de la versión 2

- Fotografías específicas de las seis elaboraciones identificadas en los menús de finales de octubre; sin emojis de platos incorrectos.
- Las elaboraciones sin fotografía verificada muestran un marcador neutro con el nombre, sin inventar una imagen.
- Tipografía de platos ampliada.
- Eliminadas las notas de procedencia del PDF de la pantalla principal, manteniendo advertencias importantes de alérgenos.

## Versión 3 · fotografía integrada

- Los días 26, 27, 28 y 30 de octubre, únicamente en el menú **basal**, muestran una composición fotográfica completa con alimentos dentro de los compartimentos de la bandeja (sin platos de loza, recuadros ni pictogramas superpuestos). Son imágenes **ilustrativas**, no fotografías reales del comedor.
- La bandeja mantiene cuatro zonas táctiles transparentes para consultar la información oficial de primer plato, segundo plato, agua y postre.
- En los demás días y en menús adaptados, se muestran los **nombres reales dentro de los compartimentos vacíos** en lugar de imágenes incorrectas, hasta disponer de composiciones verificadas. No se atribuyen a menús alérgicos fotos de la versión basal.
- La versión autónoma `demo.html` también incorpora estas composiciones y funciona sin conexión.
- Para desplegar la aplicación Next.js basta con instalar las dependencias y ejecutar `npm run build`.

### Estado de las imágenes de octubre

El menú basal cuenta con fotografías de bandeja completa para los días 26, 27, 28 y 30. Los demás 15 días están cargados con sus platos y datos, pero **sin fotografías finales aprobadas**. Los menús especiales muestran sus platos y datos propios sin reutilizar una bandeja fotográfica del basal que pueda contener ingredientes incompatibles. Nunca se debe interpretar una fotografía ilustrativa como comprobación de ingredientes o alérgenos.

## Biblioteca visual por familias (actualización)

`public/assets` contiene **25 imágenes de comida por categoría**, además de bandejas base azul y roja, agua y cubiertos en PNG con transparencia. El componente `components/Tray.jsx` compone la bandeja por capas. `lib/image-categories.js` selecciona imágenes de forma aproximada por palabras clave, nunca a partir de la lista de alérgenos.

Las imágenes son meramente ilustrativas; en adaptaciones con ingrediente incompatible, algunas ilustraciones se omiten. La bandeja azul se usa con menú basal y la roja con dietas por alergia; sin cerdo es una preferencia/restricción no necesariamente alérgica.

## Fuente oficial y seguimiento del próximo mes

El centro publica sus PDF en estas secciones de su web:

- https://www3.gobiernodecanarias.org/medusa/edublog/ceipveintedeenero/?cat=106
- https://www3.gobiernodecanarias.org/medusa/edublog/ceipveintedeenero/?cat=109
- https://www3.gobiernodecanarias.org/medusa/edublog/ceipveintedeenero/

El flujo de GitHub Actions `.github/workflows/detectar-pdf.yml` **revisa todos los días del 25 al 7 y cada lunes fuera de ese periodo**, descarga y archiva PDF nuevos en `pdf-oficiales/` e incorpora una entrada a `data/official-documents.json`. Abre una incidencia para que se revise el documento. Necesita activar Actions y permitir `GITHUB_TOKEN` con permisos de escritura (`Contents` e `Issues`). Puede ejecutarse manualmente desde la pestaña Actions.

**No cambia automáticamente los menús publicados en la web.** Se necesita validar fechas, 10 modalidades, alérgenos y aportes nutricionales antes de incorporarlos. El importador de octubre no es genérico y no debe ejecutarse a ciegas con noviembre. Paralelamente, hay un seguimiento de ChatGPT que avisará cuando detecte el PDF mensual.

Si el archivo desaparece de la página oficial o la estructura HTML cambia, el monitor puede requerir ajuste.
