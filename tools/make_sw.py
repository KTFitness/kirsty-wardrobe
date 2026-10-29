"""Writes sw.js: the offline cache for the home-screen app. Run after any change, before committing."""
import glob,os,json
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
v=open('version.txt').read().strip()
core=['./','index.html','style.js','data/wardrobe.json','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png']
pre=sorted(glob.glob('img/t/**/*.webp',recursive=True)+glob.glob('img/basics/*')+glob.glob('img/guides/*'))
js=f"""/* Offline support. Pages and data: network first, cached copy when offline. Pictures: cached copy first. */
const V="{v}",CORE={json.dumps(core)},PRE={json.dumps(pre)};
self.addEventListener("install",e=>{{e.waitUntil((async()=>{{const c=await caches.open("kw-"+V);await c.addAll(CORE);
  for(let i=0;i<PRE.length;i+=40){{await Promise.all(PRE.slice(i,i+40).map(u=>c.add(u).catch(()=>{{}})));}}
  const old=await caches.keys();for(const k of old)if(k!=="kw-"+V&&k.startsWith("kw-")){{const oc=await caches.open(k);for(const r of await oc.keys()){{if(/\\/img\\//.test(r.url)&&!(await c.match(r))){{const m=await oc.match(r);if(m)await c.put(r,m);}}}}}}
  self.skipWaiting();}})());}});
self.addEventListener("activate",e=>{{e.waitUntil((async()=>{{for(const k of await caches.keys())if(k!=="kw-"+V)await caches.delete(k);await self.clients.claim();}})());}});
async function netFirst(req){{const c=await caches.open("kw-"+V);
  try{{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),5000);const r=await fetch(req,{{signal:ctl.signal,cache:"no-cache"}});clearTimeout(t);if(r.ok)c.put(req,r.clone());return r;}}
  catch(err){{const m=await c.match(req,{{ignoreSearch:true}})||(req.mode==="navigate"?await c.match("index.html"):null);if(m)return m;throw err;}}}}
async function cacheFirst(req){{const c=await caches.open("kw-"+V);const m=await c.match(req,{{ignoreSearch:true}});if(m)return m;const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r;}}
self.addEventListener("fetch",e=>{{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
  if(/version\\.txt$/.test(u.pathname))return;
  if(/\\/img\\//.test(u.pathname))e.respondWith(cacheFirst(e.request));else e.respondWith(netFirst(e.request));}});
"""
open('sw.js','w').write(js);print('sw.js',v,len(pre),'pictures')
