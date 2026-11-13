const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;
const BASE = 'https://rophimz.vercel.app';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const agent = new https.Agent({ rejectUnauthorized: false });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============ POPUP ============
function createPopupHTML(routeName = '') {
    const clean = (routeName || '/').replace(/^\//, '').replace(/-/g, ' ').replace(/\//g, ' · ').toUpperCase();
    const displayName = clean || 'HỆ THỐNG';
    return `
    <div id="proxyPopup" style="
        display:none; position:fixed; inset:0;
        background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);
        justify-content:center; align-items:center;
        z-index:2147483646; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="
            background:linear-gradient(145deg,#0f0f1a,#1a1a2e);
            padding:40px 46px; border-radius:28px;
            border:2px solid rgba(0,255,153,0.25);
            box-shadow:0 25px 70px rgba(0,255,153,0.12), inset 0 1px 0 rgba(255,255,255,0.05);
            text-align:center; max-width:460px; width:92%; position:relative; overflow:hidden;
            animation:nhkPop .7s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;
                background:radial-gradient(circle at 30% 50%,rgba(0,255,153,0.05),transparent 60%);
                animation:nhkGlow 5s ease-in-out infinite;pointer-events:none;"></div>
            <div style="font-size:62px;margin-bottom:10px;animation:nhkFloat 2.5s ease-in-out infinite;">🚀</div>
            <div style="font-size:30px;font-weight:800;letter-spacing:1.5px;margin-bottom:4px;
                background:linear-gradient(135deg,#00ff99,#00ccff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">CODE BY NHK</div>
            <div style="width:70px;height:3px;margin:10px auto 14px;border-radius:3px;
                background:linear-gradient(90deg,#00ff99,#00ccff);"></div>
            <div style="color:#e0e0e0;font-size:17px;line-height:1.7;margin-bottom:18px;">
                <span style="color:#00ff99;font-weight:600;">✨ ${displayName}</span><br>
                <span style="color:#ffd93d;font-weight:700;font-size:16px;">Phim Hay hãy nhớ tới tui</span><br>
                <a href="https://www.tiktok.com/@hoangg.huyy.nz" target="_blank"
                   style="color:#ff0050;text-decoration:none;font-weight:700;font-size:18px;display:inline-block;margin-top:6px;">
                   📱 @hoangg.huyy.nz</a>
            </div>
            <button onclick="nhkClosePopup()" style="
                background:linear-gradient(135deg,#00ff99,#00ccff);color:#000;border:none;
                padding:12px 44px;border-radius:50px;font-size:16px;font-weight:700;cursor:pointer;
                box-shadow:0 4px 25px rgba(0,255,153,0.3);">OK</button>
            <div style="margin-top:16px;color:#444;font-size:11px;letter-spacing:2.5px;">© NHK PROXY 2026</div>
        </div>
    </div>`;
}

// ============ DÒ NHÚNG (cache theo origin) ============
const embedCache = new Map();
async function canEmbed(url) {
    let origin;
    try { origin = new URL(url).origin; } catch { return false; }
    const hit = embedCache.get(origin);
    if (hit && Date.now() - hit.t < 300000) return hit.ok;

    let ok = true;
    try {
        const r = await axios.get(url, {
            headers: { 'User-Agent': UA, 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' },
            maxRedirects: 10, timeout: 15000, validateStatus: () => true, httpsAgent: agent
        });
        const xfo = String(r.headers['x-frame-options'] || '').toLowerCase();
        if (xfo.includes('deny') || xfo.includes('sameorigin')) ok = false;
        const csp = String(r.headers['content-security-policy'] || '').toLowerCase();
        const m = csp.match(/frame-ancestors([^;]*)/);
        if (m && !m[1].includes('*')) ok = false;
    } catch { ok = false; }

    embedCache.set(origin, { ok, t: Date.now() });
    return ok;
}

// ============ VỎ NHÚNG ============
function embedShell(src, path) {
    const themes = [
        ['off', 'Tắt', 'linear-gradient(160deg,#1a1a1a,#2a2a2a)'],
        ['midnight', 'Midnight', 'linear-gradient(160deg,#05060d,#101b33)'],
        ['sunset', 'Sunset', 'linear-gradient(160deg,#1a0a12,#5c2418)'],
        ['forest', 'Forest', 'linear-gradient(160deg,#04120c,#0e3324)'],
        ['neon', 'Neon', 'linear-gradient(160deg,#12002a,#00262e)'],
        ['mono', 'Mono', 'linear-gradient(160deg,#0a0a0a,#1f1f1f)'],
        ['cinema', 'Cinema', 'linear-gradient(160deg,#08080b,#141418)']
    ];

    return `<!DOCTYPE html>
<html lang="vi"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CODE BY NHK</title>
<style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{height:100%;overflow:hidden;background:#07070c;font-family:'Segoe UI',Tahoma,sans-serif;}
    :root{ --nhk-offset: 38px; }

    #nhkFrameWrap{
        position:fixed; left:0; right:0; bottom:0; top:var(--nhk-offset);
        z-index:2147483000; background:#07070c; transition:top .3s ease;
    }
    #nhkFrame{
        width:100%; height:100%; border:0; display:block; background:#07070c;
        transition:filter .35s ease;
    }
    #nhkSpin{
        position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        flex-direction:column; gap:12px; color:#00ff99; font-size:12px; letter-spacing:2px;
        background:#07070c; z-index:0;
    }
    #nhkSpin.hide{ display:none; }
    #nhkSpin .ring{
        width:34px; height:34px; border-radius:50%;
        border:3px solid rgba(0,255,153,.18); border-top-color:#00ff99;
        animation:nhkSpin 0.9s linear infinite;
    }
    @keyframes nhkSpin{ to{ transform:rotate(360deg); } }

    #nhkVignette{
        position:fixed; inset:0; z-index:2147483300; pointer-events:none; opacity:0;
        transition:opacity .4s ease;
        background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%);
    }
    #nhkGrain{
        position:fixed; inset:0; z-index:2147483301; pointer-events:none; opacity:0;
        transition:opacity .4s ease; mix-blend-mode:overlay;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .nhk-letterbox{
        position:absolute; left:0; right:0; height:0; background:#000; z-index:2147483100;
        pointer-events:none; transition:height .45s cubic-bezier(.4,0,.2,1);
    }
    #nhkBarTop{ top:0; } #nhkBarBot{ bottom:0; }
    html.nhk-cine #nhkBarTop, html.nhk-cine #nhkBarBot{ height:clamp(34px,7vh,84px); }

    #nhkTopBar{
        position:fixed; top:0; left:0; right:0; height:38px; z-index:2147483600;
        display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 12px;
        background:linear-gradient(90deg,rgba(10,10,18,.96),rgba(16,24,40,.96));
        backdrop-filter:blur(14px);
        border-bottom:1px solid rgba(0,255,153,.25);
        box-shadow:0 6px 26px rgba(0,0,0,.5);
        transition:transform .35s ease, opacity .35s ease;
    }
    #nhkTopBar.nhk-hidden{ transform:translateY(-110%); opacity:0; pointer-events:none; }
    .nhk-left{ display:flex; align-items:center; gap:10px; min-width:0; }
    .nhk-logo{ font-size:18px; animation:nhkFloat 3s ease-in-out infinite; }
    .nhk-brand{
        font-size:13px; font-weight:800; letter-spacing:1.4px; white-space:nowrap;
        background:linear-gradient(135deg,#00ff99,#00ccff);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    }
    .nhk-slogan{
        font-size:11px; color:#ffd93d; font-weight:700; white-space:nowrap;
        padding-left:10px; border-left:1px solid rgba(255,255,255,.15);
        overflow:hidden; text-overflow:ellipsis;
    }
    .nhk-right{ display:flex; align-items:center; gap:7px; flex-shrink:0; }
    .nhk-tiktok{
        font-size:10px; font-weight:700; color:#fff; text-decoration:none;
        padding:4px 10px; border-radius:20px; background:linear-gradient(135deg,#00f2ea,#ff0050);
    }
    .nhk-btn{
        font-size:10px; font-weight:700; color:#00ff99; cursor:pointer;
        background:rgba(0,255,153,.08); border:1px solid rgba(0,255,153,.3);
        padding:5px 10px; border-radius:7px; transition:.2s; font-family:inherit;
    }
    .nhk-btn:hover{ background:rgba(0,255,153,.2); }
    .nhk-x{ padding:5px 8px; color:#888; border-color:rgba(255,255,255,.15); background:rgba(255,255,255,.05); }
    .nhk-x:hover{ color:#fff; background:rgba(255,255,255,.12); }

    #nhkTab{
        position:fixed; top:0; right:12px; z-index:2147483601; display:none;
        font-size:10px; font-weight:800; letter-spacing:1px; cursor:pointer; font-family:inherit;
        color:#000; border:none; border-radius:0 0 8px 8px; padding:4px 11px;
        background:linear-gradient(135deg,#00ff99,#00ccff);
    }
    #nhkTab.show{ display:block; }

    #nhkPanel{
        position:fixed; top:44px; right:10px; z-index:2147483620; width:308px; max-width:calc(100vw - 20px);
        max-height:calc(100vh - 60px); overflow:auto;
        padding:13px; border-radius:15px;
        background:linear-gradient(160deg,rgba(12,12,20,.98),rgba(22,22,36,.98));
        border:1px solid rgba(0,255,153,.28); box-shadow:0 22px 60px rgba(0,0,0,.65);
        backdrop-filter:blur(16px); color:#ddd;
        opacity:0; transform:translateY(-10px) scale(.97); pointer-events:none; transition:.22s ease;
    }
    #nhkPanel.open{ opacity:1; transform:none; pointer-events:auto; }
    .nhk-p-head{ display:flex; align-items:center; justify-content:space-between; font-size:12px; font-weight:800; color:#00ff99; margin-bottom:10px; }
    .nhk-p-label{ font-size:9px; text-transform:uppercase; letter-spacing:1.6px; color:#666; margin:11px 0 6px; }
    .nhk-themes{ display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }
    .nhk-th{
        display:flex; flex-direction:column; align-items:center; gap:4px; font-size:9px; font-weight:600;
        color:#999; cursor:pointer; font-family:inherit; background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:5px 2px; transition:.2s;
    }
    .nhk-th:hover{ color:#fff; border-color:rgba(0,255,153,.35); }
    .nhk-th.active{ color:#00ff99; border-color:#00ff99; background:rgba(0,255,153,.12); box-shadow:0 0 12px rgba(0,255,153,.2); }
    .nhk-sw{ width:100%; height:20px; border-radius:5px; display:block; }
    .nhk-toggles{ display:flex; flex-direction:column; gap:5px; }
    .nhk-tg{
        text-align:left; font-size:10px; font-weight:600; color:#aaa; cursor:pointer; font-family:inherit;
        background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
        border-radius:8px; padding:7px 10px; transition:.2s;
    }
    .nhk-tg:hover{ color:#fff; }
    .nhk-tg.on{ color:#000; font-weight:800; background:linear-gradient(135deg,#00ff99,#00ccff); border-color:transparent; }
    .nhk-range{ display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:10px; color:#999; margin-bottom:7px; }
    .nhk-range input{ flex:1; accent-color:#00ff99; height:3px; cursor:pointer; }
    .nhk-p-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,.07); }
    .nhk-reset{ font-size:10px; font-weight:700; color:#ff6b6b; cursor:pointer; font-family:inherit;
        background:rgba(255,107,107,.1); border:1px solid rgba(255,107,107,.3); padding:5px 11px; border-radius:7px; }
    .nhk-hint{ font-size:9px; color:#444; font-family:monospace; }

    @keyframes nhkFloat{ 0%,100%{ transform:translateY(0) rotate(0); } 50%{ transform:translateY(-4px) rotate(5deg); } }
    @keyframes nhkGlow{ 0%,100%{ transform:translate(0,0) rotate(0); } 50%{ transform:translate(8%,8%) rotate(4deg); } }
    @keyframes nhkPop{ from{ transform:scale(.7) translateY(30px); opacity:0; } to{ transform:none; opacity:1; } }
    #proxyPopup.nhk-fade{ animation:nhkPopOut .4s ease forwards; }
    @keyframes nhkPopOut{ to{ opacity:0; transform:scale(.85); } }

    @media (max-width:640px){ .nhk-slogan,.nhk-tiktok{ display:none; } }
</style>
</head><body>

<div id="nhkFrameWrap">
    <div id="nhkSpin"><div class="ring"></div><span>ĐANG TẢI</span></div>
    <iframe id="nhkFrame" src="${src.replace(/"/g, '&quot;')}"
        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div id="nhkBarTop" class="nhk-letterbox"></div>
    <div id="nhkBarBot" class="nhk-letterbox"></div>
</div>

<div id="nhkVignette"></div>
<div id="nhkGrain"></div>

<div id="nhkTopBar">
    <div class="nhk-left">
        <span class="nhk-logo">🚀</span>
        <span class="nhk-brand">CODE BY NHK</span>
        <span class="nhk-slogan">Phim Hay hãy nhớ tới tui</span>
    </div>
    <div class="nhk-right">
        <a class="nhk-tiktok" href="https://www.tiktok.com/@hoangg.huyy.nz" target="_blank" rel="noopener">@hoangg.huyy.nz</a>
        <button id="nhkReload" class="nhk-btn" title="Tải lại">⟳</button>
        <button id="nhkOpenPanel" class="nhk-btn">🎛 Nền / Cinematic</button>
        <button id="nhkMin" class="nhk-btn nhk-x" title="Thu nhỏ">✕</button>
    </div>
</div>
<button id="nhkTab" title="Mở banner">NHK</button>

<div id="nhkPanel">
    <div class="nhk-p-head"><span>🎛 Giao diện &amp; Cinematic</span>
        <button id="nhkClosePanel" class="nhk-btn nhk-x">✕</button></div>

    <div class="nhk-p-label">Chọn nền</div>
    <div class="nhk-themes">
        ${themes.map(([id, name, sw]) => `<button class="nhk-th" data-theme="${id}"><span class="nhk-sw" style="background:${sw}"></span>${name}</button>`).join('')}
    </div>

    <div class="nhk-p-label">Chế độ xem</div>
    <div class="nhk-toggles">
        <button class="nhk-tg" data-k="letterbox">🎬 Cinematic (viền đen)</button>
        <button class="nhk-tg" data-k="vignette">🌑 Vignette</button>
        <button class="nhk-tg" data-k="grain">🎞 Grain phim</button>
    </div>

    <div class="nhk-p-label">Hiệu chỉnh</div>
    <label class="nhk-range">Độ sáng <input type="range" id="nhkBright" min="60" max="150" step="1"></label>
    <label class="nhk-range">Tương phản <input type="range" id="nhkContrast" min="60" max="150" step="1"></label>
    <label class="nhk-range">Bão hòa <input type="range" id="nhkSat" min="0" max="200" step="1"></label>

    <div class="nhk-p-foot">
        <button id="nhkReset" class="nhk-reset">↺ Đặt lại</button>
        <span class="nhk-hint">Ctrl+Shift+K</span>
    </div>
</div>

${createPopupHTML(path)}

<script>
(function(){
  'use strict';
  var KEY='nhk_overlay_cfg_v3';
  var D={theme:'off',bright:100,contrast:100,sat:100,grain:false,letterbox:false,vignette:false,barHidden:false};
  var cfg=Object.assign({},D);
  try{var r=localStorage.getItem(KEY); if(r)Object.assign(cfg,JSON.parse(r));}catch(e){}

  var THEMES={
    off:{f:'none'},
    midnight:{f:'contrast(1.05) saturate(1.12) brightness(.97)'},
    sunset:{f:'sepia(.18) saturate(1.3) contrast(1.06)'},
    forest:{f:'saturate(1.18) contrast(1.04)'},
    neon:{f:'saturate(1.4) contrast(1.12) hue-rotate(-6deg)'},
    mono:{f:'grayscale(1) contrast(1.14)'},
    cinema:{f:'sepia(.12) saturate(1.22) contrast(1.14)'}
  };

  var root=document.documentElement, frame=document.getElementById('nhkFrame'),
      bar=document.getElementById('nhkTopBar'), tab=document.getElementById('nhkTab'),
      panel=document.getElementById('nhkPanel'), spin=document.getElementById('nhkSpin');
  function $(id){return document.getElementById(id);}

  function setOffset(){
    var h = bar.classList.contains('nhk-hidden') ? 0 : bar.offsetHeight;
    root.style.setProperty('--nhk-offset', h + 'px');
  }

  function apply(){
    var t=THEMES[cfg.theme]||THEMES.off;
    root.classList.toggle('nhk-cine',!!cfg.letterbox);
    var p=[];
    if(cfg.bright!==100) p.push('brightness('+(cfg.bright/100)+')');
    if(cfg.contrast!==100) p.push('contrast('+(cfg.contrast/100)+')');
    if(cfg.sat!==100) p.push('saturate('+(cfg.sat/100)+')');
    if(t.f&&t.f!=='none') p.push(t.f);
    frame.style.filter = p.join(' ') || 'none';
    $('nhkVignette').style.opacity = cfg.vignette ? '1' : '0';
    $('nhkGrain').style.opacity = cfg.grain ? '.13' : '0';
    document.querySelectorAll('.nhk-th').forEach(function(b){ b.classList.toggle('active',b.dataset.theme===cfg.theme); });
    document.querySelectorAll('.nhk-tg').forEach(function(b){ b.classList.toggle('on',!!cfg[b.dataset.k]); });
    $('nhkBright').value=cfg.bright; $('nhkContrast').value=cfg.contrast; $('nhkSat').value=cfg.sat;
    setOffset();
    try{ localStorage.setItem(KEY,JSON.stringify(cfg)); }catch(e){}
  }

  document.querySelectorAll('.nhk-th').forEach(function(b){
    b.addEventListener('click',function(){ cfg.theme=b.dataset.theme; apply(); });
  });
  document.querySelectorAll('.nhk-tg').forEach(function(b){
    b.addEventListener('click',function(){ cfg[b.dataset.k]=!cfg[b.dataset.k]; apply(); });
  });
  [['nhkBright','bright'],['nhkContrast','contrast'],['nhkSat','sat']].forEach(function(pair){
    $(pair[0]).addEventListener('input',function(){ cfg[pair[1]]=+this.value; apply(); });
  });
  $('nhkReset').addEventListener('click',function(){ cfg=Object.assign({},D); apply(); });

  function closeP(){ panel.classList.remove('open'); }
  $('nhkOpenPanel').addEventListener('click',function(e){ e.stopPropagation(); panel.classList.toggle('open'); });
  $('nhkClosePanel').addEventListener('click',closeP);

  function hideBar(){ bar.classList.add('nhk-hidden'); tab.classList.add('show'); closeP(); cfg.barHidden=true; setOffset(); try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch(e){} }
  function showBar(){ bar.classList.remove('nhk-hidden'); tab.classList.remove('show'); cfg.barHidden=false; setOffset(); try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch(e){} }
  $('nhkMin').addEventListener('click',hideBar);
  tab.addEventListener('click',showBar);

  $('nhkReload').addEventListener('click',function(){ spin.classList.remove('hide'); frame.src=frame.src; });
  frame.addEventListener('load',function(){ spin.classList.add('hide'); });

  document.addEventListener('click',function(e){
    if(!panel.contains(e.target) && e.target.id!=='nhkOpenPanel') closeP();
  });
  window.addEventListener('blur',function(){ closeP(); });
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.shiftKey&&(e.key==='K'||e.key==='k')){ e.preventDefault(); panel.classList.toggle('open'); }
    if(e.key==='Escape') closeP();
  });
  window.addEventListener('resize',setOffset);

  window.nhkClosePopup=function(){
    var p=$('proxyPopup'); if(!p)return;
    p.classList.add('nhk-fade');
    setTimeout(function(){ if(p.parentNode)p.remove(); },400);
  };

  if(cfg.barHidden){ bar.classList.add('nhk-hidden'); tab.classList.add('show'); }
  apply();

  var p=$('proxyPopup');
  if(p && !sessionStorage.getItem('nhk_popup_seen')){
    sessionStorage.setItem('nhk_popup_seen','1');
    p.style.display='flex';
    setTimeout(window.nhkClosePopup,6000);
    p.addEventListener('click',function(e){ if(e.target===p) window.nhkClosePopup(); });
  }
})();
</script>
</body></html>`;
}

// ============ FETCH + INJECT (chạy ngầm trong iframe) ============
async function fetchAndFixHtml(targetUrl, baseUrl = BASE, routeName = '', bare = false) {
    const response = await axios.get(targetUrl, {
        headers: {
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        },
        maxRedirects: 10, timeout: 30000, httpsAgent: agent
    });

    let html = response.data;

    const fixScript = `
    <script>
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true;
        var __of = window.fetch;
        window.fetch = function(u, o){
            if (typeof u === 'string' && u.charAt(0) === '/') u = '${baseUrl}' + u;
            return __of.call(this, u, o);
        };
    </script>`;

    const inject = bare ? '' : createPopupHTML(routeName);
    const baseTag = bare ? `<base href="${baseUrl}/" target="_self">` : `<base href="${baseUrl}/">`;

    html = html.replace(/<head>/i, `<head>
        ${baseTag}
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${fixScript}
    `);

    if (inject) {
        if (/<body[^>]*>/i.test(html)) html = html.replace(/<body([^>]*)>/i, `<body$1>${inject}`);
        else html = inject + html;
    }

    html = html.replace(/(src|href|action)="\/(?!\/)/g, `$1="${baseUrl}/`);
    html = html.replace(/(src|href|action)='\/(?!\/)/g, `$1='${baseUrl}/`);
    html = html.replace(/(src|href|action)="\.\//g, `$1="${baseUrl}/`);
    html = html.replace(/(src|href|action)='\.\//g, `$1='${baseUrl}/`);

    html = html.replace(/<script type="importmap">/g, `<script type="importmap" crossorigin="anonymous">`);
    html = html.replace(/<script type="module">/g, `<script type="module" crossorigin="anonymous">`);
    html = html.replace(/<script /g, `<script crossorigin="anonymous" `);

    return html;
}

// ============ HEADERS CHUNG ============
function sendHtml(res, html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send(html);
}

function errPage(res, error, label) {
    console.error('❌ Lỗi:', error.message);
    res.status(500).send(`
        <!DOCTYPE html><html><head><title>Lỗi</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#1a1a2e;color:white;">
            <h1 style="color:#ff6b6b;">⚠️ Lỗi tải trang</h1>
            <p>${error.message}</p>
            ${label ? `<p style="color:#888;font-size:14px;">${label}</p>` : ''}
            <button onclick="location.reload()" style="padding:10px 30px;background:#00ff99;border:none;border-radius:5px;cursor:pointer;margin-top:20px;">Thử lại</button>
            <br><br><a href="/" style="color:#00ccff;">Quay lại</a>
        </body></html>`);
}

// ============ HÀM DỰNG VỎ THEO ĐƯỜNG DẪN ============
async function serveShell(res, path) {
    const target = BASE + path;
    const ok = await canEmbed(target);
    const src = ok ? target : '/proxy?url=' + encodeURIComponent(target) + '&bare=1';
    sendHtml(res, embedShell(src, path));
}

// ============ PROXY (chỉ chạy trong iframe) ============
app.get('/proxy', async (req, res) => {
    try {
        let targetUrl = req.query.url || BASE + '/';
        if (!/^https?:\/\//.test(targetUrl)) targetUrl = 'https://' + targetUrl;
        const bare = req.query.bare === '1';
        const routeName = req.query.url ? new URL(targetUrl).pathname : '/';
        const html = await fetchAndFixHtml(targetUrl, BASE, routeName, bare);
        sendHtml(res, html);
    } catch (error) { errPage(res, error); }
});

// ============ IMAGES ============
app.get(/^\/images\/(.*)$/, async (req, res) => {
    try {
        const targetUrl = `${BASE}/images/${req.params[0] || ''}`;
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': UA }, responseType: 'stream', httpsAgent: agent
        });
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        response.data.pipe(res);
    } catch (error) {
        console.error('❌ Lỗi image:', error.message);
        res.status(404).send('Image not found');
    }
});

// ============ STATIC FILES ============
[['/manifest.json', 'application/json'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml']]
    .forEach(([path, type]) => {
        app.get(path, async (req, res) => {
            try {
                const r = await axios.get(BASE + path, { headers: { 'User-Agent': UA }, httpsAgent: agent });
                res.setHeader('Content-Type', type);
                res.send(r.data);
            } catch { res.status(404).send('Not found'); }
        });
    });

// ============ TRANG GIỚI THIỆU ============
app.get('/info', (req, res) => {
    res.send(`
        <!DOCTYPE html><html><head><title>CODE BY NHK</title>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            *{margin:0;padding:0;box-sizing:border-box;}
            body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
                display:flex;justify-content:center;align-items:center;min-height:100vh;
                background:linear-gradient(135deg,#0a0a0a,#1a1a2e 50%,#16213e);color:#fff;padding:20px;}
            .container{text-align:center;padding:46px 34px;background:rgba(255,255,255,.03);
                border-radius:24px;border:1px solid rgba(255,255,255,.08);max-width:520px;width:100%;
                position:relative;overflow:hidden;}
            .container::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
                background:radial-gradient(circle at 30% 50%,rgba(0,255,153,.04),transparent 60%);
                animation:bgGlow 8s ease-in-out infinite;pointer-events:none;}
            @keyframes bgGlow{0%,100%{transform:translate(0,0) rotate(0);}50%{transform:translate(5%,5%) rotate(3deg);}}
            .logo{font-size:70px;margin-bottom:14px;display:block;animation:float 3s ease-in-out infinite;}
            @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
            h1{font-size:40px;background:linear-gradient(135deg,#00ff99,#00ccff);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;}
            .slogan{color:#ffd93d;font-weight:700;font-size:16px;margin-bottom:14px;}
            .status{color:#00ff99;font-size:17px;margin:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;}
            .status .dot{width:10px;height:10px;background:#00ff99;border-radius:50%;animation:pulse 2s infinite;}
            @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
            .info-item{background:rgba(255,255,255,.05);padding:16px;border-radius:12px;
                border:1px solid rgba(255,255,255,.06);margin:16px 0;}
            .info-item .label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;}
            .tiktok-link{display:inline-block;margin-top:8px;padding:9px 22px;
                background:linear-gradient(135deg,#00f2ea,#ff0050);color:#fff;text-decoration:none;
                border-radius:50px;font-weight:700;font-size:14px;transition:.3s;}
            .tiktok-link:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(255,0,80,.4);}
            .btn-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px;}
            .btn{padding:13px 32px;border-radius:50px;font-weight:600;font-size:14px;cursor:pointer;
                transition:.3s;border:none;text-decoration:none;display:inline-block;}
            .btn-primary{background:linear-gradient(135deg,#00ff99,#00ccff);color:#000;}
            .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,255,153,.3);}
            .footer{margin-top:26px;color:#555;font-size:12px;border-top:1px solid rgba(255,255,255,.05);padding-top:18px;}
            .highlight{color:#00ff99;font-weight:bold;}
            .feat{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0;text-align:left;}
            .feat div{background:rgba(0,255,153,.06);border:1px solid rgba(0,255,153,.15);
                border-radius:10px;padding:9px 12px;font-size:11px;color:#9fe8c8;}
        </style></head><body>
            <div class="container">
                <span class="logo">🚀</span>
                <h1>CODE BY NHK</h1>
                <div class="slogan">Phim Hay hãy nhớ tới tui</div>
                <div class="status"><span class="dot"></span> Online</div>
                <div class="info-item">
                    <span class="label">TIKTOK</span><br>
                    <a href="https://www.tiktok.com/@hoangg.huyy.nz" target="_blank" class="tiktok-link">@hoangg.huyy.nz</a>
                </div>
                <div class="feat">
                    <div>🖼 Nhúng iframe — không thoát</div>
                    <div>🔗 URL sạch, không tham số</div>
                    <div>🎛 7 kiểu nền</div>
                    <div>🎬 Chế độ Cinematic</div>
                    <div>🌑 Vignette / 🎞 Grain</div>
                    <div>⌨ Ctrl+Shift+K</div>
                </div>
                <div class="btn-group">
                    <a href="/" class="btn btn-primary">🎬 Vào xem</a>
                </div>
                <div class="footer"><span class="highlight">✨ Proxy Server</span><br>
                    <span style="color:#666;font-size:11px;">© NHK Proxy</span></div>
            </div>
        </body></html>`);
});

// ============ GỐC + MỌI ĐƯỜNG DẪN ============
app.get('/', (req, res) => serveShell(res, '/'));

app.get(/^\/(?!proxy|info|images\/|manifest\.json|robots\.txt|sitemap\.xml).*/, (req, res) => {
    const path = req.path.replace(/\/$/, '') || '/';
    serveShell(res, path);
});

// ============ 404 ============
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html><html><head><title>404</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#1a1a2e;color:#fff;">
            <h1 style="color:#ff6b6b;">404 - Không tìm thấy</h1>
            <p>Đường dẫn "${req.url}" không tồn tại.</p>
            <a href="/" style="color:#00ff99;">Quay lại</a>
        </body></html>`);
});

module.exports = app;
