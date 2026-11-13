/* Seismo Almaty — Resident UI
   Public USGS catalogue + demonstrational assembly markers.
   No earthquake prediction, no actual SOS dispatch, no automatic life-safety actions. */
'use strict';
(function(){
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ALMATY={lat:43.2380,lng:76.9450};
  // Real site-specific documentary photographs; no stock photos, AI images or
  // fabricated picture / place matching. Attribution is displayed in the UI.
  // Photos describe places, not the current condition or safety of those places.
  const ASSEMBLY=[
    {name:'Парк имени 28 гвардейцев-панфиловцев',lat:43.2587,lng:76.9534,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Park of the 28 Panfilov Guardsmen Almaty.jpg',author:'Radosław Botev',license:'CC BY 3.0 PL',caption:'Парк имени 28 гвардейцев-панфиловцев, снимок 2017 года'}},
    {name:'Центральный парк культуры и отдыха',lat:43.2622,lng:76.9722,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Центральный Парк, Алматы, Казахстан.jpg',author:'Gulsana Battakova',license:'CC BY-SA 4.0',caption:'Главный вход в Центральный парк Алматы, 2018 год'}},
    {name:'Площадь Республики',lat:43.2383,lng:76.9456,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Republic Square, Almaty 1.jpg',author:'mibuchat',license:'CC BY-SA 2.0',caption:'Площадь Республики в Алматы, 2016 год'}},
    {name:'Главный ботанический сад',lat:43.2215,lng:76.9130,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Central Botanical Garden Almaty.jpg',author:'Dauren Nabijan',license:'CC0 1.0',caption:'Пруд в Ботаническом саду Алматы, май 2024 года'}},
    {name:'Парк Первого Президента',lat:43.1890,lng:76.8860,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Park of the Foundation of the First President of Almaty.jpg',author:'Radosław Botev',license:'CC BY 3.0 PL',caption:'Парк Первого Президента, Алматы, 2017 год'}},
    {name:'Площадь у Центрального стадиона',lat:43.2376,lng:76.9205,note:'Учебный ориентир, пригодность не подтверждена',
      photo:{file:'Ortalyq-Almaty 2022a.jpg',author:'CD / Wikimedia Commons',license:'CC BY-SA 4.0',caption:'Фото Центрального стадиона (ориентир рядом с площадью), декабрь 2022 года'}}
  ];
  // Wikimedia Commons redirects to optimized thumbnails. Each card links to
  // the author/license page and shows a textual fallback if the image fails.
  function placePhotoUrl(p){
    return p?.photo?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(p.photo.file.replaceAll(' ','_'))+'?width=640':'';
  }
  function placePhotoSource(p){
    return p?.photo?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(p.photo.file.replaceAll(' ','_')):'';
  }
  function placePhotoFigure(p,variant){
    if(!p.photo)return '';
    const cl=variant==='sheet'?'sheet-place-photo':'ref-place-art';
    return '<span class="'+cl+' place-photo-frame">'
      +'<img class="place-photo" src="'+esc(placePhotoUrl(p))+'" alt="'+esc(p.photo.caption)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
      +'<span class="place-photo-fallback">Фотография недоступна</span></span>';
  }
  function photoCredit(p){
    if(!p.photo)return '';
    return '<a class="place-photo-credit" href="'+esc(placePhotoSource(p))+'" target="_blank" rel="noopener noreferrer">'
      +'Фото: '+esc(p.photo.author)+' · '+esc(p.photo.license)+' · Wikimedia Commons ↗</a>';
  }
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
  // Presets are UX demonstrations, not a physical magnitude-to-acceleration model.
  const SIM_PRESETS={
    '3':{mag:3.0,amp:16,level:'NORMAL',caption:'Слабый учебный сценарий. Мониторинг без команды защитных действий.'},
    '4.5':{mag:4.5,amp:49,level:'WARNING',caption:'Учебное предупреждение: система предлагает проверить обстановку.'},
    '6':{mag:6.0,amp:83,level:'EMERGENCY',caption:'Учебная авария: показываются условные команды защитной логики и тренировочный экран.'}
  };
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
  const state={quakes:[],feed:'loading',updated:null,current:'home',map:null,layers:null,profile:null,pickOnMap:false,mapFilter:'all',eventScope:'all',detailBack:'events',sim:null};
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
      const active=b.dataset.page===page || (page==='places'&&b.dataset.page==='map') || (page==='event-detail'&&b.dataset.page==='events') || (page==='simulation'&&b.dataset.page==='profile');
      if(b.classList.contains('nav-link')||b.classList.contains('bottom-link')){b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}
    });
    if(page==='map')requestAnimationFrame(()=>{ensureMap();if(state.map)state.map.invalidateSize()});
    if(page==='events')renderEvents();if(page==='places')renderPlaces();
    if(page==='simulation')renderSimulation();
    if(page==='profile')fillProfile();
    window.scrollTo({top:0,behavior:'instant'});
    if(location.hash!=='#'+page)history.replaceState(null,'','#'+page);
  }
  function eventIcon(mag){
    const tone=mag>=4?'is-strong':'';
    return '<span class="event-icon '+tone+'">'+svgIcon('wave')+'</span>';
  }
  function renderFeed(list,container,emptyText){
    if(!container)return;
    if(state.feed==='loading'){container.innerHTML='<div class="empty-state">Загружаем данные USGS…</div>';return}
    if(state.feed==='error'){container.innerHTML='<div class="empty-state">Нет связи с USGS. Последние события сейчас недоступны, это не оценка безопасности.</div>';return}
    if(!list.length){container.innerHTML='<div class="empty-state">'+esc(emptyText||'По выбранным параметрам событий нет.')+'</div>';return}
    container.innerHTML=list.map(q=>{
      const idx=state.quakes.indexOf(q);
      return '<button class="feed-item" type="button" data-event-index="'+idx+'">'
        +eventIcon(q.mag)
        +'<span class="feed-main"><strong>M '+q.mag.toFixed(1)+'</strong><span class="feed-place">'+esc(locLabel(q))+'</span><small>'+esc(dateAlmaty(q.time))+' · глубина '+q.depth.toFixed(0)+' км</small></span>'
        +svgIcon('chevron').replace('class="icon"','class="icon feed-chevron"')+'</button>';
    }).join('');
  }
  async function fetchWeather(){
    const temp=$('weatherTemp'),icon=$('weatherIcon');
    if(!temp||!icon)return;
    const url='https://api.open-meteo.com/v1/forecast?latitude=43.238&longitude=76.945&current=temperature_2m,weather_code,is_day&timezone=Asia%2FAlmaty';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9500);
    try{
      const response=await fetch(url,{signal:controller.signal});
      if(!response.ok)throw Error('Weather HTTP '+response.status);
      const data=await response.json();
      const now=data?.current;
      if(!now||!Number.isFinite(now.temperature_2m))throw Error('No temperature');
      const t=Math.round(now.temperature_2m);
      temp.textContent=(t>0?'+':'')+t+'°';
      const code=Number(now.weather_code),day=Number(now.is_day)===1;
      icon.textContent=[0,1].includes(code)?(day?'☀':'☾'):[2,3].includes(code)?'☁':[45,48].includes(code)?'≋':[51,53,55,61,63,65,80,81,82].includes(code)?'☂':[71,73,75,77,85,86].includes(code)?'❄':'☁';
      temp.title='Погода Open-Meteo, измерения/модельные данные на '+String(now.time||'текущее время');
    }catch(e){temp.textContent='—°';icon.textContent='☁';temp.title='Погода сейчас недоступна'}
    finally{clearTimeout(timeout)}
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
    if($('refFeedTitle')) {
      $('refFeedTitle').textContent=state.feed==='ok'?'Данные получены':state.feed==='error'?'Нет соединения':'Загрузка данных';
      $('refFeedSubtitle').textContent=state.feed==='ok'?'USGS · обновлено '+new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Almaty',hour:'2-digit',minute:'2-digit'}).format(new Date(state.updated)):state.feed==='error'?'Статус безопасности неизвестен':'Проверяем подключение USGS…';
      document.querySelector('.ref-status-card')?.classList.toggle('is-error',state.feed==='error');
      document.querySelector('.ref-status-card')?.classList.toggle('is-loading',state.feed==='loading');
    }
    renderFeed(state.quakes.slice(0,3),$('homeEvents'),'За 30 дней событий M ≥ 2.5 в каталоге не найдено.');
    renderSimHome();
  }
  function filteredEvents(){
    const days=Number($('periodFilter').value)||30,min=Number($('magnitudeFilter').value)||2.5;
    const cut=Date.now()-days*86400000;
    return state.quakes.filter(q=>q.time>=cut&&q.mag>=min).filter(q=>state.eventScope==='strong'?q.mag>=4:state.eventScope==='local'?distance(ALMATY,q)<=60:true);
  }
  function renderEvents(){
    const items=filteredEvents();
    $('eventCount').textContent=state.feed==='ok'?'Показано '+items.length+' из '+state.quakes.length:'Состояние: '+(state.feed==='loading'?'загрузка':'нет связи');
    renderFeed(items,$('eventsList'),'События с такими параметрами в каталоге не найдены.');
    renderSimEvent();
  }
  function setEventScope(scope){
    if(!['all','local','strong'].includes(scope))return;
    state.eventScope=scope;
    document.querySelectorAll('[data-event-scope]').forEach(b=>{const yes=b.dataset.eventScope===scope;b.classList.toggle('is-active',yes);b.setAttribute('aria-pressed',String(yes))});
    renderEvents();
  }
  function renderPlaces(){
    const root=$('placesList');if(!root)return;
    root.innerHTML=ASSEMBLY.map((p,i)=>{
      const person=state.profile&&Number.isFinite(state.profile.lat)&&Number.isFinite(state.profile.lng);
      const dist=person?'≈ '+distance(state.profile,p).toFixed(1)+' км по прямой':'Расположение предварительное';
      return '<article class="ref-place-result"><button class="ref-place-card" data-place-index="'+i+'" type="button">'
        +placePhotoFigure(p,'list')+'<span class="ref-place-info"><strong>'+esc(p.name)+'</strong><small>'+esc(dist)+'</small><span class="ref-place-tag">Не подтверждено официально</span></span>'+svgIcon('chevron')+'</button>'
        +photoCredit(p)+'</article>';
    }).join('');
  }
  function openPlace(i){
    const p=ASSEMBLY[i];if(!p)return;
    setMapFilter('assembly');nav('map');
    requestAnimationFrame(()=>{if(state.map){state.map.setView([p.lat,p.lng],14);state.map.invalidateSize()}showMapAssembly(p)});
  }
  function mobileEventDetail(q){
    const src=safeUSGS(q.url);
    const fact=(symbol,label,value)=>'<div class="event-detail-fact"><span>'+svgIcon(symbol)+' '+esc(label)+'</span><strong>'+esc(value)+'</strong></div>';
    $('refEventDetail').innerHTML='<article class="ref-detail-primary">'
      +'<div class="event-detail-top"><span class="event-icon is-strong">'+svgIcon('wave')+'</span><div><strong>Землетрясение</strong><small>USGS · зарегистрированное событие</small></div></div>'
      +'<div class="event-magnitude-panel"><strong>M '+q.mag.toFixed(1)+'</strong><span>'+esc(dateAlmaty(q.time))+'</span></div>'
      +'<h2 class="event-detail-place">'+esc(locLabel(q))+'</h2>'
      +'<div class="ref-detail-metrics">'
      +fact('map','Расстояние от Алматы','≈ '+Math.round(distance(ALMATY,q))+' км')
      +fact('wave','Глубина',q.depth.toFixed(1)+' км')
      +fact('location','Координаты',q.lat.toFixed(4)+'°, '+q.lng.toFixed(4)+'°')
      +fact('events','Источник','USGS')
      +'</div>'
      +(src?'<a class="button button-secondary wide" href="'+esc(src)+'" target="_blank" rel="noopener noreferrer">Перейти к записи USGS '+svgIcon('arrow')+'</a>':'')
      +'</article><div class="ref-detail-info"><p>Запись о прошлом событии не прогнозирует будущие землетрясения и не означает, что конкретное здание безопасно или опасно. При сильных толчках укройтесь и защитите голову.</p></div>';
    const back=state.current==='map'?'map':'events';
    const backButton=$('page-event-detail').querySelector('.ref-back');if(backButton)backButton.dataset.page=back;
    nav('event-detail');
  }
  function detail(q){
    if(!q)return;
    if(window.matchMedia && window.matchMedia('(max-width: 800px)').matches){mobileEventDetail(q);return}
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

  // Consistent category icons. The source catalogue is not a seismic warning system.
  // One visual language for all category pins: round tile, rounded bold strokes,
  // restrained halo, and a unique silhouette for each category.
  function markerHTML(type,label){
    const paths={
      quake:'<path d="M3 32h12l6-13 8 27 9-31 8 17h15"/>',
      demo:'<path d="M4 32h10l6-9 8 20 8-26 9 17h15"/><path d="M21 52h22"/>',
      assembly:'<circle cx="23" cy="23" r="7"/><circle cx="42" cy="25" r="6"/><path d="M9 49v-4c0-8 6-13 14-13 8 0 14 5 14 13v4M37 35c8 0 16 5 16 13v1"/>',
      services:'<path d="m32 7 21 9v15c0 13-9 22-21 26-12-4-21-13-21-26V16z"/><path d="M32 19v19m0 9h.01"/>',
      self:'<circle cx="32" cy="32" r="11"/><path d="M32 7v9m0 32v9M7 32h9m32 0h9"/>'
    };
    const medicalGlyph='<g fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">'
      +'<path d="M32 9v46M9 32h46M16 16l32 32M48 16 16 48"/></g>'
      +'<path class="medical-mark-cut" d="M30 8C27 15 40 20 35 28C31 35 25 35 27 42C30 49 40 50 36 57" fill="none" stroke-width="6" stroke-linecap="round"/>'
      +'<path class="medical-mark-cut" d="M39 10C39 17 26 22 29 30C33 38 40 37 38 44C37 49 33 52 31 56" fill="none" stroke-width="4" stroke-linecap="round"/>';
    if(type!=='hospital'&&!Object.prototype.hasOwnProperty.call(paths,type))return '';
    const icon='<svg class="map-pin-symbol'+(type==='hospital'?' map-pin-symbol--medical':'')+'" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">'
      +(type==='hospital'?medicalGlyph:paths[type])+'</svg>';
    return '<span class="map-pin map-pin--'+type+'"><span class="map-pin__core">'+icon+'</span>'
      +(type==='demo'?'<span class="map-pin__mag">ТЕСТ</span>':'')+'</span>';
  }
  function leafletIcon(type,label){
    return L.divIcon({className:'seismo-map-icon',html:markerHTML(type,label),iconSize:[40,52],iconAnchor:[20,27]});
  }
  function defaultMapSheet(){
    $('mapSheet').hidden=true;
    $('mapSheetDismiss').hidden=true;
    $('mapSheet').classList.remove('has-place-photo');
    $('mapSheet').innerHTML='<div class="sheet-default"><strong>Выберите объект на карте</strong><span>Нажмите на маркер, чтобы увидеть категорию, название и подробности.</span></div>';
  }
  function setMapFilter(filter){
    if(!['all','quake','hospital','assembly','services'].includes(filter))return;
    state.mapFilter=filter;
    document.querySelectorAll('[data-map-filter]').forEach(button=>{
      const selected=button.dataset.mapFilter===filter;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    defaultMapSheet();
    refreshMapMarkers();
  }
  function ensureMap(){
    if(state.map)return;
    if(!window.L){$('map').innerHTML='<div class="empty-state">Карта недоступна: библиотека Leaflet не загрузилась. Проверьте соединение.</div>';return}
    state.map=L.map('map',{zoomControl:false}).setView([ALMATY.lat,ALMATY.lng],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(state.map);
    L.control.zoom({position:'topright'}).addTo(state.map);
    state.layers={quake:L.layerGroup().addTo(state.map),hospital:L.layerGroup().addTo(state.map),
      assembly:L.layerGroup().addTo(state.map),services:L.layerGroup().addTo(state.map),
      self:L.layerGroup().addTo(state.map),demo:L.layerGroup().addTo(state.map)};
    state.map.on('click',e=>{
      if(!state.pickOnMap)return;
      state.pickOnMap=false;state.profile={...(state.profile||{}),lat:e.latlng.lat,lng:e.latlng.lng};
      saveProfile();refreshMapMarkers();toast('Точка сохранена на устройстве');showMapLocation('Адрес на карте',e.latlng);
    });
    refreshMapMarkers();
  }
  function refreshMapMarkers(){
    if(!state.map||!state.layers)return;
    Object.values(state.layers).forEach(layer=>layer.clearLayers());
    const show=type=>state.mapFilter==='all'||state.mapFilter===type;
    if(show('quake')&&state.feed==='ok'){
      state.quakes.forEach((q,i)=>{
        L.marker([q.lat,q.lng],{icon:leafletIcon('quake',q.mag.toFixed(1)),title:'Землетрясение M '+q.mag.toFixed(1)})
          .on('click',()=>showMapQuake(q,i)).addTo(state.layers.quake);
      });
    }
    if(state.sim&&show('quake')){
      L.marker([ALMATY.lat,ALMATY.lng],{icon:leafletIcon('demo',state.sim.mag.toFixed(1)),title:'СИМУЛЯЦИЯ M '+state.sim.mag.toFixed(1)+' — не реальное землетрясение',zIndexOffset:1200})
        .on('click',showMapSimulation).addTo(state.layers.demo);
    }
    $('simMapLegend').hidden=!state.sim||!show('quake');
    if(show('hospital')){
      HOSPITALS.forEach(p=>L.marker([p.lat,p.lng],{icon:leafletIcon('hospital'),title:'Больница (координаты предварительные): '+p.name})
        .on('click',()=>showMapHospital(p)).addTo(state.layers.hospital));
    }
    if(show('assembly')){
      ASSEMBLY.forEach(p=>L.marker([p.lat,p.lng],{icon:leafletIcon('assembly'),title:'Место сбора (не проверено): '+p.name})
        .on('click',()=>showMapAssembly(p)).addTo(state.layers.assembly));
    }
    if(show('services')){
      SERVICES.forEach(p=>L.marker([p.lat,p.lng],{icon:leafletIcon('services'),title:'МЧС (координаты предварительные): '+p.name})
        .on('click',()=>showMapServices(p)).addTo(state.layers.services));
    }
    if(state.profile&&Number.isFinite(state.profile.lat)&&Number.isFinite(state.profile.lng)){
      L.marker([state.profile.lat,state.profile.lng],{icon:leafletIcon('self'),title:'Ваше сохранённое местоположение'})
        .on('click',()=>showMapLocation('Ваше местоположение',state.profile)).addTo(state.layers.self);
    }
    $('mapDataInfo').textContent=state.feed==='ok'
      ?'USGS: '+state.quakes.length+' событий · Больницы: '+HOSPITALS.length+' · МЧС: '+SERVICES.length
      :state.feed==='loading'?'Загрузка USGS; объекты предварительные':'USGS недоступен. Объекты предварительные.';
  }
  function activateMapSheet(){
    $('mapSheet').hidden=false;
    $('mapSheetDismiss').hidden=false;
  }
  function sheetHeader(type,title,subtitle){
    return '<div class="sheet-handle" aria-hidden="true"></div><div class="sheet-header"><span class="sheet-type-icon sheet-type--'+type+'">'+markerHTML(type)+'</span><div class="sheet-heading"><span class="sheet-category">'+esc(subtitle)+'</span><h3>'+esc(title)+'</h3></div></div>';
  }
  function searchMaps(name){
    const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+', Алматы, Казахстан');
    return '<a class="button button-secondary" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Найти в Google Картах '+svgIcon('arrow')+'</a>';
  }
  function profileDistance(point){
    const p=state.profile;
    return p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)
      ?'<span>≈ '+distance(p,point).toFixed(1)+' км по прямой</span>'
      :'<span>Укажите местоположение для расчёта расстояния</span>';
  }
  function showMapQuake(q,i){
    activateMapSheet();$('mapSheet').classList.remove('has-place-photo');
    $('mapSheet').innerHTML='<div class="sheet-handle"></div>'
      +'<div class="quake-sheet-heading"><span class="quake-sheet-icon">'+svgIcon('wave')+'</span><div><strong>Землетрясение</strong><small>USGS · '+esc(ago(q.time))+'</small></div><b>M '+q.mag.toFixed(1)+'</b></div>'
      +'<div class="quake-sheet-metrics"><div><span>Эпицентр</span><strong>'+q.lat.toFixed(2)+'°, '+q.lng.toFixed(2)+'°</strong></div><div><span>От Алматы</span><strong>≈ '+Math.round(distance(ALMATY,q))+' км</strong></div><div><span>Глубина</span><strong>'+q.depth.toFixed(0)+' км</strong></div></div>'
      +'<button class="quake-sheet-action" type="button" data-event-index="'+i+'">Подробнее '+svgIcon('chevron')+'</button>';
  }
  function showMapSimulation(){
    activateMapSheet();
    $('mapSheet').classList.remove('has-place-photo');
    if(!state.sim)return;
    const v=state.sim;
    $('mapSheet').innerHTML=sheetHeader('demo','СИМУЛЯЦИЯ · M '+v.mag.toFixed(1),'Учебный сценарий · НЕ USGS')
      +'<p class="sheet-info">Вымышленный эпицентр для демонстрации возле центра Алматы. Магнитуда условная. Датчик не измеряет её.</p>'
      +'<div class="sheet-meta"><span>Режим: '+esc(v.level)+'</span><span>Старт: '+esc(dateAlmaty(v.time))+'</span></div>'
      +'<div class="sheet-actions"><button class="button button-primary" data-page="simulation" type="button">Управление симуляцией '+svgIcon('arrow')+'</button></div>';
  }
  function showMapHospital(p){
    activateMapSheet();
    $('mapSheet').classList.remove('has-place-photo');
    $('mapSheet').innerHTML=sheetHeader('hospital',p.name,'Больница · координаты предварительные')
      +'<p class="sheet-info">Адрес и точность отметки не подтверждены. Перед поездкой проверьте актуальное местоположение и режим работы.</p>'
      +'<div class="sheet-meta">'+profileDistance(p)+'</div>'
      +'<div class="sheet-actions">'+searchMaps(p.name)+'</div>';
  }
  function showMapAssembly(p){
    activateMapSheet();
    $('mapSheet').classList.add('has-place-photo');
    $('mapSheet').innerHTML=sheetHeader('assembly',p.name,'Возможное место сбора · не подтверждено')
      +'<figure class="map-place-figure">'+placePhotoFigure(p,'sheet')+'<figcaption>'+photoCredit(p)+'</figcaption></figure>'
      +'<p class="sheet-info">'+esc(p.note)+'. Фотография сделана ранее и не подтверждает текущую доступность. Это не проверенный пункт эвакуации или безопасный маршрут.</p>'
      +'<div class="sheet-meta">'+profileDistance(p)+'</div>'
      +'<div class="sheet-actions">'+searchMaps(p.name)+'</div>';
  }
  function showMapServices(p){
    activateMapSheet();
    $('mapSheet').classList.remove('has-place-photo');
    $('mapSheet').innerHTML=sheetHeader('services',p.name,'МЧС · координаты предварительные')
      +'<p class="sheet-info">Местоположение учреждения требует проверки. Экстренный номер РК: 112 (общий, не прямой телефон этого учреждения).</p>'
      +'<div class="sheet-meta">'+profileDistance(p)+'</div>'
      +'<div class="sheet-actions">'+searchMaps(p.name)+'</div>';
  }
  function showMapLocation(label,loc){
    activateMapSheet();
    $('mapSheet').classList.remove('has-place-photo');
    $('mapSheet').innerHTML=sheetHeader('self',label,'Ваше сохранённое местоположение')
      +'<p class="sheet-info">'+Number(loc.lat).toFixed(5)+', '+Number(loc.lng).toFixed(5)+'</p>';
  }
  function syntheticSignal(amp){
    if(!amp)return 'M0 38 H340';
    const pts=[];
    // Deterministic synthetic waveform (not data acquired from sensors).
    for(let x=0;x<=340;x+=3){
      const phase=x/340*Math.PI*9;
      const n=(Math.sin(phase)*.65+Math.sin(phase*2.33+.7)*.22+Math.sin(phase*4.9+1.4)*.13);
      pts.push((x===0?'M':'L')+x+' '+(38-n*amp*.34).toFixed(2));
    }
    return pts.join(' ');
  }
  function renderSimHome(){
    const banner=$('simulationHomeBanner');
    if(!banner)return;
    banner.hidden=!state.sim;
    if(state.sim)$('simulationHomeTitle').textContent='УЧЕБНАЯ СИМУЛЯЦИЯ · M '+state.sim.mag.toFixed(1)+' · '+state.sim.level;
  }
  function renderSimEvent(){
    const card=$('simulationEventCard');
    if(!card)return;
    card.hidden=!state.sim;
    if(!state.sim){card.innerHTML='';return}
    const v=state.sim;
    card.innerHTML='<div class="sim-event-label"><span class="sim-demo-chip">СИМУЛЯЦИЯ</span><span>Сценарий M '+v.mag.toFixed(1)+' · '+esc(v.level)+'</span></div>'
      +'<div class="sim-event-info"><strong>Учебное землетрясение · Алматы</strong><small>'+esc(dateAlmaty(v.time))+' · тестовое событие, не из USGS</small></div>'
      +'<button type="button" data-page="simulation" class="button button-secondary">Подробнее →</button>';
  }
  function renderSimulation(){
    const v=state.sim,active=Boolean(v);
    $('simActivePanel').dataset.state=v?v.level:'OFF';
    $('simState').textContent=v?'СИМУЛЯЦИЯ · M '+v.mag.toFixed(1):'Нет активной симуляции';
    $('simModeLabel').textContent=v?v.level:'OFF';
    $('simDescription').textContent=v?v.caption:'Выберите сценарий выше. Отдельная учебная карточка появится в событиях, а тестовая точка — на карте.';
    $('simAmplitude').textContent=v?v.amp+' / 100':'0 / 100';
    $('simWavePath').setAttribute('d',syntheticSignal(v?v.amp:0));
    $('simWavePath').setAttribute('stroke',v?.level==='EMERGENCY'?'#dd4b56':v?.level==='WARNING'?'#d39b38':'#347bea');
    document.querySelectorAll('[data-sim-level]').forEach(btn=>{
      const selected=active&&Number(btn.dataset.simLevel)===v.mag;
      btn.classList.toggle('is-active',selected);btn.setAttribute('aria-pressed',String(selected));
    });
    for(const id of ['simOpenMap','simOpenEvents','simStop'])$(id).disabled=!active;
    const modes={
      'OFF':['Обычный режим','Обычный режим','Обычный режим','Обычный режим'],
      NORMAL:['Норма (демо)','Норма (демо)','Норма (демо)','Норма (демо)'],
      WARNING:['Мониторинг (демо)','Мониторинг (демо)','Проверка (демо)','Проверка (демо)'],
      EMERGENCY:['Запрос закрытия (демо)','Запрос безопасного отключения (демо)','Запрос остановки (демо)','Запрос разблокировки (демо)']
    };
    const states=modes[v?v.level:'OFF'];
    ['simGas','simPower','simLift','simDoors'].forEach((id,i)=>$(id).textContent=states[i]);
    renderSimHome();renderSimEvent();refreshMapMarkers();
  }
  function runSimulation(key){
    if(!Object.prototype.hasOwnProperty.call(SIM_PRESETS,key))return;
    const p=SIM_PRESETS[key];
    state.sim={...p,time:Date.now()};
    renderSimulation();
    if(p.level==='EMERGENCY')openDrill();
    else toast('Запущена учебная симуляция M '+p.mag.toFixed(1)+' · '+p.level);
  }
  function stopSimulation(){
    if(!state.sim)return;
    state.sim=null;
    renderSimulation();defaultMapSheet();
    toast('Учебный сценарий завершён. Реальные данные USGS не менялись.');
  }
  function activateGuide(mode){
    document.querySelectorAll('[data-guide]').forEach(b=>{const yes=b.dataset.guide===mode;b.classList.toggle('is-active',yes);b.setAttribute('aria-selected',String(yes))});
    const guideIcons=mode==='before'?['shield','book','home','group']:mode==='during'?['shield','alert','home','map']:['shield','home','alert','events'];
    $('guideCards').innerHTML=(GUIDES[mode]||GUIDES.during).map((txt,i)=>'<article class="guide-card"><span class="guide-icon">'+svgIcon(guideIcons[i])+'</span><p>'+esc(txt)+'</p></article>').join('');
  }
  function openDrill(){$('trainingOverlay').hidden=false;document.body.style.overflow='hidden';$('endDrill').focus()}
  function closeDrill(){$('trainingOverlay').hidden=true;document.body.style.overflow=''}
  function loadProfile(){
    try{const saved=JSON.parse(localStorage.getItem('seismo_resident_profile_v1')||'null');
      if(saved&&typeof saved==='object'){
        const lat=saved.lat===null?null:Number(saved.lat),lng=saved.lng===null?null:Number(saved.lng);
        state.profile={name:String(saved.name||'').slice(0,48),address:String(saved.address||'').slice(0,150),lat:lat!==null&&Number.isFinite(lat)&&Math.abs(lat)<=90?lat:null,lng:lng!==null&&Number.isFinite(lng)&&Math.abs(lng)<=180?lng:null};
      }
    }catch(e){state.profile=null}
  }
  function updateProfileLabel(){
    const raw=(state.profile?.name||'').trim();
    const name=raw.replace(/[\r\n<>]/g,' ').slice(0,48);
    $('refProfileName').textContent=name||'Профиль жителя';
    $('refGreetingName').textContent=name?'Здравствуйте,\n'+name+'!':'Здравствуйте!';
  }
  function fillProfile(){
    $('profileName').value=state.profile?.name||'';
    updateProfileLabel();
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
    state.profile={name:$('profileName').value.trim().slice(0,48),address:$('profileAddress').value.trim(),lat,lng};
    if(saveProfile()){$('profileStatus').textContent='Сохранено на этом устройстве.';updateProfileLabel();refreshMapMarkers()}
  }
  function geolocate(){
    if(!navigator.geolocation){toast('Геолокация недоступна в этом браузере');return}
    toast('Запрашиваем разрешение на местоположение…');
    navigator.geolocation.getCurrentPosition(pos=>{
      state.profile={...(state.profile||{}),lat:pos.coords.latitude,lng:pos.coords.longitude};
      if(saveProfile()){fillProfile();refreshMapMarkers();toast('Местоположение сохранено');if(state.current==='map'&&state.map)state.map.setView([state.profile.lat,state.profile.lng],13)}
    },()=>toast('Не получилось определить местоположение. Можно ввести координаты вручную.'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  loadProfile();fillProfile();activateGuide('before');renderPlaces();
  document.addEventListener('click',e=>{
    const pager=e.target.closest('[data-page]');
    if(pager){e.preventDefault();if(pager.dataset.mapLayer==='assembly')setMapFilter('assembly');nav(pager.dataset.page);return}
    const evt=e.target.closest('[data-event-index]');if(evt){detail(state.quakes[Number(evt.dataset.eventIndex)]);return}
    const scenario=e.target.closest('[data-sim-level]');
    if(scenario){runSimulation(scenario.dataset.simLevel);return}
    const place=e.target.closest('[data-place-index]');if(place){openPlace(Number(place.dataset.placeIndex));return}
    const scope=e.target.closest('[data-event-scope]');if(scope){setEventScope(scope.dataset.eventScope);return}
    const guide=e.target.closest('[data-guide]');if(guide){activateGuide(guide.dataset.guide);return}
  });
  document.querySelector('.map-preview').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nav('map')}});
  window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if($('page-'+h))nav(h)});
  const filterPanel=$('mapFilterPanel');
  const mapFilterToggle=$('toggleMapFilters');
  const mapLayerToggle=$('toggleMapLayers');
  function toggleFilterPanel(force){
    const open=typeof force==='boolean'?force:filterPanel.hidden;
    filterPanel.hidden=!open;
    mapFilterToggle.setAttribute('aria-expanded',String(open));
    mapLayerToggle.setAttribute('aria-expanded',String(open));
  }
  mapFilterToggle.addEventListener('click',()=>toggleFilterPanel());
  mapLayerToggle.addEventListener('click',()=>toggleFilterPanel());
  $('mapSheetDismiss').addEventListener('click',defaultMapSheet);
  $('mapUserLocate').addEventListener('click',geolocate);

  ['periodFilter','magnitudeFilter'].forEach(id=>$(id).addEventListener('change',renderEvents));
  document.querySelectorAll('[data-map-filter]').forEach(button=>button.addEventListener('click',()=>{setMapFilter(button.dataset.mapFilter);toggleFilterPanel(false)}));
  ['mapRefresh','eventsRefresh'].forEach(id=>$(id).addEventListener('click',fetchQuakes));
  ['locateMe','profileGeolocate'].forEach(id=>$(id).addEventListener('click',geolocate));
  $('openAddressEditor').addEventListener('click',()=>{
    const editor=$('profileForm');
    if(editor){
      const wrap=editor.closest('.profile-card');
      wrap?.classList.add('is-open');
      editor.scrollIntoView({behavior:'smooth',block:'center'});
      $('profileAddress').focus({preventScroll:true});
    }
  });
  $('simOpenMap').addEventListener('click',()=>{
    if(!state.sim)return;
    setMapFilter('all');nav('map');
    requestAnimationFrame(()=>{
      if(state.map){state.map.setView([ALMATY.lat,ALMATY.lng],12);state.map.invalidateSize()}
      showMapSimulation();
    });
  });
  $('simOpenEvents').addEventListener('click',()=>{if(state.sim)nav('events')});
  $('simStop').addEventListener('click',stopSimulation);
  $('profileForm').addEventListener('submit',saveForm);
  $('closeDetail').addEventListener('click',closeDetail);
  $('detailDialog').addEventListener('click',e=>{if(e.target===$('detailDialog'))closeDetail()});
  $('startDrill').addEventListener('click',openDrill);
  ['endDrill','trainingDone'].forEach(id=>$(id).addEventListener('click',closeDrill));
  document.addEventListener('error',e=>{
    if(e.target instanceof HTMLImageElement && e.target.classList.contains('place-photo')){
      e.target.closest('.place-photo-frame')?.classList.add('photo-unavailable');
    }
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('detailDialog').hidden)closeDetail();if(!$('trainingOverlay').hidden)closeDrill()}});
  nav(['home','map','events','instructions','profile','places','simulation'].includes(location.hash.slice(1))?location.hash.slice(1):'home');
  renderSimulation();
  fetchQuakes();
  fetchWeather();
  setInterval(fetchQuakes,300000);
  setInterval(fetchWeather,900000);
})();
