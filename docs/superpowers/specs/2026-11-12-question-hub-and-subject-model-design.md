# Excelerate revision: larger preview, open subjects, and the question hub

Date: 12 November 2026
Status: approved 12 November 2026
Prototype: `excelerate.html` (single-file build), source in `src/`

## 1. Why this change

The prototype currently behaves as if a student belongs to one subject at a time. A top-bar toggle switches the whole app between Computer Science and Physics, and the choice is stored in `state.subject`. That model does not fit an open exam-preparation app: a student can browse any subject, and a teacher can share across classes with different subjects.

The question screen is also only an answer form. The community lives in a separate feed, so the question, its solutions, its discussion and its statistics are not connected.

This revision changes the product model and makes the question screen the place where a question lives.

## 2. Goals

1. Make the mobile preview noticeably larger and easier to read.
2. Remove the Computer Science / Physics toggle and the idea of student subject enrolment.
3. List all subjects, with subject filtering in Topics and the teacher Share bank.
4. Turn the question screen into a tabbed hub: Solve, Solutions, Discussion, Stats.
5. Add image/file upload and a static “scan and check” result to the Solve tab.
6. Add a compact question helper inside the Solve tab.
7. Rename the separate Assistant tab to a general **Study coach** that can help with roadmaps and planning, attach a question, and attach a file.
8. Keep everything static and in-memory. No backend, no live model, no real file analysis.

## 3. Non-goals

- No real authentication, enrolment, class membership or persistence beyond the existing prototype state.
- No real image scanning, OCR, marking or model calls.
- No change to the reviewer queue or review workflow.
- No new teacher class-management behaviour beyond a subject filter in Share.
- No real CAIE question text. All question and mark-scheme content stays invented.

## 4. Product model

### 4.1 Subjects are catalogue areas, not enrolments

- A student can browse every subject. There is no “my subjects” list and no subject stored on the account.
- The top-bar subject switcher is removed.
- Sign-up no longer asks for a subject.
- Profile no longer has a subject choice.
- Home shows all available subjects as entry points into the catalogue.
- Topics shows all subjects by default and has a subject filter.
- The teacher Share screen has a subject filter over the question bank.
- Teacher classes still have a subject because a class is a teaching group, not a student enrolment.

### 4.2 The question hub

Opening a question shows the question header and then four tabs. The question header is always rendered above the tabs; it is not sticky, so long question text does not trap the viewport.

Tabs:

1. **Solve** — answer form, upload, scan/check, question help, save, workspace, submit.
2. **Solutions** — solutions for this question, sorted by upvotes, with a link to each solution detail.
3. **Discussion** — one question-level forum thread.
4. **Stats** — how often the question has appeared, which years and papers, difficulty and marks.

Each solution has its own detail view with the full solution, a like action and its own comment thread.

### 4.3 Attempt tools

The Solve tab adds:

- **Upload your working**: image or PDF, with the file name shown. Images may show a small local thumbnail.
- **Scan and check**: a static sample result that compares the answer or file with the mark scheme and shows an estimated mark and which points look covered. It is clearly labelled as a prototype sample and never uploads the file.
- **Question help**: a compact panel with `Hint`, `Walk me through` and `Check my working`, plus a short “Ask about this question” input. Replies are canned and appear inline.
- Existing `Submit answer`, `Save for later` and subject workspace link remain.

`Walk me through` shows the method steps and the final line, labelled as a worked solution, so it satisfies the “solve this question” request without pretending to be a live model.

### 4.4 Study coach

The student tab currently called **Assistant** becomes **Coach** in the tab bar and **Study coach** on the screen. The route stays `/assistant` to avoid breaking existing links.

It supports:

- general prompts such as “Build me a revision roadmap”, “What should I revise?”, “Explain a mark scheme” and “How do I plan my week?”;
- a free-text message box;
- an attach-question dropdown covering the whole question bank;
- a file/photo attachment with the file name shown;
- canned replies, with the roadmap reply built from the student’s weak topics.

The in-question helper and the Study coach share the same static reply logic where possible, but the in-question helper is focused on the current question and does not need the full chat layout.

## 5. Mobile preview

Replace the current fixed 390 × 844 canvas that is scaled down to fit the window.

New behaviour:

- The mobile frame is **430 px wide**.
- Its height fills the available browser height below the prototype bar, capped at **900 px**.
- It does not use a scale transform for normal use.
- On narrow windows, width becomes `min(430px, 100vw - 24px)`.
- The stage uses a small 12 px gap around the frame.
- The app still scrolls inside `.app-main`; the bottom tab bar stays fixed inside the frame.

At a 1000 × 700 browser window this gives a frame around 430 × 600 instead of the current ~237 × 514. At a 1080p window it reaches the 430 × 900 cap.

The existing **Mobile app view** toggle remains. The full-width preview remains unchanged.

## 6. Routes

Existing routes stay. New or changed routes:

| Route | Screen |
| --- | --- |
| `/topics` | All subjects |
| `/topics/<subjectId>` | Topics filtered to one subject |
| `/question/<questionId>` | Question hub, Solve tab |
| `/question/<questionId>/solutions` | Solutions tab |
| `/question/<questionId>/solutions/<solutionId>` | Solution detail and comments |
| `/question/<questionId>/discussion` | Question-level discussion |
| `/question/<questionId>/stats` | Question statistics |
| `/assistant` | Study coach (same route, new label) |
| `/post-solution` | Composer, optionally pre-filled with a question |

Question sub-routes are student-only, matching the current question routes. The community feed remains available to teachers and reviewers. For teacher and reviewer accounts, the feed keeps its current read-only modal for “Read full solution” and comments; it does not link into the student question hub. Student accounts get the new solution-detail links. This avoids changing the review workflow or adding a read-only staff version of the Solve tab.

`detailRoute` needs to parse question sub-paths. `isActiveTab` should treat `/topics/<id>` as the Topics tab and question sub-routes as no tab (the question hub is reached from a topic).

## 7. Data changes

All data remains invented and local.

### 7.1 Question history

Add a `QUESTION_HISTORY` map keyed by question id:

```js
{
  "phy-kin-1": { years: [2023, 2021, 2019, 2018], papers: [2, 2, 1, 2], frequency: 4 }
}
```

Fallback for a past question with no entry: use its existing `year` and `paper` as a single appearance.
Fallback for a practice question: no appearances.

Add a `questionStats(question)` helper that returns appearances, years, papers and a display label.

### 7.2 Question discussion

Add a `QUESTION_DISCUSSION` map keyed by question id:

```js
{
  "phy-kin-1": [
    { author: "Maya R.", text: "...", time: "2 hours ago" }
  ]
}
```

Questions with no entry show the empty state. New comments are appended in memory.

### 7.3 Solutions

Reuse `COMMUNITY_POSTS` as the solution store. A solution already has `questionId`, `likes`, `comments` and `commentList`.

Add:

- `liked: false` to each post;
- a few extra mock solutions and solution comments for the demo questions;
- a question-level discussion thread for at least `phy-kin-1` and `cs-prog-1`.

Solutions for a question are `COMMUNITY_POSTS.filter(post => post.questionId === id)`, sorted by `likes` descending. The highest-liked solution gets a “Top solution” badge.

New solutions and comments are in memory and reset on reload.

### 7.4 Worked steps for question help

Add a `workedSteps` array to the main demo questions used by the hub (at least `phy-kin-1`, `phy-dyn-1`, `cs-prog-1` and `cs-db-1`). Each entry is one short method step, and the last entry is the final line.

For any question without `workedSteps`, the helper falls back to the existing `markScheme` points in order, with the `earned` flags removed. That keeps the bank usable without rewriting every question.

The scan/check sample is deterministic:

- if the question has an existing attempt with an `awarded` mark, use that as the sample estimate;
- otherwise use `Math.max(1, question.marks - 1)`;
- mark the first `estimate` mark-scheme points as “Looks covered” and the rest as “Check this”;
- show a clear “Sample check” label and the line “This prototype does not read or upload your file.”

“Scan and check” requires either some typed working or an attached file. With neither, show a friendly inline message rather than a result.

### 7.5 Coach prompts

Add general prompts to `ASSISTANT_PROMPTS`, including “Build me a revision roadmap”. Keep the existing question and mark-scheme prompts.

## 8. State changes

Remove `subject` from the persisted state and from `loadState`/`persist`.

Add in-memory-only state where needed:

- `solutionQuestionId` for pre-filling the Post solution composer from a question or result screen;
- `questionDrafts` keyed by question id, holding the typed answer, attached file name, local image preview URL, the last scan result and the inline helper messages;
- no student subject choice;
- no separate “enrolled subjects” list.

Because every hub tab is a route and `render()` replaces the screen, the Solve tab reads from `questionDrafts` when it is rebuilt. A student can type an answer, attach a file, run a check, open Solutions or Discussion, and come back without losing the draft. The file input itself cannot be repopulated after a re-render, so the panel shows the attached file name and, for images, the local preview; the scan result stays visible. Drafts are session-only and reset on reload.

The existing `mobileView`, `inspect`, `role` and `listState` state stays.

Old localStorage values containing `subject` are ignored.

## 9. Screen and component changes

### 9.1 Shell

- Remove the subject switcher from the top bar.
- Top bar becomes: wordmark, notifications, profile.
- Remove the `shell.subjectSwitcher` inspect note.
- Update top-bar and Home/tab inspect copy that refers to switching subjects.
- The mobile frame CSS and `updateDeviceScale` logic change as described in section 5.

### 9.2 Home

- Wording changes from “both subjects” / “your subjects” to “all subjects” / “Browse by subject”.
- Subject cards link to `/topics/<subjectId>`.
- The continue card still uses the latest attempt; if there are no attempts, fall back to the first topic in the first subject.

### 9.3 Topics

- Show all topics from all subjects by default.
- Add a subject filter: `All subjects` plus one option per subject.
- Changing the filter navigates to `/topics` or `/topics/<subjectId>`.
- Each topic row shows a subject badge or subject code.
- Search filters topic names and descriptions across the current subject view.
- The count updates for the combined search and subject filter.
- List states still apply.

### 9.4 Question hub

New shared pieces:

- `QuestionHeader(question)` — breadcrumb, badges, title, source, question card.
- `QuestionTabs(question, active)` — route links for Solve, Solutions, Discussion, Stats.
- `SolvePanel(question)` — answer form, upload, scan result, question help.
- `SolutionsPanel(question)` — sorted solution list and empty state.
- `SolutionDetailScreen(questionId, solutionId)` — full solution, like, comments, comment form.
- `DiscussionPanel(question)` — question-level thread and comment form.
- `StatsPanel(question)` — appearances, years, papers, difficulty, marks.

The existing `ResultScreen` stays. “Share my solution” links to the composer with the question pre-filled.

### 9.5 Community

- Keep the feed and its subject/topic filters.
- Change “Read full solution” and the comment count to open the solution detail route.
- Like actions update the same post object used by the question hub.
- After posting a solution, go to that question’s Solutions tab and show a toast.
- The composer pre-selects `state.solutionQuestionId` when present.

### 9.6 Study coach

- Rename the tab label to `Coach` and the screen title to `Study coach`.
- Update the intro copy to cover planning and general study help.
- Add the general prompts.
- Attach-question dropdown lists all questions with subject and topic.
- Add a file/photo field and show the attached file name in the message context.
- Keep canned replies and the existing chat history behaviour.

### 9.7 Share

- Remove the dependency on `state.subject`.
- Add a subject filter over the question bank.
- Show subject, topic, marks and difficulty in each question choice.
- Keep the note/file upload and class selection unchanged.

### 9.8 Profile and sign-up

- Remove the subject choice from Profile.
- Update the Profile lede.
- Remove the subject fieldset from Sign up.
- Update the S1 and S20 sitemap summaries and inspect notes.

## 10. Copy rules

- No “generated”, “AI-generated” or “Generate” in student or teacher UI.
- No raw hex in components. Use the existing warm tokens.
- No gradients and no resting shadows beyond the existing device frame.
- 2 px radius except avatars, radios, toggles and status dots.
- Review statuses stay on reviewer screens only.
- Scan and coach replies must be honest about being prototype samples.
- Do not copy CAIE question text.

## 11. Inspect mode, sitemap and docs

Add inspect notes for:

- question tabs;
- upload and scan/check;
- question help;
- solutions list and solution detail;
- solution comments;
- question discussion;
- question stats;
- Topics subject filter;
- Share subject filter;
- Study coach prompts, attach-question and file attachment.

Update existing notes that mention:

- the subject switcher;
- “both subjects” or “your subjects”;
- the Assistant tab;
- Profile subject choice;
- Sign-up subject choice;
- the question screen being only an answer form.

Update `SCREENS`:

- S1 Sign up / Login — no subject choice.
- S2 Home — all subjects, no enrolment.
- S3 Topic browser — all subjects plus filter.
- S5 Question screen — question hub with tabs.
- Add S5A Solution detail — full solution and comments.
- S9 — Study coach.
- S13 Community feed — solutions link to question hub.
- S14 Post a solution — can be pre-filled from a question.
- S19 Share — subject filter.
- S20 Profile — no subject choice.

Update the README with the new model, controls, routes, assumptions and next-pass notes. Update the build banner to say this is a post-Phase 5 revision.

## 12. Assumptions

- The app is open to all subjects; there is no student enrolment model.
- Teacher classes still have a subject, because a class is a teaching group.
- Question history is mock data. Practice questions have no past appearances.
- Uploaded files stay in the browser. No file is read or sent anywhere.
- Scan results and coach replies are canned. The scan result is based on the question’s mark scheme, not on the file contents.
- Solve-tab drafts survive tab switches in memory for the session, but not a page reload.
- “Walk me through” uses authored `workedSteps` for the main demo questions and falls back to the mark scheme for the rest.
- Likes, new solutions and new comments are in-memory only.
- The question hub is student-facing. Teacher and reviewer community views remain read-only and keep the existing modal for full solutions and comments.

## 13. Verification

- `node --check src/app.js` and `node --check src/data.js`.
- `node build.mjs` produces a current single-file build.
- Route audit covers the new question sub-routes, filtered topics and solution detail.
- No missing inspect notes, duplicate IDs, unlabeled fields or horizontal overflow.
- Mobile check at 1000 × 700: frame is around 430 × 600, bottom tab bar visible, no page-level horizontal scroll.
- Check at a tall window: frame reaches the 430 × 900 cap.
- Check that the subject toggle is gone from the top bar and from sign-up/profile.
- Check that upload, scan/check, question help, solution like/comment, discussion comment and coach file attachment all work in memory.
- Check that a typed answer, attachment name and scan result survive switching between question tabs.
- Check that teacher/reviewer community cards still open the read-only modal rather than a student route.
- Check that no student/teacher copy uses “generated”, “AI-generated” or “Generate”.
