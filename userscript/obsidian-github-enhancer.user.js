// ==UserScript==
// @name         Obsidian GitHub Enhancer
// @namespace    https://github.com/time1043
// @version      0.0.1
// @description  Enhance your GitHub experience for Obsidian notes
// @match        https://github.com/*/blob/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  function resolveAssetURL(fileName) {
    // /_lib/excalidraw/
    // /note/

    // location.pathname
    // /time1043/math-note/blob/course/kj3d/note/course/kj3d/xx/xx.md
    const idx = location.pathname.indexOf("/note/");
    if (idx === -1) {
      console.warn("Current page is not inside /note/");
      return null;
    }

    // /time1043/math-note/course/kj3d/_lib/excalidraw/frullani.svg
    const path =
      location.pathname.substring(0, idx).replace("/blob/", "/") +
      "/_lib/excalidraw/" +
      encodeURIComponent(fileName);

    // https://raw.githubusercontent.com/time1043/math-note/course/kj3d/_lib/excalidraw/frullani.svg  // pure data ✅
    // https://github.com/time1043/math-note/blob/course/kj3d/_lib/excalidraw/frullani.svg  // html 🙅
    https: return `https://raw.githubusercontent.com${path}`;
  }

  function render() {
    document.querySelectorAll("p").forEach((p) => {
      if (p.dataset.obsidianHandled) return;

      // ![[frullani.svg]]
      const text = p.textContent.trim();
      const match = text.match(
        /^!\[\[(.+?\.(svg|png|jpg|jpeg|gif|webp))(?:\|(\d+))?\]\]$/i,
      );
      if (!match) return;

      p.dataset.obsidianHandled = "true";

      const file = match[1];
      const width = Number(match[3] ?? 800);

      const url = resolveAssetURL(file);
      if (!url) return;

      // Create image
      const img = document.createElement("img");

      img.src = url;
      img.alt = file;
      img.loading = "lazy";

      img.style.display = "block";
      img.style.maxWidth = "100%";
      img.style.width = `${width}px`;
      img.style.height = "auto";
      img.style.margin = "16px auto";
      img.style.borderRadius = "6px";

      // Error handling
      img.onerror = () => {
        const err = document.createElement("div");

        err.style.border = "1px solid #d0d7de";
        err.style.borderRadius = "6px";
        err.style.padding = "12px";
        err.style.color = "#cf222e";
        err.style.background = "#fff8f8";

        err.innerHTML = `<b>Cannot load image</b><br><br>${url}`;
        img.replaceWith(err);
      };

      p.replaceWith(img);
    });
  }

  render();

  new MutationObserver(render).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
