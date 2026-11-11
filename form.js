/* Harmony AI request forms: sends the form to Web3Forms (which emails harmony@harmonyaiconsulting.com), then goes to the thank-you page.
   If JavaScript is off, the form still posts to Web3Forms normally. The access key is public by design: it can only email this inbox. */
(function () {
  var form = document.querySelector("form[data-w3f]");
  if (!form) return;
  var btn = form.querySelector("button[type=submit]");
  var err = form.querySelector(".fp-error");
  var label = btn.textContent;

  function fail() {
    err.hidden = false;
    err.focus();
    btn.disabled = false;
    btn.textContent = label;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Sending...";
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok && res.body.success !== false) { window.location.href = form.getAttribute("data-thanks"); }
        else { fail(); }
      })
      .catch(fail);
  });
})();
