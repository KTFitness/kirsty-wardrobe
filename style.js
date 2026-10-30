/* Kirsty's outfit engine: builds outfits around one chosen piece.
   Rules come from her styling sessions: friendly colour clashes, mixed pattern types,
   no navy or plain white with the red/blue striped skirt, no forest green with tomato red. */
(function(){
const FAM_WORDS=[
 ["navy",["navy"]],["forest",["forest","bottle","olive","khaki"]],["mint",["mint","sage"]],
 ["coral",["coral","salmon","peach"]],["lilac",["lilac","lavender","purple"]],
 ["sky",["sky","pale blue","light blue","baby blue","aqua","chambray"]],
 ["blue",["cornflower","cobalt","mid blue","mid-blue","blue"]],
 ["pink",["pink","magenta","rose","fuchsia"]],["red",["red","tomato","cherry"]],
 ["orange",["orange","tangerine","rust","cinnamon","burnt"]],["yellow",["yellow","butter","lemon","mustard","ochre"]],
 ["green",["green","emerald","kelly","apple","jade"]],["brown",["brown","chocolate"]],
 ["tan",["tan","camel","oatmeal","natural","beige","stone"]],["cream",["cream","ecru","ivory","off-white"]],
 ["white",["white"]],["black",["black"]],["grey",["grey","gray","charcoal"]],["denim",["denim"]],["multi",["multicolour","multi"]]
];
function fam(c){c=String(c).toLowerCase();
  if(c.includes("denim")&&!c.includes("white")&&!c.includes("black"))return "denim";
  if(c.includes("white denim"))return "white"; if(c.includes("black denim"))return "black";
  for(const [f,ws] of FAM_WORDS) if(ws.some(w=>c.includes(w))) return f; return null;}
const NEUTRAL=new Set(["white","cream","tan","grey","denim","black"]);
const NAME={red:"red",pink:"pink",coral:"coral",orange:"orange",yellow:"yellow",mint:"mint",green:"green",forest:"dark green",sky:"sky blue",blue:"blue",navy:"navy",lilac:"lilac",brown:"chocolate brown"};
const M={};function set(a,b,v){M[a+"|"+b]=v;M[b+"|"+a]=v;}
[["red","pink",3],["red","coral",0],["red","orange",-2],["red","yellow",2],["red","mint",1],["red","green",-1],["red","forest",-3],["red","sky",3],["red","blue",3],["red","navy",1],["red","lilac",0],["red","brown",2],
 ["pink","coral",1],["pink","orange",2],["pink","yellow",2],["pink","mint",3],["pink","green",3],["pink","forest",1],["pink","sky",2],["pink","blue",2],["pink","navy",2],["pink","lilac",1],["pink","brown",2],
 ["coral","orange",1],["coral","yellow",1],["coral","mint",3],["coral","green",2],["coral","forest",1],["coral","sky",2],["coral","blue",2],["coral","navy",2],["coral","lilac",1],["coral","brown",2],
 ["orange","yellow",1],["orange","mint",3],["orange","green",2],["orange","forest",1],["orange","sky",2],["orange","blue",3],["orange","navy",2],["orange","lilac",3],["orange","brown",2],
 ["yellow","mint",1],["yellow","green",1],["yellow","forest",0],["yellow","sky",3],["yellow","blue",3],["yellow","navy",2],["yellow","lilac",3],["yellow","brown",2],
 ["mint","green",0],["mint","forest",-1],["mint","sky",2],["mint","blue",2],["mint","navy",3],["mint","lilac",2],["mint","brown",2],
 ["green","forest",0],["green","sky",2],["green","blue",2],["green","navy",2],["green","lilac",1],["green","brown",2],
 ["forest","sky",0],["forest","blue",1],["forest","navy",0],["forest","lilac",0],["forest","brown",2],
 ["sky","blue",1],["sky","navy",1],["sky","lilac",1],["sky","brown",2],["blue","navy",0],["blue","lilac",1],["blue","brown",2],
 ["navy","lilac",1],["navy","brown",2],["lilac","brown",1]].forEach(x=>set(...x));
function pair(a,b){
  if(a==="multi"||b==="multi")return 1;
  if(a===b)return NEUTRAL.has(a)?0.5:1;
  const na=NEUTRAL.has(a),nb=NEUTRAL.has(b);
  if(na&&nb){if((a==="black"&&b==="navy")||(a==="navy"&&b==="black"))return -1;return 0.5;}
  if(na||nb){const n=na?a:b,c=na?b:a;if(n==="black"&&c==="navy")return -1;if(n==="black"&&c==="brown")return 0;return 1;}
  return M[a+"|"+b]??0.5;}
const lc=it=>(it.name+" "+(it.notes||"")+" "+(it.pattern||"")).toLowerCase();
function families(it){if(!it._f){const s=new Set();(it.colours||[]).forEach(c=>{const f=fam(c);if(f)s.add(f);});it._f=[...s];}return it._f;}
function mainFams(it){return families(it).slice(0,2);}
function pkind(it){const p=String(it.pattern||"").toLowerCase();if(/^solid/.test(p))return null;
  if(/stripe|breton/.test(p))return "stripe"; if(/gingham|check|tartan|plaid|windowpane|checker/.test(p))return "check";
  if(/leopard/.test(p))return "animal"; if(/dot|spot/.test(p))return "dot";
  if(/floral|flower|daisy|rose|tulip|folk/.test(p))return "floral";
  if(/print|embroider|penguin|tile|geometric|jacquard|medallion|lobster|graphic/.test(p))return "print";
  return null;}
const KIND={stripe:"stripes",check:"check",animal:"leopard",dot:"spots",floral:"florals",print:"print"};
function pscale(it){const p=lc(it);if(/micro|fine|small|pin /.test(p))return 1;if(/jumbo|wide|large|big|bold/.test(p))return 3;return 2;}
function formality(it){const s=lc(it);
  if(it.category==="shoes"){if(/kitten|heeled|heel/.test(s))return 3;if(/knee-high|knee boots/.test(s))return 2.3;if(/doc/.test(s))return 1.6;if(/sneaker|gazelle/.test(s))return 1.2;return 1.8;}
  if(/band tee|sweatshirt|track|crochet|guns/.test(s))return 1.1;
  if(it.category==="shorts")return 1.3;
  if(/\btee\b|t-shirt|tank|polo/.test(s))return 1.6;
  if(/dress pants|blazer|velvet|sequin|satin|silk|broderie|cutwork|midi dress|maxi|appliqué|turtleneck|mock-neck/.test(s))return 2.9;
  if(/jeans|denim|cord/.test(s))return 1.7;
  return 2.2;}
const OCC={"Everyday":1.6,"Lunch out":2.1,"Dinner out":2.7,"Smart casual":2.5,"Travel":1.6,"Holiday":1.8,"Special occasion":3};
const sleeveless=it=>/sleeveless|tank|halter|vest|cami|strapless|racer/.test(lc(it));
const isVest=it=>(it.category==="knitwear"&&/vest/.test(lc(it)))||/waistcoat/.test(lc(it));
const longSleeve=it=>/long-sleeve|long sleeve|long balloon|turtleneck|jumper|sweat|funnel|cardigan|blazer|jacket|coat/.test(lc(it));
// A busy piece (Ghanda checkerboard cardigan) only goes with block colours: no second pattern of any kind.
const busyClash=ps=>{const cl=ps.filter(p=>p&&!["shoes","bags","accessories"].includes(p.category));return cl.some(p=>p.busy)&&cl.filter(p=>pkind(p)).length>1;};
const isWarmLayer=it=>it.category==="outerwear"||(it.category==="knitwear"&&/cardigan/.test(lc(it)));
const isUnder=it=>(it.category==="tops"||it.category==="knitwear")&&/basic-white-tee|basic-white-fitted-tee|basic-black-tee|basic-grey-tee|basic-black-relaxed-tee|basic-grey-relaxed-tee|basic-white-ls-crew|basic-pale-pink-ls|basic-white-linen|basic-black-turtleneck|fleece-turtleneck|uniqlo-light-blue-turtleneck|mock-neck|stripe long-sleeve|breton long-sleeve|navy-stripe-long/.test(it.id+" "+lc(it))&&!sleeveless(it);
const inSeason=(it,season)=>!it.seasons||!it.seasons.length||it.seasons.includes(season);
const short=it=>it.name.replace(/^(Gingham|Stripe|Dots) No\. \d+: /,"").replace(/^(Gorman|Boden|Zara|COS|Sportsgirl|Ghanda|Marcs|Sass|Alessandra|Country Road|Mimco|Witchery|New Look|M&S|Primark) /,"").replace(/^./,c=>c.toLowerCase());

function score(pieces,ctx){
  const clothes=pieces.filter(p=>p.category!=="shoes"&&p.category!=="bags");
  let s=0,n=0,best=null;
  for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++){
    const w=(pieces[i].category==="shoes"||pieces[j].category==="shoes")?0.5:1;
    for(const a of mainFams(pieces[i]))for(const b of mainFams(pieces[j])){const v=pair(a,b);s+=v*w;n+=w;
      if(!NEUTRAL.has(a)&&!NEUTRAL.has(b)&&a!==b&&a!=="multi"&&b!=="multi"&&(!best||v>best.v))best={a,b,v,i:pieces[i],j:pieces[j]};
      if(v<=-2)s-=2;}}
  s=n?s/n*3:0;
  const cols=new Set();clothes.forEach(p=>mainFams(p).forEach(f=>{if(!NEUTRAL.has(f)&&f!=="multi")cols.add(f);}));
  if(cols.size>3)s-=(cols.size-3)*1.2;
  const pats=clothes.filter(p=>pkind(p));
  let patNote=null;
  if(pats.length===2){const [x,y]=pats;
    if(pkind(x)===pkind(y)){s-=2.5;}else{s+=1.2+(pscale(x)!==pscale(y)?0.5:0);patNote=[x,y];}}
  else if(pats.length>2)s-=3;
  else if(pats.length===1)s+=0.6;
  // striped red/blue skirt: no navy, no plain white
  for(const p of clothes){const f=families(p);
    if(pkind(p)==="stripe"&&f.includes("red")&&(f.includes("blue")||f.includes("sky"))){
      for(const q of pieces)if(q!==p){const g=mainFams(q);if(g.includes("navy"))s-=3;if(q.basic&&g[0]==="white"&&q.category==="tops")s-=1;}}}
  const target=OCC[ctx.occ]??2;const fl=pieces.map(formality);const avg=fl.reduce((a,b)=>a+b,0)/fl.length;
  s-=Math.abs(avg-target)*1.6;
  const shoe=pieces.find(p=>p.category==="shoes");
  if(shoe){const sf=mainFams(shoe)[0];if(!NEUTRAL.has(sf)){const hit=clothes.some(p=>families(p).includes(sf));s+=hit?0.2:-1.5;}else s+=0.4;
    const d=Math.abs(formality(shoe)-target);if(d>0.6)s-=d*1.8;}
  return {s,best,patNote};
}

function reasons(o,anchor,ctx){
  const r=[];const {best,patNote,pieces}=o;
  if(o.set)r.push("Worn as the matching set.");
  if(best&&best.v>=2){const k=[best.a,best.b].sort().join("+");
    const T={"green+pink":"Pink and green, one of your strongest pairings.","pink+red":"Red and pink: a friendly clash.","mint+orange":"Orange and mint make each other brighter.",
      "blue+red":"Red and blue, picked up from your skirts.","red+sky":"Red with sky blue, like your check skirt.","mint+navy":"Navy makes mint look crisp.","coral+mint":"Coral and mint, the sorbet pairing.",
      "lilac+orange":"Orange and lilac, the lobster-skirt clash.","blue+orange":"Orange and blue sit opposite each other, so both pop.","blue+yellow":"Yellow and blue, cheerful and easy.",
      "sky+yellow":"Butter yellow with sky blue, a gentle clash.","lilac+yellow":"Yellow and lilac, soft and unexpected.","brown+mint":"Mint and chocolate, the mint-choc-chip look.","mint+pink":"Pink and mint, the sorbet pairing.","pink+sky":"Pink and sky blue, soft and fresh.","blue+pink":"Pink and blue, fresh rather than sweet.",
      "orange+pink":"Orange and pink, a warm clash.","pink+yellow":"Pink and butter yellow, sunny and sweet.","green+orange":"Orange and green, very seventies.","navy+pink":"Navy and pink, crisp and grown-up.","green+navy":"Green and navy, classic but bright.","green+sky":"Green and sky blue, fresh and outdoorsy.","blue+green":"Green and blue, fresh and outdoorsy.","red+yellow":"Red and yellow, like a picnic rug.","brown+red":"Red with chocolate brown, warm and grown-up.","brown+pink":"Pink with chocolate brown, a seventies combination."};
    r.push(T[k]||`The ${NAME[best.a]||best.a} and ${NAME[best.b]||best.b} work together.`);}
  if(patNote)r.push(`${KIND[pkind(patNote[0])]} against ${KIND[pkind(patNote[1])]}: different pattern types, so it looks deliberate.`.replace(/^./,c=>c.toUpperCase()));
  const partner=pieces.find(p=>p!==anchor&&p.basic&&p.category!=="shoes");
  if(!patNote&&partner&&r.length<2)r.push(`The plain ${short(partner)} keeps the focus on the ${short(anchor)}.`);
  const layer=pieces.find(p=>p!==anchor&&isWarmLayer(p));
  if(layer)r.push(`Add the ${short(layer)} when it's cool.`);
  const shoe=pieces.find(p=>p.category==="shoes");
  if(shoe&&shoe!==anchor){const sf=mainFams(shoe)[0],s=lc(shoe);
    if(!NEUTRAL.has(sf))r.push(`${short(shoe).replace(/^./,c=>c.toUpperCase())} pick up the ${NAME[sf]||sf}.`);
    else if(/kitten|heel/.test(s))r.push(`${short(shoe).replace(/^./,c=>c.toUpperCase())} dress it up.`);
    else if(/doc/.test(s))r.push("Docs toughen it up.");
    else if(/sneaker|gazelle/.test(s))r.push(`${short(shoe).replace(/^./,c=>c.toUpperCase())} keep it relaxed.`);
    else r.push(`Finish with ${short(shoe)}.`);}
  return r.slice(0,3).join(" ");
}


/* ---- learning from Kirsty's likes and dislikes ---- */
function shoeType(it){const s=lc(it);if(/kitten/.test(s))return "kitten heels";if(/heeled knee|heel/.test(s))return "heeled boots";if(/knee/.test(s))return "knee boots";
  if(/doc/.test(s))return "Docs";if(/sneaker|gazelle/.test(s))return "sneakers";return "flats";}
function features(pieces,occ){
  const f=[];const P=pieces;
  for(let i=0;i<P.length;i++){f.push("it:"+P[i].id);
    for(let j=i+1;j<P.length;j++){const [a,b]=[P[i].id,P[j].id].sort();f.push("ip:"+a+"|"+b);
      for(const x of mainFams(P[i]))for(const y of mainFams(P[j]))if(x&&y)f.push("cp:"+[x,y].sort().join("+"));}}
  const cl=P.filter(p=>p.category!=="shoes"&&p.category!=="bags");
  const ks=cl.map(p=>pkind(p)||"plain").sort();f.push("pat:"+ks.join("+"));
  const sh=P.find(p=>p.category==="shoes");if(sh)f.push("so:"+occ+"|"+shoeType(sh));
  return [...new Set(f)];}
const FW={it:0.4,ip:2,cp:1,pat:1,so:1.2};
function learned(pieces,ctx){let s=0;for(const k of features(pieces,ctx.occ)){const w=ctx.W[k];if(w)s+=w*(FW[k.slice(0,k.indexOf(":"))]||1);}return s;}
function lreasons(o,anchor,ctx,items){
  const cf=new Set(o.pieces.filter(p=>!["shoes","bags","accessories"].includes(p.category)).flatMap(p=>mainFams(p)));
  const top=features(o.pieces,ctx.occ).map(k=>[k,(ctx.W[k]||0)*(FW[k.slice(0,k.indexOf(":"))]||1)]).filter(x=>x[1]>0&&!x[0].startsWith("it:")&&!x[0].startsWith("so:")&&!(x[0].startsWith("cp:")&&x[0].slice(3).split("+").some(c=>!cf.has(c)))&&!(x[0].startsWith("ip:")&&x[0].slice(3).split("|").some(id=>{const it=items.find(i=>i.id===id);return !it||["shoes","bags","accessories"].includes(it.category);}))).sort((a,b)=>b[1]-a[1]).slice(0,2);
  const nm=id=>{const it=items.find(i=>i.id===id);return it?short(it):"that piece";};
  const out=top.map(([k])=>{const v=k.slice(k.indexOf(":")+1);
    if(k.startsWith("ip:")){const [a,b]=v.split("|");return `You liked the ${nm(a)} with the ${nm(b)} before.`;}
    if(k.startsWith("cp:")){const [a,b]=v.split("+");return a===b?`You've liked outfits with lots of ${NAME[a]||a}.`:`You've liked ${NAME[a]||a} with ${NAME[b]||b}.`;}
    if(k.startsWith("pat:")){const ks=v.split("+").filter(x=>x!=="plain");return ks.length>1?`You've liked mixing ${ks.map(x=>KIND[x]||x).join(" and ")}.`:ks.length?`You've liked ${KIND[ks[0]]||ks[0]} with plain pieces.`:"You've liked keeping it plain.";}
    if(k.startsWith("so:")){const [oc,t]=v.split("|");return `You've liked ${t} for ${oc.toLowerCase()}.`;}
    return null;}).filter(Boolean);
  if(o.set)out.unshift("Worn as the matching set.");
  if(!out.length)return ctx.n<8?"A fresh combination. Tell me what you think.":"Something different to try.";
  return out.join(" ");}


/* ---- jeans length guide and hair-by-neckline guide ---- */
function hem(it){if(it.category!=="trousers"||/legging/.test(it.id))return null;const s=(it.id+" "+it.name+" "+(it.notes||"").replace(/(picture|stand-in photo|your photo)[^.]*\./gi,"")+" "+(it.shape||"")).toLowerCase();
  return /crop|ankle|widecrop|above ankle/.test(s)?"crop":"full";}
function shoeKind(it){const s=lc(it);if(/loafer/.test(s))return "loafer";if(/ballet|flats|slides|mary jane/.test(s))return "flat";if(/kitten|heel/.test(s)&&!/boot/.test(s))return "heel";
  if(/boot|doc/.test(s))return "boot";if(/sneaker|gazelle|samba/.test(s))return "sneaker";if(/sandal/.test(s))return "sandal";return null;}
function hemScore(pieces){const t=pieces.find(p=>hem(p)),sh=pieces.find(p=>p.category==="shoes");if(!t||!sh)return 0;const h=hem(t),k=shoeKind(sh);
  if(h==="crop")return k==="loafer"||k==="flat"||k==="sandal"?0.5:k==="boot"?-0.8:0;
  return k==="sneaker"||k==="heel"||k==="boot"?0.4:k==="loafer"||k==="flat"?-0.9:0;}
function hemTip(pieces){const t=pieces.find(p=>hem(p)),sh=pieces.find(p=>p.category==="shoes");if(!t||!sh)return "";const h=hem(t),k=shoeKind(sh);
  if(h==="crop"&&k==="boot")return "Jeans length: a cropped hem leaves a gap over boots. Loafers or ballet flats suit this length better.";
  if(h==="full"&&(k==="flat"||k==="loafer"))return "Jeans length: a full-length hem can swamp flats. Cuff it to the ankle, or swap to sneakers, heels or boots.";
  return "";}
function hairTip(pieces){const t=pieces.find(p=>p.category==="dresses")||pieces.find(p=>(p.category==="tops"||p.category==="knitwear")&&!isWarmLayer(p));if(!t)return "";
  const s=(t.name+" "+(t.notes||"")).toLowerCase();
  if(/halter/.test(s))return "Hair: high ponytail or top knot.";
  if(/turtle|mock-neck|mock neck|funnel|stand collar|high neck/.test(s))return "Hair: sleek ponytail or low bun.";
  if(/one-shoulder|off-shoulder|strapless|bandeau/.test(s))return "Hair: low bun or soft waves.";
  if(/v-neck|deep v|wrap/.test(s))return "Hair: loose waves or a high ponytail.";
  if(/square neck|sweetheart/.test(s))return "Hair: half-up or soft curls.";
  if(/boat|bateau/.test(s))return "Hair: low bun.";
  return "";}

function suggest(anchor,items,ctx){
  const W=ctx.W||{};ctx.W=W;ctx.n=ctx.n||0;
  const seen={};(ctx.shown||[]).forEach(id=>seen[id]=(seen[id]||0)+1);
  const fresh=p=>p.reduce((t,x)=>t-(x.id!==anchor.id&&!['shoes','bags','accessories'].includes(x.category)?Math.min(seen[x.id]||0,4)*3:0),0);
  const SC=(p,c)=>{const r=ctx.rules?score(p,c):{s:0,best:null,patNote:null};r.s+=learned(p,c)+hemScore(p)+fresh(p);return r;};
  const E=ctx.rules?1:Math.max(1.3,2.5/Math.sqrt(1+ctx.n/6)+0.6);
  const season=ctx.season,rnd=mulberry(ctx.seed||1);const excl0=new Set(ctx.exclude||[]),exCore=new Set(ctx.excludeCore||[]);
  const coreKey=ps=>ps.filter(p=>!["shoes","bags","accessories"].includes(p.category)).map(p=>p.id).sort().join(",");
  const excl={has:k=>{if(excl0.has(k))return true;const ps=k.split(",").map(id=>items.find(i=>i.id===id)).filter(Boolean);return exCore.has(coreKey(ps));}};
  const pool=items.filter(i=>i.id!==anchor.id&&inSeason(i,season));
  const by=c=>pool.filter(i=>c.includes(i.category));
  let tops=by(["tops","knitwear"]).filter(i=>!isWarmLayer(i)),bottoms=by(["skirts","trousers","shorts"]),dresses=by(["dresses"]);
  let shoes=by(["shoes"]),layers=pool.filter(isWarmLayer),unders=pool.filter(isUnder),bags=by(["bags"]);
  const WI=ctx.with?items.find(i=>i.id===ctx.with&&i.id!==anchor.id):null;let forceLayer=false;
  if(WI){const c=WI.category;if(isWarmLayer(WI)){layers=[WI];forceLayer=true;}else if(c==="tops"||c==="knitwear")tops=[WI];else if(["skirts","trousers","shorts"].includes(c)){bottoms=[WI];dresses=[];}else if(c==="dresses"){dresses=[WI];bottoms=[];}else if(c==="shoes")shoes=[WI];else if(c==="bags")bags=[WI];}
  const cool=season==="Autumn"||season==="Winter";
  let cores=[];
  const ac=anchor.category;
  if(ac==="tops"||(ac==="knitwear"&&!isWarmLayer(anchor))){
    for(const b of bottoms)cores.push([anchor,b]);
  }else if(["skirts","trousers","shorts"].includes(ac)){
    for(const t of tops)cores.push([t,anchor]);
  }else if(ac==="dresses"&&(anchor.overTop||/pinafore/.test(lc(anchor)))){const U=WI&&tops.includes(WI)?[WI]:tops.filter(t=>!sleeveless(t)&&!isVest(t)&&(!anchor.overTop||!/shirt|blouse|polo/i.test(t.name.replace(/T-shirt/ig,""))));for(const t of U)cores.push([anchor,t]);
  }else if(ac==="dresses"){cores.push([anchor]);if(cool||season==="Spring")for(const l of layers)cores.push([anchor,l]);
    if(!cool)for(const u of unders.filter(u=>/linen|tee/.test(u.id)))cores.push([anchor]);}
  else{
    for(const d of dresses)cores.push([d,anchor]);
    const ts=tops.map(t=>[t,SC([t,anchor],ctx).s]).sort((a,b)=>b[1]-a[1]).slice(0,18).map(x=>x[0]);
    const bs=bottoms.map(t=>[t,SC([t,anchor],ctx).s]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
    for(const t of ts)for(const b of bs)cores.push([t,b,anchor]);
  }
  cores=cores.filter(c=>!busyClash(forceLayer&&WI?c.concat(WI):c));
  // pre-score cores, keep best
  {const sc=cores.map(c=>({c,s:SC(c,ctx).s+(rnd()*E)*1.2})).sort((a,b)=>b.s-a.s);
   const gk=c=>{const x=c.find(p=>p!==anchor&&['skirts','trousers','shorts','dresses'].includes(p.category))||c.find(p=>p!==anchor);return x?x.id:'';};
   const per={},keep=[];for(const x of sc){const k=gk(x.c);if(!WI&&(per[k]||0)>=3)continue;per[k]=(per[k]||0)+1;keep.push(x);}
   const firsts=new Set();const top=keep.filter(x=>{const k=gk(x.c);if(firsts.has(k))return false;firsts.add(k);return true;});
   cores=[...new Set(top.concat(keep.slice(0,120)))].map(x=>x.c);}
  const results=[];
  for(const core of cores){
    let pieces=core.slice();
    const top=pieces.find(p=>p.category==="tops"||p.category==="knitwear");
    if(top&&isVest(top)&&(cool||season==="Spring")){
      const u=unders.filter(u=>!pieces.includes(u)&&!busyClash(pieces.concat(u))).map(u=>[u,SC(pieces.concat(u),ctx).s]).sort((a,b)=>b[1]-a[1])[0];
      if(u)pieces.push(u[0]);
    }
    const chilly=ctx.tmax!=null&&ctx.tmax<20&&!pieces.some(longSleeve);
    const needLayer=forceLayer||chilly||(ctx.rain&&season!=="Summer"&&!(ctx.tmax>=24)&&!pieces.some(isWarmLayer))||cool&&!pieces.some(isWarmLayer)&&(pieces.some(sleeveless)||season==="Winter"||pieces.some(p=>p.category==="dresses"));
    if(needLayer&&layers.length&&!(forceLayer&&pieces.includes(WI))){const L=layers.filter(l=>!pieces.includes(l)&&!busyClash(pieces.concat(l))).map(l=>[l,SC(pieces.concat(l),ctx).s+(rnd()*E)*0.8]).sort((a,b)=>b[1]-a[1])[0];if(L)pieces.push(L[0]);}
    if(busyClash(pieces))continue;
    let alts=[];
    if(!ctx.noAccessories&&!pieces.some(p=>p.category==="shoes")&&shoes.length){
      const sh=shoes.map(x=>[x,SC(pieces.concat(x),ctx).s+(rnd()*E)*1.0]).sort((a,b)=>b[1]-a[1]);if(sh[0])pieces.push(sh[0][0]);alts=sh.slice(1,3).map(x=>x[0]);}
    if(!ctx.noAccessories&&bags.length&&!pieces.some(p=>p.category==="bags")){
      const bg=bags.map(x=>[x,SC(pieces.concat(x),ctx).s]).sort((a,b)=>b[1]-a[1])[0];if(bg&&bg[1]>-1)pieces.push(bg[0]);}
    const sc=SC(pieces,ctx);
    results.push({pieces,alts,s:sc.s+(rnd()*E)*0.6,best:sc.best,patNote:sc.patNote});
  }
  results.sort((a,b)=>b.s-a.s);
  const kOf=ps=>ps.map(p=>p.id).sort().join(",");
  if(!ctx.noAccessories)for(const r of results){if(!excl0.has(kOf(r.pieces))||exCore.has(coreKey(r.pieces)))continue;
    const sh=r.pieces.find(p=>p.category==="shoes"&&p!==anchor),bg=r.pieces.find(p=>p.category==="bags"&&p!==anchor);
    const shoeAlts=shoes.filter(x=>x!==sh).map(x=>[x,SC(r.pieces.map(p=>p===sh?x:p),ctx).s]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
    let done=false;for(const x of shoeAlts){const ps=r.pieces.map(p=>p===sh?x:p);if(!excl0.has(kOf(ps))){r.pieces=ps;r.variant=true;done=true;break;}}
    if(!done&&bg)for(const x of bags.filter(x=>x!==bg)){const ps=r.pieces.map(p=>p===bg?x:p);if(!excl0.has(kOf(ps))){r.pieces=ps;r.variant=true;break;}}}
  const out=[],used={};
  if(anchor.setWith){const mate=items.find(i=>i.id===anchor.setWith);
    if(mate){let pieces=[anchor,mate];const sh=ctx.noAccessories?null:shoes.map(x=>[x,SC(pieces.concat(x),ctx).s]).sort((a,b)=>b[1]-a[1])[0];if(sh)pieces.push(sh[0]);
      const sc=SC(pieces,ctx);out.push({pieces,s:99,best:sc.best,patNote:sc.patNote,set:true});used[mate.id]=2;}}
  let basicOnly=0,mixes=0;const seenKey=new Set(),bfam={};
  const bottomFam=r=>{const b=r.pieces.find(p=>p!==anchor&&p!==WI&&['skirts','trousers','shorts'].includes(p.category));return b?(mainFams(b)[0]||'x'):null;};
  const want=ctx.count||6;
  const hasBasic=r=>r.pieces.some(p=>p!==anchor&&p.basic&&p.category!=="shoes");
  const botOf=r=>r.pieces.find(p=>p!==anchor&&['skirts','trousers','shorts','dresses','tops','knitwear'].includes(p.category)&&(['skirts','trousers','shorts','dresses'].includes(anchor.category)?['tops','knitwear'].includes(p.category):!['tops','knitwear'].includes(p.category)));
  const wild=[];if(!WI){const fams=new Set(),bestPer=new Map();for(const r of results){const b=botOf(r);if(b&&!bestPer.has(b.id))bestPer.set(b.id,r);}
    const cand=[...bestPer.values()].map(r=>[r,rnd()]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);for(const r of cand){if(wild.length>=3)break;if(excl.has(r.pieces.map(p=>p.id).sort().join(",")))continue;const b=botOf(r);if(!b||seen[b.id])continue;const f=mainFams(b)[0];if(fams.has(f)||f==='denim'||f==='white')continue;fams.add(f);wild.push(r);}}
  const mainWant=want-wild.length;
  for(const r of results){
    if(out.length>=mainWant)break;
    if(wild.includes(r))continue;
    if(excl.has(r.pieces.map(p=>p.id).sort().join(",")))continue;
    const mains=r.pieces.filter(p=>p!==anchor&&p!==WI&&p.category!=="shoes"&&p.category!=="bags");
    const key=mains.length?null:r.pieces.map(p=>p.id).sort().join(",");
    if(key){if(seenKey.has(key))continue;seenKey.add(key);}
    if(mains.some(p=>(used[p.id]||0)>=1))continue;
    const bf=bottomFam(r);if(bf&&(bfam[bf]||0)>=2)continue;
    if(r.patNote){if(mixes>=3)continue;mixes++;}
    if(out.length===want-1&&!out.some(hasBasic)&&!hasBasic(r))continue;
    const allBasic=mains.every(p=>p.basic);
    if(allBasic&&basicOnly>=2)continue;
    if(allBasic)basicOnly++;
    mains.forEach(p=>used[p.id]=(used[p.id]||0)+1);if(bf)bfam[bf]=(bfam[bf]||0)+1;
    const sh=r.pieces.find(p=>p.category==="shoes"&&p!==anchor);
    if(sh){used["shoe:"+sh.id]=(used["shoe:"+sh.id]||0)+1;
      if(used["shoe:"+sh.id]>2&&r.alts&&r.alts.length){const alt=r.alts.find(a=>(used["shoe:"+a.id]||0)<2);
        if(alt){r.pieces=r.pieces.map(p=>p===sh?alt:p);used["shoe:"+sh.id]--;used["shoe:"+alt.id]=(used["shoe:"+alt.id]||0)+1;const sc=SC(r.pieces,ctx);r.best=sc.best;r.patNote=sc.patNote;}}}
    out.push(r);
  }
  for(const r of wild){const b=botOf(r);if(out.some(o=>o.pieces.includes(b)))continue;out.push(r);}
  if(out.length<want){const have=new Set(out.map(o=>o.pieces.map(p=>p.id).sort().join(",")));
    for(const r of results){if(out.length>=want)break;const k=r.pieces.map(p=>p.id).sort().join(",");if(have.has(k)||excl.has(k))continue;
      const mains=r.pieces.filter(p=>p!==anchor&&p!==WI&&p.category!=="shoes"&&p.category!=="bags");if(mains.some(p=>(used[p.id]||0)>=2))continue;
      const bf=bottomFam(r);if(bf&&(bfam[bf]||0)>=3)continue;if(bf)bfam[bf]=(bfam[bf]||0)+1;
      mains.forEach(p=>used[p.id]=(used[p.id]||0)+1);have.add(k);out.push(r);}}
  out.forEach(o=>{const lr=lreasons(o,anchor,ctx,items);o.why=(ctx.rules&&/fresh|different/.test(lr))?reasons(o,anchor,ctx):lr;if(o.variant)o.why="A variation on one you liked: same clothes, different shoes or bag.";o.key=o.pieces.map(p=>p.id).sort().join(",");o.tips=[hemTip(o.pieces),hairTip(o.pieces)].filter(Boolean);});
  return out;
}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function finish(pieces,items,ctx){ctx=ctx||{};ctx.W=ctx.W||{};const season=ctx.season;
  const base=pieces.filter(p=>!["shoes","bags"].includes(p.category));
  const wet=sh=>{if(!ctx.rain)return 0;const t=lc(sh);if(/slide|sandal|flat|ballet|mule|suede|gazelle|samba/.test(t))return -3;if(/boot|doc|loafer|sneaker/.test(t))return 1.5;return 0;};
  const sc=ps=>(ctx.rules?score(ps,ctx).s:0)+learned(ps,ctx)+hemScore(ps)+ps.reduce((t,x)=>t+(x.category==="shoes"?wet(x):0),0);
  const shoes=items.filter(i=>i.category==="shoes"&&inSeason(i,season)).map(x=>[x,sc(base.concat(x))]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const best=shoes[0];const bags=items.filter(i=>i.category==="bags").map(x=>[x,sc(base.concat(best?[best,x]:[x]))]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  return {shoes,bags};}

function addLayer(pieces,items,ctx){ctx=ctx||{};ctx.W=ctx.W||{};if(ctx.season==="Summer"||ctx.tmax>=24)return null;if(pieces.some(isWarmLayer)||(!ctx.rain&&pieces.some(longSleeve)))return null;
  const sc=ps=>(ctx.rules?score(ps,ctx).s:0)+learned(ps,ctx);
  const L=items.filter(i=>isWarmLayer(i)&&inSeason(i,ctx.season)&&!busyClash(pieces.concat(i))).map(x=>[x,sc(pieces.concat(x))]).sort((a,b)=>b[1]-a[1]);return L[0]?L[0][0]:null;}

/* Sub-categories, worked out from each piece's name, notes and shape. An item's own "sub" field overrides. */
const SUBS={
 tops:[["tanks","Tanks & singlets"],["vests","Vests & waistcoats"],["sstee","Short-sleeve tees & tops"],["lstee","Long-sleeve tees & tops"],["ssshirt","Short-sleeve & sleeveless shirts"],["lsshirt","Long-sleeve shirts & blouses"]],
 knitwear:[["ktank","Knit tanks"],["kvest","Knit vests"],["ktee","Knit tees & polos"],["jumper","Jumpers & sweatshirts"]],
 outerwear:[["cardigan","Cardigans & knit jackets"],["blazer","Blazers"],["jacket","Jackets"],["coat","Coats"]],
 skirts:[["mini","Short & mini"],["midi","Knee & midi"],["maxi","Maxi"]],
 jeans:[["wide","Wide-leg"],["straight","Straight & skinny"],["cropped","Cropped & ankle"]],
 trousers:[["wide","Wide-leg"],["straight","Straight & tapered"],["leggings","Leggings"]],
 shorts:[["shorts","Shorts"]],
 dresses:[["tee","T-shirt & tank dresses"],["shift","Shift & swing dresses"],["shirt","Shirt & button dresses"],["pinafore","Pinafores"],["dressy","Dressy"],["maxi","Maxi"]],
 playsuits:[["playsuit","Playsuits"],["jumpsuit","Jumpsuits"]],
 shoes:[["sneakers","Sneakers"],["flats","Flats & loafers"],["sandals","Sandals & slides"],["heels","Heels"],["boots","Boots"]],
 bags:[["crossbody","Crossbody"],["clutch","Clutches"],["tote","Totes & shoulder bags"]],accessories:[["belts","Belts"],["other","Other"]]};
function subOf(i,dc){if(i.sub)return i.sub;const n=(i.name+" "+(i.notes||"")+" "+(i.shape||"")).toLowerCase(),nm=i.name.toLowerCase();
 const sl=/sleeveless|tank|singlet|cami\b|halter|strappy|shell|racer|crop top|bandeau|tube/.test(n)&&!/long sleeve|long-sleeve|short sleeve/.test(nm);
 const ls=/long-sleeve|long sleeve|long sleeves|turtleneck|funnel|mock-neck long|balloon|blouson|three-quarter|3\/4|batwing|cuffed sleeves|roll-tab/.test(n);
 switch(dc){
 case "tops":{if(/waistcoat|vest\b/.test(nm))return "vests";if(sl&&!/shirt\b|blouse/.test(nm))return "tanks";
   const shirt=/shirt\b|blouse|popover/.test(nm)&&!/t-shirt|tee/.test(nm);if(shirt)return ls?"lsshirt":"ssshirt";if(sl)return "tanks";return ls?"lstee":"sstee";}
 case "knitwear":{if(/vest/.test(nm))return "kvest";if(sl||/tank/.test(nm))return "ktank";if(/jumper|sweat|turtleneck|pullover|funnel/.test(nm))return "jumper";return "ktee";}
 case "outerwear":{if(/cardigan|knit jacket/.test(n))return "cardigan";if(/blazer/.test(nm))return "blazer";if(/coat|trench/.test(nm))return "coat";return "jacket";}
 case "skirts":{if(/maxi/.test(n))return "maxi";if(/mini/.test(nm)||/above[ -]the[ -]knee|above[ -]knee/.test(n))return "mini";if(/midi|pencil|knee/.test(n))return "midi";return "mini";}
 case "jeans":{if(/crop|ankle/.test(nm))return "cropped";if(/wide/.test(nm))return "wide";return "straight";}
 case "trousers":{if(/legging/.test(nm))return "leggings";if(/wide|sailor|palazzo|culotte/.test(n))return "wide";return "straight";}
 case "dresses":{if(/maxi/.test(nm))return "maxi";if(/pinafore/.test(nm))return "pinafore";if(/sequin|tulle|studded|halter|ruffle|dressy|appliqu/.test(n))return "dressy";if(/t-shirt|tee dress|tank/.test(nm))return "tee";if(/shirt dress|button-front|button front/.test(nm))return "shirt";return "shift";}
 case "playsuits":return /jumpsuit/.test(nm)?"jumpsuit":"playsuit";
 case "shoes":{if(/sneaker|samba|gazelle|adidas/.test(n))return "sneakers";if(/boot|doc/.test(nm))return "boots";if(/heel|mule/.test(nm)&&!/flat/.test(nm))return "heels";if(/slide|sandal|thong/.test(nm))return "sandals";return "flats";}
 case "accessories":return /belt/.test(nm)?"belts":"other";
 case "bags":return /clutch/.test(nm)?"clutch":/tote|shoulder|bucket/.test(nm)?"tote":"crossbody";
 default:return SUBS[dc]?SUBS[dc][0][0]:"other";}}

/* Second ways to filter some categories (fabric, sleeve, length, heel). Each returns a key for a piece; an item's own field overrides. */
function txt(i){return (i.name+" "+(i.notes||"")+" "+(i.fabric||"")+" "+(i.pattern||"")+" "+(i.shape||"")).toLowerCase();}
const FACETS={
 tops:[["fabric","Fabric",[["knit","Knit & rib"],["linen","Linen"],["jersey","Jersey & T-shirt"],["cotton","Woven cotton"],["special","Lace, sequin & silk"]],i=>{if(i.fabricKind)return i.fabricKind;const t=txt(i);
   if(/lace(?!-up)|sequin|silk|satin|velvet|tulle/.test(t))return "special";if(/linen/.test(t))return "linen";if(/knit|rib\b|fine rib|crochet|pointelle|fleece|heattech/.test(t))return "knit";
   if(/shirt\b|blouse|gingham|smocked|shell|ruffle|seersucker|broderie|cutwork|poplin|voile|denim|chambray|twill|popover/.test(t)&&!/t-shirt/.test(t))return "cotton";return "jersey";}]],
 dresses:[["sleeve","Sleeves",[["sleeveless","Sleeveless"],["short","Short sleeve"],["long","Long & 3/4 sleeve"]],i=>{if(i.sleeve)return i.sleeve;const t=txt(i);
   if(/long sleeve|long-sleeve|long sleeves|three-quarter|3\/4|turtleneck|funnel/.test(t))return "long";if(/sleeveless|tank|halter|strap|one-shoulder|pinafore|cami/.test(t))return "sleeveless";return "short";}],
  ["length","Length",[["short","Knee or above"],["midi","Midi"],["maxi","Maxi"]],i=>{if(i.length)return i.length;const t=txt(i);if(/maxi/.test(t))return "maxi";if(/midi/.test(t))return "midi";return "short";}]],
 shoes:[["heel","Heel",[["flat","Flat"],["low","Low & kitten"],["mid","Mid & block"],["high","High"]],i=>{if(i.heel)return i.heel;const t=txt(i);
   if(/kitten|low-heel|low heel|low stacked/.test(t))return "low";if(/block|square-toe heeled|mid block/.test(t))return "mid";if(/heel|stiletto|slim-heel|pointed heeled/.test(t)&&!/flat/.test(i.name.toLowerCase()))return "high";return "flat";}]]};

window.Stylist={FACETS,subOf,SUBS,busyClash,addLayer,finish,coreKey:ps=>ps.filter(p=>!["shoes","bags","accessories"].includes(p.category)).map(p=>p.id).sort().join(","),suggest,features,families,pkind,formality,hemTip,hairTip};
})();
