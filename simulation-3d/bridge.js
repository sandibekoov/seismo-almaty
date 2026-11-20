/* Read-only ESP32 telemetry. No actuator commands are sent from the browser. */
function parseSeismoFrame(line) {
  let p;
  try { p=JSON.parse(line); } catch (_) { return null; }
  if(!p || p.source!=='esp32' || !['NORMAL','WARNING','EMERGENCY','FAULT'].includes(p.state) ||
    typeof p.accelerationG!=='number' || !Number.isFinite(p.accelerationG) || p.accelerationG<0 ||
    !['powerOn','gasOpen','liftMoving','alarmOn'].every(k=>typeof p[k]==='boolean') ||
    !Number.isInteger(p.floor) || p.floor<1 || p.floor>5) return null;
  return p;
}
class SeismoSerial {
  constructor(onFrame,onStatus){Object.assign(this,{onFrame,onStatus,port:null,reader:null,stopping:false,task:null})}
  connected(){return !!this.port}
  async connect(baudRate){
    if(this.port)return;
    if(!navigator.serial){this.onStatus('USB unavailable');return}
    this.stopping=false;
    try{
      const port=await navigator.serial.requestPort();
      if(this.stopping)return;
      await port.open({baudRate});
      if(this.stopping){await port.close();return}
      this.port=port;this.onStatus('Waiting for ESP32');
      this.task=this.read();
    }catch(_){this.onStatus('Connection failed')}
  }
  async read(){
    const port=this.port,decoder=new TextDecoder();let buffer='';
    try{
      this.reader=port.readable.getReader();
      while(!this.stopping){
        const {value,done}=await this.reader.read();
        if(done)break;
        buffer+=decoder.decode(value,{stream:true});
        const lines=buffer.split('\n');buffer=lines.pop();
        if(buffer.length>8192)buffer='';
        for(const line of lines){const p=parseSeismoFrame(line.trim());if(p)this.onFrame(p)}
      }
    }catch(_){if(!this.stopping)this.onStatus('Connection failed')}
    finally{
      if(this.reader){this.reader.releaseLock();this.reader=null}
      try{await port.close()}catch(_){}
      this.port=null;if(!this.stopping)this.onStatus('Disconnected');
    }
  }
  async disconnect(){this.stopping=true;if(this.reader){try{await this.reader.cancel()}catch(_){}}if(this.task)await this.task;this.task=null}
}

const Seismo3DLanguage=(()=>{
  const strings={
    'Back':['← Seismo Almaty','← Seismo Almaty','← Seismo Almaty'],
    '3D Building Lab':['3D-модель здания','Ғимараттың 3D үлгісі','3D Building Lab'],
    'KBTU Campus Lab':['3D-модель КБТУ','ҚБТУ 3D үлгісі','KBTU Campus Lab'],
    'Live unavailable':['Нет свежих данных — модель на паузе.','Жаңа деректер жоқ — үлгі кідіртілді.','No fresh telemetry — model paused.'],
    'Simulation':['Симуляция','Симуляция','Simulation'],
    'ESP32 Live':['ESP32 · мониторинг','ESP32 · мониторинг','ESP32 Live'],
    'Connect USB':['Подключить USB','USB қосу','Connect USB'],
    'Disconnect':['Отключить','Ажырату','Disconnect'],
    'Demo notice':['Учебный сценарий. Не реальная тревога.','Оқу сценарийі. Нақты дабыл емес.','Educational simulation. Not a real earthquake alert.'],
    'Live notice':['Данные команд ESP32, не подтверждение положения механизмов. Только чтение.','ESP32 командалары, механизмдердің нақты қалпы расталмайды. Тек оқу.','ESP32 command telemetry, not confirmed actuator position. Read-only.'],
    '3D unavailable':['Модель не загрузилась. Проверьте интернет.','Үлгі жүктелмеді. Интернетті тексеріңіз.','Model could not load. Check your internet connection.'],
    'Compatibility renderer':['Совместимый режим отрисовки','Үйлесімді бейнелеу режимі','Compatibility renderer'],
    'Accelerometer':['Акселерометр','Акселерометр','Accelerometer'],
    'Power':['Освещение','Жарықтандыру','Lighting'],
    'Gas':['Газ','Газ','Gas'],
    'Elevator':['Лифт','Лифт','Elevator'],
    'Alarm':['Тревога','Дабыл','Alarm'],
    'Overview':['Обзор','Шолу','Overview'],
    'Campus':['Кампус','Кампус','Campus'],
    'Sensor':['Датчик','Датчик','Sensor'],
    'Gas valve':['Газовый клапан','Газ клапаны','Gas valve'],
    'Cutaway':['Разрез','Қима','Cutaway'],
    'Alarm sound':['Звук тревоги','Дабыл дыбысы','Alarm sound'],
    'Peak vibration amplitude':['Амплитуда вибрации','Діріл амплитудасы','Peak vibration amplitude'],
    'Synthetic signal':['Условный сигнал','Шартты сигнал','Synthetic signal'],
    'Assembly point':['Точка сбора','Жиналу орны','Assembly point'],
    'Evacuation in progress':['Эвакуация','Эвакуация жүріп жатыр','Evacuation in progress'],
    'Evacuation complete':['Эвакуация завершена','Эвакуация аяқталды','Evacuation complete'],
    'Stop shaking':['Остановить толчки','Дірілді тоқтату','Stop shaking'],
    'Demo magnitude only. Release the slider to start shaking.':['Учебная магнитуда. Отпустите ползунок для запуска.','Оқу магнитудасы. Іске қосу үшін жүгірткіні босатыңыз.','Demo magnitude only. Release the slider to start shaking.'],
    'Demo signal only. Change amplitude before or during Earthquake. Reset clears latched protection.':['Демо-сигнал. Меняйте амплитуду до или во время землетрясения. Сброс снимает защиту.','Демо-сигнал. Амплитуданы жер сілкінісіне дейін немесе кезінде өзгертіңіз. Қорғауды қалпына келтіру арқылы өшіріңіз.','Demo signal only. Change amplitude before or during Earthquake. Reset clears latched protection.'],
    'SEISMO installed on a campus building (schematic model)':['SEISMO в здании КБТУ (условная модель)','ҚБТУ ғимаратындағы SEISMO (шартты үлгі)','SEISMO installed on a campus building (schematic model)'],
    'ESP32 with accelerometer monitors vibration':['ESP32 с акселерометром контролирует вибрацию','ESP32 акселерометр арқылы дірілді бақылайды','ESP32 with accelerometer monitors vibration'],
    'Simulated earthquake — adjustable peak vibration':['Симуляция землетрясения — регулируемая амплитуда','Жер сілкінісін модельдеу — реттелетін амплитуда','Simulated earthquake — adjustable peak vibration'],
    'Demo alarm active':['Демо-тревога активна','Демо-дабыл белсенді','Demo alarm active'],
    'Evacuation started':['Началась эвакуация','Эвакуация басталды','Evacuation started'],
    'People evacuate to the assembly point':['Люди выходят к точке сбора','Адамдар жиналу орнына шығады','People evacuate to the assembly point'],
    'NORMAL':['НОРМА','ҚАЛЫПТЫ','NORMAL'],'WARNING':['ВНИМАНИЕ','ЕСКЕРТУ','WARNING'],'EMERGENCY':['АВАРИЯ','АПАТ','EMERGENCY'],'FAULT':['НЕИСПРАВНОСТЬ','АҚАУ','FAULT'],
    'Earthquake':['Землетрясение','Жер сілкінісі','Earthquake'],
    'Footsteps':['Шаги','Қадамдар','Footsteps'],
    'Auto demo':['Автодемо','Автодемо','Auto demo'],
    'Reset':['Сброс','Қалпына келтіру','Reset'],
    'Settings':['Настройки','Баптаулар','Settings'],
    'Scenario magnitude':['Магнитуда сценария','Сценарий магнитудасы','Scenario magnitude'],
    'Duration':['Длительность','Ұзақтығы','Duration'],
    'Trigger threshold':['Демо-порог','Демо-шек','Demo threshold'],
    'Confirm time':['Время подтверждения','Растау уақыты','Confirm time'],
    'False-alarm filter':['Фильтр коротких ударов','Қысқа соққылар сүзгісі','False-alarm filter (ignore short impacts)'],
    'Monitoring':['Мониторинг','Мониторинг','Monitoring'],
    'Vibration detected':['Обнаружена вибрация','Діріл анықталды','Vibration detected'],
    'ARMED':['ГОТОВ','ДАЙЫН','ARMED'],'TRIGGERED':['СРАБОТАЛ','ІСКЕ ҚОСЫЛДЫ','TRIGGERED'],
    'ON':['ВКЛ','ҚОСУЛЫ','ON'],'OFF':['ВЫКЛ','ӨШІРУЛІ','OFF'],
    'OPEN':['ОТКРЫТ','АШЫҚ','OPEN'],'CLOSED':['ЗАКРЫТ','ЖАБЫҚ','CLOSED'],
    'MOVING':['ДВИЖЕНИЕ','ҚОЗҒАЛЫСТА','MOVING'],'STOPPED':['ОСТАНОВЛЕН','ТОҚТАТЫЛДЫ','STOPPED'],
    'CUT':['ОТКЛ','ӨШІРІЛДІ','CUT'],'ALARM':['ТРЕВОГА','ДАБЫЛ','ALARM'],
    'UNKNOWN':['НЕТ ДАННЫХ','ДЕРЕК ЖОҚ','UNKNOWN'],
    'Waiting for ESP32':['Ожидание ESP32','ESP32 күтілуде','Waiting for ESP32'],
    'Live telemetry':['Телеметрия ESP32','ESP32 телеметриясы','Live telemetry'],
    'Telemetry stale':['Данные устарели','Деректер ескірді','Telemetry stale'],
    'Disconnected':['Отключено','Ажыратылды','Disconnected'],
    'USB unavailable':['USB недоступен в этом браузере','Бұл браузерде USB қолжетімсіз','USB unavailable in this browser'],
    'Connection failed':['Ошибка подключения','Қосылу қатесі','Connection failed'],
    'System reset':['Система сброшена','Жүйе қалпына келтірілді','System reset'],
    'System armed':['Система готова','Жүйе дайын','System armed'],
    'Short impact filtered: no action':['Короткий удар отфильтрован','Қысқа соққы сүзілді','Short impact filtered: no action'],
    'Below threshold: no action':['Сигнал ниже порога','Сигнал шектен төмен','Below threshold: no action'],
    'Test: footsteps / short impact':['Тест: шаги / короткий удар','Сынақ: қадамдар / қысқа соққы','Test: footsteps / short impact'],
    'Power disconnected':['Освещение отключено','Жарық өшірілді','Lighting disconnected'],
    'Gas valve closed':['Газовый клапан закрыт','Газ клапаны жабылды','Gas valve closed'],
    'Elevator sent to nearest floor':['Лифт направлен на ближайший этаж','Лифт жақын қабатқа жіберілді','Elevator sent to nearest floor'],
    'Elevator stops at the nearest floor':['Лифт остановился на ближайшем этаже','Лифт жақын қабатта тоқтады','Elevator stops at the nearest floor'],
    'Alarm on, app notified':['Демо-тревога активна','Демо-дабыл белсенді','Demo alarm active'],
    'Alarm active, dashboard and app notified':['Демо-тревога активна','Демо-дабыл белсенді','Demo alarm active'],
    'Normal operation: sensor monitors vibration':['Норма: датчик контролирует вибрацию','Қалыпты: датчик дірілді бақылайды','Normal operation: sensor monitors vibration'],
    'ESP32 reads the accelerometer and checks the threshold':['ESP32 обрабатывает ускорение и проверяет порог','ESP32 үдеуді өңдеп, шекті тексереді','ESP32 reads the accelerometer and checks the threshold'],
    'Footsteps: short spike is filtered, no false alarm':['Шаги: короткий импульс отфильтрован','Қадамдар: қысқа импульс сүзілді','Footsteps: short spike is filtered, no false alarm'],
    'Magnitude 6.5 earthquake':['Учебное землетрясение M6.5','Оқу жер сілкінісі M6.5','Demo earthquake M6.5'],
    'SEISMO: the system acts, not just warns':['SEISMO: автоматическая защита макета','SEISMO: макетті автоматты қорғау','SEISMO: automated model protection'],
    'Impact ignored by filter':['Импульс отфильтрован','Импульс сүзілді','Impact ignored by filter'],
    'Vibration below threshold':['Вибрация ниже порога','Діріл шектен төмен','Vibration below threshold']
  };
  let lang='ru';try{lang=localStorage.getItem('seismo_language_v1')||'ru'}catch(_){}
  if(!['ru','kk','en'].includes(lang))lang='ru';
  const originals=new WeakMap();
  const tr=s=>{const i=lang==='kk'?1:lang==='en'?2:0;if(strings[s])return strings[s][i];
    const numbered=s.match(/^(\d[:]?\s+)(.*)$/);if(numbered)return numbered[1]+tr(numbered[2]);
    const threshold=s.match(/^Threshold (.+) g$/);if(threshold)return ['Порог ','Шек ','Threshold '][i]+threshold[1]+' g';
    const demo=s.match(/^Demo earthquake, (.+) g target$/);if(demo)return ['Демо-землетрясение, цель ','Демо жер сілкінісі, мақсат ','Demo earthquake, target '][i]+demo[1]+' g';
    const target=s.match(/^Set peak target (.+) g · (likely above threshold|likely below threshold|near threshold) \(simulation\)$/);
    if(target){const states={'likely above threshold':['вероятно выше порога','шектен жоғары болуы мүмкін','likely above threshold'],'likely below threshold':['вероятно ниже порога','шектен төмен болуы мүмкін','likely below threshold'],'near threshold':['около порога','шекке жақын','near threshold']};return ['Целевой пик ','Мақсатты шың ','Set peak target '][i]+target[1]+' g · '+states[target[2]][i]}
    const patterns=[
      [/^Earthquake started, M(.+)$/,['Начата симуляция M','Симуляция басталды M','Earthquake started, M']],
      [/^Protection active in (.+) s$/,['Защита за ','Қорғау уақыты ','Protection active in ']],
      [/^Quake confirmed\. Reaction (.+) s$/,['Сценарий подтверждён за ','Сценарий расталды: ','Quake confirmed. Reaction ']],
      [/^Quake confirmed, reaction (.+) s$/,['Сценарий подтверждён за ','Сценарий расталды: ','Quake confirmed, reaction ']],
      [/^Demo peak (.+) g: likely (above|below) threshold$/,['Демо-пик ','Демо-шың ','Demo peak ']]
    ];
    for(const [regex,prefix] of patterns){const m=s.match(regex);if(m){if(m[2])return prefix[i]+m[1]+' g · '+(m[2]==='above'?['выше порога','шектен жоғары','above threshold'][i]:['ниже порога','шектен төмен','below threshold'][i]);return prefix[i]+m[1]+(s.startsWith('Earthquake')?'':' s')}}
    const time=s.match(/^(\d\d:\d\d:\d\d\s+)(.*)$/);return time?time[1]+tr(time[2]):s;
  };
  function translateNode(n){if(n.nodeType!==3||!n.parentElement||n.parentElement.closest('script,style,select,[data-t]'))return;const old=originals.get(n);const src=old&&old.rendered===n.nodeValue?old.src:n.nodeValue;const rendered=tr(src);originals.set(n,{src,rendered});if(n.nodeValue!==rendered)n.nodeValue=rendered}
  function walk(root){if(root.nodeType===3){translateNode(root);return}const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())translateNode(n)}
  function translateAll(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=tr(el.dataset.t));walk(document.body)}
  function init(){
    const selector=document.getElementById('lang');selector.value=lang;
    selector.onchange=()=>{lang=selector.value;try{localStorage.setItem('seismo_language_v1',lang)}catch(_){}translateAll()};
    window.addEventListener('storage',e=>{if(e.key==='seismo_language_v1'&&['ru','kk','en'].includes(e.newValue)){lang=e.newValue;selector.value=lang;translateAll()}});
    translateAll();
    new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')translateNode(r.target);else for(const n of r.addedNodes)walk(n);if(r.type==='childList'&&r.target.dataset&&r.target.dataset.t){const v=tr(r.target.dataset.t);if(r.target.textContent!==v)r.target.textContent=v}}}).observe(document.body,{childList:true,characterData:true,subtree:true});
  }
  return {init,tr};
})();
