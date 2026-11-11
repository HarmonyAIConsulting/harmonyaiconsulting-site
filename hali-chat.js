/* HALI website chat box (Harmony AI, 2026-11-09). Replaces the GoHighLevel chat bubble.
   Add to a page:  <script src="/hali-chat.js" data-endpoint="https://voice.harmonyaiconsulting.com/chat" data-site="index" defer></script>
   data-site: "harmony" (Harmony AI site) or "index" (Brunswick County Index). No cookies; the chat id lives only in this tab.
   data-icon: image URL for a round face on the button.  data-side: "right" (default) or "left".  data-mobile-bottom: px above the bottom on phones (to clear a fixed bottom bar). */
(function () {
  var me = document.currentScript;
  var ENDPOINT = me && me.getAttribute("data-endpoint");
  var SITE = (me && me.getAttribute("data-site")) || "harmony";
  var SIDE = (me && me.getAttribute("data-side")) === "left" ? "left" : "right";
  var ICON = me && me.getAttribute("data-icon");
  // data-mobile (below 768px): "pill" (default), "avatar" (56px round face only) or "hide" (open it from a page link
  // with the attribute data-hali-chat, e.g. a bottom-bar "Ask AI" button).
  var MOBILE = (me && me.getAttribute("data-mobile")) || "pill";
  var MB = parseInt((me && me.getAttribute("data-mobile-bottom")) || "20", 10) || 20;
  if (!ENDPOINT) return;
  var FALLBACK = "Sorry, I couldn't connect. Please call (910) 294-5771 or email harmony@harmonyaiconsulting.com.";
  var sid;
  try { sid = sessionStorage.getItem("hali-chat-id"); } catch (e) {}
  if (!sid) {
    sid = "s" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { sessionStorage.setItem("hali-chat-id", sid); } catch (e) {}
  }

  var css = document.createElement("style");
  css.textContent = [
    ".hc-btn{position:fixed;" + SIDE + ":20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:12px;",
    "padding:10px 26px 10px 10px;min-height:64px;border:2px solid rgba(255,255,255,.55);border-radius:999px;font:800 20px/1.2 system-ui,sans-serif;color:#fff;cursor:pointer;",
    "background:linear-gradient(135deg,#00D4C8,#8B2FC9 60%,#E91E8C);box-shadow:0 10px 30px rgba(0,0,0,.35)}",
    ".hc-btn:focus-visible,.hc-panel button:focus-visible,.hc-panel textarea:focus-visible{outline:3px solid #D4AF37;outline-offset:3px}",
    ".hc-panel{position:fixed;" + SIDE + ":16px;bottom:88px;z-index:2147483000;width:min(400px,calc(100vw - 32px));",
    "height:min(560px,calc(100vh - 120px));display:flex;flex-direction:column;border-radius:20px;overflow:hidden;",
    "background:#0d0b18;color:#f4f2ff;border:1px solid rgba(0,212,200,.45);box-shadow:0 20px 50px rgba(0,0,0,.5);",
    "font:400 18px/1.5 system-ui,sans-serif}",
    ".hc-panel[hidden]{display:none}",
    ".hc-btn img{width:46px;height:46px;border-radius:50%;border:2px solid #fff;flex:none;object-fit:cover;background:#0d0b18}",
    ".hc-btn:hover{transform:translateY(-2px)}",
    ".hc-btn.hc-open{display:none}",
    ".hc-t-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}",
    (MOBILE === "hide" ? "@media (max-width:767.98px){.hc-btn{display:none}}" : ""),
    (MOBILE === "avatar" ? "@media (max-width:767.98px){.hc-btn{width:56px;height:56px;min-height:0;padding:0;justify-content:center;border-radius:50%;right:16px}" +
      ".hc-btn img{width:50px;height:50px;border:0}.hc-btn .hc-t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}" : ""),
    "@media (max-width:639px){.hc-btn{bottom:calc(" + MB + "px + env(safe-area-inset-bottom,0px));padding:7px 18px 7px 7px;min-height:52px;font-size:17px}.hc-btn img{width:38px;height:38px}" +
    ".hc-panel{bottom:calc(" + (MB + 64) + "px + env(safe-area-inset-bottom,0px));height:min(520px,calc(100vh - " + (MB + 96) + "px))}" +
    ".hc-panel textarea{font-size:16px}}",
    ".hc-head{padding:14px 18px;background:linear-gradient(135deg,rgba(0,212,200,.18),rgba(139,47,201,.25));",
    "display:flex;justify-content:space-between;align-items:center;gap:8px}",
    ".hc-head b{font-size:20px}.hc-head small{display:block;font-size:15px;opacity:.85}",
    ".hc-x{background:none;border:0;color:#fff;font-size:28px;line-height:1;cursor:pointer;padding:4px 8px}",
    ".hc-log{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}",
    ".hc-m{max-width:85%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}",
    ".hc-h{align-self:flex-start;background:#1c1830;border:1px solid rgba(0,212,200,.35)}",
    ".hc-u{align-self:flex-end;background:#3a1f5c}",
    ".hc-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.12)}",
    ".hc-form textarea{flex:1;resize:none;min-height:48px;max-height:120px;padding:10px 12px;border-radius:12px;",
    "border:1px solid rgba(255,255,255,.25);background:#15122a;color:#fff;font:inherit}",
    ".hc-form button{min-width:76px;border:0;border-radius:12px;background:#D4AF37;color:#1a1405;font:700 18px system-ui,sans-serif;cursor:pointer}",
    ".hc-note{font-size:15px;opacity:.8;padding:0 16px 10px}"
  ].join("");
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.className = "hc-btn"; btn.type = "button"; btn.setAttribute("aria-expanded", "false");
  if (ICON) { var av = document.createElement("img"); av.src = ICON; av.alt = ""; av.width = 46; av.height = 46; btn.appendChild(av); }
  var label = document.createElement("span"); label.className = "hc-t"; label.textContent = "Chat with HALI";
  btn.appendChild(label); btn.setAttribute("aria-label", "Chat with HALI");
  var panel = document.createElement("section");
  panel.className = "hc-panel"; panel.hidden = true; panel.setAttribute("aria-label", "Chat with HALI");
  panel.innerHTML = '<div class="hc-head"><div><b>HALI</b><small>Harmony\'s AI assistant</small></div>' +
    '<button class="hc-x" type="button" aria-label="Close chat">&times;</button></div>' +
    '<div class="hc-log" role="log" aria-live="polite"></div>' +
    '<p class="hc-note">HALI is an AI. Your messages go to Harmony.</p>' +
    '<form class="hc-form"><label class="hc-sr" style="position:absolute;left:-9999px" for="hc-in">Your message</label>' +
    '<textarea id="hc-in" rows="1" maxlength="1000" placeholder="Type your question"></textarea>' +
    '<button type="submit">Send</button></form>';
  document.body.appendChild(btn); document.body.appendChild(panel);
  var log = panel.querySelector(".hc-log"), form = panel.querySelector("form"), input = panel.querySelector("textarea");

  function add(text, who) {
    var p = document.createElement("p");
    p.className = "hc-m " + (who === "u" ? "hc-u" : "hc-h");
    p.textContent = text;            // text only: nothing the server sends is treated as HTML
    log.appendChild(p); log.scrollTop = log.scrollHeight;
    return p;
  }
  var opened = false;
  function toggle(open) {
    panel.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    btn.classList.toggle("hc-open", open);   // the floating button hides while the chat is open
    if (open && !opened) {
      opened = true;
      add("Hi, I'm HALI, Harmony's AI assistant. Ask me about our services, prices or the Brunswick County Index, or leave a message for Harmony.", "h");
    }
    if (open) input.focus(); else if (btn.offsetParent) btn.focus();
  }
  btn.addEventListener("click", function () { toggle(panel.hidden); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-hali-chat]");
    if (t) { e.preventDefault(); toggle(true); }
  });
  window.HaliChat = { open: function () { toggle(true); }, close: function () { toggle(false); } };
  panel.querySelector(".hc-x").addEventListener("click", function () { toggle(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
  var busy = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true; input.value = ""; add(text, "u");
    var wait = add("…", "h");
    fetch(ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: sid, site: SITE, message: text })
    }).then(function (r) { return r.json(); })
      .then(function (d) { wait.textContent = (d && d.reply) || FALLBACK; })
      .catch(function () { wait.textContent = FALLBACK; })
      .then(function () { busy = false; input.focus(); });
  });
})();
