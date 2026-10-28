#!/usr/bin/env python3
"""Detecta y archiva PDFs publicados por el colegio sin alterar menús revisados.

Se ejecuta en GitHub Actions. La automatización SOLO archiva documentos fuente;
la extracción y publicación de alérgenos requieren validación.
"""
from __future__ import annotations
import datetime as dt, json, os, re, unicodedata
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'data' / 'official-documents.json'
SCHOOL = 'https://www3.gobiernodecanarias.org/medusa/edublog/ceipveintedeenero/'
PAGES = [SCHOOL, SCHOOL + '?cat=106', SCHOOL + '?cat=109']
MONTHS = 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split()


def normalized(v: str) -> str:
    return ''.join(x for x in unicodedata.normalize('NFD', v.lower()) if not unicodedata.combining(x))


def get_month(text: str, url: str) -> str | None:
    s = normalized(text + ' ' + urlsplit(url).path)
    match = re.search(r'/20(\d{2})/(0[1-9]|1[0-2])/', s)
    if match:
        year, month = 2000 + int(match[1]), int(match[2])
        return f'{year:04}-{month:02}'
    for i, m in enumerate(MONTHS, 1):
        # Títulos habituales: MENÚ OCTUBRE’26 / MENÚ OCTUBRE 2026
        found = re.search(r'\b' + m + r"\W*(?:20)?(\d{2})\b", s)
        if found:
            return f'{2000+int(found[1]):04}-{i:02}'
    return None


def run() -> None:
    today = dt.datetime.now(dt.timezone.utc).date()
    allowed_months = {(today.year, today.month)}
    prev = (today.replace(day=1) - dt.timedelta(days=1))
    allowed_months.add((prev.year, prev.month))
    next_month = (today.replace(day=28) + dt.timedelta(days=4)).replace(day=1)
    allowed_months.add((next_month.year, next_month.month))
    old = json.loads(DB.read_text()) if DB.exists() else {'school': SCHOOL, 'documents': []}
    documents = old['documents']
    indexed = {x['url'] for x in documents}
    new = []
    errors = []
    session = requests.Session()
    session.headers['User-Agent'] = 'MiBandejaMenuMonitor/1.0 (school menu public PDFs)'
    for page_url in PAGES:
        try:
            res = session.get(page_url, timeout=30)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, 'html.parser')
            for article in soup.select('article, .post'):
                title_tag = article.select_one('h1, h2, .entry-title')
                title = title_tag.get_text(' ', strip=True) if title_tag else ''
                article_url = title_tag.find('a').get('href') if title_tag and title_tag.find('a') else page_url
                for a in article.find_all('a', href=True):
                    url = urljoin(page_url, a['href']).split('#')[0]
                    if not re.search(r'\.pdf(?:\?|$)', url, re.I):
                        continue
                    if 'gobiernodecanarias.org' not in urlsplit(url).netloc:
                        continue
                    if url in indexed:
                        continue
                    month = get_month(title, url)
                    if not month:
                        continue
                    year, num = map(int, month.split('-'))
                    if (year, num) not in allowed_months:
                        continue
                    pdf = session.get(url, timeout=55)
                    pdf.raise_for_status()
                    if not pdf.content.startswith(b'%PDF'):
                        raise ValueError('El adjunto no es un PDF válido: ' + url)
                    basename = re.sub(r'[^a-zA-Z0-9._-]', '-', urlsplit(url).path.rsplit('/', 1)[-1])
                    stored = f'pdf-oficiales/{month}-{basename}'
                    target = ROOT / stored
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(pdf.content)
                    row = {'month': month, 'title': title, 'published_at': None, 'post_url': article_url, 'url': url, 'file': stored,
                           'review': 'pendiente de validación; no apto para publicar datos de alérgenos automáticamente'}
                    documents.append(row)
                    indexed.add(url)
                    new.append(row)
        except Exception as exc:
            errors.append(f'{page_url}: {exc}')
    documents.sort(key=lambda x: (x['month'], x['url']))
    DB.write_text(json.dumps({'school': SCHOOL, 'documents': documents}, ensure_ascii=False, indent=2) + '\n')
    print(f'Documentos registrados: {len(documents)}, nuevos: {len(new)}')
    for row in new:
        print(f'Nuevo: {row["month"]}: {row["url"]}')
    if errors:
        print('Advertencias:', '\n'.join(errors))
    if len(errors) == len(PAGES):
        raise RuntimeError('No se pudo consultar ninguna página del centro')
    out = os.getenv('GITHUB_OUTPUT')
    if out:
        with open(out, 'a') as f:
            f.write(f"new_count={len(new)}\n")
            f.write('new_months=' + ', '.join(sorted({r['month'] for r in new})) + '\n')


if __name__ == '__main__':
    run()
