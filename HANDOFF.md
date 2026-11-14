# Excelerate — repository handoff and remaining work

> **Update (14 November 2026):** the post-review revision described below **has now been implemented and verified**, and a second pass added the pseudocode runner, 2D figures, the redesigned upload control, scan feedback, comment replies and richer community filters. `excelerate.html` is rebuilt, `node scripts/verify.mjs` passes (25 checks), and `node scripts/browser-audit.mjs` passes (40 browser checks). The workspace is now a Git repository published to GitHub (at the owner's request), so the "no git repository" note in section 8 no longer applies. Where the sections below say "not implemented yet" or describe the old 390 × 844 frame and the subject switcher, the current source and `README.md` are authoritative.

This document is a complete brief for the next AI agent or developer picking up this repository. Read it before touching code.

The short version: **the Phase 0–5 structural prototype is complete, but the approved post-review revision has not been implemented yet.** The current build still has the old single-subject toggle, the old answer-only question screen, and the old separate Assistant tab. The design and implementation plan for the revision are already written and approved. Your job is to implement that plan.

---

## 1. What this project is

**Excelerate** is a clickable, mobile-first structural prototype for a CAIE A Level exam-preparation platform. It currently covers:

- **Computer Science 9618**
- **Physics 9702**

It is a product/structure prototype, not the final product. It is used to walk through screens, flows and design decisions. All data is mock data. There is no backend, no authentication, no database, no live AI model and no real file analysis.

The shareable artifact is a **single self-contained file**:

```text
excelerate.html
```

It must open directly in a browser with no installation and no server. The source is split for editing, and `build.mjs` inlines the CSS, data and app code into that one file.

---

## 2. Current status

### Complete

The original **Phases 0–5** are complete:

- Phase 0 — foundations, tokens, shell, role navigation, inspect mode, sitemap, shared components.
- Phase 1 — sign up/login, Home, Topics, Topic page, Question screen, Result screen.
- Phase 2 — reviewer queue/detail, assistant chat, progress.
- Phase 3 — Computer Science code workspace and Physics diagram workspace.
- Phase 4 — community feed, post solution, teacher notes, notifications, teacher dashboard, classes, class detail, share.
- Phase 5 — profile/settings, loading/empty/error list states, larger-screen checks, final inspect/sitemap audit, README.

Current measured state:

| Item | Count / value |
| --- | --- |
| Screens in `SCREENS` | 22 |
| Screens with `status: "built"` | 22 |
| Inspect notes | 177 |
| Subjects | 2 (Computer Science, Physics) |
| Topics | 13 |
| Questions | 25 |
| Community posts | 3 |
| Classes | 2 |
| Profiles | 3 (student, teacher, reviewer) |
| Single-file build | `excelerate.html`, about 281 KB |
| Local storage key | `excelerate.proto.v1` |

### Not implemented yet

The approved **post-review revision** is documented but not coded. It covers:

- a larger mobile preview;
- removal of the single-subject toggle and student subject enrolment;
- all subjects with subject filters;
- a tabbed question hub: Solve / Solutions / Discussion / Stats;
- image/PDF upload and a static scan/check result;
- in-question help;
- Assistant renamed to Study coach, with general planning prompts and file attachment.

The current build still has the old behaviour. Do not describe the revision as done until it is implemented and verified.

---

## 3. Read these first

These two documents are the source of truth for the remaining work:

1. **Design spec:**
   `docs/superpowers/specs/2026-11-12-question-hub-and-subject-model-design.md`

2. **Implementation plan:**
   `docs/superpowers/plans/2026-11-12-question-hub-and-subject-model.md`

If this handoff and the design spec disagree, follow the design spec. If the design spec and the implementation plan disagree, follow the design spec and update the plan.

The plan is written for an implementer who has not seen the codebase. It contains exact file names, interfaces, data shapes, route names, copy rules and verification steps. Read the plan fully before starting.

---

## 4. Architecture

### Files

| Path | Purpose |
| --- | --- |
| `excelerate.html` | Final shareable single-file build. Do not edit by hand; rebuild it. |
| `index.html` | Development shell. Contains the prototype control bar, app shell, modals and script tags. |
| `src/styles.css` | Design tokens, shared components, app shell, mobile frame, all screen styles. |
| `src/data.js` | Mock data, `SCREENS`, `INSPECT_NOTES`, subjects, questions, community posts, classes, profiles. |
| `src/app.js` | Hash routing, state, layout, inspect mode, modals, all screen templates and event wiring. |
| `build.mjs` | Inlines CSS, data and app into `excelerate.html`. |
| `README.md` | Public-facing project overview. Needs updating as part of the revision. |
| `docs/superpowers/specs/...` | Approved design spec. |
| `docs/superpowers/plans/...` | Approved implementation plan. |
| `scripts/verify.mjs` | **Does not exist yet.** The plan creates it in Task 1. |

### Runtime model

- Vanilla HTML/CSS/JavaScript.
- Hash routing: `#/topics`, `#/question/phy-kin-1`, etc.
- No framework, no bundler, no npm runtime dependency.
- `src/data.js` runs before `src/app.js`.
- `src/app.js` is a single IIFE with a `state` object and screen-template functions.
- `render()` replaces `screen.innerHTML`, then `wireScreen()` attaches event listeners.
- The app is mobile-first. On wide screens the layout becomes a desktop/wide layout with a side rail. The **Mobile app view** prototype toggle puts the app inside a phone frame.

### Current state object

`state` currently contains:

```js
{
  role: "student" | "teacher" | "reviewer",
  subject: "cs" | "physics",
  mobileView: boolean,
  inspect: boolean,
  listState: "default" | "loading" | "empty" | "error",
  route: string
}
```

The revision removes `subject` from persisted state and from the app model. The localStorage key stays `excelerate.proto.v1`; old saved `subject` values are ignored.

### Current role tabs

- **Student:** Home, Topics, Community, Assistant, Progress.
- **Teacher:** Dashboard, Classes, Share, Community.
- **Reviewer:** Queue, Community.

The revision renames the student **Assistant** tab label to **Coach** but keeps the route `/assistant` and screen id `s9`.

### Current routes

```text
#/
#/foundations
#/sitemap
#/login
#/topics
#/topic/<topicId>
#/topic/<topicId>/practice
#/question/<questionId>
#/result/<questionId>
#/code/<questionId>
#/diagram/<questionId>
#/queue
#/review/<reviewId>
#/assistant
#/progress
#/community
#/post-solution
#/notes
#/notifications
#/dashboard
#/classes
#/class/<classId>
#/share
#/profile
```

The revision adds:

```text
#/topics/<subjectId>
#/question/<questionId>/solutions
#/question/<questionId>/solutions/<solutionId>
#/question/<questionId>/discussion
#/question/<questionId>/stats
```

---

## 5. How to run, build and verify

### Development

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8765/index.html
```

The browser tooling used in this workspace cannot open `file://`, so use the local server for browser checks.

### Build

```powershell
node build.mjs
```

This writes `excelerate.html`. The build must remain self-contained: no external `src/styles.css`, `src/data.js` or `src/app.js` references.

### Verification

The plan adds `scripts/verify.mjs` in Task 1. Once it exists:

```powershell
node scripts/verify.mjs
node --check src/app.js
node --check src/data.js
node build.mjs
```

The repo has no test framework and no browser automation dependency installed. The verification script is a static/data harness. Use a real browser for interaction checks: tabs, uploads, scan results, likes, comments, discussion posts, coach replies and mobile-frame sizing.

### Current browser checks used previously

The previous audit checked:

- every route renders;
- no missing inspect notes;
- no duplicate IDs;
- no unlabeled form fields;
- no horizontal overflow;
- no console errors;
- mobile frame at 390 × 844 logical size and bottom tab bar visible.

The revision changes the mobile frame to a 430 px-wide frame that fills the available height, capped at 900 px. Re-run the audit with that expectation.

---

## 6. Design system and copy rules

These are hard constraints. Do not break them.

### Colour and surfaces

- Warm tokens only. No raw hex in components. Tokens live in `src/styles.css`.
- No gradients.
- No resting shadows, except the existing device-frame shadow.
- 2 px radius everywhere, except avatars, radios, toggles and status dots.
- Crimson (`--brand`) is for primary actions and active states only.
- Error states use `--error`, which maps to the brand crimson.

### Copy

- Never use **“generated”**, **“AI-generated”** or **“Generate”** in student or teacher UI.
- There is no “Generate” button.
- Do not copy CAIE question text. All question stems and mark schemes are invented in the style of the papers.
- Review statuses (`AI-checked`, `Flagged`, `Approved`, `Rejected`, `Published`) belong only on reviewer screens.
- The scan/check result and coach replies must be honest that they are prototype samples. Do not claim real file analysis or a live model.

### Product model

- **No student enrolment.** Subjects are catalogue areas anyone can browse.
- **No top-bar subject toggle.**
- **No subject choice at sign-up or in Profile.**
- Teacher classes still have a subject because a class is a teaching group.
- Teacher/reviewer Community stays read-only and keeps the existing modal for full solutions and comments.
- The question hub is student-facing.

---

## 7. What remains: the approved revision

The implementation plan has nine tasks. This is the detailed summary.

### Task 1 — Verification harness

Create `scripts/verify.mjs`.

It should:

- load `src/data.js` in a Node `vm` context;
- read `src/app.js`, `src/styles.css`, `index.html` and `excelerate.html`;
- run checks for screens, data shapes, routes, UI markers, inspect notes, raw hex, gradients, forbidden copy and the self-contained build;
- print `PASS` / `FAIL` and exit non-zero on failure.

This harness is written before the feature work so the new requirements fail first.

### Task 2 — Question-hub data foundation

Modify `src/data.js`.

Add:

- `QUESTION_HISTORY` keyed by question id, with years, papers and frequency.
- `QUESTION_DISCUSSION` keyed by question id, with question-level comments.
- `workedSteps` on `phy-kin-1`, `phy-dyn-1`, `cs-prog-1` and `cs-db-1`.
- `liked: false` on every `COMMUNITY_POSTS` entry.
- One extra mock solution for `phy-kin-1`.
- A “Build me a revision roadmap” prompt in `ASSISTANT_PROMPTS`.
- `SCREENS` updates: S1, S2, S3, S5, S9, S13, S14, S19, S20, plus a new `s5-solution` row (S5A) for solution detail.

### Task 3 — Open subject model, top bar and larger mobile frame

Modify `src/app.js`, `src/styles.css` and the relevant inspect notes.

Remove:

- `state.subject` from `loadState`, `persist` and every consumer;
- the top-bar subject switcher;
- `setSubject`;
- the `[data-subject]` click handler;
- the `[data-profile-subject]` listener;
- the sign-up subject field;
- the Profile subject field.

Update:

- `continueTopic()` fallback to the first subject/topic;
- the `[data-open-subject]` handler to navigate to `/topics/<subjectId>`;
- Home copy from “both subjects” to “all subjects”;
- `SubjectCard` links to `/topics/<subjectId>`;
- `TopicsScreen(subjectId)` to list all topics with a subject filter;
- `detailRoute` to parse `/topics/<subjectId>`;
- `STUDENT_DETAIL_PREFIXES` to include `/topics/`;
- `isActiveTab` to treat `/topics/<id>` as the Topics tab;
- `ShareScreen` to show all questions with a subject filter;
- `renderTopbar()` to wordmark + notifications + profile only;
- CSS top bar to a flex row;
- the mobile frame to 430 px wide, filling the available height up to 900 px, with no scale transform.

The mobile frame must show about 430 × 600 at a 1000 × 700 browser window, with the bottom tab bar visible and no page-level horizontal scroll.

### Task 4 — Question hub routes and Solve tab

Modify `src/app.js`, `src/styles.css` and inspect notes.

Add route parsing for:

```text
/question/<id>
/question/<id>/solutions
/question/<id>/solutions/<solutionId>
/question/<id>/discussion
/question/<id>/stats
```

Add:

- `QuestionScreen(id, tab)`;
- `QuestionHeader(question)`;
- `QuestionTabs(question, active)`;
- `SolvePanel(question)`;
- `draftFor(questionId)` and `saveDraft(questionId, patch)`;
- `sampleScan(question, draft)`;
- `questionHelpReply(mode, question)`;
- `state.questionDrafts`.

The question header stays above the tabs. The Solve tab contains:

- the answer textarea;
- an image/PDF upload field with file name and image preview;
- a “Scan and check” button and inline sample result;
- a compact “Question help” card with Hint / Walk me through / Check my working and a short question input;
- existing Submit, Save for later and workspace link.

Draft survival is required: typed answer, attachment name, preview, scan result and help messages must survive switching between question tabs. They reset on page reload.

The scan result is deterministic:

- use the question’s existing `awarded` mark if it has one;
- otherwise use `Math.max(1, question.marks - 1)`;
- mark the first `estimate` mark-scheme points as “Looks covered” and the rest as “Check this”;
- require some typed answer or an attached file;
- clearly say the prototype does not read or upload the file.

### Task 5 — Solutions tab, solution detail and Community integration

Add:

- `solutionsFor(questionId)` sorted by likes;
- `SolutionRow(post)`;
- `SolutionsPanel(question)`;
- `SolutionDetailScreen(questionId, solutionId)`;
- `toggleSolutionLike(post)`;
- `addSolutionComment(post, text)`.

The Solutions tab lists solutions with upvotes, a “Top solution” badge, comment counts and links to solution detail. Solution detail shows the full solution, its own comment thread and a comment form.

Community behaviour:

- students get the new solution-detail routes;
- teachers/reviewers keep the existing read-only modal for “Read full solution” and comments;
- staff likes are static text, not buttons.

Posting:

- “Share a solution” pre-fills the question via `state.solutionQuestionId`;
- after posting, redirect to that question’s Solutions tab;
- new posts use `liked: false`.

Result screen “Share my solution” also pre-fills the question.

### Task 6 — Discussion and Stats tabs

Add:

- `questionStats(question)`;
- `DiscussionPanel(question)`;
- `StatsPanel(question)`;
- `addDiscussionComment(questionId, text)`.

Discussion is one question-level thread with an empty state and a comment form.

Stats shows:

- appearances;
- years seen;
- papers;
- difficulty;
- marks;
- “No past appearances yet” for practice questions.

### Task 7 — Study coach

Rename the student Assistant tab label to **Coach** and the screen title to **Study coach**. Keep the route `/assistant`.

Add:

- general prompts including “Build me a revision roadmap”;
- an attach-question dropdown covering all questions;
- a file/photo attachment with visible file name;
- a roadmap reply built from `weakTopics()`;
- the existing revise, lost-mark and mark-scheme replies.

Extract `weakTopics()` from `ProgressScreen` so both screens share it.

### Task 8 — Sitemap, inspect notes, README and build banner

Finalise:

- `SCREENS` (S5A and updated summaries; every screen `status: "built"`);
- `INSPECT_NOTES` (all new keys, remove deleted keys, update old single-subject/Assistant copy);
- `README.md` (new model, controls, routes, assumptions, files table, next-pass notes);
- `build.mjs` banner: `Phases 0–5 · post-review revision`.

### Task 9 — Final audit

Check every route, inspect mode, mobile frame, copy rules and tokens. Rebuild `excelerate.html`. Report route count, screen count, inspect-note count, frame size and remaining prototype limitations.

---

## 8. Key decisions already made

Do not re-open these unless the user explicitly asks.

1. **No enrolment.** Subjects are catalogue areas, not something a student “has”.
2. **Teacher classes remain subject-specific.** A class is a teaching group.
3. **Question hub tabs:** Solve / Solutions / Discussion / Stats.
4. **Question header stays above the tabs** so switching tabs never loses the question.
5. **Question-level discussion plus per-solution comments.** They are separate.
6. **Staff Community is read-only via the existing modal.** Students get routes.
7. **Solve drafts survive tab switches in memory**, not page reloads.
8. **Scan/check is a deterministic sample**, not real image analysis.
9. **Walk me through uses authored `workedSteps`** for the four demo questions and falls back to mark-scheme points.
10. **Assistant becomes Coach** in the tab bar and **Study coach** on screen; route stays `/assistant`.
11. **Mobile frame is 430 px wide, fills available height up to 900 px, no scale transform.**
12. **Topics filter is route-based:** `/topics` for all, `/topics/<subjectId>` for one.
13. **Share gets a subject filter** over the whole question bank.
14. **No git repository.** Do not initialise one. Keep changes in the working files and rebuild.

---

## 9. Current limitations and assumptions

- All data is mock data and resets on reload.
- New solutions, comments, likes and profile edits are in memory only.
- Uploaded files stay in the browser and are not read or sent anywhere.
- The scan result and coach replies are canned.
- The placeholder diagram and code runner are not real subject tools.
- The reviewer queue and teacher class management are structural prototypes.
- The Google Fonts Inter link is optional; the build falls back to system fonts offline.
- The prototype has no real authentication. The role switcher bypasses sign-in.
- The current `README.md` still describes the old single-subject model and 390 × 844 frame. Update it as part of Task 8.

---

## 10. Definition of done

The revision is done when:

- `excelerate.html` is rebuilt from the updated source;
- `node scripts/verify.mjs` passes;
- `node --check src/app.js` and `node --check src/data.js` pass;
- every route in the plan renders without console errors or horizontal overflow;
- the top bar has no subject toggle;
- sign-up and Profile have no subject choice;
- Topics and Share have subject filters;
- the question hub has four working tabs;
- upload, scan/check, question help, draft survival, solution likes/comments, discussion comments and coach file attachment work in memory;
- the mobile frame is visibly larger and the bottom tab bar stays visible;
- every new element has an inspect note;
- the sitemap is complete;
- the README and build banner describe the revision;
- no student/teacher UI uses “generated”, “AI-generated” or “Generate”;
- no CAIE question text is copied.

---

## 11. Recommended execution

The implementation plan recommends **Native execution**: one implementer works through the tasks in this session, because the tasks share `src/app.js`, `src/styles.css` and the same state. Subagents would need to coordinate across the same large files and are more likely to conflict.

If the next harness uses subagents, assign tasks in order and keep one owner for `src/app.js` and `src/styles.css` at a time. Do not let two agents edit those files in parallel.

After implementation, run a fresh review of the whole change set before calling it finished.
