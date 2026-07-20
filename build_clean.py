#!/usr/bin/env python3
"""Restructure Coral & Cord site: clean URLs + full SEO. Run from repo root."""
import re, os, json

BASE = "https://techilaau.github.io/Coral-And-Cord-Website/"

COLLECTIONS = {
 "bluewater":      ("bw","Bluewater","#123F56","01","Built for long days. Made for bluewater.","banner-bluewater.jpg"),
 "mangrove":       ("mg","Mangrove Roots","#5C6B3C","02","Grounded by nature. Driven by adventure.","banner-mangrove.jpg"),
 "ribbonreef":     ("rr","Ribbon Reef","#2E7D8D","04","Inspired by the vibrant life and colours of the Great Barrier Reef.","hero.jpg"),
 "sunsetcurrent":  ("sc","Sunset Current","#E86F51","05","Inspired by vibrant skies and the energy of the reef.","banner-sunsetcurrent.jpg"),
 "electricreef":   ("er","Electric Reef","#B0447E","06","Bold colours. Untamed waters. Made to stand out.","banner-electricreef.jpg"),
 "tropictide":     ("tt","Tropic Tide","#65C9D6","08","Colour straight off the reef, built for the tropics.","story_reef.jpg"),
}
TYPES = {
 "shirt": ("Long Sleeve Shirt", 79.95),
 "hoodie":("Hooded Shirt", 89.95),
 "shorts":("Boardshorts", 69.95),
 "buff":  ("Performance Buff", 34.95),
}

def read(f): return open(f, encoding="utf-8").read()
def write(path, s):
    d = os.path.dirname(path)
    if d: os.makedirs(d, exist_ok=True)
    open(path, "w", encoding="utf-8").write(s)

# ---------- link + asset rewriting ----------
def relink(s, depth):
    P = "../" * depth
    # assets
    s = s.replace('src="assets/', f'src="{P}assets/')
    s = s.replace("url('assets/", f"url('{P}assets/")
    s = s.replace('href="assets/', f'href="{P}assets/')
    # JS-built asset refs inside inline scripts (banner/meta config, art images)
    s = s.replace('"assets/', f'"{P}assets/')  # safe post-src replace: catches META banners etc.
    # undo doubles created by the broad pass
    s = s.replace(f'src="{P}{P}assets/', f'src="{P}assets/').replace(f"url('{P}{P}assets/", f"url('{P}assets/")
    # page links (order matters: longest first)
    s = re.sub(r'href="collection\.html\?c=([a-z]+)"', lambda m: f'href="{P}collections/{m.group(1)}/"', s)
    s = re.sub(r'href="product\.html\?id=([a-z-]+)"', lambda m: f'href="{P}products/{m.group(1)}/"', s)
    s = re.sub(r'href="collections\.html(\?[^"]*)?"', lambda m: f'href="{P}shop/{m.group(1) or ""}"', s)
    s = s.replace('href="index.html#', f'href="{P}#').replace('href="index.html"', f'href="{P}"')
    for page in ("about","journal","care"):
        s = s.replace(f'href="{page}.html#', f'href="{P}{page}/#')
        s = s.replace(f'href="{page}.html"', f'href="{P}{page}/"')
    # JS link builders (concat literals)
    s = s.replace("product.html?id='+p.id+'", f"{P}products/'+p.id+'/")
    s = s.replace("product.html?id='+x.id+'", f"{P}products/'+x.id+'/")
    s = s.replace("collection.html?c='+slug+'", f"{P}collections/'+slug+'/")
    s = s.replace("collection.html?c='+p.slug+'", f"{P}collections/'+p.slug+'/")
    s = s.replace("collections.html?cat='+p.catKey+'", f"{P}shop/?cat='+p.catKey+'")
    s = s.replace('location.replace("collections.html")', f'location.replace("{P}shop/")')
    s = s.replace('href="?cat=', 'href="?cat=')  # shop sidebar stays query-based
    return s

# ---------- SEO head injection ----------
def seo_head(s, *, title, desc, path, og_image, jsonld=None):
    s = re.sub(r'<title>[^<]*</title>', f'<title>{title}</title>', s, 1)
    s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', s, 1)
    url = BASE + path
    block = f'''<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Coral &amp; Cord">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:image" content="{og_image}">
'''
    if jsonld:
        block += f'<script type="application/ld+json">{json.dumps(jsonld)}</script>\n'
    return s.replace("</head>", block + "</head>", 1)

# ================= read sources =================
import subprocess
def git_src(name):
    return subprocess.run(["git","show","f870698:"+name+".html"],capture_output=True,text=True).stdout
src = {f: git_src(f) for f in
       ["index","collections","product","collection","about","journal","care"]}

# ================= root: index =================
s = relink(src["index"], 0)
org = {"@context":"https://schema.org","@type":"Organization","name":"Coral & Cord",
       "url":BASE,"logo":BASE+"assets/hero.jpg",
       "description":"Premium Australian fishing apparel inspired by the Great Barrier Reef."}
s = seo_head(s, title="Coral & Cord — Premium Fishing Apparel Inspired by the Great Barrier Reef",
    desc="Technical fishing shirts, hoodies, shorts and buffs with reef-inspired artwork. UPF 50+, quick dry, Australian owned. Free shipping over $150.",
    path="", og_image=BASE+"assets/hero.jpg", jsonld=org)
write("index.html", s)

# ================= /shop/ =================
s = relink(src["collections"], 1)
s = seo_head(s, title="Shop All — Coral & Cord Fishing Apparel",
    desc="Shop UPF 50+ fishing shirts, hooded shirts, boardshorts and performance buffs across eight reef-inspired collections.",
    path="shop/", og_image=BASE+"assets/cat_shirts.jpg")
write("shop/index.html", s)

# ================= /about /journal /care =================
meta_simple = {
 "about":  ("Our Story — Coral & Cord","Born on the Great Barrier Reef. How Coral & Cord turns real reefs into wearable artwork on technical fishing apparel.","assets/story_reef.jpg"),
 "journal":("The Journal — Coral & Cord","Design notes, reef guides and fishing stories from the Coral & Cord crew.","assets/hero.jpg"),
 "care":   ("Customer Care — Coral & Cord","Shipping, 30-day returns, size guide and contact for Coral & Cord fishing apparel.","assets/cat_buffs.jpg"),
}
for page,(t,d,img) in meta_simple.items():
    s = relink(src[page], 1)
    s = seo_head(s, title=t, desc=d, path=page+"/", og_image=BASE+img)
    write(f"{page}/index.html", s)

# ================= /collections/<slug>/ =================
for slug,(key,name,accent,num,tag,banner) in COLLECTIONS.items():
    s = relink(src["collection"], 2)
    # hard-set the slug (no query param needed)
    s = s.replace('var slug=new URLSearchParams(location.search).get("c")||"sunsetcurrent";',
                  f'var slug="{slug}";')
    crumbs = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":BASE},
        {"@type":"ListItem","position":2,"name":"Collections","item":BASE+"shop/"},
        {"@type":"ListItem","position":3,"name":name,"item":BASE+f"collections/{slug}/"}]}
    s = seo_head(s, title=f"{name} Collection — Coral & Cord",
        desc=f"{tag} Shop the {name} fishing shirt, hooded shirt, boardshorts and buff. UPF 50+, reef-inspired artwork.",
        path=f"collections/{slug}/", og_image=BASE+"assets/"+banner, jsonld=crumbs)
    write(f"collections/{slug}/index.html", s)

# ================= /products/<id>/ =================
for slug,(key,name,accent,num,tag,banner) in COLLECTIONS.items():
    for t,(label,price) in TYPES.items():
        pid = f"{key}-{t}"
        newset = slug in ("bluewater","electricreef","ribbonreef")
        ext = "jpg" if newset else "png"
        img = f"assets/{slug}-front.{ext}" if t=="shirt" else f"assets/{slug}-{t}.{ext}"
        s = relink(src["product"], 2)
        s = re.sub(r'var id=new URLSearchParams\(location\.search\)\.get\("id"\)[^;]*;',
                   f'var id="{pid}";', s)
        product_ld = {"@context":"https://schema.org","@type":"Product",
            "name":f"{name} {label}","image":[BASE+img],
            "description":f"{name} {label} with reef-inspired artwork. UPF 50+ sun protection, moisture wicking, quick dry.",
            "brand":{"@type":"Brand","name":"Coral & Cord"},
            "offers":{"@type":"Offer","priceCurrency":"AUD","price":f"{price:.2f}",
                      "availability":"https://schema.org/InStock",
                      "url":BASE+f"products/{pid}/"}}
        s = seo_head(s, title=f"{name} {label} — Coral & Cord",
            desc=f"{name} {label} — UPF 50+ technical fishing apparel with hand drawn reef artwork. ${price:.2f} AUD, free shipping over $150.",
            path=f"products/{pid}/", og_image=BASE+img, jsonld=product_ld)
        write(f"products/{pid}/index.html", s)

# ================= redirect stubs for old .html URLs =================
def stub(target_js, canonical):
    return f'''<!DOCTYPE html><html lang="en-AU"><head><meta charset="UTF-8">
<title>Coral &amp; Cord</title><link rel="canonical" href="{canonical}">
<meta name="robots" content="noindex"><script>{target_js}</script>
<meta http-equiv="refresh" content="0;url={canonical}"></head>
<body><p>Redirecting… <a href="{canonical}">Continue to Coral &amp; Cord</a></p></body></html>'''

write("collections.html", stub(
  'var q=new URLSearchParams(location.search);location.replace("shop/"+(q.toString()?("?"+q.toString()):""));', BASE+"shop/"))
write("collection.html", stub(
  'var c=new URLSearchParams(location.search).get("c")||"sunsetcurrent";location.replace("collections/"+c+"/");', BASE+"collections/sunsetcurrent/"))
write("product.html", stub(
  'var i=new URLSearchParams(location.search).get("id");location.replace(i?("products/"+i+"/"):"shop/");', BASE+"shop/"))
for page in ("about","journal","care"):
    write(page+".html", stub(f'location.replace("{page}/"+location.hash);', BASE+page+"/"))

# ================= robots.txt + sitemap.xml + 404 =================
urls = [BASE, BASE+"shop/", BASE+"about/", BASE+"journal/", BASE+"care/"]
urls += [BASE+f"collections/{s}/" for s in COLLECTIONS]
urls += [BASE+f"products/{COLLECTIONS[s][0]}-{t}/" for s in COLLECTIONS for t in TYPES]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n"
write("sitemap.xml", sm)
write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")

f04 = read("about/index.html")  # reuse shell? simpler custom:
write("404.html", f'''<!DOCTYPE html><html lang="en-AU"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Coral &amp; Cord</title>
<meta name="robots" content="noindex"><style>
body{{font-family:Georgia,serif;background:#F4EFEA;color:#0F2B46;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;margin:0}}
h1{{font-size:2.6rem;font-weight:600;margin:0 0 .6rem}}p{{color:#5c6b73;font-family:-apple-system,sans-serif}}
a{{display:inline-block;margin-top:1.4rem;background:#0F2B46;color:#fff;text-decoration:none;padding:14px 30px;border-radius:40px;font-family:-apple-system,sans-serif;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600}}
</style></head><body><div><h1>Gone with the tide.</h1><p>That page has drifted off the reef.</p>
<a href="{BASE}">Back to Coral &amp; Cord</a></div></body></html>''')

# strip retired collections from footers of every generated page
import glob as _g
removed = 0
for fp in _g.glob("**/index.html", recursive=True) + ["index.html"]:
    try: txt = open(fp).read()
    except: continue
    o = txt
    txt = re.sub(r'<a href="[^"]*collections/reeftopo/">Reef Topography</a>', "", txt)
    txt = re.sub(r'<a href="[^"]*collections/coralgarden/">Coral Garden</a>', "", txt)
    txt = re.sub(r'<article class="prod" data-id="(?:rt|cg)-[a-z]+">.*?</article>\s*', "", txt, flags=re.S)
    if fp.endswith("about/index.html"):
        txt = txt.replace("url('../assets/story_reef.jpg') center/cover", "url('../assets/about-hero.jpg') center/cover")
    txt = txt.replace('id="rt-shirt"', 'id="rr-shirt"')
    for sl in ("bluewater","electricreef","ribbonreef"):
        for t in ("front","back","hoodie","shorts","buff"):
            txt = txt.replace(f"{sl}-{t}.png", f"{sl}-{t}.jpg")
    if txt != o:
        open(fp,"w").write(txt); removed += 1
print("footer links stripped from", removed, "pages")
print("Generated:", len(urls), "pages in sitemap")
print("Tree: /shop /about /journal /care /collections(8) /products(32) + stubs + robots + sitemap + 404")
