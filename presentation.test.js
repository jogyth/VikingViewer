'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {screenKey, chooseScreen, popupFeatures, PresentationController} = require('./presentation');

const laptop = {label:'Laptop',isInternal:true,left:0,top:0,width:1920,height:1080,availLeft:0,availTop:0,availWidth:1920,availHeight:1040};
const atem = {label:'ATEM Mini',isInternal:false,left:-1920,top:0,width:1920,height:1080,availLeft:-1920,availTop:0,availWidth:1920,availHeight:1080};

function harness({blocked=false, saveResult=true, details=null}={}) {
 const elements = new Map();
 const element = id => {
  if (!elements.has(id)) elements.set(id,{value:'auto',disabled:false,textContent:'',options:[],replaceChildren(...options){this.options=options;this.value=options[0].value;},add(option){this.options.push(option);}});
  return elements.get(id);
 };
 const calls=[];
 const output={closed:false,document:{body:{}},location:{replace(url){calls.push(['navigate',url]);}},close(){this.closed=true;calls.push(['close']);},focus(){calls.push(['focus']);}};
 const browser={
  document:{getElementById:element},
  Option:class {constructor(text,value){this.text=text;this.value=value;}},
  setInterval(){return 1;},
  open(url,name,features){calls.push(['open',url,name,features]);return blocked?null:output;},
  getScreenDetails:async()=>details,
  navigator:{permissions:{query:async()=>({state:'prompt'})}}
 };
 const controller=new PresentationController({save:async()=>{calls.push(['save']);return saveResult;},changeLayout:async active=>calls.push(['layout',active])},browser);
 return {controller,element,calls,output,browser};
}

test('screen selection handles external, explicit, missing and single screens',()=>{
 const details={screens:[laptop,atem],currentScreen:laptop};
 assert.equal(chooseScreen(details),atem);
 assert.equal(chooseScreen(details,screenKey(laptop)),laptop);
 assert.equal(chooseScreen(details,'disconnected'),atem);
 assert.equal(chooseScreen({screens:[laptop],currentScreen:laptop}),laptop);
 assert.equal(chooseScreen(null),null);
 assert.match(popupFeatures(atem),/left=-1920/);
 assert.match(popupFeatures(null),/width=1280/);
});

test('launch opens before saving, positions external output, switches layout and closes from panel',async()=>{
 const {controller,element,calls,output}=harness();
 controller.details={screens:[laptop,atem],currentScreen:laptop};
 await controller.launch();
 assert.deepEqual(calls.map(call=>call[0]),['open','save','navigate']);
 assert.match(calls[0][3],/left=-1920/);
 assert.deepEqual(calls[2],['navigate','/view?presentation=1']);
 assert.equal(element('close-output').disabled,false);
 await element('live-2').onclick();
 assert.deepEqual(calls.at(-1),['layout',2]);
 await controller.launch();
 assert.equal(calls.filter(call=>call[0]==='open').length,1);
 controller.close();
 assert.equal(output.closed,true);
 assert.equal(element('close-output').disabled,true);
 assert.equal(controller.output,null);
});

test('popup blocking and invalid settings do not leave an orphaned viewer',async()=>{
 const blocked=harness({blocked:true});
 await blocked.controller.launch();
 assert.deepEqual(blocked.calls.map(call=>call[0]),['open']);
 assert.match(blocked.element('screen-status').textContent,/blokkerte/);
 assert.equal(blocked.element('launch').disabled,false);
 const invalid=harness({saveResult:false});
 await invalid.controller.launch();
 assert.equal(invalid.output.closed,true);
 assert.equal(invalid.controller.output,null);
 assert.equal(invalid.calls.some(call=>call[0]==='navigate'),false);
});

test('screen detection updates on disconnect; denied access and unsupported browsers retain fallback',async()=>{
 const listeners=new Map();
 const details={screens:[laptop,atem],currentScreen:laptop,addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);}};
 const detected=harness({details});
 await detected.controller.detectScreens();
 assert.equal(detected.element('display-screen').options.length,3);
 detected.element('display-screen').value=screenKey(atem);
 details.screens=[laptop];
 listeners.get('screenschange')();
 assert.equal(detected.element('display-screen').value,'auto');
 assert.match(detected.element('screen-status').textContent,/koblet fra/);
 detected.browser.getScreenDetails=async()=>{throw Error('Permission denied');};
 await detected.controller.detectScreens();
 assert.equal(detected.controller.details,null);
 assert.equal(detected.element('display-screen').options.length,1);
 assert.match(detected.element('screen-status').textContent,/Ingen tilgang/);
 await detected.controller.launch();
 assert.equal(detected.calls.some(call=>call[0]==='navigate'),true);
 const unsupported=harness();
 delete unsupported.browser.getScreenDetails;
 await unsupported.controller.init();
 assert.equal(unsupported.element('detect-screens').disabled,true);
 await unsupported.controller.launch();
 assert.equal(unsupported.calls.some(call=>call[0]==='navigate'),true);
});

test('closing the viewer manually resets controls; failed save also cleans up',async()=>{
 const closed=harness();
 await closed.controller.launch();
 closed.output.closed=true;
 closed.controller.syncWindow();
 assert.equal(closed.controller.output,null);
 assert.equal(closed.element('live-1').disabled,true);
 const failed=harness();
 failed.controller.save=async()=>{throw Error('Network error');};
 await failed.controller.launch();
 assert.equal(failed.output.closed,true);
 assert.equal(failed.controller.launching,false);
 assert.equal(failed.element('launch').disabled,false);
});
