/* ============================================================
   Excelerate — screenshot helper
   Run: node scripts/screenshot.mjs
   Captures the mobile preview of a few key routes into docs/preview/.
   Needs Chrome or Edge and normal (unsandboxed) process access.
   ============================================================ */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "excelerate.html");
const outDir = join(root, "docs", "preview");
const chromePath = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean).find((path) => existsSync(path));

if (!chromePath) {
  console.error("No Chrome or Edge found.");
  process.exit(2);
}

const PORT = 9412;
const pageUrl = "file:///" + target.replace(/\\/g, "/");
const profile = mkdtempSync(join(tmpdir(), "excelerate-shot-"));
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const chrome = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=" + PORT,
  "--user-data-dir=" + profile,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--disable-breakpad",
  "--disable-crash-reporter",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "about:blank"
], { stdio: "ignore" });

async function targetUrl() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch (error) {
      /* still starting */
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a page target");
}

async function main() {
  const socket = new WebSocket(await targetUrl());
  await new Promise((done, reject) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message));
      else entry.resolve(message.result);
    }
  });
  const send = (method, params = {}) => new Promise((done, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve: done, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error("evaluation failed");
    return result.result.value;
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 1000, deviceScaleFactor: 2, mobile: false });
  await send("Page.navigate", { url: pageUrl + "#/" });
  await sleep(1200);
  await evaluate(`(() => {
    const toggle = document.getElementById('mobileViewToggle');
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(400);

  mkdirSync(outDir, { recursive: true });

  const shots = [
    ["/", "home-mobile.png", "", ""],
    ["/question/phy-kin-1", "question-hub-solve.png", `(() => {
      const input = document.querySelector('[data-answer-input]');
      input.value = 'v = u + at gives v = 17.7 m s-1 for the first part.';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-scan-check]').click();
    })()`, "document.querySelector('.scan-result').scrollIntoView({ block: 'center' })"],
    ["/question/phy-kin-1/solutions", "question-hub-solutions.png", "", "document.querySelector('.question-tabs').scrollIntoView({ block: 'start' })"],
    ["/question/cs-prog-1/solutions/post-1", "solution-comments.png", "", "document.querySelector('.comment-thread').scrollIntoView({ block: 'center' })"],
    ["/code/cs-prog-1", "code-workspace.png", "document.querySelector('[data-run-code]').click()", "document.querySelector('.code-window').scrollIntoView({ block: 'start' })"],
    ["/code/cs-prog-1", "code-review.png", "(() => { document.querySelector('[data-reset-code]').click(); setTimeout(() => document.querySelector('[data-review-code]').click(), 150); })()", "document.querySelector('.review-card').scrollIntoView({ block: 'start' })"],
    ["/community", "community-filters.png", "", ""],
    ["/question/phy-dyn-3", "inclined-plane.png", "", "document.querySelector('.figure-box').scrollIntoView({ block: 'center' })"],
    ["/diagram/phy-dyn-3", "diagram-workspace.png", "", "document.querySelector('[data-figure-stage]').scrollIntoView({ block: 'start' })"],
    ["/question/phy-dyn-1", "velocity-time.png", "", "document.querySelector('.figure-box').scrollIntoView({ block: 'center' })"],
    ["/question/phy-kin-1/walkthrough", "walkthrough.png", `(() => {
      const scrub = document.querySelector('[data-player-scrub]');
      scrub.value = '2';
      scrub.dispatchEvent(new Event('input', { bubbles: true }));
    })()`, "document.querySelector('.walkthrough-stage').scrollIntoView({ block: 'center' })"],
    ["/assistant", "study-coach.png", "", ""]
  ];

  for (const [route, file, prepare, focus] of shots) {
    await evaluate(`location.hash = ${JSON.stringify(route)}`);
    await sleep(450);
    if (prepare) {
      await evaluate(prepare);
      await sleep(1900);
    }
    if (focus) {
      await evaluate(focus);
      await sleep(300);
    }
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(join(outDir, file), Buffer.from(shot.data, "base64"));
    console.log("wrote docs/preview/" + file);
  }

  socket.close();
}

main()
  .catch((error) => {
    console.error("SCREENSHOT ERROR " + error.message);
    process.exitCode = 1;
  })
  .finally(() => chrome.kill());
