/* HALI interface layer for the request pages: the node-network background (a light 2D canvas, no libraries),
   HALI's reactive speech bubble, the "listening" indicator, the progress bar and the button ripple.
   It never touches the form's submit logic (that is form.js). Stills for prefers-reduced-motion; pauses when the tab is hidden. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- node network: teal nodes with purple, magenta and gold accents, linked when close ----
  var cv = document.querySelector(".net");
  function net() {
    var ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return;
    var small = window.innerWidth < 700, nodes = [], W = 0, H = 0, ptr = null, last = 0, running = false;
    var PAL = ["0,229,255", "0,229,255", "0,229,255", "157,78,221", "233,30,140", "255,209,102"];
    var LINK = small ? 105 : 150;
    function mk() {
      var k = Math.random(), c = k < .55 ? 0 : k < .76 ? 3 : k < .92 ? 4 : 5;
      return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .36, vy: (Math.random() - .5) * .36, r: c === 5 ? 2.6 : 1.3 + Math.random() * 1.4, c: PAL[c] };
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(small ? 30 : 70, Math.max(24, W * H / 26000)));
      while (nodes.length < n) nodes.push(mk());
      nodes.length = n;
      if (reduce) draw(false);
    }
    function draw(move) {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, d;
      if (move) for (i = 0; i < nodes.length; i++) {
        a = nodes[i]; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { ctx.strokeStyle = "rgba(" + a.c + "," + ((1 - d / LINK) * .3).toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        if (ptr) { d = Math.hypot(a.x - ptr.x, a.y - ptr.y); if (d < 180) { ctx.strokeStyle = "rgba(0,229,255," + ((1 - d / 180) * .55).toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ptr.x, ptr.y); ctx.stroke(); } }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = "rgba(" + a.c + ",.14)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 3.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = "rgba(" + a.c + ",.9)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
    }
    function loop(t) {
      if (!running) return;
      if (t - last > 32) { last = t; draw(true); }   // about 30 frames a second is plenty and easy on phones
      requestAnimationFrame(loop);
    }
    size();
    window.addEventListener("resize", function () { small = window.innerWidth < 700; LINK = small ? 105 : 150; size(); });
    if (reduce) return;
    draw(true);
    window.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.addEventListener("pointerleave", function () { ptr = null; });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(loop); }
    });
    running = true; requestAnimationFrame(loop);
  }
  if (cv) {
    var later = function () { ("requestIdleCallback" in window) ? requestIdleCallback(net, { timeout: 2000 }) : setTimeout(net, 600); };
    if (document.readyState === "complete") later(); else window.addEventListener("load", later);
  }

  // ---- HALI's side of the conversation ----
  var form = document.querySelector("form[data-w3f]");
  var hud = document.querySelector(".hud");
  if (!form || !hud) return;
  var say = hud.querySelector(".say"), state = hud.querySelector(".hud-state"), count = hud.querySelector(".hud-count"), bar = hud.querySelector(".prog i");
  var stage = document.querySelector(".hali-stage");
  var fields = [].slice.call(form.querySelectorAll("[required]"));
  var idle = null;

  function setSay(t) {
    if (!t || say.textContent === t) return;
    say.textContent = t;
    say.classList.remove("in"); void say.offsetWidth; say.classList.add("in");
  }
  function progress() {
    var done = 0;
    fields.forEach(function (f) {
      var ok = f.value.trim() !== "" && f.checkValidity();
      if (ok) done++;
      var wrap = f.closest(".fp-field");
      if (wrap) wrap.classList.toggle("ok", ok);
    });
    count.textContent = done + " of " + fields.length + " details";
    bar.style.width = Math.round(done / fields.length * 100) + "%";
    if (done === fields.length && !form.hasAttribute("data-ready")) {
      form.setAttribute("data-ready", "");
      setSay("That's everything I need. Send it over whenever you're ready.");
    }
  }
  form.addEventListener("focusin", function (e) {
    var host = e.target.closest("[data-hali]");
    if (host && !(form.hasAttribute("data-ready") && host.classList.contains("fp-field"))) setSay(host.getAttribute("data-hali"));
  });
  function listen() {
    hud.classList.add("listening"); if (stage) stage.classList.add("talk"); state.textContent = "Listening";
    clearTimeout(idle);
    idle = setTimeout(function () { hud.classList.remove("listening"); if (stage) stage.classList.remove("talk"); state.textContent = "Ready"; }, 1300);
  }
  form.addEventListener("input", function () { listen(); progress(); });
  form.addEventListener("change", progress);
  progress();

  // soft ripple on the main button
  var btn = form.querySelector("button[type=submit]");
  btn.addEventListener("pointerdown", function (e) {
    if (reduce || btn.disabled) return;
    var r = btn.getBoundingClientRect(), s = document.createElement("span");
    s.className = "ripple"; s.style.left = (e.clientX - r.left) + "px"; s.style.top = (e.clientY - r.top) + "px";
    btn.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 800);
  });
})();
