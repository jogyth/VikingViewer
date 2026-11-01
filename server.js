'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');
const config = loadConfig();
const PORT = 3000;
const ROOT = __dirname;
const DRIVE_BY_LANE = config.drives.flatMap(drive => [drive + ':', drive + ':']);
const layouts = { single: 1, bottom2: 2, bottom4: 4, bottom6: 6, grid4: 4, grid6: 6 };
const defaults = () => ({ background: 'black', active: 1, presets: [{ layout: 'grid4', lanes: [1,2,3,4] }, { layout: 'bottom2', lanes: [5,6] }] });
function valid(s) { return s && ['black','transparent','chroma-green'].includes(s.background) && [1,2].includes(s.active) && Array.isArray(s.presets) && s.presets.length === 2 && s.presets.every(p => p && Object.hasOwn(layouts,p.layout) && Array.isArray(p.lanes) && p.lanes.length === layouts[p.layout] && p.lanes.every(n => Number.isInteger(n) && n >= 1 && n <= 16) && new Set(p.lanes).size === p.lanes.length); }
const settingsPath = path.join(ROOT, 'settings.json');
let state = defaults();
try { const saved = JSON.parse(fs.readFileSync(settingsPath,'utf8')); if (valid(saved)) state = saved; } catch(e) { if(e.code !== 'ENOENT') console.warn('Kunne ikke lese innstillinger. Bruker standardoppsett.'); }
const clients = new Set();
function update(next) { fs.writeFileSync(settingsPath + '.tmp', JSON.stringify(next,null,2)); fs.renameSync(settingsPath + '.tmp', settingsPath); state = next; for(const client of clients) client.write('data: ' + JSON.stringify(state) + '\n\n'); }
function json(res,status,data) { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); }
const server = http.createServer((req,res) => {
 const url = new URL(req.url, 'http://localhost:3000');
 if (req.headers.origin && !['http://localhost:3000','http://127.0.0.1:3000'].includes(req.headers.origin)) return json(res,403,{error:'Ukjent origin'});
 if (url.pathname === '/') { res.writeHead(302,{Location:'/settings'}); return res.end(); }
 if (['/settings','/view','/app.js','/presentation.js','/style.css'].includes(url.pathname) && req.method === 'GET') {
  const file = url.pathname === '/presentation.js' ? 'presentation.js' : url.pathname === '/app.js' ? 'app.js' : url.pathname === '/style.css' ? 'style.css' : 'index.html';
  res.writeHead(200,{'Content-Type': file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8','Cache-Control':'no-store'}); return fs.createReadStream(path.join(ROOT,file)).pipe(res);
 }
 if (url.pathname === '/img/sundvolden_TV_logo.png' && req.method === 'GET') {
  return fs.readFile(path.join(ROOT,'img','sundvolden_TV_logo.png'),(err,data)=>{
   if(err) {res.writeHead(404);return res.end('Not found');}
   res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-cache','Content-Length':data.length});res.end(data);
  });
 }
 if (url.pathname === '/api/state' && req.method === 'GET') return json(res,200,state);
 if (url.pathname === '/api/events' && req.method === 'GET') {
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'}); res.write('data: '+JSON.stringify(state)+'\n\n'); clients.add(res); const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),15000); req.on('close',()=>{clients.delete(res);clearInterval(heartbeat);}); return;
 }
 if (url.pathname === '/api/settings' && req.method === 'POST') {
  let body=''; req.on('data',chunk=>{body+=chunk;if(body.length>8192) req.destroy();}); req.on('end',()=>{try { const next=JSON.parse(body); if(!valid(next)) return json(res,400,{error:'Velg gyldig layout og ulike baner mellom 1 og 16.'}); update(next); json(res,200,state); } catch(e) { json(res,e instanceof SyntaxError?400:500,{error:'Kunne ikke lagre innstillingene.'}); }}); return;
 }
 const control = /^\/api\/layout\/(1|2|toggle)$/.exec(url.pathname);
 if(control && req.method === 'POST') { try { update({...state,active:control[1]==='toggle'?3-state.active:Number(control[1])}); return json(res,200,state); } catch { return json(res,500,{error:'Kunne ikke lagre layout.'}); } }
 const m = /^\/image\/(\d+)$/.exec(url.pathname);
 if(m && req.method === 'GET' && Number(m[1])>=1 && Number(m[1])<=16) {
  const lane=Number(m[1]); const file=path.win32.join(DRIVE_BY_LANE[lane-1]+'\\',config.imageDir,'VTVFile'+lane+'.jpg');
  return fs.readFile(file,(err,data)=>{ if(err) {res.writeHead(503,{'Cache-Control':'no-store'});return res.end('Bane utilgjengelig');} res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'no-store','Content-Length':data.length});res.end(data); });
 }
 res.writeHead(404);res.end('Not found');
});
if(require.main === module) server.listen(PORT,'127.0.0.1',()=>console.log('VikingViewer: http://localhost:3000/settings'));
module.exports={server,valid,defaults};
