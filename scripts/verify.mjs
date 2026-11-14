/* ============================================================
   Excelerate — static verification harness
   Run: node scripts/verify.mjs
   Prints PASS / FAIL for every check and exits non-zero on failure.
   It loads src/data.js in a Node vm context and reads the raw
   source of the app, the styles, the shell and the build.
   ============================================================ */

import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const dataCode = read("src/data.js") + `
;globalThis.__data = {
  SUBJECTS: SUBJECTS,
  QUESTIONS: QUESTIONS,
  QUESTION_HISTORY: typeof QUESTION_HISTORY === "undefined" ? {} : QUESTION_HISTORY,
  QUESTION_DISCUSSION: typeof QUESTION_DISCUSSION === "undefined" ? {} : QUESTION_DISCUSSION,
  COMMUNITY_POSTS: COMMUNITY_POSTS,
  ASSISTANT_PROMPTS: ASSISTANT_PROMPTS,
  FIGURES: typeof FIGURES === "undefined" ? {} : FIGURES,
  CODE_WORKSPACES: typeof CODE_WORKSPACES === "undefined" ? {} : CODE_WORKSPACES,
  SCREENS: SCREENS,
  INSPECT_NOTES: INSPECT_NOTES
};`;

const context = { console };
vm.createContext(context);
vm.runInContext(dataCode, context);
const data = context.__data;

const pseudoContext = { console };
vm.createContext(pseudoContext);
vm.runInContext(read("src/pseudo.js"), pseudoContext);
const Pseudo = pseudoContext.Pseudo;

const figuresContext = { console };
vm.createContext(figuresContext);
vm.runInContext(read("src/figures.js"), figuresContext);
const Figures = figuresContext.Figures;

const app = read("src/app.js");
const css = read("src/styles.css");
const html = read("index.html");
const build = existsSync(new URL("../excelerate.html", import.meta.url))
  ? read("excelerate.html")
  : "";

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

/* ---------- Baseline: the data the prototype already relies on ---------- */

test("subjects and topics are well formed", () => {
  assert(Array.isArray(data.SUBJECTS) && data.SUBJECTS.length > 0, "no subjects");
  data.SUBJECTS.forEach((subject) => {
    assert(subject.id && subject.code && subject.name, "subject is missing a field");
    assert(Array.isArray(subject.topics) && subject.topics.length > 0, "no topics in " + subject.id);
    subject.topics.forEach((topic) => {
      assert(topic.id && topic.name && typeof topic.questionCount === "number",
        "topic is missing a field in " + subject.id);
    });
  });
});

test("questions point at a real topic and subject", () => {
  const topics = new Map();
  data.SUBJECTS.forEach((subject) => {
    subject.topics.forEach((topic) => topics.set(topic.id, subject.id));
  });
  data.QUESTIONS.forEach((question) => {
    assert(topics.has(question.topicId), "unknown topic on " + question.id);
    assert(topics.get(question.topicId) === question.subjectId, "topic/subject mismatch on " + question.id);
    assert(Array.isArray(question.markScheme) && question.markScheme.length > 0,
      "no mark scheme on " + question.id);
    assert(typeof question.marks === "number" && question.marks > 0, "bad marks on " + question.id);
  });
});

test("community posts point at a real question", () => {
  const ids = new Set(data.QUESTIONS.map((question) => question.id));
  data.COMMUNITY_POSTS.forEach((post) => {
    assert(ids.has(post.questionId), "unknown question on " + post.id);
    assert(typeof post.likes === "number", "bad likes on " + post.id);
    assert(typeof post.comments === "number", "bad comment count on " + post.id);
  });
});

test("screens have the fields the sitemap needs", () => {
  const ids = new Set();
  data.SCREENS.forEach((screen) => {
    assert(!ids.has(screen.id), "duplicate screen id " + screen.id);
    ids.add(screen.id);
    assert(screen.code && screen.name && screen.summary, "screen " + screen.id + " is incomplete");
    assert(typeof screen.phase === "number", "screen " + screen.id + " has no phase");
    assert(Array.isArray(screen.contents) && screen.contents.length > 0,
      "screen " + screen.id + " has no contents");
    assert(screen.note, "screen " + screen.id + " has no note");
    assert(!screen.route || screen.route.charAt(0) === "/", "bad route on " + screen.id);
  });
});

test("inspect notes have a title and lines", () => {
  Object.keys(data.INSPECT_NOTES).forEach((key) => {
    const note = data.INSPECT_NOTES[key];
    assert(note.title, "note " + key + " has no title");
    assert(Array.isArray(note.lines) && note.lines.length > 0, "note " + key + " has no lines");
  });
});

/* ---------- New requirements for the revision ---------- */

test("all screens are built", () => {
  const missing = data.SCREENS.filter((screen) => screen.status !== "built");
  assert(missing.length === 0, "not built: " + missing.map((s) => s.id).join(", "));
});

test("solution detail screen exists", () => {
  assert(data.SCREENS.some((screen) => screen.id === "s5-solution"), "missing s5-solution");
});

test("question history exists for demo questions", () => {
  ["phy-kin-1", "phy-dyn-1", "cs-prog-1", "cs-db-1"].forEach((id) => {
    assert(data.QUESTION_HISTORY[id], "missing history for " + id);
  });
});

test("question discussion exists for demo questions", () => {
  ["phy-kin-1", "cs-prog-1"].forEach((id) => {
    assert(Array.isArray(data.QUESTION_DISCUSSION[id]), "missing discussion for " + id);
  });
});

test("worked steps exist for demo questions", () => {
  ["phy-kin-1", "phy-dyn-1", "cs-prog-1", "cs-db-1"].forEach((id) => {
    const question = data.QUESTIONS.find((item) => item.id === id);
    assert(question && Array.isArray(question.workedSteps) && question.workedSteps.length > 1,
      "missing workedSteps for " + id);
  });
});

test("solutions have a liked flag", () => {
  const missing = data.COMMUNITY_POSTS.filter((post) => typeof post.liked !== "boolean");
  assert(missing.length === 0, "missing liked on " + missing.map((post) => post.id).join(", "));
});

test("coach has a roadmap prompt", () => {
  assert(data.ASSISTANT_PROMPTS.some((prompt) => /roadmap/i.test(prompt)), "missing roadmap prompt");
});

test("subject state is gone", () => {
  assert(!/state\.subject\b/.test(app), "state.subject still present");
  assert(!/subject-switch/.test(app), "subject switcher still present");
  assert(!/signup-subject/.test(app), "sign-up subject field still present");
  assert(!/profile-subject/.test(app), "profile subject field still present");
});

test("question sub-routes are parsed", () => {
  ["solutions", "discussion", "stats"].forEach((part) => {
    assert(app.includes(`/${part}`), "missing route part " + part);
  });
  assert(/solutionId/.test(app), "missing solution detail id");
});

test("new UI markers exist", () => {
  ["data-scan-check", "data-question-help", "data-topic-subject",
    "data-share-subject", "data-coach-file"].forEach((marker) => {
    assert(app.includes(marker), "missing " + marker);
  });
});

test("mobile frame is larger", () => {
  assert(css.includes("430px"), "missing 430px frame");
  assert(!css.includes("calc(390px"), "old scaled frame still present");
  assert(!css.includes("calc(844px"), "old scaled frame height still present");
});

test("inspect notes cover static keys", () => {
  const keys = new Set();
  [app, html].forEach((source) => {
    source.replace(/data-inspect="([^"]+)"/g, (_, key) => {
      if (key.includes("${")) return;
      // Concatenated keys such as "screen." + item.id are not static.
      if (!/^[A-Za-z0-9._-]+$/.test(key)) return;
      keys.add(key);
    });
  });
  const missing = [...keys].filter((key) => !data.INSPECT_NOTES[key]);
  assert(missing.length === 0, "missing notes: " + missing.join(", "));
});

test("no raw hex in app or shell", () => {
  assert(!/#[0-9a-fA-F]{3,8}\b/.test(app), "raw hex in app.js");
  assert(!/#[0-9a-fA-F]{3,8}\b/.test(html), "raw hex in index.html");
});

test("no gradients", () => {
  assert(!/(linear|radial)-gradient/.test(css), "gradient found");
});

test("no forbidden student copy", () => {
  assert(!/AI-generated|Generate\b/.test(app), "forbidden copy in app.js");
  assert(!/AI-generated|Generate\b/.test(dataCode), "forbidden copy in data.js");
});

test("build is self-contained", () => {
  if (!build) return;
  assert(!build.includes("src/styles.css"), "external CSS reference");
  assert(!build.includes("src/pseudo.js"), "external runner reference");
  assert(!build.includes("src/figures.js"), "external figures reference");
  assert(!build.includes("src/data.js"), "external data reference");
  assert(!build.includes("src/app.js"), "external app reference");
  assert(build.includes("var Pseudo = "), "the pseudocode runner was not inlined");
});

/* ---------- Pseudocode runner and figures ---------- */

test("pseudocode runner runs the starter program", () => {
  const starter = data.CODE_WORKSPACES["cs-prog-1"];
  assert(starter && starter.starterCode, "no starter code for cs-prog-1");
  const result = Pseudo.run(starter.starterCode, starter.sampleInput);
  assert(result.ok, "runner failed: " + result.error + " (line " + result.line + ")");
  assert(result.output.join("|") === "Largest: 99|Smallest: -4",
    "unexpected output: " + result.output.join("|"));
});

test("pseudocode runner reports errors with a line", () => {
  const result = Pseudo.run("DECLARE x : INTEGER\nOUTPUT missing", "");
  assert(!result.ok, "expected an error");
  assert(/Unknown variable/.test(result.error), "unexpected error: " + result.error);
  assert(result.line === 2, "expected line 2, got " + result.line);
});

test("pseudocode runner handles functions, loops and input", () => {
  const loop = Pseudo.run("FUNCTION Square(n : INTEGER) RETURNS INTEGER\n    RETURN n * n\nENDFUNCTION\nDECLARE i : INTEGER\ni <- 1\nWHILE i <= 3 DO\n    OUTPUT Square(i)\n    i <- i + 1\nENDWHILE", "");
  assert(loop.ok, "loop failed: " + loop.error);
  assert(loop.output.join(",") === "1,4,9", "loop output: " + loop.output.join(","));

  const missing = Pseudo.run("DECLARE x : INTEGER\nINPUT x\nOUTPUT x", "");
  assert(!missing.ok && /input/i.test(missing.error), "missing input not reported");
});

test("every question figure draws", () => {
  const ids = Object.keys(data.FIGURES);
  assert(ids.length >= 14, "expected at least 14 figures, got " + ids.length);
  ["inclinedPlane", "velocityTime", "freeBody"].forEach((name) => {
    assert(typeof Figures.builders[name] === "function", "missing the " + name + " builder");
  });
  ids.forEach((id) => {
    const spec = data.FIGURES[id];
    const svg = Figures.render(spec);
    assert(svg.indexOf("<svg") === 0, id + " did not render an SVG");
    const shapes = (svg.match(/<(line|path|rect|circle|polygon|text|g)\b/g) || []).length;
    assert(shapes >= 4, id + " rendered only " + shapes + " shapes");
    assert(Figures.caption(spec), id + " has no caption");
  });
});

test("pseudocode review analyses a correct program", () => {
  const starter = data.CODE_WORKSPACES["cs-prog-1"];
  const result = Pseudo.analyse(starter.starterCode);
  assert(result.ok, "analyse failed: " + result.error + " (line " + result.line + ")");
  assert(result.facts.arrays.length === 1, "array not detected");
  assert(result.facts.fors.length === 2, "expected two loops, got " + result.facts.fors.length);
  assert(result.facts.outputVariables >= 2, "outputs not detected");
  assert(result.findings.length === 0, "unexpected findings: " + JSON.stringify(result.findings));
});

test("pseudocode review flags common mistakes", () => {
  const noOutput = Pseudo.analyse("DECLARE x : INTEGER\nx <- 1");
  assert(noOutput.ok, "should parse");
  assert(noOutput.findings.some((item) => /OUTPUT/.test(item.text)), "missing OUTPUT not flagged");

  const undeclared = Pseudo.analyse("OUTPUT total");
  assert(undeclared.findings.some((item) => /DECLARE/.test(item.text)), "undeclared variable not flagged");

  const broken = Pseudo.analyse("IF x > 1 THEN\nOUTPUT 1");
  assert(!broken.ok, "an unclosed IF should fail");
  assert(broken.line === 1, "expected line 1, got " + broken.line);
});

/* ---------- Runner ---------- */

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    failed += 1;
    console.log("FAIL " + name + ": " + error.message);
  }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
