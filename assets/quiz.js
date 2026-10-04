/**
 * Reusable multiple-choice quiz widget.
 * Markup: .q[data-type=mc][data-answer][data-explain] with label.opt > input[type=radio]
 * HUD: #answered #total #score #bar .final
 * Optional verdicts on .final: data-v100 data-v70 data-v40 data-v0
 */
(function () {
  function updateHud() {
    const qs = [...document.querySelectorAll(".q[data-type=mc]")];
    const answered = qs.filter((q) => q.dataset.done === "1").length;
    const score = qs.filter((q) => q.dataset.correct === "1").length;
    const total = qs.length;
    const answeredEl = document.getElementById("answered");
    const totalEl = document.getElementById("total");
    const scoreEl = document.getElementById("score");
    const bar = document.getElementById("bar");
    if (answeredEl) answeredEl.textContent = String(answered);
    if (totalEl) totalEl.textContent = String(total);
    if (scoreEl) scoreEl.textContent = String(score);
    if (bar) bar.style.width = total ? `${(answered / total) * 100}%` : "0%";

    const final = document.querySelector(".final");
    if (final && answered === total && total > 0) {
      final.classList.add("show");
      const msg = final.querySelector("[data-final-msg]");
      if (msg) {
        const pct = Math.round((score / total) * 100);
        const v100 = final.dataset.v100 || "Perfect. Telmodel zit vast.";
        const v70 = final.dataset.v70 || "Sterk. Nog één keer de fouten hardop uitleggen.";
        const v40 = final.dataset.v40 || "Goede basis — herhaal de rode uitlegzin.";
        const v0 = final.dataset.v0 || "Opnieuw: eerst model, dan pas rekenen.";
        let verdict = v0;
        if (pct === 100) verdict = v100;
        else if (pct >= 70) verdict = v70;
        else if (pct >= 40) verdict = v40;
        msg.textContent = `${score}/${total} goed (${pct}%). ${verdict}`;
      }
    }
  }

  function checkMc(q) {
    const selected = q.querySelector('input[type="radio"]:checked');
    const feedback = q.querySelector(".feedback");
    if (!selected || !feedback) return;

    const ok = selected.value === q.dataset.answer;
    q.dataset.done = "1";
    q.dataset.correct = ok ? "1" : "0";
    feedback.classList.add("show");
    feedback.classList.toggle("ok", ok);
    feedback.classList.toggle("bad", !ok);
    feedback.innerHTML = ok
      ? `<strong>Juist.</strong><div class="why">${q.dataset.explain || ""}</div>`
      : `<strong>Niet juist.</strong><div class="why">${q.dataset.explain || ""}</div>`;

    q.querySelectorAll("input").forEach((inp) => {
      inp.disabled = true;
    });
    const btn = q.querySelector("[data-check-mc]");
    if (btn) btn.disabled = true;
    updateHud();
  }

  document.addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    const q = input.closest(".q");
    if (!q) return;
    q.querySelectorAll("label.opt").forEach((lab) => lab.classList.remove("selected"));
    const lab = input.closest("label.opt");
    if (lab) lab.classList.add("selected");
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-check-mc]");
    if (!btn) return;
    const q = btn.closest(".q");
    if (q) checkMc(q);
  });

  document.addEventListener("DOMContentLoaded", updateHud);
})();
