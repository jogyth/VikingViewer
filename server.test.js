'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
test('settings, persistence, remote switching and validation', async () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'viking-test-'));
 fs.copyFileSync(path.join(__dirname,'server.js'),path.join(dir,'server.js'));
 fs.copyFileSync(path.join(__dirname,'config.js'),path.join(dir,'config.js'));
 fs.copyFileSync(path.join(__dirname,'presentation.js'),path.join(dir,'presentation.js'));
 fs.mkdirSync(path.join(dir,'img'));
 fs.copyFileSync(path.join(__dirname,'img','sundvolden_TV_logo.png'),path.join(dir,'img','sundvolden_TV_logo.png'));
 const {server,valid,defaults}=require(path.join(dir,'server.js'));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const post=(url,data)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 try {
  assert.ok(valid(defaults()));
  const presentation=await fetch(base+'/presentation.js');assert.equal(presentation.status,200);assert.match(presentation.headers.get('content-type'),/javascript/);assert.match(await presentation.text(),/class PresentationController/);
  const logo=await fetch(base+'/img/sundvolden_TV_logo.png');assert.equal(logo.status,200);assert.equal(logo.headers.get('content-type'),'image/png');
  assert.deepEqual(Buffer.from(await logo.arrayBuffer()),fs.readFileSync(path.join(dir,'img','sundvolden_TV_logo.png')));
  assert.equal((await fetch(base+'/img/unknown.png')).status,404);
  for (const file of ['/.env','/.env.example','/config.js']) assert.equal((await fetch(base+file)).status,404);
  const redirect=await fetch(base+'/',{redirect:'manual'});assert.equal(redirect.status,302);assert.equal(redirect.headers.get('location'),'/settings');
  for(const layout of ['single','bottom2','bottom4','bottom6','grid4','grid6']) {
   const counts={single:1,bottom2:2,bottom4:4,bottom6:6,grid4:4,grid6:6};const next=defaults();next.presets[0]={layout,lanes:Array.from({length:counts[layout]},(_,i)=>i+1)};
   assert.equal((await post('/api/settings',next)).status,200);
  }
  let response=await post('/api/layout/2',{});assert.equal((await response.json()).active,2);
  response=await post('/api/layout/toggle',{});assert.equal((await response.json()).active,1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'settings.json'))).active,1);
  for (const background of ['black','transparent','chroma-green']) {
   const next={...defaults(),background};
   const saved=await post('/api/settings',next);assert.equal(saved.status,200);assert.equal((await saved.json()).background,background);
   assert.equal((await (await fetch(base+'/api/state')).json()).background,background);
   assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'settings.json'))).background,background);
  }
  assert.equal((await post('/api/settings',{...defaults(),background:'invalid'})).status,400);
  const invalid=defaults();invalid.presets[0].lanes=[1,1,2,3];assert.equal((await post('/api/settings',invalid)).status,400);
  invalid.presets[0].lanes=[0,2,3,4];assert.equal((await post('/api/settings',invalid)).status,400);
  assert.equal((await fetch(base+'/api/layout/toggle')).status,404);
  assert.equal((await fetch(base+'/api/layout/1',{method:'POST',headers:{Origin:'https://example.com'}})).status,403);
  const controller=new AbortController();response=await fetch(base+'/api/events',{signal:controller.signal});const reader=response.body.getReader();const first=await reader.read();assert.match(new TextDecoder().decode(first.value),/data: /);
  await post('/api/layout/2',{});const changed=await reader.read();assert.match(new TextDecoder().decode(changed.value),/"active":2/);controller.abort();
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});}
});

test('shared environment configuration', () => {
 const {loadConfig}=require('./config');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'viking-config-'));
 try {
  const fallback=loadConfig(dir,{});
  assert.deepEqual(fallback.drives,['O','P','Q','R','S','T','U','V']);
  assert.equal(fallback.imageDir,'Viking2001\\GameCtrl');
  assert.equal(fallback.username,'');
  fs.writeFileSync(path.join(dir,'.env'),'VIKING_USERNAME=test\nVIKING_PASSWORD="space # secret"\nVIKING_DRIVES=A,B,C,D,E,F,G,H\nVIKING_HOST_PREFIX=lane\nVIKING_SHARE=scores\nVIKING_IMAGE_DIR=Images\n');
  const local=loadConfig(dir,{});
  assert.equal(local.password,'space # secret');
  assert.equal(local.hostPrefix,'lane');
  assert.equal(local.share,'scores');
  assert.equal(local.imageDir,'Images');
  assert.equal(local.drives[0],'A');
  assert.equal(loadConfig(dir,{VIKING_USERNAME:'override'}).username,'override');
  for(const drives of ['A,B','A,A,C,D,E,F,G,H','1,B,C,D,E,F,G,H']) assert.throws(()=>loadConfig(dir,{VIKING_DRIVES:drives}),/VIKING_DRIVES/);
  assert.throws(()=>loadConfig(dir,{VIKING_IMAGE_DIR:'..\\private'}),/VIKING_IMAGE_DIR/);
  assert.throws(()=>loadConfig(dir,{VIKING_SHARE:'bad/share'}),/VIKING_SHARE/);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
