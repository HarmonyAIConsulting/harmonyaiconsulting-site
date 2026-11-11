/* Harmony AI homepage: light motion only. Everything animated pauses off-screen; reduced motion gets a still page.
   Three.js (the v6 PREMIUM node network) loads after the page has loaded, so it never delays the first paint.
   No tracking, no network calls besides the local vendor file. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  // Pause CSS animations in sections that are off-screen.
  var animated = [].slice.call(document.querySelectorAll(".hero, .trust, .how, .local, .final"));
  if (io) {
    animated.forEach(function (el) { el.classList.add("paused"); });
    var pauser = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("paused", !e.isIntersecting); if (e.target._onVis) e.target._onVis(e.isIntersecting); });
    }, { rootMargin: "80px" });
    animated.forEach(function (el) { pauser.observe(el); });
  }

  // Reveal cards once, and light the pipeline when it comes into view.
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  var how = document.querySelector(".how");
  if (io && !reduce) {
    var shower = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target === how ? "live" : "in");
        shower.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    reveals.concat(how).forEach(function (el) { shower.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    how.classList.add("live");
  }

  // ROI estimate: missed calls a week x 4.33 weeks x average job x share won back.
  var rc = document.getElementById("r-calls"), rj = document.getElementById("r-job"), rw = document.getElementById("r-win");
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
  function roi() {
    var c = +rc.value, j = +rj.value, w = +rw.value;
    document.getElementById("o-calls").textContent = c;
    document.getElementById("o-job").textContent = money(j);
    document.getElementById("o-win").textContent = w + "%";
    document.getElementById("roi-total").textContent = money(c * 4.33 * j * w / 100);
    document.getElementById("roi-how").textContent = c + " calls × 4.33 weeks × " + money(j) + " × " + w + "%";
    [rc, rj, rw].forEach(fill);
  }
  [rc, rj, rw].forEach(function (r) { r.addEventListener("input", roi); });
  roi();

  // Map: a pulse ring behind every town pin, staggered so the coast twinkles.
  var NS = "http://www.w3.org/2000/svg";
  [].slice.call(document.querySelectorAll(".pin")).forEach(function (g, i) {
    var dot = g.querySelector("circle"), ring = document.createElementNS(NS, "circle");
    ["cx", "cy", "r"].forEach(function (a) { ring.setAttribute(a, dot.getAttribute(a)); });
    ring.setAttribute("class", "pulse");
    ring.style.animationDelay = (i * 0.21).toFixed(2) + "s";
    g.insertBefore(ring, dot);
    var t = document.createElementNS(NS, "title"); t.textContent = g.dataset.town; g.appendChild(t);
  });


  // v6 PREMIUM node network behind the hero: drifting teal nodes with gold accents, linked when close.
  var canvas = document.querySelector(".hero-net"), hero = document.querySelector(".hero");
  if (!canvas || reduce) { if (canvas) canvas.hidden = true; return; }
  function start() {
    var s = document.createElement("script");
    s.src = "vendor/three.min.js";
    s.onload = net;
    document.body.appendChild(s);
  }
  function net() {
    try {
      var T = window.THREE, small = window.innerWidth < 700;
      var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !small, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5));
      renderer.setClearColor(0x000000, 0);
      var scene = new T.Scene(), camera = new T.PerspectiveCamera(55, 1, 0.1, 1000);
      camera.position.z = 30;
      var teal = [], gold = [];
      function spawn(list, n, r, color, opacity, depth) {
        var geo = new T.SphereGeometry(r, 8, 8);
        for (var i = 0; i < n; i++) {
          var m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity() }));
          m.position.set((Math.random() - .5) * 44, (Math.random() - .5) * 26, (Math.random() - .5) * depth);
          m.userData.v = new T.Vector3((Math.random() - .5) * .015, (Math.random() - .5) * .015, (Math.random() - .5) * .006);
          scene.add(m); list.push(m);
        }
      }
      spawn(teal, small ? 34 : 64, .13, 0x00e5ff, function () { return Math.random() * .55 + .2; }, 10);
      spawn(gold, small ? 4 : 7, .2, 0xffd166, function () { return .85; }, 6);
      var lines = new T.Group(); scene.add(lines);
      var tealLine = new T.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: .12 });
      var goldLine = new T.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: .16 });
      var all = teal.concat(gold);
      function link() {
        while (lines.children.length) { lines.children.pop().geometry.dispose(); }
        var a = [], b = [], i, j;
        for (i = 0; i < teal.length; i++)
          for (j = i + 1; j < teal.length; j++)
            if (teal[i].position.distanceTo(teal[j].position) < 7.5) a.push(teal[i].position.clone(), teal[j].position.clone());
        gold.forEach(function (g) { teal.forEach(function (t) { if (g.position.distanceTo(t.position) < 9) b.push(g.position.clone(), t.position.clone()); }); });
        if (a.length) lines.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(a), tealLine));
        if (b.length) lines.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(b), goldLine));
      }
      function size() {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      }
      var frame = 0, running = false;
      function loop() {
        if (!running) return;
        frame++;
        all.forEach(function (n) {
          var v = n.userData.v; n.position.add(v);
          if (Math.abs(n.position.x) > 22) v.x *= -1;
          if (Math.abs(n.position.y) > 13) v.y *= -1;
          if (Math.abs(n.position.z) > 5) v.z *= -1;
        });
        if (frame % 4 === 0) link();
        camera.position.x = Math.sin(frame * .0012) * 1.5; camera.position.y = Math.cos(frame * .001) * .8; camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      }
      size(); link(); renderer.render(scene, camera);
      window.addEventListener("resize", size);
      hero._onVis = function (vis) { if (vis && !running) { running = true; requestAnimationFrame(loop); } else if (!vis) { running = false; } };
      var r = hero.getBoundingClientRect();
      hero._onVis(r.bottom > 0 && r.top < window.innerHeight);
    } catch (e) { canvas.hidden = true; }  // no WebGL: the hero still works without the network
  }
  function later() { ("requestIdleCallback" in window) ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200); }
  if (document.readyState === "complete") later(); else window.addEventListener("load", later);
})();
