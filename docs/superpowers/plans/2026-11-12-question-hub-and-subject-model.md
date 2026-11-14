# Question Hub and Open Subject Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile preview larger, remove the single-subject model, and turn the question screen into a tabbed hub with solving tools, solutions, discussion and statistics.

**Architecture:** Keep the existing vanilla HTML/CSS/JS hash-routed prototype and its single-file build. Add pure data helpers and route parsing to `src/app.js`, add the new question-hub templates there, extend `src/data.js` with mock history, discussion, worked steps and inspect notes, and add new component styles to `src/styles.css`. No framework, no backend, no new runtime dependency.

**Tech Stack:** Vanilla JavaScript (ES5-style in `src/app.js`), CSS custom properties, hash routing, Node 18+ for `build.mjs` and the verification script.

**Spec:** `docs/superpowers/specs/2026-11-12-question-hub-and-subject-model-design.md`

## Global Constraints

- No “generated”, “AI-generated” or “Generate” in student or teacher UI.
- No raw hex in components; use the warm tokens in `src/styles.css`.
- No gradients and no resting shadows beyond the existing device frame.
- 2 px radius except avatars, radios, toggles and status dots.
- Review statuses stay on reviewer screens only.
- Do not copy CAIE question text; all question content stays invented.
- No backend, no live model, no real file reading or upload.
- Uploaded files and new solutions/comments/likes stay in memory and reset on reload.
- Question-hub routes are student-only; teacher/reviewer Community keeps the read-only modal.
- This workspace is not a git repository. Do not initialize one. After each task run the verification command and rebuild the single file.
- The shareable output is always `excelerate.html`, built by `node build.mjs`.

## Review Focus

- **Draft survival:** a student types an answer, attaches a file, runs a scan and gets a helper reply, then switches to Solutions and back. The typed answer, attachment name, preview and scan result must still be there.
- **Direct sub-routes:** opening `#/question/phy-kin-1/stats` or `#/question/phy-kin-1/solutions/post-2` directly, or reloading it, must show the right tab/detail and keep the question header visible.
- **Empty or invalid scan input:** pressing “Scan and check” with no typed answer and no file must show a friendly inline message, not an estimated mark or a broken card.
- **Like/comment repetition:** liking a solution twice must return the count to its original value, and posting a comment must update both the thread and the count without duplicating the comment.
- **Staff community access:** a teacher or reviewer opening “Read full solution” or the comment count must still get the read-only modal, not a redirect to their role home.

---

### Task 1: Verification harness

**Files:**
- Create: `scripts/verify.mjs`

**Interfaces:**
- Produces: `node scripts/verify.mjs` exits `0` when every check passes and `1` when one fails.
- Produces: each check prints `PASS <name>` or `FAIL <name>: <reason>`.
- Consumes: `src/data.js` loaded in a Node `vm` context, plus the raw text of `src/app.js`, `src/styles.css`, `index.html` and `excelerate.html` when it exists.

- [ ] **Step 1: Write the harness skeleton**

Create `scripts/verify.mjs` with:

```js
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dataCode = read("src/data.js") + `
;globalThis.__data = {
  SUBJECTS, QUESTIONS, QUESTION_HISTORY, QUESTION_DISCUSSION,
  COMMUNITY_POSTS, ASSISTANT_PROMPTS, SCREENS, INSPECT_NOTES
};`;
const context = { console };
vm.createContext(context);
vm.runInContext(dataCode, context);
const data = context.__data;
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
```

- [ ] **Step 2: Add the new-requirement checks**

Add checks for:

```js
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
});

test("inspect notes cover static keys", () => {
  const keys = new Set();
  [app, html].forEach((source) => {
    source.replace(/data-inspect="([^"]+)"/g, (_, key) => {
      if (!key.includes("${")) keys.add(key);
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
  assert(!build.includes("src/data.js"), "external data reference");
  assert(!build.includes("src/app.js"), "external app reference");
});
```

- [ ] **Step 3: Add the runner**

```js
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
if (failed) process.exitCode = 1;
```

- [ ] **Step 4: Run the harness and confirm the expected failures**

Run: `node scripts/verify.mjs`

Expected: baseline checks pass; new checks fail with messages such as `FAIL solution detail screen exists: missing s5-solution`, `FAIL subject state is gone: state.subject still present`, and `FAIL mobile frame is larger: missing 430px frame`.

- [ ] **Step 5: Confirm the source still parses**

Run: `node --check src/app.js; node --check src/data.js`

Expected: both commands exit silently with code 0.

---

### Task 2: Question-hub data foundation

**Files:**
- Modify: `src/data.js`

**Interfaces:**
- Produces: `QUESTION_HISTORY` keyed by question id, with `{ years: number[], papers: number[], frequency: number }`.
- Produces: `QUESTION_DISCUSSION` keyed by question id, with `{ author, text, time }[]`.
- Produces: `workedSteps: string[]` on the four demo questions.
- Produces: `liked: boolean` on every `COMMUNITY_POSTS` entry.
- Produces: `ASSISTANT_PROMPTS` including a roadmap prompt.
- Produces: `SCREENS` with a new `s5-solution` row and updated summaries for S1, S2, S3, S5, S9, S13, S14, S19 and S20.

- [ ] **Step 1: Add question history**

Add after `QUESTIONS`:

```js
const QUESTION_HISTORY = {
  "phy-kin-1": { years: [2023, 2021, 2019, 2018], papers: [2, 2, 1, 2], frequency: 4 },
  "phy-dyn-1": { years: [2022, 2020, 2017], papers: [2, 3, 2], frequency: 3 },
  "cs-prog-1": { years: [2023, 2022, 2020], papers: [2, 2, 1], frequency: 3 },
  "cs-db-1": { years: [2022, 2019], papers: [1, 2], frequency: 2 },
  "phy-waves-1": { years: [2023, 2021], papers: [2, 2], frequency: 2 },
  "cs-alg-1": { years: [2023, 2020, 2018], papers: [1, 2, 1], frequency: 3 }
};
```

- [ ] **Step 2: Add question-level discussion**

Add after `QUESTION_HISTORY`:

```js
const QUESTION_DISCUSSION = {
  "phy-kin-1": [
    { author: "Maya R.", text: "I keep losing the unit on the height. Does it need m or m s⁻¹?", time: "2 hours ago" },
    { author: "Daniel O.", text: "Height is a distance, so m. Speed is the one in m s⁻¹.", time: "1 hour ago" }
  ],
  "cs-prog-1": [
    { author: "Aisha K.", text: "Does the array need to be declared before the FOR loop?", time: "Yesterday" },
    { author: "Mr Patel", text: "Yes. Declare it with its bounds before you read any values into it.", time: "Yesterday" }
  ]
};
```

- [ ] **Step 3: Add worked steps to the demo questions**

Add these exact `workedSteps` arrays:

```js
// phy-kin-1
workedSteps: [
  "Start with the quantities: u = 0, a = 9.81 m s⁻², t = 1.8 s.",
  "Use v = u + at to find the speed just before landing.",
  "Use s = ut + ½at² to find the height.",
  "Final line: v = 17.7 m s⁻¹ and s = 15.9 m."
],

// phy-dyn-1
workedSteps: [
  "State Newton's second law: F = ma.",
  "As speed rises, drag increases.",
  "The resultant force is weight minus drag, so it falls.",
  "A smaller resultant force gives a smaller acceleration.",
  "Final line: acceleration decreases as speed increases."
],

// cs-prog-1
workedSteps: [
  "Declare an array of 10 integers and variables for largest and smallest.",
  "Read the first value into the array and set largest and smallest to it.",
  "Loop from the second value to the tenth.",
  "Replace largest when the value is greater; replace smallest when it is smaller.",
  "Final line: OUTPUT largest and OUTPUT smallest after the loop."
],

// cs-db-1
workedSteps: [
  "A primary key is a field that uniquely identifies each record.",
  "It cannot repeat and it cannot be empty.",
  "It prevents duplicate records in the table.",
  "Other tables can refer to it with a foreign key.",
  "Final line: a primary key gives every row a unique identity and links tables together."
],
```

- [ ] **Step 4: Add the liked flag and one extra solution**

Add `liked: false` to every `COMMUNITY_POSTS` entry. Add one extra solution for `phy-kin-1` with a different author, `likes: 6`, `comments: 1`, and a one-item `commentList`.

- [ ] **Step 5: Add the roadmap prompt**

Append to `ASSISTANT_PROMPTS`:

```js
"Build me a revision roadmap"
```

- [ ] **Step 6: Update the screen map**

In `SCREENS`:

- S1 summary/contents: remove subject choice.
- S2 summary/contents: all subjects, no enrolment.
- S3 summary/contents: all subjects plus subject filter.
- S5 name: `Question hub`; summary/contents: four tabs, upload, scan, help.
- Add `s5-solution` after S5: code `S5A`, name `Solution detail`, phase 1, summary/contents for the full solution and its comments, route `/question/phy-kin-1/solutions/post-2`.
- S9 name: `Study coach`; summary/contents: general planning, attach question, attach file.
- S13 summary/contents: solutions open the question hub.
- S14 summary/contents: can be pre-filled from a question.
- S19 summary/contents: subject filter over the question bank.
- S20 summary/contents: no subject choice.

- [ ] **Step 7: Run the data checks**

Run: `node scripts/verify.mjs`

Expected: the data checks pass; UI checks still fail. `node --check src/data.js` must pass.

---

### Task 3: Open subject model, top bar and larger mobile frame

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `src/data.js` (inspect notes for shell, Home, Topics, Login, Profile, Share)

**Interfaces:**
- Produces: `state` without `subject`; persisted state is `{ role, mobileView, inspect, listState }`.
- Produces: `TopicsScreen(subjectId)` where `subjectId` is optional.
- Produces: `detailRoute("/topics/<subjectId>") -> { name: "topics", id }`.
- Produces: `ShareScreen()` with a subject filter over all questions.
- Produces: `renderTopbar()` markup with wordmark, notifications and profile only.
- Produces: `updateDeviceScale()` that no longer sets a scale; CSS owns the frame size.

- [ ] **Step 1: Remove subject state**

In `src/app.js`:

- Remove `subject` from `loadState` base and returned object.
- Remove `subject` from `persist`.
- Remove `subjectIdForRoute` or leave it unused; no call site may read `state.subject`.
- Remove `setSubject`, the `[data-subject]` click handler, the `[data-profile-subject]` listener and any `signup-subject`/`profile-subject` query.
- Change `continueTopic()` fallback to `{ topic: SUBJECTS[0].topics[0], subject: SUBJECTS[0] }`.
- In `syncRoute`, delete the `routeSubject` block.
- Change the `[data-open-subject]` handler to `navigate("/topics/" + subjectId)` instead of setting `state.subject`.
- Search for every remaining `state.subject`, `setSubject`, `data-subject`, `data-open-subject`, `signup-subject` and `profile-subject` occurrence and update or delete it.

- [ ] **Step 2: Replace the top bar**

Change `renderTopbar()` to:

```js
topbar.innerHTML =
  '<div class="topbar__inner">' +
    '<a class="wordmark" href="#' + ROLE_HOME[state.role] + '" data-inspect="shell.wordmark">Excelerate</a>' +
    '<div class="topbar__actions">' +
      '<a class="icon-btn bell" href="#/notifications" aria-label="Notifications, ' + unread + ' unread" data-inspect="shell.bell">' +
        ICONS.bell +
        (unread ? '<span class="bell__dot" aria-hidden="true"></span>' : "") +
      "</a>" +
      '<a class="icon-btn" href="#/profile" aria-label="Profile and settings" data-inspect="shell.profile">' + ICONS.user + "</a>" +
    "</div>" +
  "</div>";
```

Remove the `subject-switch` markup and the `shell.subjectSwitcher` inspect note. Update `.topbar__inner` in CSS to `display: flex; align-items: center; justify-content: space-between;` and add `.topbar__actions { display: flex; gap: var(--space-2); }`. Delete the `.subject-switch*` rules.

- [ ] **Step 3: Update Home and subject cards**

In `SubjectCard`, change the link to `#/topics/${subject.id}` and keep `data-open-subject`. In `HomeScreen`, change the lede and section heading to “all subjects” / “Browse by subject”, and change “across both” to “across all subjects”. Update `home.intro`, `home.subjects` and `home.subjectCard` inspect notes.

- [ ] **Step 4: Add the Topics subject filter**

Change `TopicsScreen()` to `TopicsScreen(subjectId)`. Build a `topics` array from every subject, filtered when `subjectId` is set. The eyebrow reads `All subjects · Question bank` when unfiltered, or `<subject.name> · <subject.code>` when filtered. Add:

```html
<select class="select" id="topic-subject" data-topic-subject>
  <option value="">All subjects</option>
  ...
</select>
```

Each row gets a subject badge. The search haystack includes the subject name. The count reflects both the subject filter and the search. Wire `data-topic-subject` with `navigate("/topics")` or `navigate("/topics/" + value)`.

- [ ] **Step 5: Parse the filtered Topics route**

In `detailRoute`, add:

```js
if (route.indexOf("/topics/") === 0) return { name: "topics", id: route.slice(8) };
```

In `renderScreen`, handle `detail.name === "topics"` with `TopicsScreen(detail.id)`. Add `"/topics/"` to `STUDENT_DETAIL_PREFIXES` so `isAllowed` and `roleForRoute` accept the filtered route. Update `isActiveTab` so a route starting with `/topics/` marks the Topics tab active.

- [ ] **Step 6: Remove subject choice from sign-up and Profile**

Delete the `login.subjects` fieldset and the `signup-subject` query in the submit handler. Delete the `profile.subject` fieldset and the `data-profile-subject` wiring. Update the lede and inspect notes for `login.signupForm`, `login.subjects` (remove the note) and `profile.subject` (remove the note).

- [ ] **Step 7: Add the Share subject filter**

In `ShareScreen`, remove `subjectById(state.subject)` and the `state.subject` filter. Render all questions. Add a `data-share-subject` select above the question choices. Wire it to hide non-matching `[data-share-question]` labels and uncheck any question that becomes hidden, so a filtered-out question cannot be submitted. Include subject, topic, marks and difficulty in each choice meta.

- [ ] **Step 8: Make the mobile frame larger**

In `src/styles.css`:

- Set `body.view-mobile .stage` padding to `var(--space-3)`.
- Set `body.view-mobile .device-scaler` to `width: min(430px, calc(100vw - 24px)); height: min(900px, calc(100vh - var(--proto-h, 64px) - 24px));`.
- Set `body.view-mobile .device` to `width: 100%; height: 100%;` and remove `transform: scale(...)`.
- Keep the 36 px radius and existing frame shadow.
- Remove the `calc(390px` and `calc(844px` rules.

In `updateDeviceScale()`, remove the scale calculation and the `--device-scale` property write. Keep the function as a no-op or delete it and its call sites.

- [ ] **Step 9: Update inspect notes**

Update `shell.topbar` to mention wordmark, notifications and profile. Remove `shell.subjectSwitcher`. Update `tab.home`, `home.intro`, `home.subjects`, `home.subjectCard`, `topics.intro`, `topics.search`, `topics.list`, `topics.row`, `login.signupForm`, `login.role`, `profile.form`, `share.intro`, `share.questions`. Add `topics.subjectFilter` and `share.subjectFilter`.

- [ ] **Step 10: Verify the subject model and frame**

Run: `node scripts/verify.mjs`

Expected: subject, screen-map and frame checks pass. Then start the local server and use the browser tool at `http://127.0.0.1:8765/excelerate.html`:

- No subject toggle in the top bar.
- Home subject card opens `/topics/<subjectId>` and the filter shows that subject.
- Sign up and Profile have no subject field.
- Share shows all questions and the subject filter hides the others.
- At 1000 × 700 in Mobile app view, the frame is about 430 × 600, the bottom tab bar is visible, and there is no horizontal page scroll.
- At a tall window, the frame stops at 430 × 900.

---

### Task 4: Question hub routes and Solve tab

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `src/data.js` (inspect notes for the question hub)

**Interfaces:**
- Produces: `detailRoute` question sub-routes.
- Produces: `QuestionScreen(id, tab)`.
- Produces: `QuestionHeader(question)`, `QuestionTabs(question, active)`, `SolvePanel(question)`.
- Produces: `draftFor(questionId)` and `saveDraft(questionId, patch)`.
- Produces: `sampleScan(question, draft) -> { estimate, total, points, hasInput }`.
- Produces: `questionHelpReply(mode, question) -> string`.
- Produces: `state.questionDrafts` in memory.

- [ ] **Step 1: Extend route parsing**

In `detailRoute`, replace the single `/question/` branch with parsing for:

```text
/question/<id>                     -> { name: "question", id, tab: "solve" }
/question/<id>/solutions           -> { name: "question", id, tab: "solutions" }
/question/<id>/solutions/<postId>  -> { name: "solution", questionId: id, solutionId: postId }
/question/<id>/discussion          -> { name: "question", id, tab: "discussion" }
/question/<id>/stats               -> { name: "question", id, tab: "stats" }
```

In `renderScreen`, dispatch `detail.name === "question"` to `QuestionScreen(detail.id, detail.tab)` and `detail.name === "solution"` to `SolutionDetailScreen(detail.questionId, detail.solutionId)` (the latter is completed in Task 5; for now it may render `QuestionScreen(detail.questionId, "solutions")`).

- [ ] **Step 2: Add draft helpers**

Add near the state section:

```js
function draftFor(questionId) {
  if (!state.questionDrafts[questionId]) {
    state.questionDrafts[questionId] = {
      answer: "", fileName: "", fileUrl: "", scan: null, helpMessages: []
    };
  }
  return state.questionDrafts[questionId];
}

function saveDraft(questionId, patch) {
  Object.assign(draftFor(questionId), patch);
}
```

Initialize `state.questionDrafts = {}` and `state.solutionQuestionId = null` after `loadState()`.

- [ ] **Step 3: Add the question header and tabs**

Add:

```js
function QuestionHeader(question) { ... }
function QuestionTabs(question, active) { ... }
```

`QuestionHeader` renders the breadcrumb, badges, topic title, source, question card and diagram. `QuestionTabs` renders route links for Solve, Solutions, Discussion and Stats, using `class="tab"` and `aria-current="page"` for the active tab. Links are:

```text
#/question/<id>
#/question/<id>/solutions
#/question/<id>/discussion
#/question/<id>/stats
```

- [ ] **Step 4: Replace the question screen**

Change `QuestionScreen(id, tab)` to render:

```js
QuestionHeader(question) +
QuestionTabs(question, tab || "solve") +
(tab === "solutions" ? SolutionsPanel(question) :
 tab === "discussion" ? DiscussionPanel(question) :
 tab === "stats" ? StatsPanel(question) :
 SolvePanel(question))
```

For Task 4, the Solutions/Discussion/Stats panels can be temporary empty sections without new `data-inspect` keys; Tasks 5 and 6 fill them and add their notes.

- [ ] **Step 5: Build the Solve panel**

`SolvePanel(question)` contains:

- the answer form with `data-answer-input`, the existing `data-answer-form`, `data-question-id`, Submit, Save for later and the workspace link;
- an upload field with `data-answer-file`, `accept="image/*,.pdf"`, and a visible file name / image preview;
- a `data-scan-check` button;
- a scan-result area when `draft.scan` exists;
- a `data-question-help` card with buttons `data-question-help-mode="hint"`, `"walk"` and `"check"`, a short input `data-question-help-input`, a submit button, and a reply area.

The typed answer value comes from `draftFor(question.id).answer`. The scan result is rendered from `draft.scan`.

- [ ] **Step 6: Implement the static helpers**

`sampleScan(question, draft)`:

- returns `{ hasInput: false, estimate: 0, total: question.marks, points: [] }` when there is no trimmed answer and no file name;
- uses `question.awarded` when it is a number, otherwise `Math.max(1, question.marks - 1)`;
- clamps the estimate to `1..question.marks`;
- maps `question.markScheme` to `{ point, covered }`, with the first `estimate` points covered;
- returns `{ hasInput: true, estimate, total: question.marks, points }`.

`questionHelpReply(mode, question)`:

- `hint`: return `"Start with the quantities or inputs the question gives you. The first mark usually comes from writing the method line before substituting."`;
- `walk`: return the `workedSteps` joined with newlines, or the mark-scheme points if there are no worked steps;
- `check`: return `"Use Scan and check above to see a sample mark-scheme comparison."`.

- [ ] **Step 7: Wire the Solve interactions**

In `wireScreen`, handle:

- `[data-answer-input]` input -> `saveDraft(questionId, { answer: value })`.
- `[data-answer-file]` change -> save `fileName` and, for images, `URL.createObjectURL(file)` in `fileUrl`; revoke the previous `fileUrl` if one exists; re-render.
- `[data-scan-check]` click -> build the scan; if `!hasInput`, show the inline message `Add a photo or write some working first.`; otherwise save `scan` and re-render.
- `[data-question-help-mode]` click -> append the mode reply to `draft.helpMessages` and re-render.
- `[data-question-help-form]` submit -> append the typed message and a canned reply, then re-render.
- `[data-answer-form]` submit -> keep the existing behaviour for Code/Diagram screens; when the form contains `[data-answer-input]`, save that value to the draft first, then navigate to `/result/<questionId>`.

Do not re-create object URLs on every render; reuse the stored `fileUrl`.

- [ ] **Step 8: Add the styles**

Add question-hub styles in `src/styles.css`:

- `.question-tabs` using the existing tab visual language;
- `.upload-field`, `.upload-preview`, `.scan-result`, `.scan-point`, `.help-card`, `.help-reply` with `white-space: pre-line` for the worked-steps reply;
- responsive wrapping at the 430 px frame width;
- no raw hex, no gradients, no resting shadows.

- [ ] **Step 9: Add inspect notes**

Add notes for `question.tabs`, `question.solve`, `question.upload`, `question.scan`, `question.help`, `question.helpModes`, `question.helpReply`. Update `question.header`, `question.stem`, `question.answer`, `question.actions` to describe the hub and the upload/check flow.

- [ ] **Step 10: Verify the Solve tab**

Run: `node scripts/verify.mjs`

Expected: route and marker checks pass. Then browser-check:

- `/question/phy-kin-1` shows Solve and the four tabs.
- `/question/phy-kin-1/stats` and `/question/phy-kin-1/solutions` open the right tab directly.
- Typing an answer, attaching a file, running Scan and check, then opening Solutions and returning keeps the answer, file name, preview and scan result.
- Scan with no answer and no file shows the inline message.
- Hint, Walk me through and Check my working produce replies.
- Submitting the answer still opens `/result/phy-kin-1`.

---

### Task 5: Solutions tab, solution detail and Community integration

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `src/data.js` (inspect notes for solutions)

**Interfaces:**
- Produces: `solutionsFor(questionId) -> post[]` sorted by `likes` descending.
- Produces: `SolutionRow(post)`, `SolutionsPanel(question)`, `SolutionDetailScreen(questionId, solutionId)`.
- Produces: `toggleSolutionLike(post)`, `addSolutionComment(post, text)`.
- Produces: `state.solutionQuestionId` used by the Post solution composer.

- [ ] **Step 1: Add the solution helpers**

```js
function solutionsFor(questionId) {
  return COMMUNITY_POSTS
    .filter((post) => post.questionId === questionId)
    .sort((a, b) => b.likes - a.likes);
}
```

`toggleSolutionLike(post)` flips `post.liked` and adds or subtracts 1 from `post.likes`.

`addSolutionComment(post, text)` creates `post.commentList` if needed, appends `{ author: "You", text, time: "Just now" }`, increments `post.comments`, and returns the comment.

- [ ] **Step 2: Build the Solutions panel**

`SolutionsPanel(question)`:

- heading “Solutions” with the count and a “Share a solution” button;
- a list of `SolutionRow(post)` sorted by likes;
- a “Top solution” badge on the first row when there is more than one;
- like button with `data-solution-like="<post.id>"` and count;
- comment count linking to the solution detail route;
- “Read solution” link to `#/question/<questionId>/solutions/<postId>`;
- empty state with “No solutions yet” and a “Share the first solution” button.

- [ ] **Step 3: Build the solution detail**

`SolutionDetailScreen(questionId, solutionId)`:

- breadcrumb back to the question and Solutions tab;
- the question stem;
- author, time, full solution;
- like button;
- comment thread from `post.commentList`;
- a comment form with `data-solution-comment-form` and `data-solution-comment-input`;
- a friendly empty state when there are no comments.

If the post or question is missing, render `NotFoundScreen()`.

- [ ] **Step 4: Wire likes and comments**

In `wireScreen`, handle:

- `[data-solution-like]` -> find the post, call `toggleSolutionLike`, re-render.
- `[data-solution-comment-form]` submit -> trim the input; if empty, show `Write a comment first.`; otherwise call `addSolutionComment`, re-render.
- `[data-share-solution]` -> set `state.solutionQuestionId` and navigate to `/post-solution`.

- [ ] **Step 5: Update Community for students and staff**

In `CommunityPostCard`:

- for `state.role === "student"`, “Read full solution” and the comment count link to the solution detail route;
- for teacher/reviewer, keep the existing `data-read-solution` / `data-comments` modal buttons.

Update the wiring so the modal handlers only run for staff. For staff, render the like count as static text rather than a button, so the feed stays read-only. For students, keep the like button and its count.

- [ ] **Step 6: Pre-fill and redirect the composer**

In `PostSolutionScreen`, select `state.solutionQuestionId` when present. In the submit handler:

- add the new post with `liked: false`;
- clear `state.solutionQuestionId`;
- show the toast;
- navigate to `/question/<questionId>/solutions`.

In `ResultScreen`, change “Share my solution” to a `data-share-solution` button with the question id so it sets the prefill.

- [ ] **Step 7: Add the styles**

Add `.solution-list`, `.solution-card`, `.solution-card__meta`, `.solution-card__actions`, `.solution-detail`, `.comment-thread`, `.comment-form`, `.top-solution`. Reuse the existing badge, button and card styles.

- [ ] **Step 8: Add inspect notes**

Add `question.solutions`, `question.solutionRow`, `question.solutionDetail`, `question.solutionLike`, `question.solutionComments`, `question.solutionCommentForm`, `question.solutionEmpty`. Update `community.card` and `postSolution.intro` to mention the question hub.

- [ ] **Step 9: Verify solutions**

Run: `node scripts/verify.mjs`.

Browser-check:

- Solutions for `phy-kin-1` are sorted by likes.
- Liking twice returns the count to its original value.
- Opening a solution shows its own comments; adding a comment updates the thread and count.
- “Share a solution” opens the composer with the question pre-selected; posting redirects to that question’s Solutions tab.
- As a teacher or reviewer, Community still opens the read-only modal and does not redirect.

---

### Task 6: Discussion and Stats tabs

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `src/data.js` (inspect notes for discussion and stats)

**Interfaces:**
- Produces: `questionStats(question) -> { frequency, years, papers, label }`.
- Produces: `DiscussionPanel(question)`, `StatsPanel(question)`.
- Produces: `addDiscussionComment(questionId, text)`.

- [ ] **Step 1: Add the stats helper**

```js
function questionStats(question) {
  const history = QUESTION_HISTORY[question.id];
  if (history) {
    return Object.assign({ label: history.frequency + " past paper appearances" }, history);
  }
  if (question.kind === "past" && question.year) {
    return { years: [question.year], papers: [question.paper], frequency: 1, label: "1 past paper appearance" };
  }
  return { years: [], papers: [], frequency: 0, label: "No past appearances yet" };
}
```

- [ ] **Step 2: Build the Stats panel**

`StatsPanel(question)` shows:

- a stat row with appearances, marks and difficulty;
- a “Years seen” section with year badges, or “No past appearances yet” for practice questions;
- a paper list when `papers` exists;
- a short note: “Practice questions have not appeared in a past paper.”

Use `data-inspect="question.stats"` on the section and `question.statsYears` on the year list.

- [ ] **Step 3: Build the Discussion panel**

`DiscussionPanel(question)` shows:

- the question-level thread from `QUESTION_DISCUSSION[question.id] || []`;
- author, text and time for each comment;
- an empty state when there are none;
- a form with `data-discussion-form` and `data-discussion-input`;
- a submit button.

`addDiscussionComment(questionId, text)` appends `{ author: "You", text, time: "Just now" }` to the array, creating it if needed.

- [ ] **Step 4: Wire the discussion form**

In `wireScreen`, handle `[data-discussion-form]` submit:

- trim the input;
- if empty, show `Write a comment first.`;
- otherwise add the comment and re-render.

- [ ] **Step 5: Add styles**

Add `.discussion-thread`, `.discussion-comment`, `.discussion-form`, `.stats-grid`, `.year-list`. Keep the 2 px radius and token colours.

- [ ] **Step 6: Add inspect notes**

Add `question.discussion`, `question.discussionForm`, `question.discussionEmpty`, `question.stats`, `question.statsYears`.

- [ ] **Step 7: Verify discussion and stats**

Run: `node scripts/verify.mjs`.

Browser-check:

- `phy-kin-1` shows the seeded discussion and accepts a new comment.
- A question with no discussion shows the empty state.
- `phy-kin-1` shows four appearances and the years 2023, 2021, 2019, 2018.
- A practice question shows “No past appearances yet.”

---

### Task 7: Study coach

**Files:**
- Modify: `src/app.js`
- Modify: `src/data.js` (prompts and inspect notes)
- Modify: `src/styles.css` if the file field needs a small style

**Interfaces:**
- Produces: `ROLE_TABS.student` Assistant entry with `label: "Coach"`.
- Produces: `weakTopics()` returning the same weak-topic array used by Progress.
- Produces: `AssistantScreen()` with all-question context, file attachment and general prompts.
- Produces: `assistantReply(text, question)` with roadmap/plan handling.

- [ ] **Step 1: Extract weak topics**

Move the weak-topic calculation out of `ProgressScreen` into:

```js
function weakTopics() {
  // same filtering and sorting as ProgressScreen
}
```

`ProgressScreen` calls `weakTopics()` and keeps its current markup.

- [ ] **Step 2: Rename the tab and screen**

In `ROLE_TABS.student`, change the Assistant entry label to `Coach`. Keep the route `/assistant` and screen id `s9`.

In `AssistantScreen`, change the eyebrow to `Student · Coach`, the title to `Study coach`, and the lede to cover planning, mark schemes and general study help.

- [ ] **Step 3: Expand the context and prompts**

Change the attach-question dropdown from recent attempts to every question, labelled with subject, topic and a short stem. Keep the existing suggested prompts and add the roadmap prompt from `ASSISTANT_PROMPTS`.

- [ ] **Step 4: Add file attachment**

Add a file input `data-coach-file` with `accept="image/*,.pdf"`, a visible file name, and include the file name in the message context when a message is sent. Do not read the file.

- [ ] **Step 5: Add roadmap replies**

In `assistantReply`, detect `roadmap`, `plan` or `week` and return a static plan built from `weakTopics()`. Example:

```text
Here is a two-week plan based on your lowest marks:
1. <weak topic> — two short practice attempts.
2. <next weak topic> — one past paper question, then check the mark scheme.
3. Finish the week with a mixed set from <subject>.
This is a sample plan for the prototype.
```

If `weakTopics()` is empty, return: “Start with one past paper question from each subject, then use the mark scheme to choose the next topic. This is a sample plan for the prototype.” Keep the existing revise, lost-mark and mark-scheme replies.

- [ ] **Step 6: Wire the file name**

In `wireScreen`, handle `[data-coach-file]` change and show `Attached: <name>` in `data-coach-file-name`. Include the name in the chat context when sending.

- [ ] **Step 7: Update inspect notes**

Update `tab.assistant` to “Coach tab”. Update `assistant.intro`, `assistant.chat`, `assistant.prompts` and `assistant.form` to mention general planning, all-question context and file attachment. Add `assistant.file`.

- [ ] **Step 8: Verify the coach**

Run: `node scripts/verify.mjs`.

Browser-check:

- The student tab bar says Coach.
- The screen says Study coach.
- “Build me a revision roadmap” returns a plan using weak topics.
- The attach-question dropdown lists all questions.
- Attaching a file shows its name and includes it in the sent message context.

---

### Task 8: Sitemap, inspect notes, README and build banner

**Files:**
- Modify: `src/data.js` (final screen map and inspect notes)
- Modify: `README.md`
- Modify: `build.mjs`

**Interfaces:**
- Produces: every screen in `SCREENS` has `status: "built"`.
- Produces: every static `data-inspect` key has an `INSPECT_NOTES` entry.
- Produces: the README describes the new subject model, question hub, coach, mobile frame and assumptions.
- Produces: the build banner describes the post-Phase 5 revision.

- [ ] **Step 1: Finalize the screen map**

Check `SCREENS` includes S5A and the updated S1, S2, S3, S5, S9, S13, S14, S19 and S20 rows. Every row must have `status: "built"`. Remove or rewrite any summary that still says “both subjects”, “subject switcher” or “subject choice”.

- [ ] **Step 2: Finalize inspect notes**

Run the verify script and fix every missing-note failure. Remove notes for deleted UI (`shell.subjectSwitcher`, `login.subjects`, `profile.subject`). Update notes that still describe the old single-subject model or the old Assistant tab.

- [ ] **Step 3: Update the README**

Rewrite the relevant sections:

- title/status: complete structural prototype plus this revision;
- controls: Mobile app view now uses the larger frame;
- what is built: no subject toggle; all subjects with filters; question hub tabs; upload/scan; Study coach;
- assumptions: no enrolment, all subjects open, in-memory drafts/solutions/comments/likes, static scan/coach, staff community modal;
- files table: add `scripts/verify.mjs`;
- next-pass notes: replace mock scan/coach, add real file analysis and persistence.

- [ ] **Step 4: Update the build banner**

Change the banner in `build.mjs` to:

```text
Excelerate — structural prototype (Phases 0–5 · post-review revision)
```

Keep the build date and self-contained note.

- [ ] **Step 5: Run the docs checks**

Run: `node scripts/verify.mjs`

Expected: all checks pass. Run `node build.mjs`; expected: `Built excelerate.html (... KB)`.

---

### Task 9: Final route, mobile and copy audit

**Files:**
- No source changes expected. Fix any issue found and rebuild.

**Interfaces:**
- Produces: a final `excelerate.html` that passes the audit.

- [ ] **Step 1: Build and start the dev server**

Run: `node build.mjs`

Run: `python -m http.server 8765 --bind 127.0.0.1` in the project directory.

Open `http://127.0.0.1:8765/excelerate.html` with the browser tool.

- [ ] **Step 2: Audit every route**

Visit and check for a rendered screen, no console error and no horizontal overflow:

```text
#/  #/foundations  #/sitemap  #/login  #/topics  #/topics/cs  #/topics/physics
#/topic/phy-kinematics  #/topic/phy-kinematics/practice
#/question/phy-kin-1  #/question/phy-kin-1/solutions
#/question/phy-kin-1/solutions/post-2  #/question/phy-kin-1/discussion
#/question/phy-kin-1/stats  #/result/phy-kin-1
#/code/cs-prog-1  #/diagram/phy-dyn-1
#/queue  #/review/review-1  #/assistant  #/progress
#/community  #/post-solution  #/notes  #/notifications
#/dashboard  #/classes  #/class/class-1  #/share  #/profile
```

Also check `#/question/cs-prog-1/solutions/post-1` and `#/question/phy-dyn-1/solutions` (empty solutions).

- [ ] **Step 3: Audit inspect mode**

Turn Inspect mode on and hover/tap every new element: question tabs, upload, scan result, help card, solutions, solution detail, comments, discussion, stats, Topics subject filter, Share subject filter, Coach file attachment. Every element must show a note.

- [ ] **Step 4: Audit the mobile frame**

At 1000 × 700 with Mobile app view on:

- frame around 430 × 600;
- bottom tab bar visible;
- no page-level horizontal scroll;
- question tabs, upload field and solution cards wrap without overflow;
- scan result and comment threads scroll inside the app.

At a tall window (for example 1440 × 1000):

- frame stops at 430 × 900;
- no overflow.

- [ ] **Step 5: Audit copy and tokens**

- Search student/teacher UI for “generated”, “AI-generated”, “Generate”.
- Search `src/app.js` and `index.html` for raw hex.
- Search `src/styles.css` for gradients.
- Confirm review statuses only appear on reviewer screens.
- Confirm no CAIE question text was copied.

- [ ] **Step 6: Final build and report**

Run: `node scripts/verify.mjs`

Run: `node build.mjs`

Expected: all checks pass, build succeeds, and the final `excelerate.html` is the shareable file. Report the route count, screen count, inspect-note count, frame size and any remaining prototype limitations.
