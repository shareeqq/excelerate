# Excelerate — structural prototype

A clickable, mobile-first prototype for **Excelerate**, a CAIE A Level exam practice platform for Computer Science (9618) and Physics (9702).

This is the **complete structural prototype (Phases 0–5) plus the post-review revision**: an open subject catalogue, a tabbed question hub, a larger mobile preview and a general Study coach. It is a wireframe you can click through, not the final UI. All data is mock data and there is no backend.

## Open it

**For the walkthrough:** open `excelerate.html` in any browser. It is one self-contained file and needs no installation or server.

**For development:** open `index.html` through a local server, then rebuild the single file after changes:

```powershell
python -m http.server 8765
# http://127.0.0.1:8765/index.html
node build.mjs
```

Routes are hash-based (`#/sitemap`, `#/topics`, `#/question/phy-kin-1/solutions`) so the prototype also works when opened straight from disk.

**To verify a change:**

```powershell
node scripts/verify.mjs              # static data, copy, token and build checks
node --check src/app.js              # the app still parses
node --check src/data.js             # the data still parses
node build.mjs                       # rebuild the single file
node scripts/browser-audit.mjs       # optional: drive headless Chrome (needs Chrome or Edge)
```

## Prototype controls

The strip above the app is deliberately outside it:

- **Student / Teacher / Reviewer** — preview each role's navigation without signing in.
- **Mobile app view** — puts the same screens in a **430 px-wide phone frame** that fills the available height up to 900 px, with a bottom tab bar.
- **Inspect mode** — hover or tap any part of the app for a short note on what it is, who uses it and where it leads.
- **List state** — preview the loading, empty and error versions of the main lists.
- **Foundations / Sitemap** — the design-system preview and the map of every screen by phase.

## The revision: open subjects and the question hub

**Subjects are a catalogue, not an enrolment.**

- There is no subject choice at sign-up and no subject choice in Profile.
- The top bar is now just the wordmark, notifications and profile.
- Home shows every subject as a way into the catalogue.
- Topics lists every subject with a subject filter, so `/topics` is all subjects and `/topics/physics` is one.
- The teacher Share screen filters the whole question bank by subject.
- Teacher classes still have a subject, because a class is a teaching group.

**One question, four tabs.** Opening a question shows the question header and then Solve, Solutions, Discussion and Stats. The header stays above the tabs, so switching tabs never loses the question. Each tab is its own route, so a tab can be linked to or reloaded directly.

- **Solve** — the answer box, an image/PDF upload with file name and image preview, **Scan and check**, a compact **Question help** panel (Hint / Walk me through / Check my working, plus a short question input), and the existing Submit, Save for later and workspace link.
- **Solutions** — every solution for the question, most liked first, with a Top solution badge, likes, comment counts and a link into each solution's own detail view.
- **Discussion** — one question-level thread, separate from the comments on a solution.
- **Stats** — appearances, years seen, papers, marks and difficulty.

**Study coach.** The old Assistant tab is now **Coach** in the tab bar and **Study coach** on screen, at the same `/assistant` route. It answers general planning prompts (including “Build me a revision roadmap”, built from the student's weakest topics), attaches any question in the bank, and attaches a file or photo whose name is shown with the message.

## What is built

**Phase 0 — Foundations**

- Warm design tokens in one place (`src/styles.css`): colour, type, spacing, radius.
- The app shell: wordmark, notification bell, profile link, role-based tabs (bottom bar on mobile, side rail on wide screens).
- Shared components with hover, focus, active, disabled and error states: button, input, textarea, select, tabs, card, list row, badge, filter bar, breadcrumb, empty state, modal, toast, avatar and list-state placeholders.
- Mock data for both subjects, both question kinds, mark schemes, attempts, question history, question discussion, community posts, teacher notes, notifications, classes and profiles (`src/data.js`).
- All inspect notes in the same data file, under `INSPECT_NOTES`.
- A sitemap listing every screen from Phase 0 to Phase 5, with routes where a screen exists.

**Phase 1 — Student core loop**

- S1 Sign up / Login with a log-in form, forgot-password note, and sign up for students or teachers. No subject choice.
- S2 Home with a continue card, a card per subject in the catalogue, recent attempts, and previews of community posts and teacher notes.
- S3 Topic browser listing every subject, with a subject filter, a live search and progress on every topic.
- S4 Topic page with past paper and practice tabs, year / paper / difficulty filters, and the empty practice state.
- S5 Question hub with the four tabs. The Solve tab has a styled upload control (choose or drop an image/PDF, with a file chip, a remove action and a contained image preview), **Scan and check** with a short checking simulation and plain-language feedback, and the Question help panel.
- S5A Solution detail with the full solution, its likes and a comment thread with replies. Solutions that contain pseudocode get a **Try this solution** button that loads the code into the workspace.
- S6 Result screen with the mark, earned and missed mark scheme points, feedback, and Next question / Retry / Share my solution.

**Phase 2 — Review and help layer**

- S7 Reviewer queue with subject and topic filters, status badges and automatic-check badges.
- S8 Review detail with the question, mark scheme, check reasons, closest past paper question, comment box and Approve / Edit / Reject / Save.
- S9 Study coach with an empty starting conversation, general prompts, an all-question context selector, a file attachment and canned local replies.
- S10 My progress with marks per topic, weak topics that open the Practice tab, and every past attempt.

**Phase 3 — Subject tools**

- S11 Code workspace in a LeetCode-style layout: the question and a fixed template on the left, a numbered editor with Run and Reset on the right, and an output console. The editor runs a small **pseudocode interpreter** (`src/pseudo.js`) that understands `DECLARE`, `INPUT`, `OUTPUT`, `IF`, `FOR`, `WHILE`, `REPEAT`, procedures and functions, arrays, and the usual operators — so the starter program really executes and errors name their line. A dry-run table and a final answer box sit below.
- S12 Diagram workspace for Physics: an adjustable force/angle diagram, Reset diagram, notes and an answer box.

**Physics and CS diagrams.** Questions carry a simple 2D figure drawn as inline SVG: falling bodies, force arrows, springs, the pump, wave superposition, a diffraction grating, circuits, quark composition, a queue with pointers, logic gates and a flowchart.

**Phase 4 — Community and teachers**

- S13 Community feed with search, subject, topic, question-type and year filters, likes, comment counts and full worked solutions. Students open the question hub; teachers and reviewers keep the read-only dialog.
- S14 Post a solution: choose a question (pre-filled when the composer is opened from a question), write the method, attach an optional file, preview and post.
- S15 Teacher notes (student view) grouped by topic, with a New badge for unseen notes.
- S16 Notifications for each role, with read and unread states; every item opens the related screen.
- S17 Teacher dashboard with classes, student counts, class codes and Create class.
- S18 Class detail with a student progress list and everything shared with the class.
- S19 Share notes or questions: choose classes, write or upload a note, or pick questions from the whole bank with a subject filter, then send.

**Phase 5 — Final pass**

- S20 Profile and settings with account details, Save and Sign out. No subject choice.
- Loading, empty and error states for the main lists, previewable from the prototype strip.
- Larger-screen layout checks and a final inspect-note / sitemap audit.

## Routes

```text
#/                        #/foundations             #/sitemap
#/login                   #/topics                  #/topics/<subjectId>
#/topic/<topicId>         #/topic/<topicId>/practice
#/question/<questionId>   #/question/<id>/solutions  #/question/<id>/solutions/<solutionId>
#/question/<id>/discussion  #/question/<id>/stats
#/result/<questionId>     #/code/<questionId>       #/diagram/<questionId>
#/queue                   #/review/<reviewId>       #/assistant
#/progress                #/community              #/post-solution
#/notes                   #/notifications          #/dashboard
#/classes                 #/class/<classId>        #/share
#/profile
```

## Assumptions

- **Single file, no build tooling for the user.** The source is split for editing, and `build.mjs` inlines it into `excelerate.html`.
- **No student enrolment.** Subjects are catalogue areas anyone can browse. There is no “my subjects” list, no top-bar subject switch and no subject stored on the account. An older saved subject value in local storage is ignored.
- **Teacher classes keep a subject**, because a class is a teaching group rather than a student enrolment.
- **Hash routes.** A single file cannot rewrite `/sitemap` on disk, so the sitemap lives at `#/sitemap`.
- **Temporary Foundations route.** The design-system preview stays at `#/foundations`; the student Home tab is the real S2 screen.
- **Sign in from the sitemap.** The prototype is already inside the app, so S1 is reached from the sitemap or Profile → Sign out. Logging in or signing up simply continues into the chosen role.
- **Mock marking.** Submitting an answer opens a sample result built from the question's mark scheme. No answer is checked.
- **The scan and check is a sample.** It pauses briefly to simulate reading the working, then compares the question's mark scheme with itself, uses the existing awarded mark when there is one, and never reads or uploads the attached file. It needs some typed working or an attached file before it shows a result, and its feedback is written from the mark-scheme points, not from the answer.
- **The pseudocode runner is a small interpreter, not a compiler.** It supports one-dimensional arrays, procedures and functions, and the usual control flow; it has no file I/O, records, classes or 2D arrays, and it stops after 400,000 steps or 60 nested calls.
- **Diagrams are hand-built inline SVG.** No charting library is loaded, so the single file stays self-contained and every figure follows the warm tokens.
- **Drafts are session-only.** A typed answer, an attachment name, an image preview, the last scan result and the help conversation survive switching between question tabs, but not a page reload.
- **Walk me through uses authored steps** for the four demo questions and falls back to the mark scheme for the rest.
- **Likes, new solutions and new comments are in memory.** They reset on reload. A like updates the same post the community feed shows.
- **Role tabs are provisional.** Teacher: Dashboard, Classes, Share, Community. Reviewer: Queue, Community.
- **Classes tab.** It shows the full class list; the dashboard shows the same classes with summary numbers, and each class opens S18.
- **Teacher notes.** Notes are grouped by topic and open in a modal rather than a separate screen, so no extra screen is invented.
- **List states.** The list-state control is prototype-only. It changes the main lists so the empty, loading and error designs can be inspected.
- **Error colour.** The condensed Warm rules do not define one, so error states use the brand crimson token (`--error`).
- **Question content.** All stems and mark scheme points are invented in the style of the attached 9702/22 and 9618/22 papers. No CAIE text is copied.
- **List counts.** Topics and classes show realistic sizes while the prototype renders a small sample of questions and students.
- **The mobile frame is 430 px wide** and fills the available height up to 900 px. On narrow windows the width becomes `min(430px, 100vw − 24px)`. There is no scale transform.
- **No file is read or sent anywhere.** Uploads stay in the browser.

## Files

| File | Purpose |
| --- | --- |
| `excelerate.html` | Shareable single-file build |
| `index.html` | Development shell |
| `src/styles.css` | Design tokens, shared components, app shell, screen styles |
| `src/pseudo.js` | The pseudocode interpreter used by the code workspace |
| `src/data.js` | Mock data, figures, screen map, inspect notes |
| `src/app.js` | Routing, state, inspect mode, screen templates and event wiring |
| `build.mjs` | Inlines the source into `excelerate.html` |
| `scripts/verify.mjs` | Static verification harness (`node scripts/verify.mjs`) |
| `scripts/browser-audit.mjs` | Optional headless-Chrome interaction audit |
| `scripts/screenshot.mjs` | Optional: captures `docs/preview/*.png` from the mobile preview |

## Notes for the next pass

- Replace the mock marking, the sample scan and the canned coach replies with real services when the backend exists.
- Add real file analysis (OCR for photos, PDF text extraction) and a real submission pipeline.
- Extend the pseudocode runner towards the full 9618 command set (records, 2D arrays, files, `CASE`).
- Persist drafts, code, solutions, likes and comments beyond the browser session.
- If interactive graphs are needed later, adopt a dedicated library (Mafs or JSXGraph for graphs, Mermaid if flowcharts should be written as text) rather than hand-building every scene.
- Confirm the provisional teacher and reviewer tabs.
- Turn the list-state preview into real request states once data loading is wired up.
- Replace the placeholder diagram and code runner with subject-specific tools.
