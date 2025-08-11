document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".typing-wrap").forEach((root) => {
    const el = root.querySelector(".typing-text");
    if (!el) return;

    const provided = (root.dataset.text || "").trim();
    const fallback = (el.textContent || "").trim();
    const text = provided || fallback;
    if (!text) return;

    const loops      = parseInt(root.dataset.loops || "2", 10);
    const typeMs     = parseInt(root.dataset.type  || "70", 10);
    const eraseMs    = parseInt(root.dataset.erase || "50", 10);
    const pauseMs    = parseInt(root.dataset.pause || "600", 10);
    const keepChars  = Math.max(0, parseInt(root.dataset.keep || "0", 10));
    const keepWords  = Math.max(0, parseInt(root.dataset.keepwords || "0", 10));
    const keepPrefix = Math.max(0, parseInt(root.dataset.keepprefix || "0", 10));

    // Figure out where to stop erasing
    function computeKeepIndex(str) {
      // If user gave explicit char count, use it
      if (keepChars > 0) return Math.min(keepChars, str.length);

      if (keepWords > 0) {
        const parts = str.split(/\s+/);
        const firstN = parts.slice(0, keepWords).join(" ");
        let idx = firstN.length;

        // if there are more words, we may keep a prefix of the next word
        const hasNext = parts.length > keepWords;
        if (hasNext) {
          // add one space between words if there was any kept text
          if (idx > 0) idx += 1; // account for the space after the Nth word
          const nextWord = parts[keepWords] || "";
          idx += Math.min(keepPrefix, nextWord.length);
        }
        return Math.min(idx, str.length);
      }
      return 0;
    }

    const stopIndex = computeKeepIndex(text);

    function typeTo(target, cb){
      let i = el.textContent.length;
      const tick = () => {
        if (i < target) {
          i++;
          el.textContent = text.slice(0, i);
          setTimeout(tick, typeMs);
        } else {
          setTimeout(cb, pauseMs);
        }
      };
      tick();
    }

    function eraseTo(target, cb){
      let i = el.textContent.length;
      const tick = () => {
        if (i > target) {
          i--;
          el.textContent = text.slice(0, i);
          setTimeout(tick, eraseMs);
        } else {
          setTimeout(cb, pauseMs);
        }
      };
      tick();
    }

    const runOnce = () => new Promise(res =>
      typeTo(text.length, () =>
        eraseTo(stopIndex, () =>
          typeTo(text.length, res)
        )
      )
    );

    (async () => {
      el.textContent = "";
      for (let k = 0; k < Math.max(1, loops); k++) {
        await runOnce();
      }
      // ends fully typed; caret keeps blinking
    })();
  });
});
