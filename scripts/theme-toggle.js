document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return; // header not on this page

  const apply = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
    btn.setAttribute("aria-pressed", String(t === "dark"));
  };

  // start with saved theme or light
  apply(localStorage.getItem("theme") || "light");

  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
  });
});

