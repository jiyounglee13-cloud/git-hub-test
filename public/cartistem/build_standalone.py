#!/usr/bin/env python3
# 카티스템 상담 시스템을 '단일 HTML 파일'로 묶는 빌드 스크립트.
# - 모든 이미지를 base64 data URI로 인라인
# - 자료 페이지(작용기전/생산/사례/실손/공식deck)는 파일 내부에서 iframe(srcdoc)으로 전환
# 결과물: consult-standalone.html (전체), consult-standalone-lite.html (44p deck 제외)
import base64, json, re, pathlib

BASE = pathlib.Path(__file__).resolve().parent
IMGDIR = BASE / 'img'

def datauri(p: pathlib.Path) -> str:
    mime = 'image/png' if p.suffix.lower() == '.png' else 'image/jpeg'
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

URI = {f"img/{p.name}": datauri(p) for p in sorted(IMGDIR.iterdir())
       if p.suffix.lower() in ('.png', '.jpg', '.jpeg')}

def inline_static(html: str) -> str:
    for k in sorted(URI, key=len, reverse=True):
        html = html.replace(k, URI[k])
    return html

BACKLINK = re.compile(r'href="consult\.html#[a-z]+"')
BACK_REPL = 'href="#" onclick="parent.postMessage(\'closeDoc\',\'*\');return false;"'

def prep_material(name: str) -> str:
    html = (BASE / name).read_text(encoding='utf-8')
    html = inline_static(html)
    html = BACKLINK.sub(BACK_REPL, html)
    return html

def prep_deck(name: str) -> str:
    html = (BASE / name).read_text(encoding='utf-8')
    deck_uris = {k: v for k, v in URI.items() if k.startswith('img/deck_')}
    inject = "var IMG=" + json.dumps(deck_uris, ensure_ascii=False) + ";\n"
    html = html.replace('<script>', '<script>\n' + inject, 1)
    html = html.replace("src=\"img/deck_'+pad(p)+'.jpg\"",
                        "src=\"'+IMG['img/deck_'+pad(p)+'.jpg']+'\"")
    html = BACKLINK.sub(BACK_REPL, html)
    # NOTE: deck images are looked up via the IMG map at runtime; do NOT run
    # inline_static here or it would replace the IMG map KEYS (img/deck_XX.jpg)
    # with data URIs and break the lookup. The deck has no static img refs.
    return html

# '공식 제품 설명자료 전체보기' 버튼(제품정보 탭) 제거용
PDECKBTN = re.compile(r"\s*h\+='<a class=\"pdeckbtn\".*?</a>';")

def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False).replace('</', '<\\/')

def build(include_deck: bool, outname: str):
    docs = {
        'mechanism': prep_material('material-mechanism.html'),
        'production': prep_material('material-production.html'),
        'cases': prep_material('material-cases.html'),
        'insurance': prep_material('material-insurance-playbook.html'),
    }
    if include_deck:
        docs['deck'] = prep_deck('product-deck.html')

    docs_js = "var DOCS={" + ",".join(f"{json.dumps(k)}:{js_string(v)}" for k, v in docs.items()) + "};"

    overlay = '''
<div id="docview" style="display:none;position:fixed;inset:0;z-index:200;background:#fff">
  <button onclick="closeDoc()" style="position:fixed;right:12px;top:12px;z-index:210;border:0;background:rgba(20,32,46,.82);color:#fff;font:600 13px/1 'IBM Plex Sans KR',sans-serif;border-radius:999px;padding:9px 15px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)">✕ 닫기</button>
  <iframe id="docframe" style="width:100%;height:100%;border:0" referrerpolicy="no-referrer"></iframe>
</div>
<script>
__DOCS__
var DMAP={'material-mechanism':'mechanism','material-production':'production','material-cases':'cases','material-insurance-playbook':'insurance','product-deck':'deck'};
function openDoc(k){var d=DOCS[k];if(!d){alert('이 자료는 단일 파일(라이트) 버전에는 포함되지 않았습니다.\\n온라인 버전에서 확인해 주세요.');return;}var f=document.getElementById('docframe');f.srcdoc=d;document.getElementById('docview').style.display='block';document.body.style.overflow='hidden';}
function closeDoc(){document.getElementById('docview').style.display='none';document.getElementById('docframe').srcdoc='';document.body.style.overflow='';}
window.addEventListener('message',function(e){if(e&&e.data==='closeDoc')closeDoc();});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';var m=h.match(/(material-mechanism|material-production|material-cases|material-insurance-playbook|product-deck)\\.html/);if(m){e.preventDefault();openDoc(DMAP[m[1]]);}});
</script>
'''.replace('__DOCS__', docs_js)

    shell = (BASE / 'consult.html').read_text(encoding='utf-8')
    shell = inline_static(shell)
    if not include_deck:
        # 라이트: 제품정보 탭의 '공식 제품 설명자료 전체보기' 칸 제거(용량↓)
        shell = PDECKBTN.sub('', shell)
    shell = shell.replace('</body>', overlay + '\n</body>')

    out = BASE / outname
    out.write_text(shell, encoding='utf-8')
    mb = out.stat().st_size / 1024 / 1024
    print(f"{outname}: {mb:.1f} MB")
    return out

if __name__ == '__main__':
    print(f"images inlined: {len(URI)}")
    build(True, 'consult-standalone.html')
    build(False, 'consult-standalone-lite.html')
