/* CHECKMATE legacy operations board — empty-state reference script.
   The launcher (dashboard.html) loads app.js; this file is retained for
   reference only. It seeds no records, timers or random material and leaves
   every legacy table empty for the control plane to populate. */
(function () {
  "use strict";
  ["#matrixRows", "#streamRows", "#registryRows"].forEach(function (sel) {
    var body = document.querySelector(sel);
    if (body) body.innerHTML = "";
  });
  var auditResult = document.getElementById("auditResult");
  if (auditResult) {
    auditResult.innerHTML = '<p class="audit-empty">No audit records yet. Connect the control plane to index request ids.</p>';
  }
  var pubKeyBox = document.getElementById("pubKeyBox");
  if (pubKeyBox) pubKeyBox.textContent = "—";
})();
