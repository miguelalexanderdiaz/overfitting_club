// Fix: Quarto's "Show/Hide All Code" handler uses ".cell > details > .sourceCode",
// but the runtime wraps .sourceCode inside .code-copy-outer-scaffold, so the selector
// matches nothing and the buttons appear inert. Re-bind with a wrapper-tolerant query.
(function () {
  function toggleAll(show) {
    return function (e) {
      document.querySelectorAll(".cell details.code-fold").forEach(function (d) {
        if (show) d.setAttribute("open", "");
        else d.removeAttribute("open");
      });
      document.querySelectorAll(".cell > .sourceCode, .cell > .code-copy-outer-scaffold").forEach(function (el) {
        var from = show ? "hidden" : "unhidden";
        var to = show ? "unhidden" : "hidden";
        if (el.classList.contains(from)) {
          el.classList.remove(from);
          el.classList.add(to);
        }
      });
      if (e && e.preventDefault) e.preventDefault();
      return false;
    };
  }
  document.addEventListener("DOMContentLoaded", function () {
    var show = document.getElementById("quarto-show-all-code");
    var hide = document.getElementById("quarto-hide-all-code");
    if (show) show.addEventListener("click", toggleAll(true));
    if (hide) hide.addEventListener("click", toggleAll(false));
  });
})();
