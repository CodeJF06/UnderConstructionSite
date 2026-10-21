import { DurableObject } from "cloudflare:workers";

// Hinweis: Das Client-Script unten nutzt bewusst keine Backticks und kein "${...}",
// damit es sicher in diesem Template-Literal stehen kann.
const HTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Im Aufbau | feh.re</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --yellow: #facc15;
      --track: #334155;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      text-align: center;
    }
    .card {
      width: 100%;
      max-width: 420px;
      background-color: var(--card);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .stripes {
      height: 14px;
      background: repeating-linear-gradient(
        -45deg, var(--yellow) 0 14px, #111827 14px 28px);
      background-size: 39.6px 100%;
      animation: slide 1.2s linear infinite;
    }
    @keyframes slide { to { background-position: 39.6px 0; } }
    .content { padding: 2rem 2rem 2.2rem; }
    h1 { margin: 0 0 .6rem; font-size: 1.8rem; }
    .emoji {
      display: inline-block;
      cursor: pointer;
      user-select: none;
      transition: transform .2s;
    }
    .emoji:hover { transform: rotate(-12deg) scale(1.15); }
    p { color: var(--muted); line-height: 1.5; margin: 0 0 1.4rem; }
    .progress-head {
      display: flex;
      justify-content: space-between;
      font-size: .85rem;
      color: var(--muted);
      margin-bottom: .4rem;
    }
    .track {
      height: 12px;
      background: var(--track);
      border-radius: 999px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, #f59e0b, var(--yellow));
      transition: width .6s ease-out;
    }
    .status {
      min-height: 1.5em;
      margin: .9rem 0 0;
      font-size: .9rem;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .caret {
      display: inline-block;
      width: .5ch;
      border-right: 2px solid var(--yellow);
      margin-left: 2px;
      animation: blink 1s steps(1) infinite;
    }
    @keyframes blink { 50% { border-color: transparent; } }
    .hint { margin: 1.4rem 0 0; font-size: .75rem; opacity: .6; }
    .visitors {
      margin: .5rem 0 0;
      font-size: .8rem;
      color: var(--muted);
      opacity: 0;
      transition: opacity .6s ease;
    }
    .visitors.show { opacity: 1; }
    .visitors b { color: var(--yellow); font-variant-numeric: tabular-nums; }

    /* Snake */
    #game { display: none; margin-top: 1.4rem; }
    #game.open { display: block; }
    #board {
      display: block;
      margin: 0 auto;
      width: 100%;
      max-width: 280px;
      aspect-ratio: 1;
      background: #0b1220;
      border: 2px solid var(--track);
      border-radius: 8px;
      touch-action: none;
    }
    .score { margin: .6rem 0 .4rem; font-size: .85rem; color: var(--muted); }
    .pad {
      display: grid;
      grid-template-columns: repeat(3, 48px);
      grid-template-rows: repeat(2, 44px);
      gap: 6px;
      justify-content: center;
      margin-top: .5rem;
    }
    .pad button {
      background: var(--track);
      color: var(--text);
      border: 0;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .pad button:active { background: #475569; }
    .pad .up { grid-column: 2; grid-row: 1; }
    .pad .left { grid-column: 1; grid-row: 2; }
    .pad .down { grid-column: 2; grid-row: 2; }
    .pad .right { grid-column: 3; grid-row: 2; }
    .close {
      margin-top: .8rem;
      background: none;
      border: 0;
      color: var(--muted);
      font-size: .8rem;
      text-decoration: underline;
      cursor: pointer;
    }

    /* Leaderboard */
    .lb-panel {
      margin-top: 1rem;
      text-align: left;
      background: #0b1220;
      border: 1px solid var(--track);
      border-radius: 8px;
      padding: .7rem .8rem;
    }
    .lb-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: .85rem;
      margin-bottom: .4rem;
    }
    .lb-gear {
      background: none;
      border: 0;
      color: var(--muted);
      cursor: pointer;
      font-size: .95rem;
      line-height: 1;
      padding: .1rem .3rem;
    }
    .lb-gear:hover { color: var(--text); }
    .lb-list { list-style: none; margin: 0; padding: 0; font-size: .82rem; }
    .lb-empty { color: var(--muted); padding: .2rem 0; }
    .lb-row {
      display: flex;
      gap: .5rem;
      padding: .2rem 0;
      border-top: 1px solid var(--track);
    }
    .lb-row:first-child { border-top: 0; }
    .lb-rank { color: var(--muted); width: 1.4rem; flex: none; }
    .lb-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lb-score { color: var(--yellow); font-variant-numeric: tabular-nums; }
    .lb-form {
      margin-top: .7rem;
      background: #0b1220;
      border: 1px solid var(--track);
      border-radius: 8px;
      padding: .7rem .8rem;
      text-align: left;
    }
    .lb-form-text { color: var(--text); font-size: .82rem; margin: 0 0 .5rem; }
    .lb-input {
      width: 100%;
      background: var(--track);
      border: 0;
      border-radius: 6px;
      color: var(--text);
      padding: .45rem .6rem;
      font-size: .85rem;
      margin-bottom: .5rem;
    }
    .lb-form-actions { display: flex; gap: .5rem; }
    .lb-form-actions button {
      flex: 1;
      border: 0;
      border-radius: 6px;
      padding: .45rem .5rem;
      font-size: .8rem;
      cursor: pointer;
    }
    .lb-yes { background: var(--yellow); color: #111827; font-weight: 600; }
    .lb-no { background: var(--track); color: var(--text); }

    @media (prefers-reduced-motion: reduce) {
      .stripes, .caret { animation: none; }
      .bar { transition: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="stripes"></div>
    <div class="content">
      <h1><span class="emoji" id="egg" title="Klick mich">🚧</span> Under Construction</h1>
      <p>Hier entsteht gerade etwas Neues. Schau bald wieder vorbei!</p>

      <div class="progress-head"><span>Aufbau</span><span id="pct">0 %</span></div>
      <div class="track"><div class="bar" id="bar"></div></div>
      <div class="status"><span id="msg"></span><span class="caret"></span></div>

      <div id="game">
        <canvas id="board" width="280" height="280"></canvas>
        <div class="score" id="score">Punkte: 0</div>
        <div class="pad">
          <button class="up" data-d="up" aria-label="hoch">▲</button>
          <button class="left" data-d="left" aria-label="links">◀</button>
          <button class="down" data-d="down" aria-label="runter">▼</button>
          <button class="right" data-d="right" aria-label="rechts">▶</button>
        </div>

        <div class="lb-panel">
          <div class="lb-head">
            <span>🏆 Bestenliste</span>
            <button class="lb-gear" id="lbGear" title="Leaderboard-Einstellungen" aria-label="Leaderboard-Einstellungen">⚙</button>
          </div>
          <ol class="lb-list" id="lbList"><li class="lb-empty">Lädt …</li></ol>
        </div>

        <div class="lb-form" id="lbForm" hidden>
          <p class="lb-form-text" id="lbFormText">Im Leaderboard erscheinen?</p>
          <input class="lb-input" id="lbNickname" maxlength="20" placeholder="Dein Name">
          <div class="lb-form-actions">
            <button class="lb-yes" id="lbOptIn">Ja, zeig mich</button>
            <button class="lb-no" id="lbOptOut">Lieber nicht</button>
          </div>
        </div>

        <button class="close" id="close">Spiel schließen</button>
      </div>

      <p class="hint">Tipp: Klick auf die 🚧 …</p>
      <p class="visitors" id="visitors" hidden>Du bist Besucher Nr. <b id="count"></b></p>
    </div>
    <div class="stripes"></div>
  </div>

  <script>
  (function () {
    // ---- Besucherzähler ----
    // Pro Browser-Sitzung wird nur einmal gezählt (Reload zählt nicht doppelt).
    function animateCount(el, to, duration) {
      var start = null;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased).toLocaleString('de-DE');
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    (function () {
      var counted = false;
      try { counted = sessionStorage.getItem('counted') === '1'; } catch (e) {}
      fetch('/api/visit', { method: counted ? 'GET' : 'POST' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || typeof d.count !== 'number') return;
          var visitorsEl = document.getElementById('visitors');
          animateCount(document.getElementById('count'), d.count, 900);
          visitorsEl.hidden = false;
          requestAnimationFrame(function () { visitorsEl.classList.add('show'); });
          try { sessionStorage.setItem('counted', '1'); } catch (e) {}
        })
        .catch(function () {});
    })();

    // ---- Fortschrittsbalken ----
    var bar = document.getElementById('bar');
    var pctEl = document.getElementById('pct');
    var pct = 0;
    function setPct(v) {
      pct = v;
      bar.style.width = v + '%';
      pctEl.textContent = v + ' %';
    }
    setTimeout(function () { setPct(63); }, 300);
    setInterval(function () {
      if (pct < 99) setPct(pct + 1);
    }, 6000);

    // ---- Typewriter ----
    var lines = [
      'Schrauben festziehen …',
      'Kaffee kochen …',
      'Pixel polieren …',
      'Bagger tanken …',
      'Server streicheln …',
      'Fast fertig. Wirklich. …'
    ];
    var msg = document.getElementById('msg');
    var li = 0, ci = 0, deleting = false;
    function tick() {
      var full = lines[li];
      if (!deleting) {
        ci++;
        msg.textContent = full.slice(0, ci);
        if (ci === full.length) { deleting = true; return setTimeout(tick, 1400); }
        return setTimeout(tick, 60);
      }
      ci--;
      msg.textContent = full.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(tick, 300); }
      setTimeout(tick, 25);
    }
    tick();

    // ---- Spielkonfiguration (vom Admin einstellbar) ----
    var snakeTickMs = 140;
    fetch('/api/config').then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.snakeTickMs) snakeTickMs = d.snakeTickMs; })
      .catch(function () {});

    // ---- Leaderboard: Hilfsfunktionen ----
    var LB_KEY = 'snakeLbPrefs';
    var CID_KEY = 'snakeClientId';
    function getClientId() {
      try {
        var id = localStorage.getItem(CID_KEY);
        if (!id) {
          id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(16).slice(2)));
          localStorage.setItem(CID_KEY, id);
        }
        return id;
      } catch (e) { return 'temp-' + Math.random().toString(16).slice(2); }
    }
    function getPrefs() {
      try { var raw = localStorage.getItem(LB_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    }
    function setPrefs(p) { try { localStorage.setItem(LB_KEY, JSON.stringify(p)); } catch (e) {} }

    function renderLeaderboard(entries) {
      var list = document.getElementById('lbList');
      list.innerHTML = '';
      if (!entries || !entries.length) {
        var empty = document.createElement('li');
        empty.className = 'lb-empty';
        empty.textContent = 'Noch keine Einträge.';
        list.appendChild(empty);
        return;
      }
      entries.forEach(function (e, i) {
        var row = document.createElement('li');
        row.className = 'lb-row';
        var rank = document.createElement('span'); rank.className = 'lb-rank'; rank.textContent = (i + 1) + '.';
        var name = document.createElement('span'); name.className = 'lb-name'; name.textContent = e.nickname;
        var sc = document.createElement('span'); sc.className = 'lb-score'; sc.textContent = e.score;
        row.appendChild(rank); row.appendChild(name); row.appendChild(sc);
        list.appendChild(row);
      });
    }
    function loadLeaderboard() {
      fetch('/api/leaderboard').then(function (r) { return r.json(); })
        .then(function (d) { renderLeaderboard(d && d.entries); })
        .catch(function () {});
    }
    function submitScore(sc, optIn, nickname) {
      fetch('/api/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId: getClientId(), nickname: nickname, score: sc, optIn: optIn })
      }).then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.entries) renderLeaderboard(d.entries); })
        .catch(function () {});
    }

    var lbForm = document.getElementById('lbForm');
    var lbFormText = document.getElementById('lbFormText');
    var lbNickname = document.getElementById('lbNickname');
    var pendingScore = 0;

    function openLbForm(mode) {
      var prefs = getPrefs();
      lbNickname.value = (prefs && prefs.nickname) || '';
      lbFormText.textContent = mode === 'settings'
        ? 'Leaderboard-Einstellungen:'
        : 'Punktzahl ' + pendingScore + ' – im Leaderboard erscheinen?';
      lbForm.hidden = false;
    }
    function closeLbForm() { lbForm.hidden = true; }

    document.getElementById('lbOptIn').addEventListener('click', function () {
      var nickname = (lbNickname.value || '').trim().slice(0, 20) || 'Anonym';
      setPrefs({ optIn: true, nickname: nickname });
      submitScore(pendingScore, true, nickname);
      closeLbForm();
    });
    document.getElementById('lbOptOut').addEventListener('click', function () {
      var prefs = getPrefs();
      var nickname = (prefs && prefs.nickname) || 'Anonym';
      setPrefs({ optIn: false, nickname: nickname });
      submitScore(pendingScore, false, nickname);
      closeLbForm();
    });
    document.getElementById('lbGear').addEventListener('click', function () {
      if (!lbForm.hidden) { closeLbForm(); return; }
      openLbForm('settings');
    });

    function handleGameOver(sc) {
      pendingScore = sc;
      var prefs = getPrefs();
      if (prefs) {
        submitScore(sc, !!prefs.optIn, prefs.nickname || 'Anonym');
      } else if (sc > 0) {
        openLbForm('gameover');
      }
      loadLeaderboard();
    }

    // ---- Snake ----
    var game = document.getElementById('game');
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');
    var scoreEl = document.getElementById('score');
    var N = 14, S = canvas.width / N;
    var snake, dir, nextDir, food, score, timer, running = false;

    function placeFood() {
      while (true) {
        var f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
        var hit = false;
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === f.x && snake[i].y === f.y) { hit = true; break; }
        }
        if (!hit) { food = f; return; }
      }
    }
    function reset() {
      snake = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }];
      dir = { x: 1, y: 0 };
      nextDir = dir;
      score = 0;
      scoreEl.textContent = 'Punkte: 0';
      placeFood();
    }
    function draw(over) {
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = (S - 4) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔩', food.x * S + S / 2, food.y * S + S / 2 + 1);
      for (var i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#facc15' : '#f59e0b';
        ctx.fillRect(snake[i].x * S + 1, snake[i].y * S + 1, S - 2, S - 2);
      }
      if (over) {
        ctx.fillStyle = 'rgba(15,23,42,.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('Game over', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText('Tippen / Taste für neue Runde', canvas.width / 2, canvas.height / 2 + 16);
      }
    }
    function step() {
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      var dead = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
      for (var i = 0; i < snake.length && !dead; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) dead = true;
      }
      if (dead) {
        clearInterval(timer);
        running = false;
        draw(true);
        handleGameOver(score);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = 'Punkte: ' + score;
        placeFood();
      } else {
        snake.pop();
      }
      draw(false);
    }
    function start() {
      reset();
      draw(false);
      running = true;
      clearInterval(timer);
      timer = setInterval(step, snakeTickMs);
    }
    function turn(d) {
      var map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      var v = map[d];
      if (!v) return;
      if (!running) { if (game.classList.contains('open')) start(); return; }
      if (v[0] === -dir.x && v[1] === -dir.y) return; // keine 180°-Wende
      nextDir = { x: v[0], y: v[1] };
    }
    function openGame() {
      game.classList.add('open');
      start();
      loadLeaderboard();
      game.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function closeGame() {
      game.classList.remove('open');
      clearInterval(timer);
      running = false;
      closeLbForm();
    }

    document.getElementById('egg').addEventListener('click', function () {
      if (game.classList.contains('open')) closeGame(); else openGame();
    });
    document.getElementById('close').addEventListener('click', closeGame);

    var pad = document.querySelectorAll('.pad button');
    for (var b = 0; b < pad.length; b++) {
      pad[b].addEventListener('click', function (e) { turn(e.currentTarget.getAttribute('data-d')); });
    }

    // Tastatur: Pfeile / WASD, Konami-Code öffnet das Spiel
    var keyMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right'
    };
    var konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var kpos = 0;
    document.addEventListener('keydown', function (e) {
      if (e.key === konami[kpos]) {
        kpos++;
        if (kpos === konami.length) { kpos = 0; if (!game.classList.contains('open')) openGame(); }
      } else {
        kpos = (e.key === konami[0]) ? 1 : 0;
      }
      var d = keyMap[e.key];
      if (d && game.classList.contains('open')) { e.preventDefault(); turn(d); }
    });

    // Wischen auf dem Spielfeld
    var tx = 0, ty = 0;
    canvas.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
      if (!running) turn('right');
    }, { passive: true });
    canvas.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
      else turn(dy > 0 ? 'down' : 'up');
    }, { passive: true });
  })();
  </script>
</body>
</html>`;

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | feh.re</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --yellow: #facc15;
      --track: #334155;
      --danger: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 1.2rem;
    }
    .wrap { max-width: 720px; margin: 0 auto; }
    h1 { font-size: 1.4rem; margin: 0 0 1.2rem; }
    h2 { font-size: 1rem; margin: 0 0 .6rem; color: var(--yellow); }
    .card {
      background: var(--card);
      border-radius: 10px;
      padding: 1.1rem 1.2rem;
      margin-bottom: 1rem;
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
    }
    .row { display: flex; justify-content: space-between; align-items: center; gap: .6rem; flex-wrap: wrap; }
    .muted { color: var(--muted); font-size: .85rem; }
    input, button { font: inherit; }
    input[type="text"], input[type="password"], input[type="number"] {
      background: var(--track);
      border: 0;
      border-radius: 6px;
      color: var(--text);
      padding: .5rem .6rem;
      width: 100%;
    }
    button {
      background: var(--yellow);
      color: #111827;
      font-weight: 600;
      border: 0;
      border-radius: 6px;
      padding: .5rem .9rem;
      cursor: pointer;
    }
    .btn-secondary { background: var(--track); color: var(--text); font-weight: 400; }
    .btn-small { padding: .3rem .6rem; font-size: .8rem; font-weight: 400; background: var(--track); color: var(--text); }
    .btn-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    th, td { text-align: left; padding: .4rem .3rem; border-bottom: 1px solid var(--track); vertical-align: middle; }
    th { color: var(--muted); font-weight: 500; }
    .cell-input { background: var(--track); border: 0; border-radius: 4px; color: var(--text); padding: .3rem .4rem; width: 100%; }
    .cell-input-num { width: 5.5rem; }
    .error { color: var(--danger); font-size: .85rem; min-height: 1.2em; margin: .4rem 0 0; }
    .big-number { font-size: 2.2rem; font-weight: 700; color: var(--yellow); font-variant-numeric: tabular-nums; }
    .hint { font-size: .8rem; color: var(--muted); margin: .3rem 0 .8rem; }
    form.inline { display: flex; gap: .5rem; align-items: flex-end; flex-wrap: wrap; }
    form.inline > div { flex: 1; min-width: 120px; }
    label { font-size: .8rem; color: var(--muted); display: block; margin-bottom: .2rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>🔧 Admin – underconstruction</h1>

    <div class="card" id="loginView">
      <h2>Anmelden</h2>
      <form id="loginForm">
        <input type="password" id="passwordInput" placeholder="Passwort" autocomplete="current-password" required>
        <p class="error" id="loginError"></p>
        <button type="submit">Anmelden</button>
      </form>
    </div>

    <div id="panelView" hidden>
      <div class="row" style="margin-bottom:1rem;">
        <span class="muted">Angemeldet</span>
        <button class="btn-secondary" id="logoutBtn">Abmelden</button>
      </div>

      <div class="card">
        <h2>Besucherzähler</h2>
        <div class="row">
          <div class="big-number" id="counterValue">0</div>
          <button id="resetBtn">Zurücksetzen</button>
        </div>
        <p class="hint">Beim Zurücksetzen wird der alte Stand in der Historie gesichert und bleibt wiederherstellbar.</p>
        <table>
          <thead><tr><th>Zeitpunkt</th><th>Wert</th><th>Aktion</th><th></th></tr></thead>
          <tbody id="historyBody"></tbody>
        </table>
      </div>

      <div class="card">
        <h2>Snake-Leaderboard</h2>
        <table>
          <thead><tr><th>Name</th><th>Punkte</th><th>Zuletzt</th><th></th></tr></thead>
          <tbody id="lbBody"></tbody>
        </table>
        <p class="hint">Neuen Eintrag hinzufügen:</p>
        <form class="inline" id="addEntryForm">
          <div><label>Name</label><input type="text" id="newNickname" maxlength="20" required></div>
          <div><label>Punkte</label><input type="number" id="newScore" min="0" value="0" required></div>
          <button type="submit">Hinzufügen</button>
        </form>
      </div>

      <div class="card">
        <h2>Snake-Geschwindigkeit</h2>
        <p class="hint">Millisekunden pro Spielzug. Kleinerer Wert = schnelleres Spiel (empfohlen: 80–200).</p>
        <form class="inline" id="configForm">
          <div><label>Tick in ms</label><input type="number" id="tickInput" min="40" max="500" required></div>
          <button type="submit">Speichern</button>
        </form>
      </div>
    </div>
  </div>

  <script>
  (function () {
    function qs(id) { return document.getElementById(id); }
    var loginView = qs('loginView');
    var panelView = qs('panelView');
    var loginForm = qs('loginForm');
    var loginError = qs('loginError');
    var state = null;

    function fmtDate(ms) {
      try { return new Date(ms).toLocaleString('de-DE'); } catch (e) { return String(ms); }
    }
    function api(path, opts) {
      opts = opts || {};
      opts.headers = Object.assign({ 'content-type': 'application/json' }, opts.headers || {});
      return fetch(path, opts).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          return { ok: r.ok, status: r.status, data: d };
        });
      });
    }
    function showLogin(msg) {
      panelView.hidden = true;
      loginView.hidden = false;
      loginError.textContent = msg || '';
    }
    function showPanel() {
      loginView.hidden = true;
      panelView.hidden = false;
    }

    function renderCounter() {
      qs('counterValue').textContent = state.count.toLocaleString('de-DE');
      var tbody = qs('historyBody');
      tbody.innerHTML = '';
      if (!state.history.length) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 4; td.textContent = 'Noch keine Einträge.'; td.className = 'muted';
        tr.appendChild(td); tbody.appendChild(tr);
      }
      state.history.forEach(function (h) {
        var tr = document.createElement('tr');
        var tdTime = document.createElement('td'); tdTime.textContent = fmtDate(h.at);
        var tdVal = document.createElement('td'); tdVal.textContent = h.n.toLocaleString('de-DE');
        var tdKind = document.createElement('td'); tdKind.textContent = h.kind === 'reset' ? 'Reset' : 'Restore';
        var tdAction = document.createElement('td');
        var btn = document.createElement('button');
        btn.className = 'btn-small'; btn.textContent = 'Wiederherstellen';
        btn.addEventListener('click', function () { restoreCounter(h.id); });
        tdAction.appendChild(btn);
        tr.appendChild(tdTime); tr.appendChild(tdVal); tr.appendChild(tdKind); tr.appendChild(tdAction);
        tbody.appendChild(tr);
      });
    }

    function resetCounter() {
      if (!confirm('Besucherzähler wirklich auf 0 zurücksetzen? Der alte Stand bleibt in der Historie erhalten.')) return;
      api('/api/admin/reset-counter', { method: 'POST' }).then(function (res) {
        if (res.ok) { state.count = res.data.count; state.history = res.data.history; renderCounter(); }
        else alert(res.data.error || 'Fehler beim Zurücksetzen');
      });
    }
    function restoreCounter(id) {
      if (!confirm('Diesen Stand wiederherstellen? Der aktuelle Stand wird zuvor gesichert.')) return;
      api('/api/admin/restore-counter', { method: 'POST', body: JSON.stringify({ historyId: id }) }).then(function (res) {
        if (res.ok) { state.count = res.data.count; state.history = res.data.history; renderCounter(); }
        else alert(res.data.error || 'Fehler beim Wiederherstellen');
      });
    }

    function renderLeaderboard() {
      var tbody = qs('lbBody');
      tbody.innerHTML = '';
      if (!state.leaderboard.length) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 4; td.textContent = 'Noch keine Einträge.'; td.className = 'muted';
        tr.appendChild(td); tbody.appendChild(tr);
      }
      state.leaderboard.forEach(function (e) {
        var tr = document.createElement('tr');
        var nameInput = document.createElement('input');
        nameInput.className = 'cell-input'; nameInput.value = e.nickname; nameInput.maxLength = 20;
        var scoreInput = document.createElement('input');
        scoreInput.className = 'cell-input cell-input-num'; scoreInput.type = 'number'; scoreInput.value = e.score;
        var tdName = document.createElement('td'); tdName.appendChild(nameInput);
        var tdScore = document.createElement('td'); tdScore.appendChild(scoreInput);
        var tdUpdated = document.createElement('td'); tdUpdated.textContent = fmtDate(e.updated_at); tdUpdated.className = 'muted';
        var tdActions = document.createElement('td');
        var saveBtn = document.createElement('button'); saveBtn.className = 'btn-small'; saveBtn.textContent = 'Speichern';
        saveBtn.addEventListener('click', function () {
          api('/api/admin/leaderboard/save', {
            method: 'POST',
            body: JSON.stringify({ clientId: e.client_id, nickname: nameInput.value, score: scoreInput.value })
          }).then(function (res) {
            if (res.ok) { state.leaderboard = res.data.entries; renderLeaderboard(); }
            else alert(res.data.error || 'Fehler beim Speichern');
          });
        });
        var delBtn = document.createElement('button'); delBtn.className = 'btn-small btn-danger'; delBtn.textContent = 'Löschen';
        delBtn.addEventListener('click', function () {
          if (!confirm('Eintrag von "' + e.nickname + '" löschen?')) return;
          api('/api/admin/leaderboard/delete', { method: 'POST', body: JSON.stringify({ clientId: e.client_id }) })
            .then(function (res) {
              if (res.ok) { state.leaderboard = res.data.entries; renderLeaderboard(); }
              else alert(res.data.error || 'Fehler beim Löschen');
            });
        });
        tdActions.appendChild(saveBtn); tdActions.appendChild(delBtn);
        tr.appendChild(tdName); tr.appendChild(tdScore); tr.appendChild(tdUpdated); tr.appendChild(tdActions);
        tbody.appendChild(tr);
      });
    }

    qs('addEntryForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      api('/api/admin/leaderboard/save', {
        method: 'POST',
        body: JSON.stringify({ nickname: qs('newNickname').value, score: qs('newScore').value })
      }).then(function (res) {
        if (res.ok) {
          state.leaderboard = res.data.entries; renderLeaderboard();
          qs('newNickname').value = ''; qs('newScore').value = '0';
        } else alert(res.data.error || 'Fehler beim Hinzufügen');
      });
    });

    function renderConfig() { qs('tickInput').value = state.config.snakeTickMs; }
    qs('configForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      api('/api/admin/config', { method: 'POST', body: JSON.stringify({ snakeTickMs: qs('tickInput').value }) })
        .then(function (res) {
          if (res.ok) { state.config = res.data; renderConfig(); }
          else alert(res.data.error || 'Fehler beim Speichern');
        });
    });

    qs('resetBtn').addEventListener('click', resetCounter);
    qs('logoutBtn').addEventListener('click', function () {
      api('/admin/logout', { method: 'POST' }).then(function () { showLogin(); state = null; });
    });

    loginForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var pw = qs('passwordInput').value;
      api('/admin/login', { method: 'POST', body: JSON.stringify({ password: pw }) }).then(function (res) {
        if (res.ok) { qs('passwordInput').value = ''; boot(); }
        else showLogin(res.data.error || 'Login fehlgeschlagen');
      });
    });

    function boot() {
      api('/api/admin/state').then(function (res) {
        if (!res.ok) { showLogin(); return; }
        state = res.data;
        showPanel();
        renderCounter();
        renderLeaderboard();
        renderConfig();
      });
    }
    boot();
  })();
  </script>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Durable Object mit SQLite-Speicher: Besucherzähler + Historie, Leaderboard,
// Spielkonfiguration. Ein einziger globaler Namespace ("global") reicht für
// diese kleine Seite.
// ---------------------------------------------------------------------------
export class Counter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY CHECK (id = 1), n INTEGER NOT NULL)");
    this.sql.exec("INSERT OR IGNORE INTO visits (id, n) VALUES (1, 0)");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS visit_history (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, n INTEGER NOT NULL, kind TEXT NOT NULL, at INTEGER NOT NULL)"
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS leaderboard (" +
      "client_id TEXT PRIMARY KEY, nickname TEXT NOT NULL, score INTEGER NOT NULL, updated_at INTEGER NOT NULL)"
    );
    this.sql.exec("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    this.sql.exec("INSERT OR IGNORE INTO config (key, value) VALUES ('snakeTickMs', '140')");
  }

  // ---- Besucherzähler ----
  read() {
    return this.sql.exec("SELECT n FROM visits WHERE id = 1").one().n;
  }
  async get() { return this.read(); }
  async increment() {
    this.sql.exec("UPDATE visits SET n = n + 1 WHERE id = 1");
    return this.read();
  }

  // ---- Admin: Counter-Historie ----
  history() {
    return this.sql.exec("SELECT id, n, kind, at FROM visit_history ORDER BY at DESC, id DESC LIMIT 50").toArray();
  }
  async resetCounter() {
    const current = this.read();
    const now = Date.now();
    this.sql.exec("INSERT INTO visit_history (n, kind, at) VALUES (?, 'reset', ?)", current, now);
    this.sql.exec("UPDATE visits SET n = 0 WHERE id = 1");
    return { count: this.read(), history: this.history() };
  }
  async restoreCounter(historyId) {
    const rows = this.sql.exec("SELECT n FROM visit_history WHERE id = ?", historyId).toArray();
    if (!rows.length) throw new Error("Historie nicht gefunden");
    const current = this.read();
    const now = Date.now();
    this.sql.exec("INSERT INTO visit_history (n, kind, at) VALUES (?, 'restore', ?)", current, now);
    this.sql.exec("UPDATE visits SET n = ? WHERE id = 1", rows[0].n);
    return { count: this.read(), history: this.history() };
  }

  // ---- Leaderboard ----
  topScores(limit) {
    return this.sql.exec(
      "SELECT nickname, score FROM leaderboard ORDER BY score DESC, updated_at ASC LIMIT ?", limit || 10
    ).toArray();
  }
  allScores() {
    return this.sql.exec(
      "SELECT client_id, nickname, score, updated_at FROM leaderboard ORDER BY score DESC, updated_at ASC"
    ).toArray();
  }
  async submitScore(clientId, nickname, score, optIn) {
    if (!optIn) {
      this.sql.exec("DELETE FROM leaderboard WHERE client_id = ?", clientId);
      return this.topScores();
    }
    const existing = this.sql.exec("SELECT score FROM leaderboard WHERE client_id = ?", clientId).toArray();
    const best = existing.length ? Math.max(existing[0].score, score) : score;
    this.sql.exec(
      "INSERT INTO leaderboard (client_id, nickname, score, updated_at) VALUES (?, ?, ?, ?) " +
      "ON CONFLICT(client_id) DO UPDATE SET nickname = excluded.nickname, score = excluded.score, updated_at = excluded.updated_at",
      clientId, nickname, best, Date.now()
    );
    return this.topScores();
  }
  async saveLeaderboardEntry(clientId, nickname, score) {
    const id = clientId || ("admin-" + crypto.randomUUID().slice(0, 8));
    this.sql.exec(
      "INSERT INTO leaderboard (client_id, nickname, score, updated_at) VALUES (?, ?, ?, ?) " +
      "ON CONFLICT(client_id) DO UPDATE SET nickname = excluded.nickname, score = excluded.score, updated_at = excluded.updated_at",
      id, nickname, score, Date.now()
    );
    return this.allScores();
  }
  async deleteLeaderboardEntry(clientId) {
    this.sql.exec("DELETE FROM leaderboard WHERE client_id = ?", clientId);
    return this.allScores();
  }

  // ---- Spielkonfiguration ----
  getConfig() {
    const rows = this.sql.exec("SELECT key, value FROM config").toArray();
    const cfg = {};
    for (const r of rows) cfg[r.key] = r.value;
    return { snakeTickMs: Number(cfg.snakeTickMs) || 140 };
  }
  async setSnakeTickMs(ms) {
    this.sql.exec(
      "INSERT INTO config (key, value) VALUES ('snakeTickMs', ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      String(ms)
    );
    return this.getConfig();
  }

  async adminState() {
    return {
      count: this.read(),
      history: this.history(),
      leaderboard: this.allScores(),
      config: this.getConfig(),
    };
  }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen: Antworten, Validierung, Admin-Session (HMAC-signiertes Cookie)
// ---------------------------------------------------------------------------
const json = (body, status, extraHeaders) =>
  new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign(
      { "content-type": "application/json", "cache-control": "no-store" },
      extraHeaders || {}
    ),
  });

function clampInt(v, min, max, fallback) {
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function sanitizeNickname(v) {
  const s = (typeof v === "string" ? v : "").trim().slice(0, 20);
  return s || "Anonym";
}
function sanitizeClientId(v) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(s)) return null;
  return s;
}

function b64urlEncode(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const parts = header.split(/;\s*/);
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx) === name) return decodeURIComponent(part.slice(idx + 1));
  }
  return null;
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 Stunden
async function getHmacKey(env) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.ADMIN_PASSWORD || ""));
  return crypto.subtle.importKey("raw", digest, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function createSessionCookie(env) {
  const exp = String(Date.now() + SESSION_TTL_MS);
  const key = await getHmacKey(env);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(exp));
  const token = exp + "." + b64urlEncode(sig);
  return "admin_session=" + token + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + (SESSION_TTL_MS / 1000);
}
const CLEAR_SESSION_COOKIE = "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
async function isAdminRequest(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = getCookie(request, "admin_session");
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const exp = Number(token.slice(0, dot));
  if (!exp || exp < Date.now()) return false;
  try {
    const key = await getHmacKey(env);
    const sig = b64urlDecode(token.slice(dot + 1));
    return await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(token.slice(0, dot)));
  } catch (e) {
    return false;
  }
}
async function passwordMatches(env, candidate) {
  if (!env.ADMIN_PASSWORD || typeof candidate !== "string") return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(env.ADMIN_PASSWORD)),
    crypto.subtle.digest("SHA-256", enc.encode(candidate)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const stub = env.COUNTER.getByName("global");

    // ---- Öffentlich: Besucherzähler ----
    if (pathname === "/api/visit") {
      if (request.method !== "GET" && request.method !== "POST") return json({ error: "method not allowed" }, 405);
      try {
        const count = request.method === "POST" ? await stub.increment() : await stub.get();
        return json({ count });
      } catch (e) {
        return json({ count: null }, 503);
      }
    }

    // ---- Öffentlich: Spielkonfiguration ----
    if (pathname === "/api/config" && request.method === "GET") {
      try { return json(await stub.getConfig()); }
      catch (e) { return json({ snakeTickMs: 140 }); }
    }

    // ---- Öffentlich: Leaderboard lesen ----
    if (pathname === "/api/leaderboard" && request.method === "GET") {
      try { return json({ entries: await stub.topScores(10) }); }
      catch (e) { return json({ entries: [] }); }
    }

    // ---- Öffentlich: Punktzahl einreichen ----
    if (pathname === "/api/score" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
      const clientId = sanitizeClientId(body.clientId);
      if (!clientId) return json({ error: "invalid clientId" }, 400);
      const nickname = sanitizeNickname(body.nickname);
      const score = clampInt(body.score, 0, 9999, 0);
      const optIn = body.optIn === true;
      try {
        const entries = await stub.submitScore(clientId, nickname, score, optIn);
        return json({ entries });
      } catch (e) {
        return json({ error: "storage error" }, 503);
      }
    }

    // ---- Admin: Login/Logout ----
    if (pathname === "/admin/login" && request.method === "POST") {
      if (!env.ADMIN_PASSWORD) return json({ error: "Admin ist nicht konfiguriert" }, 503);
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
      if (!(await passwordMatches(env, body.password))) return json({ error: "Falsches Passwort" }, 401);
      return json({ ok: true }, 200, { "set-cookie": await createSessionCookie(env) });
    }
    if (pathname === "/admin/logout" && request.method === "POST") {
      return json({ ok: true }, 200, { "set-cookie": CLEAR_SESSION_COOKIE });
    }

    // ---- Admin: API (geschützt) ----
    if (pathname.startsWith("/api/admin/")) {
      if (!(await isAdminRequest(request, env))) return json({ error: "unauthorized" }, 401);

      if (pathname === "/api/admin/state" && request.method === "GET") {
        try { return json(await stub.adminState()); }
        catch (e) { return json({ error: "storage error" }, 503); }
      }

      if (pathname === "/api/admin/reset-counter" && request.method === "POST") {
        try { return json(await stub.resetCounter()); }
        catch (e) { return json({ error: "storage error" }, 503); }
      }

      if (pathname === "/api/admin/restore-counter" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
        const historyId = clampInt(body.historyId, 1, Number.MAX_SAFE_INTEGER, null);
        if (!historyId) return json({ error: "invalid historyId" }, 400);
        try { return json(await stub.restoreCounter(historyId)); }
        catch (e) { return json({ error: String((e && e.message) || e) }, 400); }
      }

      if (pathname === "/api/admin/leaderboard/save" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
        const rawClientId = typeof body.clientId === "string" && body.clientId.trim() ? body.clientId.trim() : null;
        const clientId = rawClientId ? sanitizeClientId(rawClientId) : null;
        if (rawClientId && !clientId) return json({ error: "invalid clientId" }, 400);
        const nickname = sanitizeNickname(body.nickname);
        const score = clampInt(body.score, 0, 999999, 0);
        try { return json({ entries: await stub.saveLeaderboardEntry(clientId, nickname, score) }); }
        catch (e) { return json({ error: "storage error" }, 503); }
      }

      if (pathname === "/api/admin/leaderboard/delete" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
        if (!body.clientId || typeof body.clientId !== "string") return json({ error: "invalid clientId" }, 400);
        try { return json({ entries: await stub.deleteLeaderboardEntry(body.clientId) }); }
        catch (e) { return json({ error: "storage error" }, 503); }
      }

      if (pathname === "/api/admin/config" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400); }
        const raw = Math.trunc(Number(body.snakeTickMs));
        if (!Number.isFinite(raw) || raw < 40 || raw > 500) {
          return json({ error: "Wert muss zwischen 40 und 500 liegen" }, 400);
        }
        try { return json(await stub.setSnakeTickMs(raw)); }
        catch (e) { return json({ error: "storage error" }, 503); }
      }

      return json({ error: "not found" }, 404);
    }

    // ---- Admin-Oberfläche ----
    if (pathname === "/admin") {
      return new Response(ADMIN_HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    // ---- Hauptseite ----
    return new Response(HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
  },
};
