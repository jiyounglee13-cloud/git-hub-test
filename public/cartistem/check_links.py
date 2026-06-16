#!/usr/bin/env python3
"""카티스템 상담앱 자산/링크 깨짐 점검 (CI용).

- 각 HTML이 참조하는 img/ 파일 존재 확인
- HTML 간 링크(href="*.html") 대상 파일 존재 확인
- product-deck.html 의 SECTIONS 페이지마다 deck 이미지(deck_NN.jpg) 존재 확인
- <script> 블록 JS 문법 검사(node 있으면)

문제가 있으면 stderr로 출력하고 exit 1.
"""
import re, sys, subprocess, shutil
from pathlib import Path

BASE = Path(__file__).resolve().parent
htmls = sorted(p for p in BASE.glob('*.html') if 'standalone' not in p.name)
errors = []
checked = {'img': 0, 'link': 0, 'deck': 0, 'js': 0}

IMG_RE  = re.compile(r'img/[\w\-]+\.(?:png|jpe?g|webp|svg)')
LINK_RE = re.compile(r'href=\\?["\']([\w\-./]+?\.html)')

for h in htmls:
    t = h.read_text(encoding='utf-8')
    for token in sorted(set(IMG_RE.findall(t))):
        checked['img'] += 1
        if not (BASE / token).exists():
            errors.append(f'[IMG MISSING] {h.name} → {token}')
    for link in sorted(set(LINK_RE.findall(t))):
        if link.startswith(('http://', 'https://')):
            continue
        name = link.split('/')[-1].split('#')[0]
        checked['link'] += 1
        if not (BASE / name).exists():
            errors.append(f'[LINK MISSING] {h.name} → {link}')

# product-deck SECTIONS → deck 이미지 존재 확인
deck = (BASE / 'product-deck.html')
if deck.exists():
    dt = deck.read_text(encoding='utf-8')
    pages = set(int(n) for n in re.findall(r'pages:\[([\d,\s]+)\]', dt) for n in re.findall(r'\d+', n))
    for p in sorted(pages):
        checked['deck'] += 1
        f = BASE / f'deck_{p:02d}.jpg'
        if not (BASE / 'img' / f.name).exists():
            errors.append(f'[DECK MISSING] product-deck p{p} → img/deck_{p:02d}.jpg')

# JS 문법 검사 (node 있을 때)
node = shutil.which('node')
if node:
    for h in htmls:
        t = h.read_text(encoding='utf-8')
        js = '\n;\n'.join(re.findall(r'<script>(.*?)</script>', t, re.S))
        if not js.strip():
            continue
        checked['js'] += 1
        tmp = BASE / f'.__chk_{h.stem}.js'
        tmp.write_text(js, encoding='utf-8')
        r = subprocess.run([node, '--check', str(tmp)], capture_output=True, text=True)
        tmp.unlink(missing_ok=True)
        if r.returncode != 0:
            errors.append(f'[JS SYNTAX] {h.name}: {r.stderr.strip().splitlines()[-1] if r.stderr else "error"}')
else:
    print('note: node 미설치 → JS 문법 검사 건너뜀')

print(f'점검 완료 — img:{checked["img"]} · link:{checked["link"]} · deck:{checked["deck"]} · js:{checked["js"]} (파일 {len(htmls)}개)')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    print(f'\n❌ 문제 {len(errors)}건 발견', file=sys.stderr)
    sys.exit(1)
print('✅ 깨진 이미지/링크 없음')
