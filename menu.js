/* Header menu button: shown below 1280px (and when the browser is zoomed in that far). No network calls. */
(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  function set(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", function () { set(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !btn.contains(e.target)) set(false);
  });
  var wide = window.matchMedia("(min-width: 1280px)");
  var onWide = function () { if (wide.matches) set(false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
})();
