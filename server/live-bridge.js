/* Injected only by the local FastAPI server; GitHub Pages stays unchanged. */
(() => {
  'use strict';
  if (window.self !== window.top) return; // One live panel per visible page.
  const style = document.createElement('style');
  style.textContent = `
    #seismo-lan-status {
      position:fixed;bottom:18px;right:18px;z-index:2147480000;
      box-sizing:border-box;max-width:min(350px,calc(100vw - 30px));min-width:220px;
      border-radius:14px;padding:12px 15px;background:#18334b;color:#fff;
      border:2px solid #66788b;box-shadow:0 8px 32px #0004;
      font:600 13px/1.45 system-ui,Arial,sans-serif;
      pointer-events:none
    }
    #seismo-lan-status strong{display:block;font-size:17px;letter-spacing:.035em}
    #seismo-lan-status small{display:block;font-size:11px;font-weight:400;opacity:.92}
    #seismo-lan-status[data-level="NORMAL"]{border-color:#37c58e}
    #seismo-lan-status[data-level="WARNING"]{background:#684809;border-color:#ffd15a}
    #seismo-lan-status[data-level="EMERGENCY"]{background:#8c2020;border-color:#ff5b5b}
    #seismo-lan-status[data-level="OFFLINE"]{background:#36404b;border-color:#8a9199}
    @media(max-width:650px){#seismo-lan-status{right:8px;bottom:76px;min-width:0;
      padding:8px 10px;font-size:11px}#seismo-lan-status strong{font-size:14px}}
  `;
  document.head.appendChild(style);
  const panel = document.createElement('aside');
  panel.id = 'seismo-lan-status';
  panel.dataset.level = 'OFFLINE';
  panel.setAttribute('role','status');
  panel.setAttribute('aria-live','polite');
  const title = document.createElement('strong');
  const detail = document.createElement('small');
  panel.append(title, detail);
  document.body.append(panel);

  let connected = false;
  function show(state) {
    const level = ['NORMAL','WARNING','EMERGENCY','OFFLINE'].includes(state.level)
      ? state.level : 'OFFLINE';
    const source = state.source === 'demo' ? 'TEST DATA' : 'SENSOR FEED';
    panel.dataset.level = level;
    title.textContent = 'LOCAL · ' + level;
    const reading = state.sensor_online && typeof state.acceleration_g === 'number'
      ? ' · ' + state.acceleration_g.toFixed(3) + ' g' : '';
    detail.textContent = (connected ? source : 'SERVER DISCONNECTED')
      + reading + (state.latched ? ' · ACK/RESET needed' : '')
      + ' · EDUCATIONAL ONLY';
    window.SeismoLocalState = Object.freeze({...state});
    window.dispatchEvent(new CustomEvent('seismo:server-state', {detail: state}));
  }
  show({level:'OFFLINE', source:null, sensor_online:false, latched:false});
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  let retry;
  function connect() {
    const socket = new WebSocket(proto + '//' + location.host + '/ws');
    socket.onopen = () => { connected = true; };
    socket.onmessage = event => {
      try {show(JSON.parse(event.data));} catch (error) {console.warn('Bad local sensor packet', error);}
    };
    socket.onclose = () => {
      connected = false;
      show({level:'OFFLINE', source:null, sensor_online:false, latched:false});
      clearTimeout(retry);
      retry = setTimeout(connect, 1800);
    };
    socket.onerror = () => socket.close();
  }
  connect();
})();
