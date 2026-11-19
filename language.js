/* Shared resident/engineering locale. Translate presentation, not sensor or USGS data. */
(function () {
  'use strict';
  const KEY = 'seismo_language_v1';
  const dictionary = window.SEISMO_TRANSLATIONS || {};
  const supported = ['kk', 'ru', 'en'];
  const column = {kk: 0, en: 1};
  let language = 'ru';
  try {
    const saved = localStorage.getItem(KEY);
    if (supported.includes(saved)) language = saved;
  } catch (_) {}
  const patterns = [
    [/^Здравствуйте,([\s\S]+)!$/, 'Сәлеметсіз бе,$1!', 'Hello,$1!'],
    [/^(USGS · )?Только что$/, '$1Жаңа ғана', '$1Just now'],
    [/^(USGS · )?(\d+) мин назад$/, '$1$2 мин бұрын', '$1$2 min ago'],
    [/^(USGS · )?(\d+) ч назад$/, '$1$2 сағ бұрын', '$1$2 hr ago'],
    [/^(USGS · )?(\d+) дн назад$/, '$1$2 күн бұрын', '$1$2 days ago'],
    [/^Каталог событий · обновление (.+)$/, 'Оқиғалар каталогы · жаңартылды $1', 'Event catalogue · updated $1'],
    [/^USGS · обновлено (.+)$/, 'USGS · жаңартылды $1', 'USGS · updated $1'],
    [/^Показано (\d+) из (\d+)$/, '$2 оқиғаның $1 көрсетілді', 'Showing $1 of $2'],
    [/^USGS: (\d+) событий · Больницы: (\d+) · МЧС: (\d+)$/, 'USGS: $1 оқиға · Ауруханалар: $2 · ТЖМ: $3', 'USGS: $1 events · Hospitals: $2 · Emergency services: $3'],
    [/^(.*) · глубина ([\d.]+) км$/, '$1 · тереңдігі $2 км', '$1 · depth $2 km'],
    [/^(.*) · время Алматы$/, '$1 · Алматы уақыты', '$1 · Almaty time'],
    [/^(.*) · тестовое событие, не из USGS$/, '$1 · сынақ оқиғасы, USGS емес', '$1 · test event, not USGS'],
    [/^(≈ [\d.]+) км по прямой$/, '$1 км (түзу сызықпен)', '$1 km straight-line'],
    [/^([≈\s\d.]+) км$/, '$1 км', '$1 km'],
    [/^([\d.]+) м$/, '$1 м', '$1 m'],
    [/^Фото: (.+)$/, 'Фото: $1', 'Photo: $1'],
    [/^Погода Open-Meteo, измерения\/модельные данные на (.+)$/, 'Open-Meteo ауа райы, өлшеу/модель деректері: $1', 'Open-Meteo weather, observations/model data: $1'],
    [/^Землетрясение M (.+)$/, 'Жер сілкінісі M $1', 'Earthquake M $1'],
    [/^СИМУЛЯЦИЯ M (.+) — не реальное землетрясение$/, 'СИМУЛЯЦИЯ M $1 — нақты жер сілкінісі емес', 'SIMULATION M $1 — not a real earthquake'],
    [/^СИМУЛЯЦИЯ · M (.+)$/, 'СИМУЛЯЦИЯ · M $1', 'SIMULATION · M $1'],
    [/^УЧЕБНАЯ СИМУЛЯЦИЯ · M (.+)$/, 'ОҚУ СИМУЛЯЦИЯСЫ · M $1', 'TRAINING SIMULATION · M $1'],
    [/^Сценарий M (.+)$/, 'Сценарий M $1', 'Scenario M $1'],
    [/^Запущена учебная симуляция M (.+)$/, 'Оқу симуляциясы іске қосылды M $1', 'Training simulation started M $1'],
    [/^Режим: (.+)$/, 'Режим: $1', 'Mode: $1'],
    [/^Старт: (.+)$/, 'Басталуы: $1', 'Started: $1'],
    [/^Больница \(координаты предварительные\): (.+)$/, 'Аурухана (координаттары алдын ала белгіленген): $1', 'Hospital (provisional coordinates): $1', true],
    [/^Место сбора \(не проверено\): (.+)$/, 'Жиналу орны (тексерілмеген): $1', 'Assembly point (unverified): $1', true],
    [/^МЧС \(координаты предварительные\): (.+)$/, 'ТЖМ (координаттары алдын ала белгіленген): $1', 'Emergency services (provisional coordinates): $1', true],
    [/^Скорая: (.+)$/, 'Жедел жәрдем: $1', 'Ambulance: $1'],
    [/^Тел\.: (.+)$/, 'Тел.: $1', 'Tel.: $1'],
    [/^Не удалось подключить: (.+)$/, 'Қосылу мүмкін болмады: $1', 'Could not connect: $1'],
    [/^Не удалось загрузить данные USGS: (.+)$/, 'USGS деректерін жүктеу мүмкін болмады: $1', 'Could not load USGS data: $1'],
    [/^обновлено (.+)$/, 'жаңартылды $1', 'updated $1'],
    [/^📍 Координаты: (.+) \((.+)\)$/, '📍 Координаттар: $1 ($2)', '📍 Coordinates: $1 ($2)', true],
    [/^([\d.]+ (?:м|км)) · ~(\d+) мин пешком · (.+)$/, '$1 · жаяу ~$2 мин · $3', '$1 · ~$2 min walk · $3', true],
    [/^(.+) от вас\)\.$/, '$1 сізден).', '$1 from you).'],
    [/^Глубина (\d+) км · (.+) от вас$/, 'Тереңдігі $1 км · сізден $2', 'Depth $1 km · $2 from you', true],
    [/^(\d+) этаже$/, '$1-қабатта', 'floor $1'],
    [/^: спускайтесь только по лестнице, лифт не используйте\.$/, ': тек баспалдақпен түсіңіз, лифтіні пайдаланбаңыз.', ': use stairs only, not the elevator.'],
    [/^: выходите через ближайший выход\.$/, ': ең жақын шығу жолымен шығыңыз.', ': leave through the nearest exit.'],
    [/^— (.+), ~(\d+) мин\.$/, '— $1, ~$2 мин.', '— $1, ~$2 min.', true],
    [/^· событий: (\d+) · макс\. M([\d.]+) · в радиусе 150 км: (\d+)\.$/, '· оқиғалар: $1 · макс. M$2 · 150 км радиуста: $3.', '· events: $1 · max M$2 · within 150 km: $3.'],
    [/^USGS: M([\d.]+) в (.+) — уровень WARNING$/, 'USGS: M$1, $2 — WARNING деңгейі', 'USGS: M$1 at $2 — WARNING level', true],
    [/^Позвонить (.+)$/, 'Қоңырау шалу $1', 'Call $1'],
    [/^(🚒|🏥|✖) (.+)$/, '$1 $2', '$1 $2', true]
  ];
  function translate(source) {
    if (language === 'ru' || typeof source !== 'string' || !source.trim()) return source;
    const i = column[language];
    const value = source.trim();
    let translated = Object.prototype.hasOwnProperty.call(dictionary, value) ? dictionary[value][i] : null;
    if (translated == null) {
      for (const [pattern, kk, en, nested] of patterns) {
        const match = value.match(pattern);
        if (!match) continue;
        const replacement = i === 0 ? kk : en;
        translated = replacement.replace(/\$(\d+)/g, (_, n) => {
          const part = match[Number(n)] || '';
          return nested ? translate(part) : part;
        });
        break;
      }
    }
    if (translated == null) return source;
    return source.slice(0, source.indexOf(value)) + translated + source.slice(source.indexOf(value) + value.length);
  }

  // Keep the original strings per text node/attribute so switching languages
  // is reversible and asynchronous updates can be translated without rerendering
  // the map, form values, active drill or navigation state.
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const attrs = ['title', 'aria-label', 'placeholder', 'alt'];
  const excluded = 'script,style,svg,textarea,[translate="no"],[data-language-select] option,.feed-place,.event-detail-place';
  function ignored(el) { return !el || !!el.closest(excluded); }
  function translateText(node) {
    if (ignored(node.parentElement)) return;
    const value = node.nodeValue;
    let entry = textSources.get(node);
    if (!entry || value !== entry.output) entry = {source: value, output: value};
    const result = translate(entry.source);
    entry.output = result;
    textSources.set(node, entry);
    if (value !== result) node.nodeValue = result;
  }
  function translateAttributes(el) {
    if (ignored(el) && !el.matches('[data-language-select]')) return;
    const names = el.matches('meta[name="description"]') ? ['content'] : attrs;
    let records = attributeSources.get(el);
    for (const attr of names) {
      const value = el.getAttribute(attr);
      if (value === null) continue;
      if (!records) { records = {}; attributeSources.set(el, records); }
      let entry = records[attr];
      if (!entry || value !== entry.output) entry = {source: value, output: value};
      const result = translate(entry.source);
      records[attr] = {source: entry.source, output: result};
      if (value !== result) el.setAttribute(attr, result);
    }
  }
  function walk(root) {
    if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || ignored(root)) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeType === Node.ELEMENT_NODE && ignored(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) translateText(node);
      else translateAttributes(node);
    }
  }
  function applyLanguage(next, persist) {
    if (!supported.includes(next)) return;
    language = next;
    document.documentElement.lang = next;
    if (persist) try { localStorage.setItem(KEY, next); } catch (_) {}
    document.querySelectorAll('[data-language-select]').forEach(el => { el.value = next; });
    walk(document.documentElement);
  }
  document.addEventListener('change', event => {
    if (event.target.matches('[data-language-select]')) applyLanguage(event.target.value, true);
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY) applyLanguage(supported.includes(event.newValue) ? event.newValue : 'ru', false);
  });
  applyLanguage(language, false);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') translateText(record.target);
      else if (record.type === 'attributes') translateAttributes(record.target);
      else for (const node of record.addedNodes) walk(node);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: [...attrs, 'content']
  });
  window.SeismoLanguage = {translate, get language() { return language; }, setLanguage: next => applyLanguage(next, true)};
})();
