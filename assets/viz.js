/**
 * Lightweight interactive visuals for systematisch-tellen lessons.
 * Markers:
 *   [data-viz="positions"] data-n data-symbol-hi data-symbol-lo data-k
 *   [data-viz="coins"] data-n data-k  (highlight sequences with k heads)
 *   [data-viz="slots"] data-choices="6,6,6" or "6,5,4"
 */
(function () {
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function combinations(n, k) {
    const out = [];
    function walk(start, chosen) {
      if (chosen.length === k) {
        out.push(chosen.slice());
        return;
      }
      for (let i = start; i < n; i++) {
        chosen.push(i);
        walk(i + 1, chosen);
        chosen.pop();
      }
    }
    walk(0, []);
    return out;
  }

  function mountPositions(root) {
    const n = Number(root.dataset.n || 5);
    const k = Number(root.dataset.k || 1);
    const hi = root.dataset.symbolHi || "7";
    const lo = root.dataset.symbolLo || "3";
    const combos = combinations(n, k);
    let idx = 0;

    const title = el("div", "viz-title", "Posities kiezen — klik ‘volgende’");
    const row = el("div", "pos-row");
    const caption = el("p", "pos-caption");
    const actions = el("div", "actions");
    const btn = el("button", "secondary", "Volgende plaatsing");
    btn.type = "button";
    actions.appendChild(btn);

    function render() {
      row.innerHTML = "";
      const chosen = new Set(combos[idx]);
      for (let i = 0; i < n; i++) {
        const box = el("div", "pos " + (chosen.has(i) ? "hi" : "lo"), chosen.has(i) ? hi : lo);
        row.appendChild(box);
      }
      caption.textContent =
        `Plaatsing ${idx + 1} van ${combos.length}: de ${hi} staat op positie(s) ` +
        [...chosen].map((i) => i + 1).join(" en ") +
        `.`;
    }

    btn.addEventListener("click", () => {
      idx = (idx + 1) % combos.length;
      render();
    });

    root.append(title, row, caption, actions);
    const pill = el("div", "count-pill", `${combos.length} verschillende rijen = C(${n},${k})`);
    root.appendChild(pill);
    render();
  }

  function mountCoins(root) {
    const n = Number(root.dataset.n || 3);
    const k = root.dataset.k === undefined ? null : Number(root.dataset.k);
    const total = 1 << n;
    const title = el(
      "div",
      "viz-title",
      k == null
        ? `Alle ${total} rijen bij ${n} worpen`
        : `Alle ${total} rijen — geel = precies ${k}× kop`
    );
    const grid = el("div", "seq-grid");

    for (let mask = 0; mask < total; mask++) {
      const bits = [];
      let heads = 0;
      for (let i = n - 1; i >= 0; i--) {
        const isHead = (mask >> i) & 1;
        bits.push(isHead);
        if (isHead) heads++;
      }
      const match = k == null || heads === k;
      const seq = el("div", "seq");
      const tag = el("span", "seq-tag", match && k != null ? "✓ telt mee" : `rij ${mask + 1}`);
      const coins = el("div", "coin-row");
      bits.forEach((isHead) => {
        coins.appendChild(el("div", "coin " + (isHead ? "k" : "m"), isHead ? "K" : "M"));
      });
      if (k != null && !match) seq.style.opacity = "0.35";
      seq.append(tag, coins);
      grid.appendChild(seq);
    }

    root.append(title, grid);
    if (k != null) {
      const count = combinations(n, k).length;
      root.appendChild(
        el("div", "count-pill", `${count} rijen met precies ${k}× kop = C(${n},${k})`)
      );
    } else {
      root.appendChild(el("div", "count-pill", `${total} rijen = 2ⁿ = 2^${n}`));
    }
  }

  function mountSlots(root) {
    const parts = String(root.dataset.choices || "6,6,6")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const title = el("div", "viz-title", root.dataset.title || "Keuzes per stap");
    const slots = el("div", "slots");
    parts.forEach((p, i) => {
      if (i > 0) slots.appendChild(el("div", "slot-times", "×"));
      const slot = el("div", "slot");
      slot.appendChild(el("div", "slot-box", p));
      slot.appendChild(el("div", "slot-label", `stap ${i + 1}`));
      slots.appendChild(slot);
    });
    const product = parts.reduce((a, b) => a * Number(b), 1);
    root.append(title, slots);
    root.appendChild(el("div", "count-pill", `Totaal: ${parts.join(" × ")} = ${product}`));
    if (root.dataset.caption) {
      root.appendChild(el("p", "viz-caption", root.dataset.caption));
    }
  }

  function init() {
    document.querySelectorAll('[data-viz="positions"]').forEach(mountPositions);
    document.querySelectorAll('[data-viz="coins"]').forEach(mountCoins);
    document.querySelectorAll('[data-viz="slots"]').forEach(mountSlots);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
