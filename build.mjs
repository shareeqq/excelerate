/* Build a single, self-contained HTML file from index.html and src/.
   Run: node build.mjs
   Output: excelerate.html (open it directly in any browser). */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const pseudo = readFileSync(resolve(root, "src/pseudo.js"), "utf8");
const data = readFileSync(resolve(root, "src/data.js"), "utf8");
const app = readFileSync(resolve(root, "src/app.js"), "utf8");

const banner = `<!--
  Excelerate — structural prototype (Phases 0–5 · post-review revision)
  Built from index.html and src/ on ${new Date().toISOString().slice(0, 10)}.
  This file is self-contained. Open it directly in a browser.
-->`;

const out = html
  .replace(
    '<link rel="stylesheet" href="src/styles.css">',
    () => `<style>\n${css}\n</style>`
  )
  .replace(
    '<script src="src/pseudo.js"></script>',
    () => `<script>\n${pseudo}\n</script>`
  )
  .replace(
    '<script src="src/data.js"></script>',
    () => `<script>\n${data}\n</script>`
  )
  .replace(
    '<script src="src/app.js"></script>',
    () => `<script>\n${app}\n</script>`
  )
  .replace("<!doctype html>", () => `<!doctype html>\n${banner}`);

const leftovers = ["src/styles.css", "src/pseudo.js", "src/data.js", "src/app.js"]
  .filter((reference) => out.includes(reference));
if (leftovers.length) {
  throw new Error("Build failed: source references left behind: " + leftovers.join(", "));
}

writeFileSync(resolve(root, "excelerate.html"), out, "utf8");
console.log(`Built excelerate.html (${(out.length / 1024).toFixed(1)} KB)`);
