/* Shared, deterministic training scenario. No conversion from M to measured g. */
(function(root){
  'use strict';
  const KEY='seismo_training_v2', now=()=>Date.now();
  const initial=()=>({mag:0,at:0,time:0,shake:false,latched:false,auto:false});
  let data=initial();
  function valid(x){return x&&Number.isFinite(x.mag)&&x.mag>=0&&x.mag<=8&&Number.isFinite(x.at)&&Number.isFinite(x.time)&&typeof x.shake==='boolean'&&typeof x.latched==='boolean'&&typeof x.auto==='boolean'}
  function read(){try{const raw=root.localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);if(valid(v))data=v}}catch(_){}return data}
  function write(v){data=v;try{root.localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}return snapshot()}
  function amplitude(m){const pts=[[0,0],[3,16],[4.5,49],[6,83],[8,100]];for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];if(m<=c)return Math.round(b+(m-a)/(c-a)*(d-b))}return 100}
  function snapshot(t=now()){
    const x=read(),elapsed=Math.max(0,t-x.at);
    const mag=x.auto?(elapsed<3000?3:elapsed<6500?4.5:6):x.mag;
    const shaking=x.shake&&(!x.auto||elapsed<18000)&&mag>0;
    const latched=x.latched||(x.auto?elapsed>=8500:mag>=6&&x.shake&&elapsed>=2000);
    const level=latched?'EMERGENCY':shaking&&mag>=4.5?'WARNING':'NORMAL';
    const amp=shaking?(mag>=6&&!latched?49:amplitude(mag)):0;
    return {mag,level,amp,shaking,latched,active:mag>0||latched,time:x.time,at:x.at,auto:x.auto&&elapsed<18000,evacuate:latched&&!shaking};
  }
  function select(m){m=Math.round(Math.max(0,Math.min(8,Number(m)))*10)/10;if(!Number.isFinite(m))return snapshot();const old=snapshot(),t=now();return write({mag:m,at:t,time:old.active?old.time:t,shake:m>0,latched:old.latched,auto:false})}
  function stop(){const old=snapshot();return write({mag:old.mag,at:now(),time:old.time,shake:false,latched:old.latched,auto:false})}
  function reset(){return write(initial())}
  function auto(){const old=snapshot();if(old.latched)return old;const t=now();return write({mag:3,at:t,time:t,shake:true,latched:false,auto:true})}
  function wave(s,t=now()){if(!s.shaking)return 0;const p=(t-s.time)/1000;return s.amp*(.65*Math.sin(p*14)+.22*Math.sin(p*32.62+.7)+.13*Math.sin(p*68.6+1.4))}
  root.SeismoTraining={snapshot,select,stop,reset,auto,wave,amplitude};
})(typeof window==='undefined'?globalThis:window);
