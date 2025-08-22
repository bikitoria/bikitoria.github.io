document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("expChart");
  if (!el || !window.Chart) return;

  // 1) Load data from /public/data/experiences.json
  let items = [];
  try {
    const res = await fetch("/data/experiences.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`); // ✅ fix: use backticks
    items = await res.json();
  } catch (err) {
    console.error("[expChart] load failed:", err);
    return;
  }

  // 2) Normalize + sort by date
  items = (items || [])
    .map(d => ({ ...d, date: new Date(d.date) }))
    .filter(d => !Number.isNaN(d.date))
    .sort((a, b) => a.date - b.date);
  if (!items.length) return;

  // 3) Labels + cumulative values
  const labels = items.map(i => i.date.toLocaleDateString(undefined, { year: "numeric", month: "short" }));
  const values = items.map((_, i) => i + 1);

  // 4) Theme colors from CSS variables
  const css = getComputedStyle(document.documentElement);
  const text = css.getPropertyValue("--text").trim() || "#222";
  const grid = css.getPropertyValue("--muted").trim() || "#ddd";
  const line = css.getPropertyValue("--link").trim() || text;

  // 5) Chart (simple LINE, no fill)
  const chart = new Chart(el.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: line,
        borderWidth: 2,
        tension: 0,             // straight segments like your example
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: line,
        pointBorderColor: line,
        showLine: true,
        fill: false             // ✅ no area fill
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${values[ctx.dataIndex]} · ${items[ctx.dataIndex].title}` // ✅ fix backticks
          }
        }
      },
      scales: {
        x: { grid: { color: grid }, ticks: { color: text } },
        y: { grid: { color: grid }, ticks: { color: text, precision: 0, stepSize: 1, beginAtZero: true } }
      }
    }
  });

  // 6) Re‑apply colors on theme toggle
  const recolor = () => {
    const c = getComputedStyle(document.documentElement);
    const t = c.getPropertyValue("--text").trim() || text;
    const g = c.getPropertyValue("--muted").trim() || grid;
    const ln = c.getPropertyValue("--link").trim() || t;
    chart.options.scales.x.ticks.color = t;
    chart.options.scales.y.ticks.color = t;
    chart.options.scales.x.grid.color = g;
    chart.options.scales.y.grid.color = g;
    const ds = chart.data.datasets[0];
    ds.borderColor = ln; ds.pointBackgroundColor = ln; ds.pointBorderColor = ln;
    chart.update();
  };
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
});