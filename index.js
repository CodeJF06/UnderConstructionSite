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
        <button class="close" id="close">Spiel schließen</button>
      </div>

      <p class="hint">Tipp: Klick auf die 🚧 …</p>
    </div>
    <div class="stripes"></div>
  </div>

  <script>
  (function () {
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
      timer = setInterval(step, 140);
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
      game.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function closeGame() {
      game.classList.remove('open');
      clearInterval(timer);
      running = false;
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

export default {
  async fetch(request) {
    return new Response(HTML, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
