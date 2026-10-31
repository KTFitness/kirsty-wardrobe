"""Merge a 'Copy my taste for Claude' export into data/wardrobe.json. Usage: python3 tools/save_taste.py export.txt"""
import json,re,sys,os,datetime
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
t=open(sys.argv[1]).read();E=json.loads(t[t.index('{'):])
d=json.load(open('data/wardrobe.json'));items={i['id']:i for i in d['items']};S=d['taste']['saved'];ACC=('shoes','bags','accessories')
nl,nd=len(set(E['liked'])-set(S['liked'])),len(set(E['disliked'])-set(S['disliked']))
def core(ids): return ','.join(sorted(x for x in ids if x in items and items[x]['category'] not in ACC))
ul=set(E.get('unlikedKeys',[]));ulc={core(k.split(',')) for k in ul};und=set(E.get('undone',[]))
liked=E['liked']+[k for k in S['liked'] if k not in set(E['liked'])];liked=[k for k in liked if k not in ul and core(k.split(',')) not in ulc]
dis=[k for k in E['disliked'] if k not in und]+[k for k in ulc if k not in set(E['disliked'])]
un=lambda a,b:sorted(set(a or [])|set(b or []))
S['blockPairs']=[k for k in un(S.get('blockPairs'),E.get('blockPairs')) if k not in set(E.get('unblock',[]))]
S['blockPats']=[k for k in un(S.get('blockPats'),E.get('blockPats')) if k not in set(E.get('unblockPat',[]))]
S.update(liked=liked,disliked=dis,n=len(liked)+len(dis),savedAt=datetime.date.today().isoformat())
d['outfits']=[o for o in d['outfits'] if not(o.get('liked') and core(o['itemIds']) in ulc)]
have={core(o['itemIds']) for o in d['outfits']};n=max(int(o['id'][6:]) for o in d['outfits'] if re.fullmatch(r'liked-\d+',o['id']))
def rank(i):
  c=i['category'];return 3 if (c=='outerwear' or (c=='knitwear' and 'cardigan' in (i['id']+i['name']).lower())) else (0 if c in('tops','knitwear','dresses') else 1)
add=0
for k in liked:
  ids=[x for x in k.split(',') if x in items];c=core(ids)
  if not c or c in have:continue
  have.add(c);n+=1;add+=1;cl=sorted([items[x] for x in ids if items[x]['category'] not in ACC],key=rank)
  d['outfits'].append({'id':f'liked-{n}','name':cl[0]['name']+(' with the '+' and the '.join(x['name'] for x in cl[1:]) if len(cl)>1 else ''),'itemIds':ids,'occasions':['Everyday'],'liked':True,'why':'You liked this in Style me.'})
gone=set(E.get('inspoGone',[]));b=len(d['inspo']);d['inspo']=[p for p in d['inspo'] if p['id'] not in gone]
for pid,ids in E.get('inspoEdits',{}).items():
  p=next((x for x in d['inspo'] if x['id']==pid),None)
  if p:p['itemIds']=ids
for bo in E.get('built',[]):
  if '(my version)' in bo['name'] or core(bo['itemIds']) in have:continue
  d['outfits'].append({'id':'built-'+bo['id'],'name':bo['name'],'itemIds':bo['itemIds'],'occasions':bo.get('occasions',[]),'liked':True,'built':True,'why':''});have.add(core(bo['itemIds']))
json.dump(d,open('data/wardrobe.json','w'),ensure_ascii=False,indent=1)
c={}
for k in liked+dis:
  for x in k.split(','):c[x]=c.get(x,0)+1
cl=[i for i in d['items'] if i['category'] not in ACC+('dresses',)]
print(json.dumps({'new_likes':nl,'new_dislikes':nd,'ratings':S['n'],'liked_outfits_added':add,'liked_outfits':sum(1 for o in d['outfits'] if o.get('liked')),'inspo_removed':b-len(d['inspo']),'under5_nondress':[i['name'] for i in cl if c.get(i['id'],0)<5],'wish':[(w['title'],w.get('got')) for w in E.get('wish',[])]}))
