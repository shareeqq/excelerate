/* ============================================================
   Excelerate — browser audit
   Run: node scripts/browser-audit.mjs [suite]
   Drives headless Chrome over the DevTools protocol using only
   Node built-ins. Prints PASS / FAIL per check and exits non-zero
   on failure. This is a developer tool, not part of the build.
   ============================================================ */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "excelerate.html");
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chromePath) {
  console.error("No Chrome or Edge found. Set CHROME_PATH.");
  process.exit(2);
}
if (!existsSync(target)) {
  console.error("excelerate.html is missing. Run node build.mjs first.");
  process.exit(2);
}

const PORT = 9411;
const pageUrl = "file:///" + target.replace(/\\/g, "/");
const profile = mkdtempSync(join(tmpdir(), "excelerate-cdp-"));
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
  "--allow-file-access-from-files",
  "--window-size=1000,700",
  "about:blank"
], { stdio: "ignore" });

let ws = null;

async function devtoolsTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((item) => item.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch (error) {
      /* Chrome is still starting. */
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a DevTools page target");
}

class Client {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.events = [];
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve: done, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else done(message.result);
        return;
      }
      this.events.push(message);
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((done, reject) => {
      this.pending.set(id, { resolve: done, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception
        ? result.exceptionDetails.exception.description
        : "evaluation failed");
    }
    return result.result.value;
  }

  resetEvents() {
    this.events = [];
  }

  problems() {
    const found = [];
    for (const event of this.events) {
      if (event.method === "Runtime.exceptionThrown") {
        const detail = event.params.exceptionDetails;
        found.push("exception: " + (detail.exception ? detail.exception.description : detail.text));
      }
      if (event.method === "Runtime.consoleAPICalled" && event.params.type === "error") {
        found.push("console.error: " + event.params.args.map((arg) => arg.value || arg.description).join(" "));
      }
      if (event.method === "Log.entryAdded" && event.params.entry.level === "error") {
        const text = event.params.entry.text;
        // file:// pages log a harmless favicon and local-storage notice.
        if (!/favicon|storage|font/i.test(text)) found.push("log: " + text);
      }
    }
    return found;
  }
}

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

async function main() {
  const socketUrl = await devtoolsTarget();
  const socket = new WebSocket(socketUrl);
  await new Promise((done, reject) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const client = new Client(socket);
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  await client.send("Log.enable");

  await client.send("Page.navigate", { url: pageUrl + "#/" });
  await sleep(900);

  const api = {
    client,
    async goto(route) {
      await client.evaluate(`location.hash = ${JSON.stringify(route)}`);
      await sleep(220);
    },
    async html() {
      return client.evaluate("document.getElementById('screen').innerHTML");
    },
    async text() {
      return client.evaluate("document.getElementById('screen').innerText");
    },
    async setViewport(width, height, mobileView) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile: false
      });
      await client.evaluate(`(() => {
        const toggle = document.getElementById('mobileViewToggle');
        if (toggle && toggle.checked !== ${Boolean(mobileView)}) {
          toggle.checked = ${Boolean(mobileView)};
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`);
      await sleep(300);
    },
    async role(name) {
      await client.evaluate(`document.querySelector('[data-role="${name}"]').click()`);
      await sleep(250);
    }
  };

  await run(api);
  socket.close();
}

async function run(api) {
  const args = process.argv.slice(2);
  for (const { name, fn } of checks) {
    if (args.length && !args.some((filter) => name.toLowerCase().includes(filter.toLowerCase()))) continue;
    try {
      await fn(api);
      console.log("PASS " + name);
    } catch (error) {
      console.log("FAIL " + name + ": " + error.message);
      process.exitCode = 1;
    }
  }
  const problems = api.client.problems();
  if (problems.length) {
    console.log("FAIL runtime console: " + problems.slice(0, 6).join(" | "));
    process.exitCode = 1;
  } else {
    console.log("PASS runtime console is clean");
  }
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

/* ---------- Checks ---------- */

check("home renders without a subject switcher", async (api) => {
  await api.goto("/");
  const html = await api.html();
  assert(html.includes("Browse by subject"), "home copy missing");
  assert(!html.includes("subject-switch"), "subject switcher markup present");
  const switcher = await api.client.evaluate("document.querySelectorAll('[data-subject]').length");
  assert(switcher === 0, "subject buttons still in the top bar");
});

check("filtered topics route shows one subject", async (api) => {
  await api.goto("/topics/physics");
  const text = await api.text();
  assert(text.includes("Kinematics"), "no physics topics");
  assert(!text.includes("Programming"), "computer science topics leaked in");
  const selected = await api.client.evaluate("document.querySelector('[data-topic-subject]').value");
  assert(selected === "physics", "filter not selected, got " + selected);
});

check("all topics route lists both subjects", async (api) => {
  await api.goto("/topics");
  const text = await api.text();
  assert(text.includes("Kinematics") && text.includes("Programming"), "mixed topic list missing");
  const rows = await api.client.evaluate("document.querySelectorAll('[data-topic-row]').length");
  assert(rows === 13, "expected 13 topic rows, got " + rows);
});

check("topics search and filter combine", async (api) => {
  await api.goto("/topics");
  await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-topic-search]');
    input.value = 'kinema';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(120);
  const count = await api.client.evaluate("document.querySelector('[data-topic-count]').textContent");
  assert(count === "1 topic", "search count wrong: " + count);
});

check("sign up and profile have no subject choice", async (api) => {
  await api.goto("/login");
  let html = await api.html();
  assert(!html.includes("signup-subject"), "sign-up still asks for a subject");
  await api.goto("/profile");
  html = await api.html();
  assert(!html.includes("profile-subject"), "profile still asks for a subject");
});

check("question hub shows four tabs", async (api) => {
  await api.goto("/question/phy-kin-1");
  const tabs = await api.client.evaluate(
    "Array.from(document.querySelectorAll('.question-tabs .tab')).map((tab) => tab.textContent.trim())"
  );
  assert(tabs.join(",") === "Solve,Solutions,Discussion,Stats", "tabs were " + tabs.join(","));
  const active = await api.client.evaluate(
    "document.querySelector('.question-tabs .tab[aria-current=\"page\"]').textContent.trim()"
  );
  assert(active === "Solve", "active tab was " + active);
});

check("question sub-routes open directly", async (api) => {
  for (const [route, expected] of [
    ["/question/phy-kin-1/stats", "Stats"],
    ["/question/phy-kin-1/solutions", "Solutions"],
    ["/question/phy-kin-1/discussion", "Discussion"]
  ]) {
    await api.goto(route);
    const active = await api.client.evaluate(
      "document.querySelector('.question-tabs .tab[aria-current=\"page\"]').textContent.trim()"
    );
    assert(active === expected, route + " showed " + active);
    const header = await api.client.evaluate("Boolean(document.querySelector('[data-inspect=\"question.stem\"]'))");
    assert(header, route + " lost the question header");
  }
});

check("solve tab draft survives a tab switch", async (api) => {
  await api.goto("/question/phy-kin-1");
  await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-answer-input]');
    input.value = 'v = u + at so v = 17.7 m s-1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const data = new DataTransfer();
    data.items.add(new File(['fake'], 'working.png', { type: 'image/png' }));
    const file = document.querySelector('[data-answer-file]');
    file.files = data.files;
    file.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(300);
  await api.client.evaluate("document.querySelector('[data-scan-check]').click()");
  await sleep(200);
  const checking = await api.client.evaluate("Boolean(document.querySelector('.scan-result--busy'))");
  assert(checking, "no checking state after Scan and check");
  await sleep(1800);
  const before = await api.client.evaluate(`(() => ({
    answer: document.querySelector('[data-answer-input]').value,
    file: document.querySelector('[data-answer-file-name]').textContent,
    preview: Boolean(document.querySelector('[data-answer-preview] img')),
    scan: Boolean(document.querySelector('.scan-result:not(.scan-result--busy)')),
    feedback: Boolean(document.querySelector('[data-inspect="question.scanFeedback"]'))
  }))()`);
  assert(before.answer.includes("17.7"), "answer not kept");
  assert(before.file.includes("working.png"), "file name not kept, got " + before.file);
  assert(before.preview, "image preview not shown");
  assert(before.scan, "scan result not shown");
  assert(before.feedback, "scan feedback not shown");

  await api.goto("/question/phy-kin-1/solutions");
  await api.goto("/question/phy-kin-1");
  const after = await api.client.evaluate(`(() => ({
    answer: document.querySelector('[data-answer-input]').value,
    file: document.querySelector('[data-answer-file-name]').textContent,
    preview: Boolean(document.querySelector('[data-answer-preview] img')),
    scan: Boolean(document.querySelector('.scan-result:not(.scan-result--busy)'))
  }))()`);
  assert(after.answer.includes("17.7"), "answer lost after tab switch");
  assert(after.file.includes("working.png"), "file name lost after tab switch");
  assert(after.preview, "preview lost after tab switch");
  assert(after.scan, "scan result lost after tab switch");
});

check("scan with no input shows a friendly message", async (api) => {
  await api.goto("/question/phy-dyn-2");
  await api.client.evaluate("document.querySelector('[data-scan-check]').click()");
  await sleep(200);
  const notice = await api.client.evaluate(`(() => {
    const el = document.querySelector('[data-scan-notice]');
    return { hidden: el.hidden, text: el.textContent, scan: Boolean(document.querySelector('.scan-result')) };
  })()`);
  assert(!notice.hidden, "message not shown");
  assert(notice.text.includes("Add a photo or write some working first."), "unexpected message: " + notice.text);
  assert(!notice.scan, "a scan result was rendered without input");
});

check("question help replies work", async (api) => {
  await api.goto("/question/phy-kin-1");
  for (const mode of ["hint", "walk", "check"]) {
    await api.client.evaluate(`document.querySelector('[data-question-help-mode="${mode}"]').click()`);
    await sleep(150);
  }
  const replies = await api.client.evaluate(
    "Array.from(document.querySelectorAll('.help-reply')).map((el) => el.textContent)"
  );
  assert(replies.length === 3, "expected three replies, got " + replies.length);
  assert(replies[1].includes("Final line"), "walk me through did not use worked steps");
  const ask = await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-question-help-input]');
    input.value = 'Why is the height a distance?';
    document.querySelector('[data-question-help-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(200);
  const count = await api.client.evaluate("document.querySelectorAll('.help-reply').length");
  assert(count === 5, "free-text help did not add a question and reply, got " + count);
});

check("submitting an answer opens its result", async (api) => {
  await api.goto("/question/phy-kin-1");
  await api.client.evaluate(`document.querySelector('[data-answer-form] button[type="submit"]').click()`);
  await sleep(250);
  const hash = await api.client.evaluate("location.hash");
  assert(hash === "#/result/phy-kin-1", "went to " + hash);
});

check("teacher share lists every question with a subject filter", async (api) => {
  await api.role("teacher");
  await api.goto("/share");
  await api.client.evaluate("document.querySelector('[data-share-type][value=questions]').click()");
  await sleep(150);
  const total = await api.client.evaluate("document.querySelectorAll('[data-share-question-row]').length");
  assert(total === 26, "expected 26 question choices, got " + total);
  await api.client.evaluate(`(() => {
    const select = document.querySelector('[data-share-subject]');
    select.value = 'physics';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(150);
  const visible = await api.client.evaluate(
    "Array.from(document.querySelectorAll('[data-share-question-row]')).filter((row) => !row.hidden).length"
  );
  assert(visible > 0 && visible < total, "subject filter did not narrow the list: " + visible);
  await api.role("student");
});

check("solutions are sorted by likes with a top badge", async (api) => {
  await api.goto("/question/phy-kin-1/solutions");
  const likes = await api.client.evaluate(
    "Array.from(document.querySelectorAll('[data-solution-like-count]')).map((el) => Number(el.textContent))"
  );
  assert(likes.length === 2, "expected two solutions, got " + likes.length);
  assert(likes[0] >= likes[1], "solutions not sorted: " + likes.join(","));
  const top = await api.client.evaluate("document.querySelectorAll('.top-solution').length");
  assert(top === 1, "expected one top-solution badge");
});

check("liking twice returns the original count", async (api) => {
  await api.goto("/question/phy-kin-1/solutions");
  const before = await api.client.evaluate("Number(document.querySelector('[data-solution-like-count]').textContent)");
  await api.client.evaluate("document.querySelector('[data-solution-like]').click()");
  const liked = await api.client.evaluate("(() => ({ count: Number(document.querySelector('[data-solution-like-count]').textContent), pressed: document.querySelector('[data-solution-like]').getAttribute('aria-pressed') }))()");
  await api.client.evaluate("document.querySelector('[data-solution-like]').click()");
  const after = await api.client.evaluate("Number(document.querySelector('[data-solution-like-count]').textContent)");
  assert(liked.count === before + 1, "like did not add one: " + liked.count);
  assert(liked.pressed === "true", "like did not set aria-pressed");
  assert(after === before, "second click did not remove the like: " + after);
});

check("solution detail has its own comment thread", async (api) => {
  await api.goto("/question/phy-kin-1/solutions/post-2");
  const before = await api.client.evaluate("document.querySelectorAll('.comment').length");
  assert(before === 2, "expected two seeded comments, got " + before);
  await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-solution-comment-input]');
    input.value = 'The graph tip is useful, thanks.';
    document.querySelector('[data-solution-comment-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(220);
  const state = await api.client.evaluate(`(() => ({
    comments: document.querySelectorAll('.comment').length,
    text: document.body.innerText.includes('The graph tip is useful')
  }))()`);
  assert(state.comments === 3, "comment was not added, got " + state.comments);
  assert(state.text, "comment text not shown");
});

check("empty comment is rejected with a message", async (api) => {
  await api.goto("/question/cs-prog-1/solutions/post-1");
  await api.client.evaluate(`document.querySelector('[data-solution-comment-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))`);
  await sleep(150);
  const error = await api.client.evaluate("(() => { const el = document.querySelector('[data-solution-comment-error]'); return { hidden: el.hidden, text: el.textContent }; })()");
  assert(!error.hidden, "no error shown for an empty comment");
  assert(error.text.includes("Write a comment first."), "unexpected error text");
});

check("share a solution pre-fills and redirects to the question", async (api) => {
  await api.goto("/question/phy-kin-1/solutions");
  const countBefore = await api.client.evaluate("document.querySelectorAll('.solution-card').length");
  await api.client.evaluate("document.querySelector('[data-share-solution]').click()");
  await sleep(250);
  const selected = await api.client.evaluate("document.querySelector('[data-solution-question]').value");
  assert(selected === "phy-kin-1", "composer not pre-filled, got " + selected);
  await api.client.evaluate(`(() => {
    const text = document.querySelector('[data-solution-text]');
    text.value = 'Write the two equations first, then substitute both values.';
    document.querySelector('[data-solution-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(300);
  const hash = await api.client.evaluate("location.hash");
  assert(hash === "#/question/phy-kin-1/solutions", "went to " + hash);
  const countAfter = await api.client.evaluate("document.querySelectorAll('.solution-card').length");
  assert(countAfter === countBefore + 1, "new solution not listed");
});

check("community links students into the hub", async (api) => {
  await api.role("student");
  await api.goto("/community");
  const links = await api.client.evaluate(
    "Array.from(document.querySelectorAll('[data-post-id] a')).map((a) => a.getAttribute('href')).filter((href) => href && href.indexOf('/solutions/') !== -1)"
  );
  assert(links.length > 0, "students got no solution links");
  const modalButtons = await api.client.evaluate(
    "document.querySelectorAll('[data-read-solution], [data-comments]').length"
  );
  assert(modalButtons === 0, "student feed still uses the modal buttons");
});

check("staff community keeps the read-only modal", async (api) => {
  await api.role("teacher");
  await api.goto("/community");
  const staffMarkers = await api.client.evaluate(
    "document.querySelectorAll('[data-read-solution]').length > 0 && document.querySelectorAll('.feed-card__actions .muted').length > 0"
  );
  assert(staffMarkers, "staff feed is missing static like counts or modal buttons");
  await api.client.evaluate("document.querySelector('[data-read-solution]').click()");
  await sleep(200);
  const modal = await api.client.evaluate("(() => ({ open: !document.getElementById('infoModal').hidden, hash: location.hash }))()");
  assert(modal.open, "read-only modal did not open");
  assert(modal.hash === "#/community", "staff were redirected to " + modal.hash);
  await api.client.evaluate("document.querySelector('#infoModal [data-close-modal]').click()");
  await sleep(150);
  await api.role("student");
});

check("question discussion seeds and accepts a comment", async (api) => {
  await api.goto("/question/phy-kin-1/discussion");
  const before = await api.client.evaluate("document.querySelectorAll('[data-inspect=\"question.discussion\"] .comment').length");
  assert(before === 3, "expected two comments plus one reply, got " + before);
  await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-discussion-input]');
    input.value = 'Is the unit mark separate from the height value?';
    document.querySelector('[data-discussion-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(220);
  const after = await api.client.evaluate("document.querySelectorAll('[data-inspect=\"question.discussion\"] .comment').length");
  assert(after === 4, "discussion comment not added, got " + after);
});

check("a question with no discussion shows the empty state", async (api) => {
  await api.goto("/question/phy-dyn-2/discussion");
  const empty = await api.client.evaluate("Boolean(document.querySelector('[data-inspect=\"question.discussionEmpty\"]'))");
  assert(empty, "no discussion empty state");
});

check("stats show appearances, years and papers", async (api) => {
  await api.goto("/question/phy-kin-1/stats");
  const text = await api.text();
  assert(text.includes("4 past paper appearances"), "appearance count missing");
  for (const year of ["2023", "2021", "2019", "2018"]) {
    assert(text.includes(year), "year " + year + " missing");
  }
  assert(text.includes("Paper"), "paper list missing");
  await api.goto("/question/phy-kin-2/stats");
  const practiceText = await api.text();
  assert(practiceText.includes("No past appearances yet"), "practice question should have no appearances");
});

check("coach tab, title and roadmap reply", async (api) => {
  await api.goto("/");
  const tabLabels = await api.client.evaluate(
    "Array.from(document.querySelectorAll('.tabbar__item')).map((a) => a.textContent.trim()).join(',')"
  );
  assert(tabLabels.includes("Coach"), "tab bar does not say Coach: " + tabLabels);
  await api.goto("/assistant");
  const title = await api.client.evaluate("document.querySelector('.page-title').textContent.trim()");
  assert(title === "Study coach", "screen title was " + title);
  const empty = await api.client.evaluate("Boolean(document.querySelector('.chat-empty'))");
  const seeded = await api.client.evaluate("document.querySelectorAll('.chat-message').length");
  assert(empty, "coach should open with an empty conversation");
  assert(seeded === 0, "coach still shows seeded messages: " + seeded);
  const options = await api.client.evaluate("document.querySelectorAll('[data-chat-context] option').length");
  assert(options === 27, "attach-question list should hold all 26 questions plus the empty option, got " + options);
  await api.client.evaluate(`document.querySelector('[data-prompt="Build me a revision roadmap"]').click()`);
  await sleep(250);
  const reply = await api.client.evaluate(`(() => {
    const messages = Array.from(document.querySelectorAll('.chat-message--assistant .chat-message__body'));
    return messages[messages.length - 1].textContent;
  })()`);
  assert(reply.includes("two-week plan"), "roadmap reply missing: " + reply.slice(0, 80));
  assert(reply.includes("Computer architecture"), "roadmap did not use weak topics: " + reply.slice(0, 140));
});

check("coach attachment name travels with the message", async (api) => {
  await api.goto("/assistant");
  await api.client.evaluate(`(() => {
    const data = new DataTransfer();
    data.items.add(new File(['fake'], 'notes.pdf', { type: 'application/pdf' }));
    const input = document.querySelector('[data-coach-file]');
    input.files = data.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(150);
  const label = await api.client.evaluate("(() => { const el = document.querySelector('[data-coach-file-name]'); return { hidden: el.hidden, text: el.textContent }; })()");
  assert(!label.hidden && label.text.indexOf("notes.pdf") !== -1, "file name not shown");
  await api.client.evaluate(`(() => {
    const input = document.querySelector('[data-chat-input]');
    input.value = 'Does this help my plan?';
    document.querySelector('[data-chat-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(250);
  const sent = await api.client.evaluate("document.body.innerText.indexOf('Attached: notes.pdf') !== -1");
  assert(sent, "attachment not shown in the sent message");
});

check("mobile frame is about 430 by 600 at 1000x700", async (api) => {
  await api.setViewport(1000, 700, true);
  const box = await api.client.evaluate(`(() => {
    const scaler = document.querySelector('.device-scaler').getBoundingClientRect();
    const tabbar = document.querySelector('.tabbar').getBoundingClientRect();
    const device = document.querySelector('.device').getBoundingClientRect();
    return {
      width: Math.round(scaler.width),
      height: Math.round(scaler.height),
      tabbarVisible: tabbar.bottom <= device.bottom + 1 && tabbar.height > 0,
      overflow: document.documentElement.scrollWidth > window.innerWidth
    };
  })()`);
  assert(box.width >= 420 && box.width <= 432, "frame width was " + box.width);
  assert(box.height >= 560 && box.height <= 660, "frame height was " + box.height);
  assert(box.tabbarVisible, "bottom tab bar not visible");
  assert(!box.overflow, "page scrolls horizontally");
  console.log("  frame at 1000x700: " + box.width + " x " + box.height);
});

check("mobile frame caps at 900 on a tall window", async (api) => {
  await api.setViewport(1440, 1000, true);
  const box = await api.client.evaluate(`(() => {
    const scaler = document.querySelector('.device-scaler').getBoundingClientRect();
    return { width: Math.round(scaler.width), height: Math.round(scaler.height) };
  })()`);
  assert(box.width === 430, "frame width was " + box.width);
  assert(box.height === 900, "frame height was " + box.height);
  await api.setViewport(1000, 700, false);
});

check("upload control is a styled drop zone", async (api) => {
  await api.goto("/question/phy-kin-1");
  const upload = await api.client.evaluate(`(() => {
    const drop = document.querySelector('.upload__drop');
    const input = document.querySelector('[data-answer-file]');
    return {
      drop: Boolean(drop),
      label: drop ? drop.querySelector('.upload__label').textContent.replace(/\\s+/g, ' ').trim() : '',
      inputHidden: input ? getComputedStyle(input).opacity : ''
    };
  })()`);
  assert(upload.drop, "no drop zone");
  assert(upload.label.includes("Choose an image or PDF"), "label copy missing: " + upload.label);
  assert(upload.inputHidden === "0", "the native file input is still visible");
});

check("attached file shows a contained preview and can be removed", async (api) => {
  await api.goto("/question/phy-kin-1");
  await api.client.evaluate(`(() => {
    const remove = document.querySelector('[data-answer-file-remove]');
    if (remove) remove.click();
  })()`);
  await sleep(250);
  await api.client.evaluate(`(() => {
    const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
    const data = new DataTransfer();
    data.items.add(new File([bytes], 'tall.png', { type: 'image/png' }));
    const input = document.querySelector('[data-answer-file]');
    input.files = data.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(300);
  const state = await api.client.evaluate(`(() => {
    const img = document.querySelector('[data-answer-preview] img');
    const figure = document.querySelector('[data-answer-preview]');
    return {
      name: document.querySelector('[data-answer-file-name]').textContent,
      objectFit: img ? getComputedStyle(img).objectFit : '',
      ratio: figure ? getComputedStyle(figure).aspectRatio : '',
      remove: Boolean(document.querySelector('[data-answer-file-remove]'))
    };
  })()`);
  assert(state.name.indexOf("tall.png") !== -1, "file name missing: " + state.name);
  assert(state.objectFit === "contain", "preview is not contained: " + state.objectFit);
  assert(state.ratio && state.ratio !== "auto", "preview has no fixed aspect box");
  assert(state.remove, "no remove button");
  await api.client.evaluate("document.querySelector('[data-answer-file-remove]').click()");
  await sleep(250);
  const cleared = await api.client.evaluate(
    "document.querySelectorAll('[data-answer-preview]').length + document.querySelectorAll('[data-answer-file-name]').length"
  );
  assert(cleared === 0, "attachment was not cleared");
});

check("physics and CS questions render a 2D figure", async (api) => {
  const withFigures = [
    "phy-kin-1", "phy-kin-2", "phy-dyn-1", "phy-dyn-2", "phy-dyn-3", "phy-energy-1", "phy-energy-2",
    "phy-waves-1", "phy-waves-2", "phy-elec-1", "phy-elec-2", "phy-part-1",
    "cs-ds-2", "cs-bool-1", "cs-alg-1"
  ];
  for (const id of withFigures) {
    await api.goto("/question/" + id);
    const shapes = await api.client.evaluate(`(() => {
      const svg = document.querySelector('[data-inspect="question.figure"] svg');
      return svg ? svg.children.length : 0;
    })()`);
    assert(shapes > 6, id + " has no figure (shapes: " + shapes + ")");
  }
});

check("comments have avatars, replies and a reply form", async (api) => {
  await api.goto("/question/cs-prog-1/solutions/post-1");
  const before = await api.client.evaluate("document.querySelectorAll('.comment').length");
  assert(before === 5, "expected 3 comments and 2 replies, got " + before);
  const avatars = await api.client.evaluate("document.querySelectorAll('.comment__avatar').length");
  assert(avatars === before, "every comment should have an avatar");
  await api.client.evaluate("document.querySelector('[data-comment-reply]').click()");
  await sleep(150);
  const open = await api.client.evaluate("!document.querySelector('[data-comment-reply-form]').hidden");
  assert(open, "reply form did not open");
  await api.client.evaluate(`(() => {
    const form = document.querySelector('[data-comment-reply-form]');
    form.querySelector('[data-comment-reply-input]').value = 'That clears it up.';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(250);
  const after = await api.client.evaluate("document.querySelectorAll('.comment').length");
  assert(after === before + 1, "reply was not added");
});

check("community searches and filters by type and year", async (api) => {
  await api.role("student");
  await api.goto("/community");
  const total = await api.client.evaluate("document.querySelectorAll('[data-post-id]').length");
  assert(total >= 4, "expected at least the four seeded posts, got " + total);
  await api.client.evaluate(`(() => {
    const search = document.querySelector('[data-community-search]');
    search.value = 'primary key';
    search.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(150);
  const searched = await api.client.evaluate("Array.from(document.querySelectorAll('[data-post-id]')).filter((c) => !c.hidden).length");
  assert(searched === 1, "search should leave one post, got " + searched);
  await api.client.evaluate(`(() => {
    const search = document.querySelector('[data-community-search]');
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const kind = document.querySelector('[data-community-kind]');
    kind.value = 'practice';
    kind.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(150);
  const yearHidden = await api.client.evaluate("document.getElementById('community-year').closest('.field').hidden");
  assert(yearHidden, "year filter should hide for practice questions");
  const practice = await api.client.evaluate("Array.from(document.querySelectorAll('[data-post-id]')).filter((c) => !c.hidden).length");
  assert(practice === 0, "no practice solutions exist yet, expected 0, got " + practice);
  await api.client.evaluate(`(() => {
    const kind = document.querySelector('[data-community-kind]');
    kind.value = 'past';
    kind.dispatchEvent(new Event('change', { bubbles: true }));
    const year = document.querySelector('[data-community-year]');
    year.value = '2022';
    year.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(150);
  const inYear = await api.client.evaluate("Array.from(document.querySelectorAll('[data-post-id]')).filter((c) => !c.hidden).length");
  assert(inYear === 1, "expected one 2022 solution, got " + inYear);
});

check("code workspace runs pseudocode", async (api) => {
  await api.goto("/code/cs-prog-1");
  const lines = await api.client.evaluate("document.querySelector('[data-code-gutter]').textContent.split('\\n').length");
  assert(lines > 10, "gutter has no line numbers");
  await api.client.evaluate("document.querySelector('[data-run-code]').click()");
  await sleep(300);
  const out = await api.client.evaluate("document.querySelector('[data-code-console]').innerText");
  assert(out.indexOf("Largest: 99") !== -1, "missing the largest value: " + out.slice(0, 120));
  assert(out.indexOf("Smallest: -4") !== -1, "missing the smallest value: " + out.slice(0, 120));
});

check("code workspace reports errors with a line", async (api) => {
  await api.goto("/code/cs-prog-1");
  await api.client.evaluate(`(() => {
    const editor = document.querySelector('[data-code-editor]');
    editor.value = 'DECLARE x : INTEGER\\nOUTPUT missing';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-run-code]').click();
  })()`);
  await sleep(300);
  const out = await api.client.evaluate("document.querySelector('[data-code-console]').innerText");
  assert(out.indexOf("Unknown variable missing") !== -1, "error not shown: " + out.slice(0, 140));
  assert(/Line 2/.test(out), "error line missing: " + out.slice(0, 80));
});

check("try a solution loads and runs it", async (api) => {
  await api.goto("/question/cs-prog-1/solutions/post-1");
  await api.client.evaluate("document.querySelector('[data-try-solution]').click()");
  await sleep(400);
  const state = await api.client.evaluate(`(() => ({
    hash: location.hash,
    code: document.querySelector('[data-code-editor]').value,
    notice: Boolean(document.querySelector('.notice'))
  }))()`);
  assert(state.hash === "#/code/cs-prog-1", "went to " + state.hash);
  assert(state.code.indexOf("LargestAndSmallest") !== -1, "solution code not loaded");
  assert(state.notice, "no notice that a solution was loaded");
  await api.client.evaluate("document.querySelector('[data-run-code]').click()");
  await sleep(350);
  const out = await api.client.evaluate("document.querySelector('[data-code-console]').innerText");
  assert(out.indexOf("Largest: 99") !== -1, "the loaded solution did not run: " + out.slice(0, 120));
});

check("code review scores the starter program", async (api) => {
  await api.goto("/code/cs-alg-1");
  await api.client.evaluate("document.querySelector('[data-reset-code]').click()");
  await sleep(200);
  await api.client.evaluate("document.querySelector('[data-review-code]').click()");
  await sleep(150);
  const busy = await api.client.evaluate("Boolean(document.querySelector('.review-card--busy'))");
  assert(busy, "no reviewing state after Review");
  await sleep(1400);
  const state = await api.client.evaluate(`(() => ({
    text: document.querySelector('.review-card').innerText,
    met: document.querySelectorAll('.review-item.is-met').length,
    missing: document.querySelectorAll('.review-item.is-missing').length
  }))()`);
  assert(state.met === 4 && state.missing === 0,
    "starter should pass every check, got " + state.met + " met / " + state.missing + " missing");
  assert(state.text.indexOf("rule-based") !== -1, "missing the honest disclaimer");
});

check("code review flags a missing output", async (api) => {
  await api.goto("/code/cs-prog-1");
  await api.client.evaluate(`(() => {
    const editor = document.querySelector('[data-code-editor]');
    editor.value = 'DECLARE x : INTEGER\\nx <- 1';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-review-code]').click();
  })()`);
  await sleep(1400);
  const state = await api.client.evaluate(`(() => ({
    text: document.querySelector('.review-card').innerText,
    missing: document.querySelectorAll('.review-item.is-missing').length
  }))()`);
  assert(state.text.indexOf("OUTPUT") !== -1, "missing-output finding not shown: " + state.text.slice(0, 120));
  assert(state.missing > 0, "criteria should show as missing");
});

check("code review stops on a syntax error", async (api) => {
  await api.goto("/code/cs-prog-1");
  await api.client.evaluate(`(() => {
    const editor = document.querySelector('[data-code-editor]');
    editor.value = 'IF x > 1 THEN\\nOUTPUT 1';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-review-code]').click();
  })()`);
  await sleep(1400);
  const text = await api.client.evaluate("document.querySelector('.review-card').innerText");
  assert(/review stopped/i.test(text), "no stopped state: " + text.slice(0, 80));
  assert(/Line 1/.test(text), "line number missing: " + text.slice(0, 80));
});

check("the dynamics question shows a velocity–time graph", async (api) => {
  await api.goto("/question/phy-dyn-1");
  const info = await api.client.evaluate(`(() => {
    const svg = document.querySelector('[data-inspect="question.figure"] svg');
    return { shapes: svg ? svg.querySelectorAll('*').length : 0, text: svg ? svg.textContent : '' };
  })()`);
  assert(info.shapes > 15, "graph has too few shapes: " + info.shapes);
  assert(info.text.indexOf("terminal velocity") !== -1, "graph is missing its labels");
});

check("the diagram workspace models the inclined plane", async (api) => {
  await api.goto("/diagram/phy-dyn-3");
  const before = await api.client.evaluate("document.querySelector('[data-out=acceleration]').textContent");
  const shapesBefore = await api.client.evaluate("document.querySelectorAll('[data-figure-stage] svg *').length");
  assert(shapesBefore > 10, "the plane drew too few shapes: " + shapesBefore);
  await api.client.evaluate(`(() => {
    const angle = document.querySelector('[data-angle-range]');
    angle.value = '40';
    angle.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(150);
  const after = await api.client.evaluate("document.querySelector('[data-out=acceleration]').textContent");
  assert(before !== after, "the acceleration did not change with the angle (" + before + ")");
  const weight = await api.client.evaluate("document.querySelector('[data-out=weight]').textContent");
  assert(weight.indexOf("39.2") !== -1, "weight readout wrong: " + weight);
});

const STUDENT_ROUTES = [
  "/", "/foundations", "/sitemap", "/login", "/topics", "/topics/cs", "/topics/physics",
  "/topic/phy-kinematics", "/topic/phy-kinematics/practice", "/topic/cs-databases",
  "/question/phy-kin-1", "/question/phy-kin-1/solutions",
  "/question/phy-kin-1/solutions/post-2", "/question/phy-kin-1/discussion",
  "/question/phy-kin-1/stats", "/question/cs-prog-1/solutions/post-1",
  "/question/phy-dyn-1/solutions", "/result/phy-kin-1", "/code/cs-prog-1",
  "/diagram/phy-dyn-1", "/assistant", "/progress", "/community", "/post-solution",
  "/notes", "/notifications", "/profile"
];
const TEACHER_ROUTES = ["/dashboard", "/classes", "/class/class-1", "/share", "/community", "/notifications", "/profile"];
const REVIEWER_ROUTES = ["/queue", "/review/rev-1", "/community", "/notifications", "/profile"];

check("every route renders a screen without overflow", async (api) => {
  await api.role("student");
  const sweeps = [["student", STUDENT_ROUTES], ["teacher", TEACHER_ROUTES], ["reviewer", REVIEWER_ROUTES]];
  for (const [role, routes] of sweeps) {
    await api.role(role);
    for (const route of routes) {
      await api.goto(route);
      const state = await api.client.evaluate(`(() => {
        const screen = document.getElementById('screen');
        return {
          hash: location.hash,
          empty: screen.children.length === 0,
          text: screen.innerText.trim().length,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1
        };
      })()`);
      assert(state.hash === "#" + route || (route === "/" && state.hash === "#/"), role + " " + route + " redirected to " + state.hash);
      assert(!state.empty, role + " " + route + " rendered nothing");
      assert(state.text > 10, role + " " + route + " rendered almost no text");
      assert(!state.overflow, role + " " + route + " overflows horizontally");
    }
  }
  await api.role("student");
});

check("every inspectable element on the new screens has a note", async (api) => {
  await api.role("student");
  await api.client.evaluate(`(() => {
    const toggle = document.getElementById('inspectToggle');
    if (!toggle.checked) { toggle.checked = true; toggle.dispatchEvent(new Event('change', { bubbles: true })); }
  })()`);
  await sleep(200);
  const routes = [
    "/question/phy-kin-1", "/question/phy-kin-1/solutions",
    "/question/phy-kin-1/solutions/post-2", "/question/phy-kin-1/discussion",
    "/question/phy-kin-1/stats", "/topics", "/topics/physics", "/assistant",
    "/community", "/result/phy-kin-1"
  ];
  for (const route of routes) {
    await api.goto(route);
    const missing = await api.client.evaluate(`(() => {
      const out = [];
      document.querySelectorAll('#screen [data-inspect]').forEach((el) => {
        el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
        const card = document.getElementById('inspectCard');
        const title = document.getElementById('inspectTitle').textContent.trim();
        if (card.hidden || title === '') out.push(el.getAttribute('data-inspect'));
      });
      return Array.from(new Set(out));
    })()`);
    assert(missing.length === 0, route + " is missing notes for: " + missing.join(", "));
  }
  await api.role("teacher");
  await api.goto("/share");
  const shareMissing = await api.client.evaluate(`(() => {
    const out = [];
    document.querySelectorAll('#screen [data-inspect]').forEach((el) => {
      el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
      const card = document.getElementById('inspectCard');
      const title = document.getElementById('inspectTitle').textContent.trim();
      if (card.hidden || title === '') out.push(el.getAttribute('data-inspect'));
    });
    return Array.from(new Set(out));
  })()`);
  assert(shareMissing.length === 0, "/share is missing notes for: " + shareMissing.join(", "));
  await api.client.evaluate(`(() => {
    const toggle = document.getElementById('inspectToggle');
    if (toggle.checked) { toggle.checked = false; toggle.dispatchEvent(new Event('change', { bubbles: true })); }
  })()`);
  await api.role("student");
});

check("result screen share pre-fills the composer", async (api) => {
  await api.goto("/result/phy-kin-1");
  await api.client.evaluate("document.querySelector('[data-share-solution]').click()");
  await sleep(250);
  const selected = await api.client.evaluate("document.querySelector('[data-solution-question]').value");
  assert(selected === "phy-kin-1", "composer not pre-filled from the result, got " + selected);
});

check("no review status leaks into student screens", async (api) => {
  await api.role("student");
  for (const route of ["/question/phy-kin-1", "/question/phy-kin-1/solutions", "/community", "/topics"]) {
    await api.goto(route);
    const text = await api.text();
    for (const word of ["AI-checked", "Flagged", "Approved", "Rejected", "Published"]) {
      assert(!text.includes(word), route + " shows review status " + word);
    }
  }
});

main()
  .catch((error) => {
    console.error("AUDIT ERROR " + error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    if (ws) ws.close();
    chrome.kill();
  });
