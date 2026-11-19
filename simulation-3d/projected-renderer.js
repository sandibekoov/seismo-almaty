/* Canvas rendering of the SAME Three.js scene when WebGL is unavailable.
 * Projects triangle geometry with the active perspective camera. */
class ProjectedRenderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ratio=1;this.last=0;this.w=1;this.h=1}
  setPixelRatio(r){this.ratio=Math.min(1.5,r)}
  setSize(w,h){this.w=w;this.h=h;this.canvas.width=Math.max(1,Math.round(w*this.ratio));this.canvas.height=Math.max(1,Math.round(h*this.ratio))}
  render(scene,camera){
    const now=performance.now();if(now-this.last<32)return;this.last=now;
    const ctx=this.ctx,w=this.w,h=this.h,faces=[];
    ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.clearRect(0,0,w,h);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const p=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),edge=new THREE.Vector3(),light=new THREE.Vector3(.6,1,.7).normalize();
    scene.traverseVisible(obj=>{
      if(!obj.isMesh&&!obj.isLine)return;
      const attr=obj.geometry.getAttribute('position'),idx=obj.geometry.index,mat=obj.material;
      if(!attr||!mat||!mat.color)return;
      const project=i=>{
        p.fromBufferAttribute(attr,i).applyMatrix4(obj.matrixWorld).project(camera);
        return [w*(p.x+1)/2,h*(1-p.y)/2,p.z]
      };
      const points=Array.from({length:attr.count},(_,i)=>project(i));
      const color=mat.color,alpha=mat.opacity===undefined?1:mat.opacity;
      if(obj.isLine){
        for(let j=1;j<points.length;j++)faces.push({line:true,v:[points[j-1],points[j]],depth:(points[j-1][2]+points[j][2])/2,color:color.getStyle(),alpha});
        return
      }
      const length=idx?idx.count:attr.count;
      for(let j=0;j+2<length;j+=3){
        const i0=idx?idx.getX(j):j,i1=idx?idx.getX(j+1):j+1,i2=idx?idx.getX(j+2):j+2;
        const v0=points[i0],v1=points[i1],v2=points[i2];
        if([v0,v1,v2].some(v=>!Number.isFinite(v[0])||v[2]<-1||v[2]>1))continue;
        const cross=(v1[0]-v0[0])*(v2[1]-v0[1])-(v1[1]-v0[1])*(v2[0]-v0[0]);
        if(cross>=0)continue;
        a.fromBufferAttribute(attr,i0).applyMatrix4(obj.matrixWorld);b.fromBufferAttribute(attr,i1).applyMatrix4(obj.matrixWorld);c.fromBufferAttribute(attr,i2).applyMatrix4(obj.matrixWorld);
        n.subVectors(b,a).cross(edge.subVectors(c,a)).normalize();
        const shade=.53+.47*Math.max(0,n.dot(light));
        const glow=Math.min(1,(mat.emissiveIntensity||0)*.28),em=mat.emissive||color;
        const rgb=['r','g','b'].map(k=>Math.round(Math.min(1,color[k]*shade+glow*em[k])*255));
        faces.push({v:[v0,v1,v2],depth:(v0[2]+v1[2]+v2[2])/3,color:'rgb('+rgb.join(',')+')',alpha,ground:!!obj.userData.ground});
      }
    });
    faces.sort((a,b)=>(Number(!!b.ground)-Number(!!a.ground))||b.depth-a.depth);
    for(const f of faces){
      ctx.globalAlpha=f.alpha;ctx.beginPath();ctx.moveTo(f.v[0][0],f.v[0][1]);
      for(let i=1;i<f.v.length;i++)ctx.lineTo(f.v[i][0],f.v[i][1]);
      if(f.line){ctx.strokeStyle=f.color;ctx.lineWidth=1;ctx.stroke()}
      else{ctx.closePath();ctx.fillStyle=f.color;ctx.fill()}
    }
    ctx.globalAlpha=1;
  }
}
