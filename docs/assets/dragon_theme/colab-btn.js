/* ════════════════════════════════════════════════════════════════
 * <ColabBtn> — vanilla port of dragon/ColabBtn.jsx
 *
 * Front card sits idle; CSS keyframes run a 600ms wiggle every ~7s.
 * On hover, this script populates the back card's mini-network and
 * runs a forward-pass wave (input → hidden → output) at 1.8s loop.
 * ════════════════════════════════════════════════════════════════ */
(function () {
  const NET_W = 230, NET_H = 76;
  const COLS = [
    { x: 26,  ys: [16, 32, 48, 64] },     // input
    { x: 115, ys: [10, 26, 42, 58, 70] }, // hidden
    { x: 204, ys: [22, 38, 54] },         // output
  ];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const PULSE_PERIOD_MS = 1800;
  const SIGMA = 0.22;

  function buildNetwork(svg) {
    if (svg.__ocBuilt) return svg.__ocBuilt;
    svg.setAttribute('viewBox', '0 0 ' + NET_W + ' ' + NET_H);

    const edges = [];
    for (let layer = 0; layer < COLS.length - 1; layer++) {
      const from = COLS[layer], to = COLS[layer + 1];
      from.ys.forEach((y1, fi) => {
        to.ys.forEach((y2, ti) => {
          const line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', from.x);
          line.setAttribute('y1', y1);
          line.setAttribute('x2', to.x);
          line.setAttribute('y2', y2);
          line.setAttribute('stroke', '#625E5A');
          line.setAttribute('stroke-width', '0.7');
          line.setAttribute('opacity', '0.12');
          svg.appendChild(line);
          edges.push({ el: line, from: layer, to: layer + 1 });
        });
      });
    }

    const nodes = [];
    COLS.forEach((col, ci) => {
      col.ys.forEach((y, yi) => {
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', col.x);
        c.setAttribute('cy', y);
        c.setAttribute('r', '2.4');
        c.setAttribute('fill', ci === 2 ? '#8EA4A2' : '#9AA09A');
        c.setAttribute('opacity', '0.5');
        svg.appendChild(c);
        nodes.push({ el: c, layer: ci, idx: yi, x: col.x, y: y });
      });
    });

    const halo = document.createElementNS(SVG_NS, 'circle');
    halo.setAttribute('r', '6');
    halo.setAttribute('fill', 'none');
    halo.setAttribute('stroke', '#B6927B');
    halo.setAttribute('stroke-width', '0.8');
    halo.setAttribute('opacity', '0');
    svg.appendChild(halo);

    const built = { edges, nodes, halo };
    svg.__ocBuilt = built;
    return built;
  }

  function layerActivation(layerIdx, pulse) {
    const center = pulse * 1.5 - 0.15; // sweep slightly past 1
    const myX = layerIdx / 2;          // 0, 0.5, 1
    const dist = Math.abs(myX - center);
    return Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
  }

  function renderFrame(built, pulse) {
    const acts = [
      layerActivation(0, pulse),
      layerActivation(1, pulse),
      layerActivation(2, pulse),
    ];

    built.edges.forEach(e => {
      const edgeAct = Math.min(acts[e.from], acts[e.to]);
      const opacity = 0.12 + edgeAct * 0.7;
      const hot = edgeAct > 0.4;
      e.el.setAttribute('stroke', hot ? '#B6927B' : '#625E5A');
      e.el.setAttribute('stroke-width', hot ? '1.1' : '0.7');
      e.el.setAttribute('opacity', String(opacity));
    });

    built.nodes.forEach(n => {
      const act = acts[n.layer];
      n.el.setAttribute('r', String(2.4 + act * 1.6));
      n.el.setAttribute('fill', act > 0.5 ? '#D6B89E' : (n.layer === 2 ? '#8EA4A2' : '#9AA09A'));
      n.el.setAttribute('opacity', String(0.5 + act * 0.5));
    });

    const outAct = acts[2];
    if (outAct < 0.3) {
      built.halo.setAttribute('opacity', '0');
    } else {
      const outYs = COLS[2].ys;
      const idx = Math.floor(pulse * 7) % outYs.length;
      built.halo.setAttribute('cx', String(COLS[2].x));
      built.halo.setAttribute('cy', String(outYs[idx]));
      built.halo.setAttribute('opacity', String(outAct * 0.6));
    }
  }

  function resetFrame(built) {
    built.edges.forEach(e => {
      e.el.setAttribute('stroke', '#625E5A');
      e.el.setAttribute('stroke-width', '0.7');
      e.el.setAttribute('opacity', '0.12');
    });
    built.nodes.forEach(n => {
      n.el.setAttribute('r', '2.4');
      n.el.setAttribute('fill', n.layer === 2 ? '#8EA4A2' : '#9AA09A');
      n.el.setAttribute('opacity', '0.5');
    });
    built.halo.setAttribute('opacity', '0');
  }

  function attach(btn) {
    if (btn.__ocColabBound) return;
    btn.__ocColabBound = true;
    const svg = btn.querySelector('.oc-colab-btn-net');
    if (!svg) return;
    const built = buildNetwork(svg);
    let raf = 0, start = 0;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function loop(now) {
      const elapsed = (now - start) % PULSE_PERIOD_MS;
      renderFrame(built, elapsed / PULSE_PERIOD_MS);
      raf = requestAnimationFrame(loop);
    }
    function startLoop() {
      if (raf) return;
      start = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function stopLoop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      resetFrame(built);
    }

    btn.addEventListener('mouseenter', startLoop);
    btn.addEventListener('mouseleave', stopLoop);
    btn.addEventListener('focus', startLoop);
    btn.addEventListener('blur', stopLoop);
  }

  function init() {
    document.querySelectorAll('.oc-colab-btn').forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
