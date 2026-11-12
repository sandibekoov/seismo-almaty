/* Seismo Almaty — Resident UI
   Public USGS catalogue + demonstrational assembly markers.
   No earthquake prediction, no actual SOS dispatch, no automatic life-safety actions. */
'use strict';
(function(){
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ALMATY={lat:43.2380,lng:76.9450};
  const ASSEMBLY=[
    {name:'Парк имени 28 гвардейцев-панфиловцев',lat:43.2587,lng:76.9534,note:'Учебный ориентир, пригодность не подтверждена'},
    {name:'Центральный парк культуры и отдыха',lat:43.2622,lng:76.9722,note:'Учебный ориентир, пригодность не подтверждена'},
    {name:'Площадь Республики',lat:43.2383,lng:76.9456,note:'Учебный ориентир, пригодность не подтверждена'},
    {name:'Главный ботанический сад',lat:43.2215,lng:76.9130,note:'Учебный ориентир, пригодность не подтверждена'},
    {name:'Парк Первого Президента',lat:43.1890,lng:76.8860,note:'Учебный ориентир, пригодность не подтверждена'},
    {name:'Площадь у Центрального стадиона',lat:43.2376,lng:76.9205,note:'Учебный ориентир, пригодность не подтверждена'}
  ];
  // Legacy engineering-demo coordinates; positions are not independently verified.
  const HOSPITALS=[
    {name:'Больница скорой неотложной помощи (БСНП)',lat:43.2570,lng:76.9160},
    {name:'Центральная городская клиническая больница',lat:43.2450,lng:76.9130},
    {name:'Городская клиническая больница №4',lat:43.2850,lng:76.9560},
    {name:'Городская клиническая больница №5',lat:43.2420,lng:76.8900},
    {name:'Городская клиническая больница №7',lat:43.2290,lng:76.7900},
    {name:'Городская клиническая больница №1',lat:43.2290,lng:76.8530}
  ];
  const SERVICES=[{name:'Департамент по чрезвычайным ситуациям города Алматы',lat:43.2600,lng:76.9400}];
  const GUIDES={
    during:[
      'Пригнитесь, укройтесь под прочной мебелью и держитесь за неё до окончания толчков.',
      'Защитите голову и шею. Держитесь подальше от окон, шкафов и тяжёлых предметов.',
      'Не бегите к выходу и не используйте лифт, пока здание трясётся.',
      'Если вы на улице, отойдите от зданий, деревьев и линий электропередачи.'
    ],
    before:[
      'Обсудите с близкими план действий и способы связи после чрезвычайной ситуации.',
      'Подготовьте аптечку, воду, фонарик, зарядное устройство и необходимые документы.',
      'Закрепите тяжёлую мебель и предметы, которые могут упасть.',
      'Изучите выходы из здания и официально обозначенные пункты сбора.'
    ],
    after:[
      'Когда толчки закончились, проверьте себя и окружающих на травмы.',
      'Оцените обстановку. При необходимости выходите по лестнице, не пользуясь лифтом.',
      'Остерегайтесь повреждённых конструкций, утечек газа и повторных толчков.',
      'Следуйте сообщениям официальных служб; при угрозе жизни звоните 112.'
    ]
  };
  const state={quakes:[],feed:'loading',updated:null,current:'home',map:null,layers:null,profile:null,pickOnMap:false,mapFilter:'all'};
  let toastTimer;
  function toast(msg){const el=$('toast');el.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.textContent=''},4800)}
  function dateAlmaty(t){return new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Almaty',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(t))}
  function ago(t){const min=Math.max(0,Math.floor((Date.now()-t)/60000));return min<1?'Только что':min<60?min+' мин назад':min<1440?Math.floor(min/60)+' ч назад':Math.floor(min/1440)+' дн назад'}
  function distance(a,b){const r=Math.PI/180;const dLat=(a.lat-b.lat)*r,dLng=(a.lng-b.lng)*r;const v=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(v)))}
  function safeUSGS(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='earthquake.usgs.gov'?u.href:null}catch(e){return null}}
  function svgIcon(name){return '<svg class="icon"><use href="#i-'+name+'"></use></svg>'}
  function badge(m){return '<span class="mag-badge '+(m>=5?'m5':m>=4?'m4':'')+'">M '+m.toFixed(1)+'</span>'}
  function locLabel(q){return q.place||'Событие без названия'}
  function nav(page){
    const target=$('page-'+page);if(!target)return;
    state.current=page;
    document.querySelectorAll('.page').forEach(p=>{const selected=p===target;p.hidden=!selected;p.classList.toggle('is-active',selected)});
    document.querySelectorAll('[data-page]').forEach(b=>{
      const active=b.dataset.page===page;
      if(b.classList.contains('nav-link')||b.classList.contains('bottom-link')){b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}
    });
    if(page==='map')requestAnimationFrame(()=>{ensureMap();if(state.map)state.map.invalidateSize()});
    if(page==='events')renderEvents();
    if(page==='profile')fillProfile();
    window.scrollTo({top:0,behavior:'instant'});
    if(location.hash!=='#'+page)history.replaceState(null,'','#'+page);
  }
  function renderFeed(list,container,emptyText){
    if(!container)return;
    if(state.feed==='loading'){container.innerHTML='<div class="empty-state">Загружаем данные USGS…</div>';return}
    if(state.feed==='error'){container.innerHTML='<div class="empty-state">Нет связи с USGS. Проверьте интернет или обновите страницу. Нет данных — не значит, что нет опасности.</div>';return}
    if(!list.length){container.innerHTML='<div class="empty-state">'+esc(emptyText||'За выбранный период события не найдены.')+'</div>';return}
    container.innerHTML=list.map(q=>{
      const n=state.quakes.indexOf(q);
      return '<button type="button" class="feed-item" data-event-index="'+n+'" aria-label="Подробнее о событии M '+q.mag.toFixed(1)+'">'+badge(q.mag)+'<span class="feed-main"><strong>'+esc(locLabel(q))+'</strong><small>'+esc(ago(q.time))+' · глубина '+q.depth.toFixed(0)+' км</small></span>'+svgIcon('chevron').replace('class="icon"','class="icon feed-chevron"')+'</button>';
    }).join('');
  }
  function renderHome(){
    const status=$('headerFeed'),pill=status.closest('.data-pill');
    pill.classList.toggle('is-live',state.feed==='ok');pill.classList.toggle('is-error',state.feed==='error');
    status.textContent=state.feed==='ok'?'USGS · данные загружены':state.feed==='error'?'USGS · нет соединения':'USGS · загрузка';
    $('homeFeedTitle').textContent=state.feed==='ok'?'События USGS загружены':state.feed==='error'?'Источник сейчас недоступен':'Подключаем данные USGS';
    $('homeFeedSubtitle').textContent=state.feed==='ok'?'Каталог событий · обновление '+new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Almaty',hour:'2-digit',minute:'2-digit'}).format(new Date(state.updated)):'Нет данных не означает отсутствие опасности';
    $('statCount').textContent=state.feed==='ok'?String(state.quakes.length):'—';
    $('statMax').textContent=state.feed==='ok'?(state.quakes.length?'M '+Math.max(...state.quakes.map(q=>q.mag)).toFixed(1):'—'):'—';
    $('statRecent').textContent=state.feed==='ok'?(state.quakes.length?ago(state.quakes[0].time):'—'):'—';
    renderFeed(state.quakes.slice(0,3),$('homeEvents'),'За 30 дней событий M ≥ 2.5 в каталоге не найдено.');
  }
  function filteredEvents(){
    const days=Number($('periodFilter').value)||30,min=Number($('magnitudeFilter').value)||2.5;
    const cut=Date.now()-days*86400000;
    return state.quakes.filter(q=>q.time>=cut&&q.mag>=min);
  }
  function renderEvents(){
    const items=filteredEvents();
    $('eventCount').textContent=state.feed==='ok'?'Показано '+items.length+' из '+state.quakes.length:'Состояние: '+(state.feed==='loading'?'загрузка':'нет связи');
    renderFeed(items,$('eventsList'),'События с такими параметрами в каталоге не найдены.');
  }
  function detail(q){
    if(!q)return;
    const url=safeUSGS(q.url);
    $('detailContent').innerHTML='<span class="eyebrow">ЗАРЕГИСТРИРОВАННОЕ СОБЫТИЕ · USGS</span><h2>'+badge(q.mag)+' '+esc(locLabel(q))+'</h2><p>'+esc(dateAlmaty(q.time))+' · время Алматы</p><div class="detail-metrics"><div><small>Магнитуда</small><strong>M '+q.mag.toFixed(1)+'</strong></div><div><small>Глубина</small><strong>'+q.depth.toFixed(1)+' км</strong></div><div><small>Расстояние от центра Алматы</small><strong>≈ '+Math.round(distance(ALMATY,q))+' км</strong></div><div><small>Эпицентр</small><strong>'+q.lat.toFixed(4)+'°, '+q.lng.toFixed(4)+'°</strong></div></div><p>Магнитуда и расстояние не определяют последствия для конкретного здания и не являются прогнозом.</p>'+(url?'<a class="button button-primary wide" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Открыть первоисточник USGS '+svgIcon('arrow')+'</a>':'');
    $('detailDialog').hidden=false;document.body.style.overflow='hidden';$('closeDetail').focus();
  }
  function closeDetail(){$('detailDialog').hidden=true;document.body.style.overflow=''}
  async function fetchQuakes(){
    state.feed='loading';renderHome();renderEvents();
    const since=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
    const url='https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude='+ALMATY.lat+'&longitude='+ALMATY.lng+'&maxradiuskm=500&minmagnitude=2.5&starttime='+since+'&orderby=time&limit=200';
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),16000);
    try{
      const response=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/geo+json,application/json'}});
      if(!response.ok)throw Error('HTTP '+response.status);
      const data=await response.json();
      if(!data||!Array.isArray(data.features))throw Error('Invalid USGS response');
      state.quakes=data.features.filter(f=>f&&f.properties&&Array.isArray(f.geometry?.coordinates)).map(f=>({
        mag:Number(f.properties.mag),place:String(f.properties.place||'—'),time:Number(f.properties.time),url:f.properties.url,
        lng:Number(f.geometry.coordinates[0]),lat:Number(f.geometry.coordinates[1]),depth:Number(f.geometry.coordinates[2])
      })).filter(q=>Number.isFinite(q.mag)&&Number.isFinite(q.time)&&Number.isFinite(q.lat)&&Number.isFinite(q.lng)&&Number.isFinite(q.depth)).sort((a,b)=>b.time-a.time);
      state.feed='ok';state.updated=Date.now();
    }catch(error){state.feed='error';state.quakes=[];}
    finally{clearTimeout(timeout);renderHome();renderEvents();refreshMapMarkers()}
  }
  function markerHTML(type,label){
    const cls=type==='quake'?'quake-marker':type==='assembly'?'assembly-marker':'self-marker';
    return '<span class="'+cls+'">'+esc(label)+'</span>';
  }
  function leafletIcon(type,label){
    return L.divIcon({className:'',html:markerHTML(type,label),iconSize:[25,25],iconAnchor:[12,12]});
  }
  function ensureMap(){
    if(state.map)return;
    if(!window.L){$('map').innerHTML='<div class="empty-state">Карта недоступна: библиотека Leaflet не загрузилась. Проверьте соединение.</div>';return}
    state.map=L.map('map',{zoomControl:false}).setView([ALMATY.lat,ALMATY.lng],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(state.map);
    L.control.zoom({position:'topright'}).addTo(state.map);
    state.layers={quake:L.layerGroup().addTo(state.map),assembly:L.layerGroup().addTo(state.map),self:L.layerGroup().addTo(state.map)};
    state.map.on('click',e=>{
      if(!state.pickOnMap)return;
      state.pickOnMap=false;state.profile={...(state.profile||{}),lat:e.latlng.lat,lng:e.latlng.lng};
      saveProfile();refreshMapMarkers();toast('Точка сохранена на устройстве');showMapLocation('Адрес на карте',e.latlng);
    });
    refreshMapMarkers();
  }
  function refreshMapMarkers(){
    if(!state.map||!state.layers)return;
    Object.values(state.layers).forEach(l=>l.clearLayers());
    if($('showQuakes').checked&&state.feed==='ok'){
      state.quakes.forEach((q,i)=>{
        L.marker([q.lat,q.lng],{icon:leafletIcon('quake','!'),title:'M '+q.mag.toFixed(1)+' · '+q.place})
          .on('click',()=>showMapQuake(q,i)).addTo(state.layers.quake);
      });
    }
    if($('showAssembly').checked){
      ASSEMBLY.forEach((p,i)=>L.marker([p.lat,p.lng],{icon:leafletIcon('assembly','A'),title:p.name})
        .on('click',()=>showMapAssembly(p,i)).addTo(state.layers.assembly));
    }
    if(state.profile&&Number.isFinite(state.profile.lat)&&Number.isFinite(state.profile.lng)){
      L.marker([state.profile.lat,state.profile.lng],{icon:leafletIcon('self','●'),title:'Сохранённое положение'})
       .on('click',()=>showMapLocation('Ваше местоположение (задано вами)',state.profile)).addTo(state.layers.self);
    }
    $('mapDataInfo').textContent=state.feed==='ok'?'USGS: '+state.quakes.length+' событий (M ≥ 2.5) за 30 дней':state.feed==='loading'?'Загрузка событий USGS…':'USGS недоступен — не показываются события';
  }
  function showMapQuake(q,i){
    $('mapSheet').innerHTML='<div class="sheet-title">'+badge(q.mag)+'<div><h3>'+esc(locLabel(q))+'</h3><p>USGS · '+esc(ago(q.time))+'</p></div></div><div class="sheet-info">Глубина '+q.depth.toFixed(1)+' км · ≈ '+Math.round(distance(ALMATY,q))+' км от центра Алматы</div><div class="sheet-actions"><button class="button button-primary" type="button" data-event-index="'+i+'">Подробнее '+svgIcon('arrow')+'</button></div>';
  }
  function showMapAssembly(p){
    const personal=state.profile&&Number.isFinite(state.profile.lat)&&Number.isFinite(state.profile.lng);
    const km=personal?distance(state.profile,p):null;
    $('mapSheet').innerHTML='<div class="sheet-title"><span class="mag-badge">A</span><div><h3>'+esc(p.name)+'</h3><p>Возможный ориентир · не подтверждён</p></div></div><div class="sheet-info">'+esc(p.note)+(km!==null?' · по прямой ≈ '+km.toFixed(1)+' км':'')+'. Это не проверенный маршрут или официально назначенный пункт сбора.</div>';
  }
  function showMapLocation(label,loc){$('mapSheet').innerHTML='<div class="sheet-title"><span class="mag-badge">●</span><h3>'+esc(label)+'</h3></div><div class="sheet-info">'+Number(loc.lat).toFixed(5)+', '+Number(loc.lng).toFixed(5)+'</div>';}
  function activateGuide(mode){
    document.querySelectorAll('[data-guide]').forEach(b=>{const yes=b.dataset.guide===mode;b.classList.toggle('is-active',yes);b.setAttribute('aria-selected',String(yes))});
    $('guideCards').innerHTML=(GUIDES[mode]||GUIDES.during).map((s,i)=>'<article class="guide-card"><strong>0'+(i+1)+'</strong><p>'+esc(s)+'</p></article>').join('');
  }
  function openDrill(){$('trainingOverlay').hidden=false;document.body.style.overflow='hidden';$('endDrill').focus()}
  function closeDrill(){$('trainingOverlay').hidden=true;document.body.style.overflow=''}
  function loadProfile(){
    try{const saved=JSON.parse(localStorage.getItem('seismo_resident_profile_v1')||'null');
      if(saved&&typeof saved==='object'){
        const lat=saved.lat===null?null:Number(saved.lat),lng=saved.lng===null?null:Number(saved.lng);
        state.profile={address:String(saved.address||'').slice(0,150),lat:lat!==null&&Number.isFinite(lat)&&Math.abs(lat)<=90?lat:null,lng:lng!==null&&Number.isFinite(lng)&&Math.abs(lng)<=180?lng:null};
      }
    }catch(e){state.profile=null}
  }
  function fillProfile(){
    $('profileAddress').value=state.profile?.address||'';
    $('profileLat').value=Number.isFinite(state.profile?.lat)?String(state.profile.lat):'';
    $('profileLng').value=Number.isFinite(state.profile?.lng)?String(state.profile.lng):'';
  }
  function saveProfile(){
    try{localStorage.setItem('seismo_resident_profile_v1',JSON.stringify(state.profile));return true}
    catch(e){toast('Не удалось сохранить настройки: браузер ограничил хранилище');return false}
  }
  function saveForm(e){
    e.preventDefault();
    const a=$('profileLat').value.trim(),b=$('profileLng').value.trim();
    if((a&&!b)||(!a&&b)){$('profileStatus').textContent='Укажите обе координаты или оставьте оба поля пустыми.';return}
    const lat=a?Number(a):null,lng=b?Number(b):null;
    if(lat!==null&&(lat < -90||lat >90||!Number.isFinite(lat))||lng!==null&&(lng < -180||lng >180||!Number.isFinite(lng))){$('profileStatus').textContent='Проверьте координаты широты и долготы.';return}
    state.profile={address:$('profileAddress').value.trim(),lat,lng};
    if(saveProfile()){$('profileStatus').textContent='Сохранено на этом устройстве.';refreshMapMarkers()}
  }
  function geolocate(){
    if(!navigator.geolocation){toast('Геолокация недоступна в этом браузере');return}
    toast('Запрашиваем разрешение на местоположение…');
    navigator.geolocation.getCurrentPosition(pos=>{
      state.profile={...(state.profile||{}),lat:pos.coords.latitude,lng:pos.coords.longitude};
      if(saveProfile()){fillProfile();refreshMapMarkers();toast('Местоположение сохранено');if(state.current==='map'&&state.map)state.map.setView([state.profile.lat,state.profile.lng],13)}
    },()=>toast('Не получилось определить местоположение. Можно ввести координаты вручную.'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  loadProfile();fillProfile();activateGuide('during');
  document.addEventListener('click',e=>{
    const pager=e.target.closest('[data-page]');
    if(pager){e.preventDefault();if(pager.dataset.mapLayer==='assembly')setMapFilter('assembly');nav(pager.dataset.page);return}
    const evt=e.target.closest('[data-event-index]');if(evt){detail(state.quakes[Number(evt.dataset.eventIndex)]);return}
    const guide=e.target.closest('[data-guide]');if(guide){activateGuide(guide.dataset.guide);return}
  });
  document.querySelector('.map-preview').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nav('map')}});
  window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if($('page-'+h))nav(h)});
  ['periodFilter','magnitudeFilter'].forEach(id=>$(id).addEventListener('change',renderEvents));
  document.querySelectorAll('[data-map-filter]').forEach(button=>button.addEventListener('click',()=>setMapFilter(button.dataset.mapFilter)));
  ['mapRefresh','eventsRefresh'].forEach(id=>$(id).addEventListener('click',fetchQuakes));
  ['locateMe','profileGeolocate'].forEach(id=>$(id).addEventListener('click',geolocate));
  $('profileForm').addEventListener('submit',saveForm);
  $('closeDetail').addEventListener('click',closeDetail);
  $('detailDialog').addEventListener('click',e=>{if(e.target===$('detailDialog'))closeDetail()});
  $('startDrill').addEventListener('click',openDrill);
  ['endDrill','trainingDone'].forEach(id=>$(id).addEventListener('click',closeDrill));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('detailDialog').hidden)closeDetail();if(!$('trainingOverlay').hidden)closeDrill()}});
  nav(['home','map','events','instructions','profile'].includes(location.hash.slice(1))?location.hash.slice(1):'home');
  fetchQuakes();
  setInterval(fetchQuakes,300000);
})();
