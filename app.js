// V4.1: Mobile Scrollfix – neue Frage statt Seitenanfang fokussieren
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='shk-din-trainer-v2';
let saved={total:0,correct:0,streak:0,wrong:{},extra:[]};
try{saved={...saved,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
const base=[...(window.BASE_QUESTIONS||[])];
function qKey(q){return [q.norm||'',q.topic||'',q.q||''].join('|')}
function uniqueQuestions(arr){const m=new Map();for(const q of arr){const k=qKey(q);if(!m.has(k))m.set(k,q)}return [...m.values()]}
let all=uniqueQuestions([...base,...(saved.extra||[])]);
const st={mode:'learn',family:'Alle',norm:'Alle',prio:'Alle',queue:[],i:0,locked:false,exam:[]};
const shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
function persist(){localStorage.setItem(KEY,JSON.stringify(saved))}
function catalog(){return st.mode==='practice'?all.filter(x=>x.image):all}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function families(){return [...new Set(catalog().map(x=>x.family).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'))}
function syncFilters(){
 const fam=$('#family'),old=st.family,fl=families();
 fam.innerHTML='<option value="Alle">Alle Bereiche</option>'+fl.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
 st.family=fl.includes(old)?old:'Alle';fam.value=st.family;
 const norms=[...new Set(catalog().filter(x=>st.family==='Alle'||x.family===st.family).map(x=>x.norm).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
 const ns=$('#norm'),on=st.norm;ns.innerHTML='<option value="Alle">Alle Normen</option>'+norms.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
 st.norm=norms.includes(on)?on:'Alle';ns.value=st.norm
}
function basePool(){return catalog().filter(x=>(st.family==='Alle'||x.family===st.family)&&(st.norm==='Alle'||x.norm===st.norm)&&(st.prio==='Alle'||x.prio===st.prio))}
function pool(){let p=basePool();if(st.mode==='weak'){const keys=Object.keys(saved.wrong||{}).filter(k=>saved.wrong[k]>0);if(keys.length)p=p.filter(x=>keys.includes((x.norm||'')+'|'+(x.topic||'')))}return p}
function stats(){
 $('#score').textContent=saved.total?Math.round(saved.correct/saved.total*100)+'%':'0%';$('#answered').textContent=saved.total||0;$('#streak').textContent=saved.streak||0;$('#count').textContent=basePool().length;
 const baseKeys=new Set(base.map(qKey));const localUnique=uniqueQuestions(saved.extra||[]).filter(q=>!baseKeys.has(qKey(q))).length;
 $('#packInfo').textContent=`Fest eingebaut: ${base.length} Fragen · davon ${base.filter(x=>x.image).length} Bildfälle · lokale zusätzliche Fragen: ${localUnique}.`
}
function mode(m){st.mode=m;st.family='Alle';st.norm='Alle';$$('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));syncFilters();start()}
function start(){
 st.i=0;st.locked=false;st.exam=[];$('#result').classList.add('hidden');$('#quiz').classList.remove('hidden');let p=pool();
 if(!p.length){const img=$('#practiceImage');img.classList.remove('show');img.removeAttribute('src');$('#question').textContent=st.mode==='weak'?'Noch keine Fehler in diesem Filter.':'Keine Fragen/Fälle in diesem Filter.';$('#options').innerHTML='';$('#check').disabled=true;$('#next').disabled=true;stats();return}
 st.queue=st.mode==='exam'?shuffle(p).slice(0,Math.min(20,p.length)):shuffle(p);show();stats()
}
function show(){
 if(st.mode==='exam'&&st.i>=st.queue.length){examResult();return}
 if(st.mode!=='exam'&&st.i>=st.queue.length){st.queue=shuffle(pool());st.i=0}
 const q=st.queue[st.i];st.cur=q;st.locked=false;$('#normTag').textContent=q.norm||'';$('#prioTag').textContent=q.prio||'';$('#topicTag').textContent=q.topic||'';
 const prefix=st.mode==='exam'?'Prüfung ':st.mode==='practice'?'Praxisfall ':'Frage ';$('#progressText').textContent=prefix+(st.i+1)+'/'+st.queue.length;$('#bar').style.width=((st.i+1)/st.queue.length*100)+'%';
 const img=$('#practiceImage');if(q.image){img.src=q.image;img.classList.add('show');img.alt='Praxisfall: '+(q.topic||'SHK');img.onerror=()=>{img.classList.remove('show');console.warn('Bild nicht gefunden:',q.image)}}else{img.classList.remove('show');img.removeAttribute('src')}
 $('#question').textContent=q.q;const order=shuffle(q.options.map((v,i)=>({v,i})));$('#options').innerHTML=order.map((x,j)=>`<label class="opt"><input type="radio" name="ans" value="${x.i}"><span><b>${String.fromCharCode(65+j)})</b> ${escapeHtml(x.v)}</span></label>`).join('');
 $('#feedback').className='feedback hidden';$('#feedback').innerHTML='';$('#check').disabled=false;$('#next').disabled=true;$('#check').textContent=st.mode==='exam'?'Antwort speichern':'Antwort prüfen';requestAnimationFrame(()=>$('#question').scrollIntoView({behavior:'smooth',block:'center'}))
}
$('#form').addEventListener('submit',e=>{
 e.preventDefault();if(st.locked)return;const p=$('input[name="ans"]:checked');if(!p){$('#feedback').className='feedback neutral';$('#feedback').textContent='Bitte zuerst eine Antwort auswählen.';return}
 st.locked=true;const q=st.cur,ok=Number(p.value)===q.answer;saved.total=(saved.total||0)+1;
 if(ok){saved.correct=(saved.correct||0)+1;saved.streak=(saved.streak||0)+1}else{saved.streak=0;const k=(q.norm||'')+'|'+(q.topic||'');saved.wrong[k]=(saved.wrong[k]||0)+1}
 persist();$$('input[name="ans"]').forEach(x=>x.disabled=true);$('#check').disabled=true;$('#next').disabled=false;
 if(st.mode==='exam'){st.exam.push({q,ok});$('#feedback').className='feedback neutral';$('#feedback').textContent='Antwort gespeichert. Auswertung nach der letzten Frage.'}
 else{$('#feedback').className='feedback '+(ok?'ok':'bad');$('#feedback').innerHTML=`<b>${ok?'Richtig.':'Falsch.'}</b><br>${escapeHtml(q.explanation||'')}<div class="small" style="margin-top:7px">Quelle/Regel: ${escapeHtml(q.source||'')}</div>`}
 stats()
});
$('#next').onclick=()=>{if(st.locked){st.i++;show()}};
function examResult(){const r=$('#result');$('#quiz').classList.add('hidden');r.classList.remove('hidden');const right=st.exam.filter(x=>x.ok).length,total=st.exam.length,miss=st.exam.filter(x=>!x.ok),grouped={};miss.forEach(x=>{const k=(x.q.norm||'')+' · '+(x.q.topic||'');grouped[k]=(grouped[k]||0)+1});const weak=Object.entries(grouped).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="feedback bad"><b>${escapeHtml(k)}</b><br>${v} Fehler</div>`).join('');r.innerHTML=`<h2>Prüfung: ${right}/${total}</h2>${weak||'<div class="feedback ok"><b>Fehlerfrei.</b></div>'}<div class="actions"><button class="primary" id="again">Neue Prüfung</button><button id="weakNow">Fehlertraining</button></div>`;$('#again').onclick=start;$('#weakNow').onclick=()=>mode('weak')}
$$('.mode').forEach(b=>b.onclick=()=>mode(b.dataset.mode));$('#family').onchange=e=>{st.family=e.target.value;st.norm='Alle';syncFilters();start()};$('#norm').onchange=e=>{st.norm=e.target.value;start()};$('#prio').onchange=e=>{st.prio=e.target.value;start()};$('#restart').onclick=start;
$('#reset').onclick=()=>{if(!confirm('Nur die Lernstatistik löschen? Die zentralen Fragen bleiben erhalten.'))return;saved={total:0,correct:0,streak:0,wrong:{},extra:saved.extra||[]};persist();start()};
$('#importBtn').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text()),pack=Array.isArray(data)?data:data.questions;if(!Array.isArray(pack))throw new Error('Kein gültiges Fragenpaket');const valid=pack.filter(x=>x.family&&x.norm&&x.prio&&x.topic&&x.q&&Array.isArray(x.options)&&Number.isInteger(x.answer)&&x.explanation&&x.source),existing=new Set(all.map(qKey)),fresh=valid.filter(q=>!existing.has(qKey(q)));saved.extra=uniqueQuestions([...(saved.extra||[]),...fresh]);persist();all=uniqueQuestions([...base,...saved.extra]);syncFilters();start();alert(fresh.length+' neue Fragen importiert. '+(valid.length-fresh.length)+' bereits vorhandene Fragen wurden übersprungen.')}catch(err){alert('Import fehlgeschlagen: '+err.message)}e.target.value=''};
$('#updateBtn').onclick=async()=>{if(!confirm('App-Dateien neu von GitHub laden? Deine Statistik und lokalen Zusatzfragen bleiben erhalten.'))return;try{if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}}catch(e){}const u=new URL(location.href);u.searchParams.set('update',Date.now());location.replace(u.toString())};
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{}))}
syncFilters();start();stats();