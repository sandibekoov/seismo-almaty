const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const dir=__dirname;
const bridge=fs.readFileSync(dir+'/bridge.js','utf8');
const data={source:'esp32',accelerationG:.4,state:'EMERGENCY',powerOn:false,gasOpen:false,liftMoving:false,alarmOn:true,floor:2};
const v=vm.createContext({});vm.runInContext(bridge,v);
const parse=s=>vm.runInContext('parseSeismoFrame('+JSON.stringify(s)+')',v);
assert.equal(parse(JSON.stringify(data)).state,'EMERGENCY');
assert.equal(parse(JSON.stringify({...data,floor:5})).floor,5);
for(const p of [{...data,accelerationG:-1},{...data,powerOn:1},{...data,floor:6},{...data,state:'ALARM'},{...data,source:'unknown'},{}])assert.equal(parse(JSON.stringify(p)),null);
assert.equal(parse('64'),null);

let time=0;
const elements=new Map();
const no=()=>{};
const pos=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})},setScalar(v){this.set(v,v,v)}});
const brush=new Proxy({}, {get:(o,k)=>o[k]||no});
function element(id){
  if(!elements.has(id))elements.set(id,{id,style:{},dataset:{},textContent:'',classList:{toggle:no,add:no,remove:no},clientWidth:1100,clientHeight:800,width:220,height:60,querySelector:()=>element(id+'-b'),getContext:()=>brush,addEventListener:no,setPointerCapture:no,appendChild:no});
  return elements.get(id)
}
class Obj{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position=pos();this.rotation=pos();this.scale=pos();this.userData={}}add(){}lookAt(){}updateProjectionMatrix(){}setFromPoints(){return this}}
class Material{constructor(o){Object.assign(this,o);this.color={set:no};this.emissive={set:no}}}
class Renderer{setPixelRatio(){}setSize(){}render(){}}
class Geometry{constructor(r,h){this.parameters={height:h}}}
class Vector{constructor(x,y,z){Object.assign(this,{x,y,z})}clone(){return new Vector(this.x,this.y,this.z)}project(){return this}}
class SerialStub{constructor(frame,status){this.frame=frame;this.status=status;this.open=false}connected(){return this.open}async connect(){this.open=true;this.status('Waiting for ESP32')}async disconnect(){this.open=false}}
const THREE=new Proxy({WebGLRenderer:Renderer,MeshStandardMaterial:Material,Vector3:Vector,ConeGeometry:Geometry},{get:(o,k)=>o[k]||Obj});
const c=vm.createContext({THREE,document:{getElementById:element,querySelectorAll:()=>[],createElement:()=>element('created'),body:element('body')},devicePixelRatio:1,addEventListener:no,requestAnimationFrame:no,SeismoSerial:SerialStub,Seismo3DLanguage:{init:no},performance:{now:()=>time}});
const html=fs.readFileSync(dir+'/index.html','utf8');
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],c);
const run=s=>vm.runInContext(s,c);
function advance(sec){for(let i=0;i<Math.ceil(sec*60);i++){time+=1000/60;run('loop('+time+')')}}
element('au').onclick();advance(8);assert.equal(run('prot'),false);assert.notEqual(run('demo'),null);
advance(5);assert.equal(run('prot'),true);assert.equal(run('sw.gas'),false);assert.equal(run('sw.power'),false);
advance(20);assert.equal(run('demo'),null);assert.equal(element('au').disabled,false);
element('rs').onclick();assert.equal(run('prot'),false);assert.equal(run('sw.gas'),true);
run("setP('a',.08)");element('go').onclick();advance(1);assert.equal(run('prot'),false);
run("setP('a',1.1)");advance(2);assert.equal(run('prot'),true);
run("setP('a',0)");advance(1);assert.equal(run('prot'),true);
element('rs').onclick();
element('mode-live').onclick();assert.equal(element('go').disabled,true);assert.equal(element('c-esp-b').textContent,'UNKNOWN');
(async()=>{assert.equal(element('a').disabled,true);await element('connect').onclick();run('applyTelemetry('+JSON.stringify({...data,floor:5})+')');assert.equal(element('c-esp-b').textContent,'EMERGENCY');assert.equal(run('sw.gas'),false);assert.equal(run('liftY'),5.3);advance(2.1);assert.equal(element('c-esp-b').textContent,'UNKNOWN');await element('disconnect').onclick();assert.equal(element('rt').textContent,'Disconnected');await element('mode-sim').onclick();assert.equal(element('go').disabled,false);assert.equal(element('a').disabled,false);assert.equal(run('sw.gas'),true);console.log('PASS: telemetry, auto demo, amplitude control, short impact filtering, emergency latch, reset, stale and mode isolation (mock 3D)')})().catch(e=>{console.error(e);process.exitCode=1});
