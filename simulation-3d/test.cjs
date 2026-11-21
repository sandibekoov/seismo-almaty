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

let time=1000;
const elements=new Map();
const no=()=>{};
const pos=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})},setScalar(v){this.set(v,v,v)}});
const brush=new Proxy({}, {get:(o,k)=>o[k]||no});
function element(id){
  if(!elements.has(id))elements.set(id,{id,style:{},dataset:{},textContent:'',classList:{toggle:no,add:no,remove:no},clientWidth:1100,clientHeight:800,width:220,height:60,querySelector:()=>element(id+'-b'),getContext:()=>brush,showModal(){this.open=true},close(){this.open=false},addEventListener:no,setPointerCapture:no,appendChild:no});
  return elements.get(id)
}
class Obj{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position=pos();this.rotation=pos();this.scale=pos();this.userData={};this.shadow={mapSize:{set:no},camera:{}}}add(){}traverse(){}updateMatrix(){}setMatrixAt(){}lookAt(){}updateProjectionMatrix(){}updateMatrixWorld(){}setFromPoints(){return this}}
class Material{constructor(o){Object.assign(this,o);this.color=new Color();this.emissive={set:no}}}
class Renderer{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}
class Geometry{constructor(r,h){this.parameters={height:h};this.attributes={position:{array:[0,0,0],count:1,getX:()=>0,getZ:()=>0,setY:no,setZ:no}}}rotateX(){}setAttribute(){}computeVertexNormals(){}}
class Color{constructor(){this.r=this.g=this.b=1}set(){}copy(){return this}lerp(){return this}}
class Vector{constructor(x,y,z){Object.assign(this,{x,y,z})}clone(){return new Vector(this.x,this.y,this.z)}project(){return this}}
class SerialStub{constructor(frame,status){this.frame=frame;this.status=status;this.open=false}connected(){return this.open}async connect(){this.open=true;this.status('Waiting for ESP32')}async disconnect(){this.open=false}}
const THREE=new Proxy({WebGLRenderer:Renderer,MeshStandardMaterial:Material,MeshBasicMaterial:Material,ShaderMaterial:Material,Color,Vector3:Vector,ConeGeometry:Geometry,PlaneGeometry:Geometry,Float32BufferAttribute:Obj},{get:(o,k)=>o[k]||Obj});
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
class Clock extends Date{static now(){return time}constructor(...args){super(...(args.length?args:[time]))}}
const c=vm.createContext({THREE,ProjectedRenderer:class {},sessionStorage:localStorage,document:{getElementById:element,documentElement:element('html'),querySelectorAll:()=>[],createElement:()=>element('created'),body:element('body')},location:{search:''},URLSearchParams,Date:Clock,localStorage,devicePixelRatio:1,addEventListener:no,requestAnimationFrame:no,SeismoSerial:SerialStub,Seismo3DLanguage:{init:no},performance:{now:()=>time}});
const shared=fs.readFileSync(dir+'/../simulation-state.js','utf8');
vm.runInContext(shared,c);
const parent=vm.createContext({Date:Clock,localStorage});vm.runInContext(shared,parent);
const main=s=>vm.runInContext('SeismoTraining.'+s,parent);
const html=fs.readFileSync(dir+'/index.html','utf8');
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],c);
const run=s=>vm.runInContext(s,c);
function advance(sec){for(let i=0;i<Math.ceil(sec*60);i++){time+=1000/60;run('loop('+time+')')}}
main('select(3)');advance(1);assert.equal(run('prot'),false);assert.equal(element('c-esp-b').textContent,'NORMAL');
main('select(4.5)');advance(1);assert.equal(element('c-esp-b').textContent,'WARNING');assert.equal(run('sw.gas'),true);
main('select(8)');advance(1);assert.equal(element('c-esp-b').textContent,'WARNING');advance(1.2);assert.equal(run('prot'),true);assert.equal(run('sw.gas'),false);assert.equal(run('sw.power'),false);assert.equal(element('emergencyScreen').open,true);element('emergencyAck').onclick();advance(.1);assert.equal(element('emergencyScreen').open,false);
assert.equal(main('snapshot().evacuate'),false);assert.equal(run('people.every(p=>p.g.position.z<2.4)'),true);
advance(7.9);assert.equal(main('snapshot().shaking'),false);assert.equal(main('snapshot().evacuate'),true);assert.equal(element('evac-status').hidden,false);
assert.equal(main('evacuation(SeismoTraining.snapshot()).arrived'),0);
advance(4);assert.equal(run('people.some(p=>p.g.position.z>4.3)'),true);assert.equal(run('people.some(p=>p.g.position.z<2.4)'),true);
advance(12);assert.equal(main('evacuation(SeismoTraining.snapshot()).arrived'),14);assert.equal(element('evac-count').textContent,'14 / 14');assert.equal(run('people.every(p=>p.g.position.z>=11.35)'),true);
// Reopening a view uses the same clock and does not restart evacuation.
assert.equal(run('SeismoTraining.evacuation(SeismoTraining.snapshot()).arrived'),14);
main('select(3)');advance(.1);assert.equal(run('prot'),true);element('stop').onclick();advance(.1);assert.equal(main('snapshot().evacuate'),true);
element('rs').onclick();advance(.1);assert.equal(run('prot'),false);assert.equal(run('sw.gas'),true);assert.equal(main('snapshot().active'),false);
element('au').onclick();advance(4);assert.equal(main('snapshot().level'),'WARNING');advance(5);assert.equal(main('snapshot().level'),'EMERGENCY');assert.equal(element('emergencyScreen').open,true);element('emergencyAck').onclick();advance(10);assert.equal(main('snapshot().shaking'),false);assert.equal(main('snapshot().evacuate'),true);element('rs').onclick();advance(.1);
element('mode-live').onclick();assert.equal(element('a').disabled,true);assert.equal(element('c-esp-b').textContent,'UNKNOWN');
(async()=>{await element('connect').onclick();main('select(6)');run('applyTelemetry('+JSON.stringify({...data,floor:5})+')');assert.equal(element('c-esp-b').textContent,'EMERGENCY');assert.equal(run('sw.gas'),false);assert.equal(run('liftY'),5.61);advance(2.1);assert.equal(element('c-esp-b').textContent,'UNKNOWN');await element('disconnect').onclick();assert.equal(element('rt').textContent,'Disconnected');await element('mode-sim').onclick();assert.equal(element('a').disabled,false);assert.equal(run('sw.gas'),false);element('rs').onclick();advance(.1);assert.equal(run('sw.gas'),true);console.log('PASS: shared main/3D state, M 3/4.5/8, warning then emergency, latching, stop/reset, auto sequence, telemetry isolation and stale (mock 3D)')})().catch(e=>{console.error(e);process.exitCode=1});
