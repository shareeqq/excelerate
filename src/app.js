/* ============================================================
   Excelerate — prototype shell, routing and inspect mode
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "excelerate.proto.v1";

  var ROLE_LABELS = {
    student: "Student",
    teacher: "Teacher",
    reviewer: "Reviewer"
  };

  var ROLE_HOME = {
    student: "/",
    teacher: "/dashboard",
    reviewer: "/queue"
  };

  var ROLE_TABS = {
    student: [
      { id: "home", label: "Home", route: "/", icon: "home", screenId: null },
      { id: "topics", label: "Topics", route: "/topics", icon: "grid", screenId: "s3" },
      { id: "community", label: "Community", route: "/community", icon: "users", screenId: "s13" },
      { id: "assistant", label: "Coach", route: "/assistant", icon: "chat", screenId: "s9" },
      { id: "progress", label: "Progress", route: "/progress", icon: "chart", screenId: "s10" }
    ],
    teacher: [
      { id: "dashboard", label: "Dashboard", route: "/dashboard", icon: "dashboard", screenId: "s17" },
      { id: "classes", label: "Classes", route: "/classes", icon: "users", screenId: "s18" },
      { id: "share", label: "Share", route: "/share", icon: "share", screenId: "s19" },
      { id: "community", label: "Community", route: "/community", icon: "grid", screenId: "s13" }
    ],
    reviewer: [
      { id: "queue", label: "Queue", route: "/queue", icon: "queue", screenId: "s7" },
      { id: "community", label: "Community", route: "/community", icon: "grid", screenId: "s13" }
    ]
  };

  var COMMON_ROUTES = ["/foundations", "/sitemap", "/notifications", "/login", "/profile"];

  var STUDENT_EXTRA_ROUTES = ["/notes", "/post-solution"];

  var STUDENT_DETAIL_PREFIXES = ["/topics/", "/topic/", "/question/", "/result/", "/code/", "/diagram/"];
  var TEACHER_DETAIL_PREFIXES = ["/class/"];
  var REVIEWER_DETAIL_PREFIXES = ["/review/"];

  var PHASE_TITLES = {
    0: "Foundations",
    1: "Student core loop",
    2: "Review and help layer",
    3: "Subject tools",
    4: "Community and teachers",
    5: "Final pass"
  };

  var TOKEN_LIST = [
    { name: "Paper surface", token: "--paper", use: "Page background" },
    { name: "Panel", token: "--panel", use: "Default panel" },
    { name: "Featured panel", token: "--panel-featured", use: "Selected panel" },
    { name: "Heading ink", token: "--ink", use: "Headings" },
    { name: "Body ink", token: "--body", use: "Body text" },
    { name: "Muted text", token: "--muted", use: "Labels and meta" },
    { name: "Brand crimson", token: "--brand", use: "Primary actions" },
    { name: "Hairline", token: "--hairline", use: "Borders" }
  ];

  function svg(paths) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  var ICONS = {
    home: svg('<path d="M3 10.5L12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path>'),
    grid: svg('<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>'),
    users: svg('<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><path d="M16 5.5a3 3 0 010 5.8"></path><path d="M18 20c0-2.5-1.2-4.7-3-6"></path>'),
    chat: svg('<path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z"></path><path d="M8 11h8M8 15h5"></path>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>'),
    dashboard: svg('<rect x="3" y="3" width="8" height="8"></rect><rect x="13" y="3" width="8" height="5"></rect><rect x="13" y="10" width="8" height="11"></rect><rect x="3" y="13" width="8" height="8"></rect>'),
    share: svg('<path d="M12 16V3"></path><path d="M7 8l5-5 5 5"></path><path d="M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5"></path>'),
    queue: svg('<path d="M8 6h13M8 12h13M8 18h13"></path><circle cx="3.5" cy="6" r="1"></circle><circle cx="3.5" cy="12" r="1"></circle><circle cx="3.5" cy="18" r="1"></circle>'),
    bell: svg('<path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10.5 21a2 2 0 003 0"></path>'),
    user: svg('<circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"></path>'),
    chevron: svg('<path d="M9 6l6 6-6 6"></path>'),
    upload: svg('<path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M4 20h16"></path>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"></path>'),
    play: svg('<path d="M7 4l13 8-13 8z"></path>'),
    reset: svg('<path d="M4 4v6h6"></path><path d="M4.5 10a8 8 0 1 1 1.5 6"></path>'),
    terminal: svg('<path d="M4 6h16v12H4z"></path><path d="M8 10l2 2-2 2"></path><path d="M13 14h4"></path>'),
    spark: svg('<path d="M12 3l1.7 4.6L18.5 9.5l-4.8 1.9L12 16l-1.7-4.6L5.5 9.5l4.8-1.9z"></path><path d="M18 16.5l.8 2.1 2.2.9-2.2.9-.8 2.1-.8-2.1-2.2-.9 2.2-.9z"></path>')
  };

  var app = document.getElementById("app");
  var topbar = document.getElementById("topbar");
  var sidenav = document.getElementById("sidenav");
  var tabbar = document.getElementById("tabbar");
  var screen = document.getElementById("screen");
  var protoBar = document.getElementById("protoBar");
  var inspectCard = document.getElementById("inspectCard");
  var inspectTitle = document.getElementById("inspectTitle");
  var inspectBody = document.getElementById("inspectBody");
  var mobileToggle = document.getElementById("mobileViewToggle");
  var inspectToggle = document.getElementById("inspectToggle");
  var listStateSelect = document.getElementById("listStateSelect");
  var toast = document.getElementById("toast");

  var state = loadState();
  state.route = ROLE_HOME[state.role];
  state.questionDrafts = {};
  state.solutionQuestionId = null;
  state.codeDrafts = {};
  state.codePrefill = null;

  var inspectedEl = null;
  var pinned = false;
  var assistantMessages = ASSISTANT_MESSAGES.slice();
  var coachFile = "";
  var toastTimer = null;

  /* ---------- Small helpers ---------- */

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3500);
  }

  function screenById(id) {
    return SCREENS.find(function (item) {
      return item.id === id;
    });
  }

  function phaseLabel(phase) {
    return "Phase " + phase;
  }

  function subjectById(id) {
    return SUBJECTS.find(function (item) {
      return item.id === id;
    });
  }

  function topicById(id) {
    for (var i = 0; i < SUBJECTS.length; i += 1) {
      var topic = SUBJECTS[i].topics.find(function (item) {
        return item.id === id;
      });
      if (topic) return { topic: topic, subject: SUBJECTS[i] };
    }
    return null;
  }

  function questionById(id) {
    return QUESTIONS.find(function (item) {
      return item.id === id;
    });
  }

  function questionsFor(topicId, kind) {
    return QUESTIONS.filter(function (item) {
      return item.topicId === topicId && (!kind || item.kind === kind);
    });
  }

  function detailRoute(route) {
    if (route.indexOf("/topics/") === 0) return { name: "topics", id: route.slice(8) };
    if (route.indexOf("/topic/") === 0) {
      var parts = route.slice(7).split("/");
      return { name: "topic", id: parts[0], tab: parts[1] === "practice" ? "practice" : "past" };
    }
    if (route.indexOf("/question/") === 0) {
      var questionParts = route.slice(10).split("/");
      if (questionParts[1] === "solutions" && questionParts[2]) {
        return { name: "solution", questionId: questionParts[0], solutionId: questionParts[2] };
      }
      if (questionParts[1] === "solutions") return { name: "question", id: questionParts[0], tab: "solutions" };
      if (questionParts[1] === "discussion") return { name: "question", id: questionParts[0], tab: "discussion" };
      if (questionParts[1] === "stats") return { name: "question", id: questionParts[0], tab: "stats" };
      return { name: "question", id: questionParts[0], tab: "solve" };
    }
    if (route.indexOf("/result/") === 0) return { name: "result", id: route.slice(8) };
    if (route.indexOf("/review/") === 0) return { name: "review", id: route.slice(8) };
    if (route.indexOf("/code/") === 0) return { name: "code", id: route.slice(6) };
    if (route.indexOf("/diagram/") === 0) return { name: "diagram", id: route.slice(9) };
    if (route.indexOf("/class/") === 0) return { name: "class", id: route.slice(7) };
    return null;
  }

  function classById(id) {
    return CLASSES.find(function (item) {
      return item.id === id;
    });
  }

  function reviewById(id) {
    return REVIEW_ITEMS.find(function (item) {
      return item.id === id;
    });
  }

  function questionForReview(review) {
    return review ? questionById(review.questionId) : null;
  }

  function allTopics() {
    var entries = [];
    SUBJECTS.forEach(function (subject) {
      subject.topics.forEach(function (topic) {
        entries.push({ subject: subject, topic: topic });
      });
    });
    return entries;
  }

  function formatDate(value) {
    var date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) return value;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getDate() + " " + months[date.getMonth()];
  }

  function progressPercent(done, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }

  function attemptFor(questionId) {
    return ATTEMPTS.find(function (item) {
      return item.questionId === questionId;
    });
  }

  function continueTopic() {
    var latest = ATTEMPTS.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    })[0];
    if (latest) {
      var question = questionById(latest.questionId);
      if (question) {
        var found = topicById(question.topicId);
        if (found) return found;
      }
    }
    return { topic: SUBJECTS[0].topics[0], subject: SUBJECTS[0] };
  }

  function nextQuestion(question) {
    var sameTopic = questionsFor(question.topicId);
    var index = sameTopic.findIndex(function (item) {
      return item.id === question.id;
    });
    if (index !== -1 && index < sameTopic.length - 1) return sameTopic[index + 1];

    var subject = subjectById(question.subjectId);
    if (!subject) return null;
    var topicIndex = subject.topics.findIndex(function (item) {
      return item.id === question.topicId;
    });
    for (var i = topicIndex + 1; i < subject.topics.length; i += 1) {
      var next = questionsFor(subject.topics[i].id);
      if (next.length) return next[0];
    }
    return null;
  }

  /* ---------- Persistence ---------- */

  function loadState() {
    var base = { role: "student", mobileView: false, inspect: false, listState: "default" };
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      var saved = JSON.parse(raw);
      // Older builds saved a "subject". Subjects are no longer enrolment,
      // so any saved value is ignored.
      return {
        role: ROLE_TABS[saved.role] ? saved.role : base.role,
        mobileView: Boolean(saved.mobileView),
        inspect: Boolean(saved.inspect),
        listState: ["default", "loading", "empty", "error"].indexOf(saved.listState) !== -1 ? saved.listState : base.listState
      };
    } catch (error) {
      return base;
    }
  }

  /* ---------- Question hub: drafts and sample checks ---------- */

  function draftFor(questionId) {
    if (!state.questionDrafts[questionId]) {
      state.questionDrafts[questionId] = {
        answer: "",
        fileName: "",
        fileSize: "",
        fileType: "",
        fileUrl: "",
        scan: null,
        scanning: false,
        scanNotice: "",
        helpMessages: []
      };
    }
    return state.questionDrafts[questionId];
  }

  function formatBytes(size) {
    if (!size && size !== 0) return "";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

  function saveDraft(questionId, patch) {
    Object.assign(draftFor(questionId), patch);
  }

  function sampleScan(question, draft) {
    var hasAnswer = Boolean((draft.answer || "").trim());
    var hasFile = Boolean(draft.fileName);
    if (!hasAnswer && !hasFile) {
      return { hasInput: false, estimate: 0, total: question.marks, points: [] };
    }
    var estimate = typeof question.awarded === "number"
      ? question.awarded
      : Math.max(1, question.marks - 1);
    estimate = Math.max(1, Math.min(question.marks, estimate));
    var points = (question.markScheme || []).map(function (point, index) {
      return { point: point.point, covered: index < estimate };
    });
    return { hasInput: true, estimate: estimate, total: question.marks, points: points };
  }

  function questionHelpReply(mode, question) {
    if (mode === "hint") {
      return "Start with the quantities or inputs the question gives you. The first mark usually comes from writing the method line before substituting.";
    }
    if (mode === "walk") {
      if (Array.isArray(question.workedSteps) && question.workedSteps.length) {
        return question.workedSteps.join("\n");
      }
      return (question.markScheme || []).map(function (point) {
        return point.point;
      }).join("\n");
    }
    return "Use Scan and check above to see a sample mark-scheme comparison.";
  }

  function questionHelpText(question, text) {
    var lower = text.toLowerCase();
    var first = question.markScheme && question.markScheme.length ? question.markScheme[0].point : "the method line";
    if (lower.indexOf("unit") !== -1) {
      return "Every final answer needs its unit. Distance is in metres and speed is in metres per second. Write the unit on the same line as the value.";
    }
    if (lower.indexOf("why") !== -1) {
      return "Start from the line the mark scheme expects, then say what each quantity means. For this question that line is: " + first;
    }
    return "For this question, write the method line first, then substitute, then state the answer with its unit. Use Walk me through if you want the full method.";
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        role: state.role,
        mobileView: state.mobileView,
        inspect: state.inspect,
        listState: state.listState
      }));
    } catch (error) {
      /* Storage can be unavailable on a locked-down browser. */
    }
  }

  /* ---------- Routing ---------- */

  function hashRoute() {
    var raw = location.hash.replace(/^#/, "");
    if (!raw) return "";
    return raw.charAt(0) === "/" ? raw : "/" + raw;
  }

  function currentRoute() {
    return hashRoute() || ROLE_HOME[state.role];
  }

  function isAllowed(route) {
    if (COMMON_ROUTES.indexOf(route) !== -1) return true;
    if (state.role === "student") {
      if (STUDENT_EXTRA_ROUTES.indexOf(route) !== -1) return true;
      if (STUDENT_DETAIL_PREFIXES.some(function (prefix) {
        return route.indexOf(prefix) === 0;
      })) return true;
    }
    if (state.role === "teacher") {
      if (TEACHER_DETAIL_PREFIXES.some(function (prefix) {
        return route.indexOf(prefix) === 0;
      })) return true;
    }
    if (state.role === "reviewer") {
      if (REVIEWER_DETAIL_PREFIXES.some(function (prefix) {
        return route.indexOf(prefix) === 0;
      })) return true;
    }
    return ROLE_TABS[state.role].some(function (tab) {
      return tab.route === route;
    });
  }

  function roleForRoute(route) {
    if (COMMON_ROUTES.indexOf(route) !== -1) return null;
    var roles = Object.keys(ROLE_TABS);
    for (var i = 0; i < roles.length; i += 1) {
      var match = ROLE_TABS[roles[i]].some(function (tab) {
        return tab.route === route;
      });
      if (match) return roles[i];
    }
    if (STUDENT_EXTRA_ROUTES.indexOf(route) !== -1) return "student";
    if (route === "/") return "student";
    if (STUDENT_DETAIL_PREFIXES.some(function (prefix) {
      return route.indexOf(prefix) === 0;
    })) return "student";
    if (TEACHER_DETAIL_PREFIXES.some(function (prefix) {
      return route.indexOf(prefix) === 0;
    })) return "teacher";
    if (REVIEWER_DETAIL_PREFIXES.some(function (prefix) {
      return route.indexOf(prefix) === 0;
    })) return "reviewer";
    return null;
  }

  function syncRoute() {
    var route = currentRoute();
    if (!isAllowed(route)) {
      route = ROLE_HOME[state.role];
      history.replaceState(null, "", "#" + route);
    }
    state.route = route;

    render();
    resetScroll();
    refreshInspect();
  }

  function navigate(route) {
    if (location.hash === "#" + route) {
      syncRoute();
      return;
    }
    location.hash = route;
  }

  function resetScroll() {
    if (state.mobileView) {
      screen.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }

  /* ---------- Layout ---------- */

  function isWide() {
    return !state.mobileView && window.innerWidth >= 1024;
  }

  function applyLayout() {
    var wide = isWide();
    app.classList.toggle("app--wide", wide);
    app.classList.toggle("app--mobile", !wide);
    document.body.classList.toggle("view-mobile", state.mobileView);
    updateDeviceScale();
  }

  function updateDeviceScale() {
    // The phone frame is sized in CSS now, so there is no scale to compute.
    // The hook is kept so the layout call sites stay simple.
    document.documentElement.style.removeProperty("--device-scale");
  }

  function updateProtoHeight() {
    document.documentElement.style.setProperty("--proto-h", protoBar.offsetHeight + "px");
  }

  /* ---------- Chrome ---------- */

  function renderTopbar() {
    var unread = NOTIFICATIONS.filter(function (item) {
      return item.unread && item.audience === state.role;
    }).length;

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
  }

  function isActiveTab(route) {
    if (route === "/topics") {
      return state.route === "/topics" || state.route.indexOf("/topics/") === 0;
    }
    return state.route === route;
  }

  function renderNav() {
    var tabs = ROLE_TABS[state.role];

    sidenav.innerHTML =
      '<p class="sidenav__label">' + ROLE_LABELS[state.role] + " screens</p>" +
      '<ul class="sidenav__list">' +
        tabs.map(function (tab) {
          return '<li><a class="sidenav__link" href="#' + tab.route + '"' +
            (isActiveTab(tab.route) ? ' aria-current="page"' : "") +
            ' data-inspect="tab.' + tab.id + '">' +
            (ICONS[tab.icon] || "") +
            "<span>" + tab.label + "</span>" +
          "</a></li>";
        }).join("") +
      "</ul>";

    tabbar.innerHTML = tabs.map(function (tab) {
      return '<a class="tabbar__item" href="#' + tab.route + '"' +
        (isActiveTab(tab.route) ? ' aria-current="page"' : "") +
        ' data-inspect="tab.' + tab.id + '">' +
        (ICONS[tab.icon] || "") +
        "<span>" + tab.label + "</span>" +
      "</a>";
    }).join("");
  }

  function renderScreen() {
    if (state.route === "/") {
      screen.innerHTML = HomeScreen();
      return;
    }
    if (state.route === "/foundations") {
      screen.innerHTML = FoundationsScreen();
      return;
    }
    if (state.route === "/sitemap") {
      screen.innerHTML = SitemapScreen();
      return;
    }
    if (state.route === "/notifications") {
      screen.innerHTML = NotificationsScreen();
      return;
    }
    if (state.route === "/profile") {
      screen.innerHTML = ProfileScreen();
      return;
    }
    if (state.route === "/community") {
      screen.innerHTML = CommunityScreen();
      return;
    }
    if (state.route === "/dashboard") {
      screen.innerHTML = TeacherDashboardScreen();
      return;
    }
    if (state.route === "/classes") {
      screen.innerHTML = TeacherClassesScreen();
      return;
    }
    if (state.route === "/share") {
      screen.innerHTML = ShareScreen();
      return;
    }
    if (state.route === "/login") {
      screen.innerHTML = LoginScreen();
      return;
    }
    if (state.route === "/notes") {
      screen.innerHTML = NotesScreen();
      return;
    }
    if (state.route === "/post-solution") {
      screen.innerHTML = PostSolutionScreen();
      return;
    }
    if (state.route === "/topics") {
      screen.innerHTML = TopicsScreen();
      return;
    }
    if (state.route === "/queue") {
      screen.innerHTML = ReviewerQueueScreen();
      return;
    }
    if (state.route === "/assistant") {
      screen.innerHTML = AssistantScreen();
      return;
    }
    if (state.route === "/progress") {
      screen.innerHTML = ProgressScreen();
      return;
    }

    var detail = detailRoute(state.route);
    if (detail) {
      if (detail.name === "topics") {
        screen.innerHTML = TopicsScreen(detail.id);
      } else if (detail.name === "topic") {
        screen.innerHTML = TopicScreen(detail.id, detail.tab);
      } else if (detail.name === "question") {
        screen.innerHTML = QuestionScreen(detail.id, detail.tab);
      } else if (detail.name === "solution") {
        screen.innerHTML = SolutionDetailScreen(detail.questionId, detail.solutionId);
      } else if (detail.name === "review") {
        screen.innerHTML = ReviewDetailScreen(detail.id);
      } else if (detail.name === "code") {
        screen.innerHTML = CodeScreen(detail.id);
      } else if (detail.name === "diagram") {
        screen.innerHTML = DiagramScreen(detail.id);
      } else if (detail.name === "class") {
        screen.innerHTML = ClassDetailScreen(detail.id);
      } else {
        screen.innerHTML = ResultScreen(detail.id);
      }
      return;
    }

    var tab = ROLE_TABS[state.role].find(function (item) {
      return item.route === state.route;
    });
    if (tab && tab.screenId) {
      screen.innerHTML = PlaceholderScreen(tab.screenId);
      return;
    }
    screen.innerHTML = NotFoundScreen();
  }

  function syncChrome() {
    mobileToggle.checked = state.mobileView;
    mobileToggle.setAttribute("aria-checked", String(state.mobileView));
    inspectToggle.checked = state.inspect;
    inspectToggle.setAttribute("aria-checked", String(state.inspect));
    if (listStateSelect) listStateSelect.value = state.listState;

    document.querySelectorAll("[data-role]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-role") === state.role));
    });

    document.querySelectorAll(".proto-link").forEach(function (link) {
      if (link.getAttribute("href") === "#" + state.route) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.body.classList.toggle("inspect-on", state.inspect);
  }

  function render() {
    var openLayer = document.querySelector(".modal-layer:not([hidden])");
    if (openLayer) closeModal(openLayer);

    applyLayout();
    renderTopbar();
    renderNav();
    renderScreen();
    wireScreen();
    syncChrome();
    requestAnimationFrame(function () {
      updateProtoHeight();
      updateDeviceScale();
    });
  }

  /* ---------- Screen wiring ---------- */

  function applyTopicSearch(input) {
    var query = input.value.trim().toLowerCase();
    var visible = 0;
    screen.querySelectorAll("[data-topic-row]").forEach(function (row) {
      var haystack = (row.getAttribute("data-search") || "").toLowerCase();
      var match = !query || haystack.indexOf(query) !== -1;
      row.hidden = !match;
      if (match) visible += 1;
    });
    var count = screen.querySelector("[data-topic-count]");
    if (count) count.textContent = visible + (visible === 1 ? " topic" : " topics");
    var empty = screen.querySelector("[data-topic-empty]");
    if (empty) empty.hidden = visible !== 0;
  }

  function applyQuestionFilters() {
    var bar = screen.querySelector("[data-question-filters]");
    if (!bar) return;
    var year = bar.querySelector('[data-filter="year"]');
    var paper = bar.querySelector('[data-filter="paper"]');
    var difficulty = bar.querySelector('[data-filter="difficulty"]');
    var values = {
      year: year ? year.value : "",
      paper: paper ? paper.value : "",
      difficulty: difficulty ? difficulty.value : ""
    };

    screen.querySelectorAll("[data-panel-kind]").forEach(function (panel) {
      var rows = Array.prototype.slice.call(panel.querySelectorAll("[data-question-row]"));
      var visible = 0;
      rows.forEach(function (row) {
        var match = (!values.year || row.getAttribute("data-year") === values.year) &&
          (!values.paper || row.getAttribute("data-paper") === values.paper) &&
          (!values.difficulty || row.getAttribute("data-difficulty") === values.difficulty);
        row.hidden = !match;
        if (match) visible += 1;
      });
      var filtered = panel.querySelector("[data-empty-filter]");
      if (filtered) filtered.hidden = !(rows.length > 0 && visible === 0);
    });
  }

  function syncFilterVisibility() {
    var active = screen.querySelector("[data-question-tabs] [aria-selected='true']");
    var kind = active ? active.getAttribute("data-kind") : "past";
    var bar = screen.querySelector("[data-question-filters]");
    if (!bar) return;

    bar.querySelectorAll("[data-filter-past]").forEach(function (field) {
      field.hidden = kind !== "past";
    });

    if (kind !== "past") {
      var year = bar.querySelector('[data-filter="year"]');
      var paper = bar.querySelector('[data-filter="paper"]');
      if (year) year.value = "";
      if (paper) paper.value = "";
    }
  }

  function wireScreen() {
    screen.querySelectorAll("[data-tabs]").forEach(function (tablist) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

      function select(tab, moveFocus) {
        tabs.forEach(function (item) {
          var on = item === tab;
          item.setAttribute("aria-selected", String(on));
          item.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(item.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (moveFocus) tab.focus();
        if (tablist.hasAttribute("data-question-tabs")) {
          syncFilterVisibility();
          applyQuestionFilters();
        }
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          select(tab, false);
        });
        tab.addEventListener("keydown", function (event) {
          var next = null;
          if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
          if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
          if (event.key === "Home") next = tabs[0];
          if (event.key === "End") next = tabs[tabs.length - 1];
          if (next) {
            event.preventDefault();
            select(next, true);
          }
        });
      });
    });

    var search = screen.querySelector("[data-topic-search]");
    if (search) {
      search.addEventListener("input", function () {
        applyTopicSearch(search);
      });
    }

    var topicSubject = screen.querySelector("[data-topic-subject]");
    if (topicSubject) {
      topicSubject.addEventListener("change", function () {
        navigate(topicSubject.value ? "/topics/" + topicSubject.value : "/topics");
      });
    }

    var filterBar = screen.querySelector("[data-question-filters]");
    if (filterBar) {
      filterBar.querySelectorAll("select").forEach(function (select) {
        select.addEventListener("change", applyQuestionFilters);
      });
      var clear = filterBar.querySelector("[data-clear-filters]");
      if (clear) {
        clear.addEventListener("click", function () {
          filterBar.querySelectorAll("select").forEach(function (select) {
            select.value = "";
          });
          applyQuestionFilters();
        });
      }
      syncFilterVisibility();
      applyQuestionFilters();
    }

    var loginForm = screen.querySelector("[data-login-form]");
    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        navigate("/");
      });
    }

    var signupForm = screen.querySelector("[data-signup-form]");
    if (signupForm) {
      signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var roleInput = signupForm.querySelector('input[name="signup-role"]:checked');
        var role = roleInput ? roleInput.value : "student";
        state.role = role;
        persist();
        navigate(ROLE_HOME[role]);
      });
    }

    var forgot = screen.querySelector("[data-forgot]");
    if (forgot) {
      forgot.addEventListener("click", function () {
        var note = screen.querySelector("[data-forgot-note]");
        if (note) note.hidden = false;
        forgot.setAttribute("aria-expanded", "true");
      });
    }

    var answerForm = screen.querySelector("[data-answer-form]");
    var activeQuestionId = answerForm ? answerForm.getAttribute("data-question-id") : null;

    if (answerForm) {
      answerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = answerForm.querySelector("[data-answer-input]");
        if (input && activeQuestionId) saveDraft(activeQuestionId, { answer: input.value });
        navigate("/result/" + activeQuestionId);
      });
    }

    if (activeQuestionId) {
      var answerInput = screen.querySelector("[data-answer-input]");
      if (answerInput) {
        answerInput.addEventListener("input", function () {
          saveDraft(activeQuestionId, { answer: answerInput.value });
        });
      }

      var attachFile = function (file) {
        var openDraft = draftFor(activeQuestionId);
        if (openDraft.fileUrl) URL.revokeObjectURL(openDraft.fileUrl);
        var isImage = Boolean(file) && file.type.indexOf("image/") === 0;
        saveDraft(activeQuestionId, {
          fileName: file ? file.name : "",
          fileSize: file ? formatBytes(file.size) : "",
          fileType: file ? (isImage ? "image" : file.type === "application/pdf" ? "pdf" : "file") : "",
          fileUrl: isImage ? URL.createObjectURL(file) : "",
          scan: null,
          scanning: false,
          scanNotice: ""
        });
        renderScreen();
        wireScreen();
        refreshInspect();
      };

      var answerFile = screen.querySelector("[data-answer-file]");
      if (answerFile) {
        answerFile.addEventListener("change", function () {
          attachFile(answerFile.files && answerFile.files[0]);
        });
      }

      var fileDrop = screen.querySelector(".upload__drop");
      if (fileDrop && answerFile) {
        fileDrop.addEventListener("dragover", function (event) {
          event.preventDefault();
          fileDrop.classList.add("is-dragging");
        });
        fileDrop.addEventListener("dragleave", function () {
          fileDrop.classList.remove("is-dragging");
        });
        fileDrop.addEventListener("drop", function (event) {
          event.preventDefault();
          fileDrop.classList.remove("is-dragging");
          var dropped = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
          if (dropped) attachFile(dropped);
        });
      }

      var removeFile = screen.querySelector("[data-answer-file-remove]");
      if (removeFile) {
        removeFile.addEventListener("click", function () {
          attachFile(null);
        });
      }

      var scanCheck = screen.querySelector("[data-scan-check]");
      if (scanCheck) {
        scanCheck.addEventListener("click", function () {
          var question = questionById(activeQuestionId);
          if (!question || draftFor(activeQuestionId).scanning) return;
          var result = sampleScan(question, draftFor(activeQuestionId));
          if (!result.hasInput) {
            saveDraft(activeQuestionId, { scan: null, scanning: false, scanNotice: "Add a photo or write some working first." });
            renderScreen();
            wireScreen();
            refreshInspect();
            return;
          }
          saveDraft(activeQuestionId, { scanning: true, scan: null, scanNotice: "" });
          renderScreen();
          wireScreen();
          refreshInspect();
          var pendingId = activeQuestionId;
          setTimeout(function () {
            var draft = draftFor(pendingId);
            draft.scanning = false;
            draft.scan = sampleScan(questionById(pendingId), draft);
            if (state.route === "/question/" + pendingId) {
              renderScreen();
              wireScreen();
              refreshInspect();
            }
          }, 1400);
        });
      }

      screen.querySelectorAll("[data-question-help-mode]").forEach(function (button) {
        button.addEventListener("click", function () {
          var question = questionById(activeQuestionId);
          if (!question) return;
          var mode = button.getAttribute("data-question-help-mode");
          var label = mode === "hint" ? "Hint" : mode === "walk" ? "Walk me through" : "Check my working";
          draftFor(activeQuestionId).helpMessages.push({
            label: label,
            text: questionHelpReply(mode, question)
          });
          renderScreen();
          wireScreen();
          refreshInspect();
        });
      });

      var helpForm = screen.querySelector("[data-question-help-form]");
      if (helpForm) {
        helpForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var input = helpForm.querySelector("[data-question-help-input]");
          var text = input ? input.value.trim() : "";
          if (!text) {
            if (input) input.focus();
            return;
          }
          var question = questionById(activeQuestionId);
          var draft = draftFor(activeQuestionId);
          draft.helpMessages.push({ label: "You", text: text });
          draft.helpMessages.push({ label: "Question help", text: questionHelpText(question, text) });
          renderScreen();
          wireScreen();
          refreshInspect();
        });
      }
    }

    var reviewFilters = screen.querySelector("[data-review-filters]");
    if (reviewFilters) {
      var subjectFilter = reviewFilters.querySelector("[data-review-subject]");
      var topicFilter = reviewFilters.querySelector("[data-review-topic]");

      function rebuildReviewTopics() {
        var subjectId = subjectFilter.value;
        var options = ['<option value="">All topics</option>'];
        SUBJECTS.forEach(function (subject) {
          if (subjectId && subject.id !== subjectId) return;
          subject.topics.forEach(function (topic) {
            options.push('<option value="' + topic.id + '">' + esc(subject.name) + " · " + esc(topic.name) + "</option>");
          });
        });
        topicFilter.innerHTML = options.join("");
      }

      function applyReviewFilters() {
        var subjectId = subjectFilter.value;
        var topicId = topicFilter.value;
        var visible = 0;
        screen.querySelectorAll("[data-review-row]").forEach(function (row) {
          var match = (!subjectId || row.getAttribute("data-subject") === subjectId) &&
            (!topicId || row.getAttribute("data-topic") === topicId);
          row.hidden = !match;
          if (match) visible += 1;
        });
        var empty = screen.querySelector("[data-review-empty]");
        if (empty) empty.hidden = visible !== 0;
      }

      subjectFilter.addEventListener("change", function () {
        rebuildReviewTopics();
        applyReviewFilters();
      });
      topicFilter.addEventListener("change", applyReviewFilters);

      var clearReview = reviewFilters.querySelector("[data-clear-review-filters]");
      if (clearReview) {
        clearReview.addEventListener("click", function () {
          subjectFilter.value = "";
          rebuildReviewTopics();
          topicFilter.value = "";
          applyReviewFilters();
        });
      }
      applyReviewFilters();
    }

    var approveReview = screen.querySelector("[data-approve-review]");
    if (approveReview) {
      approveReview.addEventListener("click", function () {
        var item = reviewById(approveReview.getAttribute("data-approve-review"));
        if (item) {
          item.status = "Approved";
          var comment = screen.querySelector("#review-comment");
          if (comment) item.comment = comment.value.trim();
        }
        showToast("Question approved.");
        render();
      });
    }

    var rejectReview = screen.querySelector("[data-reject-review]");
    if (rejectReview) {
      rejectReview.addEventListener("click", function () {
        var item = reviewById(rejectReview.getAttribute("data-reject-review"));
        if (item) {
          item.status = "Rejected";
          var comment = screen.querySelector("#review-comment");
          if (comment) item.comment = comment.value.trim();
        }
        showToast("Question rejected.");
        render();
      });
    }

    var editReview = screen.querySelector("[data-edit-review]");
    if (editReview) {
      editReview.addEventListener("click", function () {
        var editor = screen.querySelector("[data-review-editor]");
        var saveRow = screen.querySelector("[data-review-save-row]");
        if (editor) editor.hidden = false;
        if (saveRow) saveRow.hidden = false;
        var textarea = screen.querySelector("[data-review-textarea]");
        if (textarea) textarea.focus();
      });
    }

    var cancelReview = screen.querySelector("[data-cancel-review]");
    if (cancelReview) {
      cancelReview.addEventListener("click", function () {
        var editor = screen.querySelector("[data-review-editor]");
        var saveRow = screen.querySelector("[data-review-save-row]");
        if (editor) editor.hidden = true;
        if (saveRow) saveRow.hidden = true;
      });
    }

    var saveReview = screen.querySelector("[data-save-review]");
    if (saveReview) {
      saveReview.addEventListener("click", function () {
        var item = reviewById(saveReview.getAttribute("data-save-review"));
        var textarea = screen.querySelector("[data-review-textarea]");
        if (item && textarea) {
          var question = questionForReview(item);
          if (question && textarea.value.trim()) question.stem = textarea.value.trim();
        }
        showToast("Question updated.");
        render();
      });
    }

    var chatForm = screen.querySelector("[data-chat-form]");
    if (chatForm) {
      var chatInput = chatForm.querySelector("[data-chat-input]");
      var chatContext = chatForm.querySelector("[data-chat-context]");

      function sendChat(text) {
        var value = (text || chatInput.value || "").trim();
        if (!value) {
          chatInput.focus();
          return;
        }
        var contextQuestion = chatContext.value ? questionById(chatContext.value) : null;
        assistantMessages.push({
          from: "user",
          text: value,
          context: contextQuestion ? contextQuestion.source : "",
          file: coachFile
        });
        assistantMessages.push({
          from: "assistant",
          text: assistantReply(value, contextQuestion)
        });
        coachFile = "";
        chatInput.value = "";
        renderScreen();
        wireScreen();
        var log = screen.querySelector("[data-chat-log]");
        if (log) log.scrollTop = log.scrollHeight;
        refreshInspect();
      }

      var coachFileInput = screen.querySelector("[data-coach-file]");
      if (coachFileInput) {
        coachFileInput.addEventListener("change", function () {
          var file = coachFileInput.files && coachFileInput.files[0];
          coachFile = file ? file.name : "";
          var label = screen.querySelector("[data-coach-file-name]");
          if (label) {
            label.textContent = coachFile ? "Attached: " + coachFile : "";
            label.hidden = !coachFile;
          }
        });
      }

      chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendChat();
      });

      screen.querySelectorAll("[data-prompt]").forEach(function (button) {
        button.addEventListener("click", function () {
          sendChat(button.getAttribute("data-prompt"));
        });
      });
    }

    var codeEditor = screen.querySelector("[data-code-editor]");
    var codeForm = screen.querySelector("[data-answer-form]");
    var codeQuestionId = codeForm && codeEditor ? codeForm.getAttribute("data-question-id") : null;

    if (codeEditor && codeQuestionId) {
      var codeGutter = screen.querySelector("[data-code-gutter]");
      var codeInput = screen.querySelector("[data-code-input]");

      var syncGutter = function () {
        if (codeGutter) codeGutter.textContent = codeLineNumbers(codeEditor.value);
      };

      codeEditor.addEventListener("input", function () {
        codeDraftFor(codeQuestionId).code = codeEditor.value;
        syncGutter();
      });

      codeEditor.addEventListener("scroll", function () {
        if (codeGutter) codeGutter.scrollTop = codeEditor.scrollTop;
      });

      syncGutter();

      if (codeInput) {
        codeInput.addEventListener("input", function () {
          codeDraftFor(codeQuestionId).input = codeInput.value;
        });
      }

      var runCode = screen.querySelector("[data-run-code]");
      if (runCode) {
        runCode.addEventListener("click", function () {
          var draft = codeDraftFor(codeQuestionId);
          draft.code = codeEditor.value;
          if (codeInput) draft.input = codeInput.value;
          var result = Pseudo.run(draft.code, draft.input);
          draft.result = {
            ok: result.ok,
            lines: result.output,
            error: result.error,
            line: result.line,
            steps: result.steps
          };
          renderScreen();
          wireScreen();
          refreshInspect();
        });
      }

      var resetCode = screen.querySelector("[data-reset-code]");
      if (resetCode) {
        resetCode.addEventListener("click", function () {
          var draft = codeDraftFor(codeQuestionId);
          var workspace = CODE_WORKSPACES[codeQuestionId];
          draft.code = workspace ? workspace.starterCode : "// Write your pseudocode here\n";
          draft.result = null;
          draft.review = null;
          draft.reviewing = false;
          draft.fromSolution = "";
          renderScreen();
          wireScreen();
          refreshInspect();
        });
      }

      var reviewCode = screen.querySelector("[data-review-code]");
      if (reviewCode) {
        reviewCode.addEventListener("click", function () {
          var draft = codeDraftFor(codeQuestionId);
          draft.code = codeEditor.value;
          if (codeInput) draft.input = codeInput.value;
          draft.reviewing = true;
          draft.review = null;
          renderScreen();
          wireScreen();
          refreshInspect();
          var pendingId = codeQuestionId;
          setTimeout(function () {
            var pending = codeDraftFor(pendingId);
            pending.review = buildReview(questionById(pendingId), pending.code);
            pending.reviewing = false;
            if (state.route === "/code/" + pendingId) {
              renderScreen();
              wireScreen();
              refreshInspect();
            }
          }, 1100);
        });
      }

      var clearConsole = screen.querySelector("[data-code-clear]");
      if (clearConsole) {
        clearConsole.addEventListener("click", function () {
          codeDraftFor(codeQuestionId).result = null;
          renderScreen();
          wireScreen();
          refreshInspect();
        });
      }
    }

    var figureStage = screen.querySelector("[data-figure-stage]");
    if (figureStage) {
      var angleRange = screen.querySelector("[data-angle-range]");
      var massRange = screen.querySelector("[data-mass-range]");
      var frictionRange = screen.querySelector("[data-friction-range]");
      var plainNote = screen.querySelector("[data-plain-note]");

      var setOut = function (key, value) {
        var target = screen.querySelector('[data-out="' + key + '"]');
        if (target) target.textContent = value;
      };

      var updatePlane = function () {
        var angle = Number(angleRange.value);
        var mass = Number(massRange.value);
        var friction = Number(frictionRange.value);

        figureStage.innerHTML = Figures.render({
          builder: "inclinedPlane",
          params: {
            angle: angle,
            showForces: true,
            showComponents: true,
            weightLabel: "W = mg",
            caption: "Block on a plane inclined at " + angle + "°"
          }
        });

        var weight = mass * 9.81;
        var parallel = weight * Math.sin(angle * Math.PI / 180);
        var resultant = parallel - friction;
        var acceleration = resultant > 0 ? resultant / mass : 0;

        setOut("weight", weight.toFixed(1) + " N");
        setOut("parallel", parallel.toFixed(1) + " N");
        setOut("resultant", resultant.toFixed(1) + " N");
        setOut("acceleration", acceleration.toFixed(1) + " m s⁻²");

        var angleValue = screen.querySelector("[data-angle-value]");
        var massValue = screen.querySelector("[data-mass-value]");
        var frictionValue = screen.querySelector("[data-friction-value]");
        if (angleValue) angleValue.textContent = angle + "°";
        if (massValue) massValue.textContent = mass.toFixed(1) + " kg";
        if (frictionValue) frictionValue.textContent = friction.toFixed(1) + " N";
        if (plainNote) plainNote.hidden = resultant > 0;
      };

      [angleRange, massRange, frictionRange].forEach(function (range) {
        if (range) range.addEventListener("input", updatePlane);
      });

      var resetDiagram = screen.querySelector("[data-reset-diagram]");
      if (resetDiagram) {
        resetDiagram.addEventListener("click", function () {
          angleRange.value = "25";
          massRange.value = "4";
          frictionRange.value = "6";
          updatePlane();
        });
      }
      updatePlane();
    }

    var communityFilters = screen.querySelector("[data-community-filters]");
    var communityFeed = screen.querySelector("[data-community-feed]");
    if (communityFilters && communityFeed) {
      var communitySubject = communityFilters.querySelector("[data-community-subject]");
      var communityTopic = communityFilters.querySelector("[data-community-topic]");
      var communityEmpty = screen.querySelector("[data-community-empty]");

      var rebuildCommunityTopics = function () {
        var subjectId = communitySubject.value;
        var entries = [];
        SUBJECTS.forEach(function (subject) {
          if (subjectId && subject.id !== subjectId) return;
          subject.topics.forEach(function (topic) {
            entries.push({ topic: topic, subject: subject });
          });
        });
        communityTopic.innerHTML = '<option value="">All topics</option>' + entries.map(function (entry) {
          return '<option value="' + entry.topic.id + '">' + esc(entry.subject.code + " · " + entry.topic.name) + "</option>";
        }).join("");
      };

      var communitySearch = communityFilters.querySelector("[data-community-search]");
      var communityKind = communityFilters.querySelector("[data-community-kind]");
      var communityYear = communityFilters.querySelector("[data-community-year]");
      var communityYearField = communityYear ? communityYear.closest(".field") : null;

      var syncCommunityYear = function () {
        if (!communityYearField) return;
        var kind = communityKind ? communityKind.value : "";
        communityYearField.hidden = kind === "practice";
        if (kind === "practice" && communityYear) communityYear.value = "";
      };

      var applyCommunityFilters = function () {
        var subjectId = communitySubject.value;
        var topicId = communityTopic.value;
        var kind = communityKind ? communityKind.value : "";
        var year = communityYear ? communityYear.value : "";
        var query = communitySearch ? communitySearch.value.trim().toLowerCase() : "";
        var visible = 0;
        communityFeed.querySelectorAll("[data-post-id]").forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matches = (!subjectId || card.getAttribute("data-subject-id") === subjectId) &&
            (!topicId || card.getAttribute("data-topic-id") === topicId) &&
            (!kind || card.getAttribute("data-kind") === kind) &&
            (!year || card.getAttribute("data-year") === year) &&
            (!query || haystack.indexOf(query) !== -1);
          card.hidden = !matches;
          if (matches) visible += 1;
        });
        communityEmpty.hidden = visible !== 0;
      };

      rebuildCommunityTopics();
      communitySubject.addEventListener("change", function () {
        rebuildCommunityTopics();
        applyCommunityFilters();
      });
      communityTopic.addEventListener("change", applyCommunityFilters);
      if (communityKind) {
        communityKind.addEventListener("change", function () {
          syncCommunityYear();
          applyCommunityFilters();
        });
      }
      if (communityYear) communityYear.addEventListener("change", applyCommunityFilters);
      if (communitySearch) communitySearch.addEventListener("input", applyCommunityFilters);

      var clearCommunity = communityFilters.querySelector("[data-clear-community]");
      if (clearCommunity) {
        clearCommunity.addEventListener("click", function () {
          if (communitySearch) communitySearch.value = "";
          communitySubject.value = "";
          rebuildCommunityTopics();
          communityTopic.value = "";
          if (communityKind) communityKind.value = "";
          if (communityYear) communityYear.value = "";
          syncCommunityYear();
          applyCommunityFilters();
        });
      }
      syncCommunityYear();

      // Likes are handled once for every screen by [data-solution-like],
      // because a like updates the same post the question hub shows.
      if (state.role !== "student") {
        communityFeed.querySelectorAll("[data-comments]").forEach(function (button) {
          button.addEventListener("click", function () {
            var post = COMMUNITY_POSTS.find(function (item) {
              return item.id === button.getAttribute("data-comments");
            });
            if (!post) return;
            var comments = post.commentList || [];
            var body = comments.length ? comments.map(function (comment) {
              return '<div><p class="list-row__title">' + esc(comment.author) +
                ' <span class="muted">' + esc(comment.time) + "</span></p><p>" + esc(comment.text) + "</p></div>";
            }).join("") : '<p class="muted">No comments yet.</p>';
            openInfoModal(post.comments + " comments", body);
          });
        });

        communityFeed.querySelectorAll("[data-read-solution]").forEach(function (button) {
          button.addEventListener("click", function () {
            var post = COMMUNITY_POSTS.find(function (item) {
              return item.id === button.getAttribute("data-read-solution");
            });
            if (!post) return;
            openInfoModal("Full solution",
              '<p class="muted">' + esc(post.author) + " · " + esc(post.time) + "</p><p>" + esc(post.solution) + "</p>");
          });
        });
      }
    }

    screen.querySelectorAll("[data-solution-like]").forEach(function (button) {
      button.addEventListener("click", function () {
        var post = COMMUNITY_POSTS.find(function (item) {
          return item.id === button.getAttribute("data-solution-like");
        });
        if (!post) return;
        toggleSolutionLike(post);
        button.setAttribute("aria-pressed", String(post.liked));
        var count = button.querySelector("[data-solution-like-count]");
        if (count) count.textContent = String(post.likes);
        if (button.firstChild && button.firstChild.nodeType === 3) {
          button.firstChild.nodeValue = post.liked ? "Liked " : "Like ";
        }
      });
    });

    var solutionCommentForm = screen.querySelector("[data-solution-comment-form]");
    if (solutionCommentForm) {
      solutionCommentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = solutionCommentForm.querySelector("[data-solution-comment-input]");
        var error = solutionCommentForm.querySelector("[data-solution-comment-error]");
        var text = input ? input.value.trim() : "";
        if (!text) {
          if (error) error.hidden = false;
          if (input) input.focus();
          return;
        }
        if (error) error.hidden = true;
        var post = COMMUNITY_POSTS.find(function (item) {
          return item.id === solutionCommentForm.getAttribute("data-post-id");
        });
        if (!post) return;
        addSolutionComment(post, text);
        renderScreen();
        wireScreen();
        refreshInspect();
      });
    }

    var discussionForm = screen.querySelector("[data-discussion-form]");
    if (discussionForm) {
      discussionForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = discussionForm.querySelector("[data-discussion-input]");
        var error = discussionForm.querySelector("[data-discussion-error]");
        var text = input ? input.value.trim() : "";
        if (!text) {
          if (error) error.hidden = false;
          if (input) input.focus();
          return;
        }
        if (error) error.hidden = true;
        addDiscussionComment(discussionForm.getAttribute("data-question-id"), text);
        renderScreen();
        wireScreen();
        refreshInspect();
      });
    }

    screen.querySelectorAll("[data-comment-reply]").forEach(function (button) {
      button.addEventListener("click", function () {
        var comment = button.closest(".comment");
        var form = comment ? comment.querySelector("[data-comment-reply-form]") : null;
        if (!form) return;
        form.hidden = false;
        var input = form.querySelector("[data-comment-reply-input]");
        if (input) input.focus();
      });
    });

    screen.querySelectorAll("[data-comment-reply-cancel]").forEach(function (button) {
      button.addEventListener("click", function () {
        var form = button.closest("[data-comment-reply-form]");
        if (form) form.hidden = true;
      });
    });

    screen.querySelectorAll("[data-comment-reply-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("[data-comment-reply-input]");
        var text = input ? input.value.trim() : "";
        if (!text) {
          if (input) input.focus();
          return;
        }
        var parts = String(form.getAttribute("data-comment-thread")).split(":");
        var index = Number(form.getAttribute("data-comment-index"));
        var thread = threadFor(parts[0], parts[1]);
        var parent = thread[index];
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push({ author: "You", text: text, time: "Just now" });
          if (parts[0] === "solution") {
            for (var i = 0; i < COMMUNITY_POSTS.length; i += 1) {
              if (COMMUNITY_POSTS[i].id === parts[1]) COMMUNITY_POSTS[i].comments += 1;
            }
          }
        }
        renderScreen();
        wireScreen();
        refreshInspect();
      });
    });

    screen.querySelectorAll("[data-try-solution]").forEach(function (button) {
      button.addEventListener("click", function () {
        var post = null;
        for (var i = 0; i < COMMUNITY_POSTS.length; i += 1) {
          if (COMMUNITY_POSTS[i].id === button.getAttribute("data-try-solution")) post = COMMUNITY_POSTS[i];
        }
        if (!post || !post.code) return;
        state.codePrefill = { questionId: post.questionId, code: post.code, author: post.author };
        navigate("/code/" + post.questionId);
      });
    });

    screen.querySelectorAll("[data-share-solution]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.solutionQuestionId = button.getAttribute("data-share-solution");
        navigate("/post-solution");
      });
    });

    var solutionForm = screen.querySelector("[data-solution-form]");
    if (solutionForm) {
      var solutionQuestion = screen.querySelector("[data-solution-question]");
      var solutionText = screen.querySelector("[data-solution-text]");
      var solutionFile = screen.querySelector("[data-solution-file]");
      var solutionFileName = screen.querySelector("[data-solution-file-name]");
      var solutionError = screen.querySelector("[data-solution-error]");
      var solutionPreview = screen.querySelector("[data-solution-preview]");
      var previewQuestion = screen.querySelector("[data-preview-question]");
      var previewText = screen.querySelector("[data-preview-text]");
      var previewFile = screen.querySelector("[data-preview-file]");

      if (solutionFile && solutionFileName) {
        solutionFile.addEventListener("change", function () {
          var file = solutionFile.files && solutionFile.files[0];
          solutionFileName.textContent = file ? "Attached: " + file.name : "";
          solutionFileName.hidden = !file;
        });
      }

      var updateSolutionPreview = function () {
        var question = questionById(solutionQuestion.value);
        if (previewQuestion) previewQuestion.textContent = question ? question.stem : "";
        if (previewText) previewText.textContent = solutionText.value.trim() || "Nothing written yet.";
        if (previewFile) {
          var file = solutionFile.files && solutionFile.files[0];
          previewFile.textContent = file ? "Attached: " + file.name : "";
          previewFile.hidden = !file;
        }
        if (solutionPreview) solutionPreview.hidden = false;
      };

      var previewButton = screen.querySelector("[data-preview-solution]");
      if (previewButton) previewButton.addEventListener("click", updateSolutionPreview);

      solutionForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var text = solutionText.value.trim();
        if (!text) {
          if (solutionError) solutionError.hidden = false;
          solutionText.focus();
          return;
        }
        if (solutionError) solutionError.hidden = true;
        var question = questionById(solutionQuestion.value);
        if (!question) return;
        COMMUNITY_POSTS.unshift({
          id: "post-new-" + Date.now(),
          author: "You",
          subjectId: question.subjectId,
          topicId: question.topicId,
          questionId: question.id,
          snippet: truncate(text, 150),
          solution: text,
          likes: 0,
          liked: false,
          comments: 0,
          commentList: [],
          time: "Just now"
        });
        state.solutionQuestionId = null;
        showToast("Your solution is now on the question.");
        navigate("/question/" + question.id + "/solutions");
      });
    }

    screen.querySelectorAll("[data-note]").forEach(function (button) {
      button.addEventListener("click", function () {
        openNoteModal(button.getAttribute("data-note"));
        var badge = button.querySelector("[data-note-new]");
        if (badge) badge.remove();
      });
    });

    var markRead = screen.querySelector("[data-mark-read]");
    if (markRead) {
      markRead.addEventListener("click", function () {
        NOTIFICATIONS.forEach(function (item) {
          if (item.audience === state.role) item.unread = false;
        });
        render();
        showToast("All notifications marked as read.");
      });
    }

    screen.querySelectorAll("[data-notification]").forEach(function (link) {
      link.addEventListener("click", function () {
        var item = NOTIFICATIONS.find(function (notification) {
          return notification.id === link.getAttribute("data-notification");
        });
        if (item) item.unread = false;
        renderTopbar();
      });
    });

    screen.querySelectorAll("[data-shared-note]").forEach(function (button) {
      button.addEventListener("click", function () {
        openNoteModal(button.getAttribute("data-shared-note"));
      });
    });

    screen.querySelectorAll("[data-shared-questions]").forEach(function (button) {
      button.addEventListener("click", function () {
        var ids = button.getAttribute("data-shared-questions").split(",");
        var body = ids.map(function (id) {
          var question = questionById(id);
          if (!question) return "";
          var found = topicById(question.topicId);
          return '<div><p class="list-row__title">' + esc(found ? found.topic.name : "") + "</p><p>" +
            esc(question.stem) + '</p><p class="muted">' + question.marks + " marks · " +
            esc(question.difficulty) + "</p></div>";
        }).join("");
        openInfoModal("Shared questions", body || '<p class="muted">No questions in this set.</p>');
      });
    });

    var shareForm = screen.querySelector("[data-share-form]");
    if (shareForm) {
      var shareNotePanel = screen.querySelector("[data-share-note-panel]");
      var shareQuestionsPanel = screen.querySelector("[data-share-questions-panel]");
      var shareFile = screen.querySelector("[data-share-file]");
      var shareFileName = screen.querySelector("[data-share-file-name]");
      var shareError = screen.querySelector("[data-share-error]");

      var syncSharePanels = function () {
        var type = screen.querySelector("[data-share-type]:checked");
        var isNote = !type || type.value === "note";
        if (shareNotePanel) shareNotePanel.hidden = !isNote;
        if (shareQuestionsPanel) shareQuestionsPanel.hidden = isNote;
      };

      screen.querySelectorAll("[data-share-type]").forEach(function (input) {
        input.addEventListener("change", syncSharePanels);
      });
      syncSharePanels();

      var shareSubject = screen.querySelector("[data-share-subject]");
      var applyShareSubject = function () {
        var value = shareSubject ? shareSubject.value : "";
        screen.querySelectorAll("[data-share-question-row]").forEach(function (row) {
          var match = !value || row.getAttribute("data-share-subject-id") === value;
          row.hidden = !match;
          if (!match) {
            var box = row.querySelector("[data-share-question]");
            if (box) box.checked = false;
          }
        });
      };
      if (shareSubject) {
        shareSubject.addEventListener("change", applyShareSubject);
        applyShareSubject();
      }

      if (shareFile && shareFileName) {
        shareFile.addEventListener("change", function () {
          var file = shareFile.files && shareFile.files[0];
          shareFileName.textContent = file ? "Attached: " + file.name : "";
          shareFileName.hidden = !file;
        });
      }

      shareForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var classes = Array.prototype.slice.call(screen.querySelectorAll("[data-share-class]:checked"));
        var titleInput = screen.querySelector("[data-share-title]");
        var title = titleInput ? titleInput.value.trim() : "";
        var type = screen.querySelector("[data-share-type]:checked");
        var isNote = !type || type.value === "note";
        var noteInput = screen.querySelector("[data-share-note]");
        var noteText = noteInput ? noteInput.value.trim() : "";
        var file = shareFile && shareFile.files && shareFile.files[0];
        var questions = screen.querySelectorAll("[data-share-question]:checked");
        var error = "";

        if (!classes.length) error = "Choose at least one class.";
        else if (!title) error = "Add a title.";
        else if (isNote && !noteText && !file) error = "Write a note or attach a file.";
        else if (!isNote && !questions.length) error = "Pick at least one question.";

        if (error) {
          if (shareError) {
            shareError.textContent = error;
            shareError.hidden = false;
          }
          return;
        }

        if (shareError) shareError.hidden = true;
        var names = classes.map(function (input) {
          var cls = classById(input.value);
          return cls ? cls.name : "";
        }).filter(Boolean);
        showToast("Shared with " + names.join(", ") + ".");
        navigate("/dashboard");
      });
    }

    var profileForm = screen.querySelector("[data-profile-form]");
    if (profileForm) {
      profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var nameInput = document.getElementById("profile-name");
        var emailInput = document.getElementById("profile-email");
        var profile = PROFILES[state.role];
        if (profile && nameInput && nameInput.value.trim()) profile.name = nameInput.value.trim();
        if (profile && emailInput && emailInput.value.trim()) profile.email = emailInput.value.trim();
        if (profile) {
          profile.initials = profile.name.split(/\s+/).map(function (word) {
            return word.charAt(0);
          }).join("").slice(0, 2).toUpperCase();
        }
        render();
        showToast("Profile saved.");
      });
    }

    var signOut = screen.querySelector("[data-sign-out]");
    if (signOut) {
      signOut.addEventListener("click", function () {
        showToast("Signed out. Use the prototype role switcher to come back.");
        navigate("/login");
      });
    }

    screen.querySelectorAll("[data-retry-list]").forEach(function (button) {
      button.addEventListener("click", function () {
        setListState("default");
      });
    });
  }

  /* ---------- Actions ---------- */

  function setRole(role) {
    if (!ROLE_TABS[role] || state.role === role) return;
    state.role = role;
    persist();

    if (!isAllowed(state.route)) {
      state.route = ROLE_HOME[role];
      history.replaceState(null, "", "#" + state.route);
    }

    render();
    resetScroll();
    refreshInspect();
  }

  function setMobileView(on) {
    var scrollTop = state.mobileView ? screen.scrollTop : window.scrollY;
    state.mobileView = on;
    persist();
    applyLayout();
    syncChrome();

    requestAnimationFrame(function () {
      updateProtoHeight();
      updateDeviceScale();
      if (on) {
        window.scrollTo(0, 0);
        screen.scrollTop = Math.min(scrollTop, screen.scrollHeight);
      } else {
        window.scrollTo(0, scrollTop);
      }
      if (inspectedEl) positionInspectCard(inspectedEl);
    });
  }

  function setInspect(on) {
    state.inspect = on;
    persist();
    syncChrome();
    if (!on) {
      pinned = false;
      clearInspect(true);
    }
  }

  function setListState(value) {
    if (["default", "loading", "empty", "error"].indexOf(value) === -1) return;
    state.listState = value;
    persist();
    render();
  }

  /* ---------- Inspect mode ---------- */

  function noteFor(el) {
    return INSPECT_NOTES[el.getAttribute("data-inspect")];
  }

  function showInspect(el) {
    if (!state.inspect || !el) return;
    var note = noteFor(el);
    if (!note) return;

    if (inspectedEl && inspectedEl !== el) {
      inspectedEl.classList.remove("is-inspected");
    }

    inspectedEl = el;
    el.classList.add("is-inspected");

    inspectTitle.textContent = note.title;
    inspectBody.innerHTML = note.lines.map(function (line) {
      return "<p>" + esc(line) + "</p>";
    }).join("");
    inspectCard.hidden = false;
    positionInspectCard(el);
  }

  function clearInspect(force) {
    if (pinned && !force) return;
    if (inspectedEl) inspectedEl.classList.remove("is-inspected");
    inspectedEl = null;
    inspectCard.hidden = true;
  }

  function refreshInspect() {
    if (!state.inspect) {
      pinned = false;
      clearInspect(true);
      return;
    }
    if (inspectedEl && !document.body.contains(inspectedEl)) {
      pinned = false;
      clearInspect(true);
    }
  }

  function positionInspectCard(el) {
    var rect = el.getBoundingClientRect();
    var card = inspectCard.getBoundingClientRect();
    var margin = 12;
    var gap = 10;

    var top = rect.bottom + gap;
    if (top + card.height > window.innerHeight - margin) {
      top = rect.top - card.height - gap;
    }
    top = Math.max(margin, Math.min(top, window.innerHeight - card.height - margin));

    var left = Math.max(margin, Math.min(rect.left, window.innerWidth - card.width - margin));

    inspectCard.style.top = top + "px";
    inspectCard.style.left = left + "px";
  }

  document.addEventListener("pointerover", function (event) {
    if (!state.inspect || event.pointerType === "touch") return;
    var el = event.target.closest("[data-inspect]");
    if (el) {
      pinned = false;
      showInspect(el);
    }
  });

  document.addEventListener("pointerout", function (event) {
    if (!state.inspect || pinned || event.pointerType === "touch") return;
    var el = event.target.closest("[data-inspect]");
    if (!el) return;
    if (event.relatedTarget && el.contains(event.relatedTarget)) return;
    clearInspect(true);
  });

  document.addEventListener("pointerdown", function (event) {
    if (!state.inspect) return;
    var el = event.target.closest("[data-inspect]");
    if (el) {
      pinned = true;
      showInspect(el);
    } else {
      pinned = false;
      clearInspect(true);
    }
  }, true);

  document.addEventListener("focusin", function (event) {
    if (!state.inspect) return;
    var el = event.target.closest("[data-inspect]");
    if (el) {
      pinned = false;
      showInspect(el);
    }
  });

  document.addEventListener("focusout", function (event) {
    if (!state.inspect || pinned) return;
    var el = event.target.closest("[data-inspect]");
    if (el && !(event.relatedTarget && el.contains(event.relatedTarget))) {
      clearInspect(true);
    }
  });

  document.addEventListener("scroll", function () {
    if (inspectedEl && !inspectCard.hidden) positionInspectCard(inspectedEl);
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && pinned) {
      pinned = false;
      clearInspect(true);
    }
  });

  /* ---------- Modal ---------- */

  var modalReturnFocus = null;

  function openModal(id) {
    var layer = document.getElementById(id);
    if (!layer) return;
    pinned = false;
    clearInspect(true);
    modalReturnFocus = document.activeElement;
    layer.hidden = false;
    document.body.classList.add("modal-open");
    var focusable = layer.querySelector("button, [href], input, select, textarea");
    if (focusable) focusable.focus();
  }

  function closeModal(layer) {
    if (!layer) return;
    layer.hidden = true;
    document.body.classList.remove("modal-open");
    if (modalReturnFocus && document.body.contains(modalReturnFocus)) {
      modalReturnFocus.focus();
    }
    modalReturnFocus = null;
  }

  function openInfoModal(title, bodyHtml) {
    var titleEl = document.getElementById("infoModalTitle");
    var bodyEl = document.getElementById("infoModalBody");
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    openModal("infoModal");
  }

  function openNoteModal(noteId) {
    var note = TEACHER_NOTES.find(function (item) {
      return item.id === noteId;
    });
    if (!note) return;
    var body = '<p class="muted">' + esc(note.teacher) + " · " + esc(note.time) + "</p>" +
      note.body.map(function (line) {
        return "<p>" + esc(line) + "</p>";
      }).join("");
    openInfoModal(note.title, body);
  }

  document.addEventListener("keydown", function (event) {
    var layer = document.querySelector(".modal-layer:not([hidden])");
    if (!layer) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(layer);
      return;
    }

    if (event.key !== "Tab") return;

    var focusables = Array.prototype.slice.call(
      layer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });

    if (!focusables.length) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Events ---------- */

  document.addEventListener("click", function (event) {
    var screenLink = event.target.closest("a[data-screen-route]");
    if (screenLink) {
      var targetRoute = screenLink.getAttribute("data-screen-route");
      if (!isAllowed(targetRoute)) {
        var owner = roleForRoute(targetRoute);
        if (owner) {
          event.preventDefault();
          setRole(owner);
          navigate(targetRoute);
        }
      }
    }

    var subjectLink = event.target.closest("[data-open-subject]");
    if (subjectLink) {
      event.preventDefault();
      var subjectId = subjectLink.getAttribute("data-open-subject");
      if (subjectById(subjectId)) navigate("/topics/" + subjectId);
      return;
    }

    var roleButton = event.target.closest("[data-role]");
    if (roleButton) {
      setRole(roleButton.getAttribute("data-role"));
      return;
    }

    var opener = event.target.closest("[data-open-modal]");
    if (opener) {
      openModal(opener.getAttribute("data-open-modal"));
      return;
    }

    var closer = event.target.closest("[data-close-modal]");
    if (closer) {
      closeModal(closer.closest(".modal-layer"));
    }
  });

  mobileToggle.addEventListener("change", function () {
    setMobileView(mobileToggle.checked);
  });

  inspectToggle.addEventListener("change", function () {
    setInspect(inspectToggle.checked);
  });

  if (listStateSelect) {
    listStateSelect.addEventListener("change", function () {
      setListState(listStateSelect.value);
    });
  }

  var skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      screen.focus();
      screen.scrollIntoView({ block: "start" });
    });
  }

  window.addEventListener("hashchange", syncRoute);

  window.addEventListener("resize", function () {
    applyLayout();
    updateProtoHeight();
    updateDeviceScale();
    if (inspectedEl && !inspectCard.hidden) positionInspectCard(inspectedEl);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateProtoHeight);
  }

  /* ---------- Screen templates ---------- */

  function tokenHex(token) {
    return getComputedStyle(document.documentElement).getPropertyValue(token).trim().toUpperCase();
  }

  function FoundationsScreen() {
    var catalog = SUBJECTS.map(function (subject) {
      return subject.name + " · " + subject.code;
    }).join(", ");
    var tabs = ROLE_TABS[state.role].map(function (tab) {
      return tab.label;
    }).join(", ");

    return `
      <div class="screen screen--wide flow" data-inspect="foundations.intro">
        <div class="page-head">
          <p class="eyebrow">Phase 0 · Foundations</p>
          <h1 class="page-title">The frame is ready</h1>
          <p class="lede">A permanent reference for the structural walkthrough. It shows the shell, the design tokens and every shared component that the student screens are built from.</p>
        </div>

        <section class="hero-card" data-inspect="foundations.shell">
          <p class="eyebrow">App shell</p>
          <h2 class="section-title" style="margin-top: var(--space-2)">One frame, three roles</h2>
          <p class="lede" style="margin-top: var(--space-5)">The top bar, bottom tab bar and role tabs stay the same. Only the tabs and the screens behind them change.</p>
          <dl class="kv" style="margin-top: var(--space-5)">
            <dt>Previewing as</dt>
            <dd>${ROLE_LABELS[state.role]}</dd>
            <dt>Subjects in the catalogue</dt>
            <dd>${esc(catalog)}</dd>
            <dt>Tabs in this role</dt>
            <dd>${tabs}</dd>
          </dl>
          <div class="demo-row" style="margin-top: var(--space-5)">
            <a class="btn btn--secondary" href="#/sitemap">Open the sitemap</a>
            <button type="button" class="btn btn--ghost" data-open-modal="demoModal" data-inspect="foundations.modal">See a modal</button>
          </div>
        </section>

        <section class="flow" data-inspect="foundations.tokens">
          <div>
            <p class="eyebrow">Design tokens</p>
            <h2 class="section-title" style="margin-top: var(--space-2)">Warm, in one place</h2>
            <p class="lede" style="margin-top: var(--space-5)">Every screen uses these named colours. Crimson is reserved for primary actions and active states.</p>
          </div>
          <div class="swatches">
            ${TOKEN_LIST.map(function (token) {
              return `
                <div class="swatch">
                  <div class="swatch__chip" style="background: var(${token.token})"></div>
                  <div class="swatch__meta">
                    <div class="swatch__name">${token.name}</div>
                    <div class="swatch__hex">${tokenHex(token.token)} · ${token.use}</div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </section>

        <section class="flow" data-inspect="foundations.type">
          <div>
            <p class="eyebrow">Type</p>
            <h2 class="section-title" style="margin-top: var(--space-2)">Inter, tightly set</h2>
            <p class="lede" style="margin-top: var(--space-5)">Headings are weight 500 with tight tracking. Body text stays at 16px or larger.</p>
          </div>
          <div class="card card--plain">
            <div class="type-row">
              <span style="font-size: var(--text-3xl); font-weight: 500; letter-spacing: -0.04em; line-height: 1.1; color: var(--ink)">Heading</span>
              <span class="type-row__meta">38 / 500 / −0.04em</span>
            </div>
            <div class="type-row">
              <span style="font-size: var(--text-xl); font-weight: 500; letter-spacing: -0.04em; line-height: 1.2; color: var(--ink)">Section heading</span>
              <span class="type-row__meta">24 / 500</span>
            </div>
            <div class="type-row">
              <span style="font-size: var(--text-base); line-height: 1.5; color: var(--body)">Body text for reading, at 16px with a 1.5 line height.</span>
              <span class="type-row__meta">16 / 400 / 1.5</span>
            </div>
            <div class="type-row">
              <span class="eyebrow">Eyebrow label</span>
              <span class="type-row__meta">11 / 500 / 0.14em</span>
            </div>
          </div>
        </section>

        <section class="flow">
          <div>
            <p class="eyebrow">Shared components</p>
            <h2 class="section-title" style="margin-top: var(--space-2)">The parts every screen reuses</h2>
            <p class="lede" style="margin-top: var(--space-5)">Each component has default, hover, focus, active and disabled states. Error states are shown where they apply.</p>
          </div>

          <div class="demo-grid">
            <div class="card card--plain demo-group" data-inspect="foundations.buttons">
              <div>
                <p class="eyebrow">Button</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Actions</h3>
              </div>
              <div class="demo-stack">
                <div class="demo-row">
                  <button type="button" class="btn btn--primary">Submit answer</button>
                  <button type="button" class="btn btn--secondary">Save for later</button>
                  <button type="button" class="btn btn--ghost">Clear filters</button>
                </div>
                <div class="demo-row">
                  <button type="button" class="btn btn--primary" disabled>Submit answer</button>
                  <button type="button" class="btn btn--secondary btn--small">Small action</button>
                </div>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.inputs">
              <div>
                <p class="eyebrow">Input, textarea and select</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Fields</h3>
              </div>
              <div class="field">
                <label class="field__label" for="demo-email">Email</label>
                <input class="input" id="demo-email" type="email" placeholder="you@example.com">
                <p class="field__hint">Use the email your school knows you by.</p>
              </div>
              <div class="field">
                <label class="field__label" for="demo-password">Password</label>
                <input class="input" id="demo-password" type="password" value="short" aria-invalid="true" aria-describedby="demo-password-error">
                <p class="field__error" id="demo-password-error">Use at least 8 characters.</p>
              </div>
              <div class="field">
                <label class="field__label" for="demo-difficulty">Difficulty</label>
                <div class="select-wrap">
                  <select class="select" id="demo-difficulty">
                    <option>Any difficulty</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label class="field__label" for="demo-notes">Working</label>
                <textarea class="textarea" id="demo-notes" placeholder="Show your working here"></textarea>
              </div>
              <div class="field">
                <label class="field__label" for="demo-school">School</label>
                <input class="input" id="demo-school" value="Added by your teacher" disabled>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.tabs">
              <div>
                <p class="eyebrow">Tabs</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Two views, one screen</h3>
              </div>
              <div class="demo-stack">
                <div class="tabs" role="tablist" aria-label="Question type" data-tabs>
                  <button type="button" class="tab" role="tab" id="demo-tab-past" aria-selected="true" aria-controls="demo-panel-past" tabindex="0">Past paper questions</button>
                  <button type="button" class="tab" role="tab" id="demo-tab-practice" aria-selected="false" aria-controls="demo-panel-practice" tabindex="-1">Practice questions</button>
                </div>
                <div role="tabpanel" id="demo-panel-past" aria-labelledby="demo-tab-past">
                  <p class="muted">Real CAIE questions, organised by topic instead of by year.</p>
                </div>
                <div role="tabpanel" id="demo-panel-practice" aria-labelledby="demo-tab-practice" hidden>
                  <p class="muted">New, unseen questions that follow the CAIE pattern. Every one is approved before students see it.</p>
                </div>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.card">
              <div>
                <p class="eyebrow">Card</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Grouping</h3>
              </div>
              <div class="card">
                <p class="eyebrow">Continue</p>
                <p class="subsection-title" style="margin-top: var(--space-2)">Kinematics</p>
                <p class="muted" style="margin-top: var(--space-2)">12 of 38 questions done</p>
                <p style="margin-top: var(--space-4)"><span class="badge badge--brand">In progress</span></p>
              </div>
              <div class="card card--featured">
                <p class="eyebrow">Featured</p>
                <p class="subsection-title" style="margin-top: var(--space-2)">Practice questions</p>
                <p class="muted" style="margin-top: var(--space-2)">A slightly deeper tone, separated by a hairline.</p>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.listrow">
              <div>
                <p class="eyebrow">List row</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">One item, one tap target</h3>
              </div>
              <ul class="list">
                <li>
                  <a class="list-row" href="#/topics">
                    <span class="list-row__main">
                      <span class="list-row__title">Kinematics</span>
                      <span class="list-row__meta">38 questions · 14 done</span>
                    </span>
                    <span class="list-row__end"><span class="badge">Physics</span>${ICONS.chevron}</span>
                  </a>
                </li>
                <li>
                  <a class="list-row" href="#/topics">
                    <span class="list-row__main">
                      <span class="list-row__title">Programming</span>
                      <span class="list-row__meta">46 questions · 18 done</span>
                    </span>
                    <span class="list-row__end"><span class="badge">CS</span>${ICONS.chevron}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.badge">
              <div>
                <p class="eyebrow">Badge</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Small labels</h3>
              </div>
              <div class="demo-row">
                <span class="badge">Past paper</span>
                <span class="badge badge--brand">Practice question</span>
                <span class="badge">Medium</span>
                <span class="badge badge--solid">New</span>
                <span class="badge badge--panel">4 marks</span>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.filterbar">
              <div>
                <p class="eyebrow">Filter bar</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Narrowing a list</h3>
              </div>
              <div class="filter-bar">
                <div class="field">
                  <label class="field__label" for="demo-year">Year</label>
                  <div class="select-wrap">
                    <select class="select" id="demo-year">
                      <option>Any year</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label class="field__label" for="demo-paper">Paper</label>
                  <div class="select-wrap">
                    <select class="select" id="demo-paper">
                      <option>Any paper</option>
                      <option>Paper 2</option>
                      <option>Paper 4</option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label class="field__label" for="demo-level">Difficulty</label>
                  <div class="select-wrap">
                    <select class="select" id="demo-level">
                      <option>Any difficulty</option>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>
                <div class="filter-bar__actions">
                  <button type="button" class="btn btn--ghost btn--small">Clear</button>
                </div>
              </div>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.breadcrumb">
              <div>
                <p class="eyebrow">Breadcrumb</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">The path back</h3>
              </div>
              <nav aria-label="Breadcrumb">
                <ol class="breadcrumb">
                  <li><a href="#/topics">Physics</a></li>
                  <li><a href="#/topics">Kinematics</a></li>
                  <li><span aria-current="page">Question 3</span></li>
                </ol>
              </nav>
            </div>

            <div class="card card--plain demo-group" data-inspect="foundations.empty">
              <div>
                <p class="eyebrow">Empty state</p>
                <h3 class="subsection-title" style="margin-top: var(--space-2)">Nothing here yet</h3>
              </div>
              <div class="empty">
                <span class="empty__mark">${ICONS.queue}</span>
                <p class="empty__title">More practice questions for this topic are on the way.</p>
                <p class="muted">Try the past paper questions in the meantime.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--featured" data-inspect="foundations.next">
          <p class="eyebrow">Next</p>
          <h2 class="section-title" style="margin-top: var(--space-2)">Phase 1 is built — the student core loop</h2>
          <p class="lede" style="margin-top: var(--space-5)">Home, the topic browser, a question and its result now sit on top of this frame. The sitemap lists every screen and the phase it belongs to.</p>
          <p style="margin-top: var(--space-5)"><a class="btn btn--primary" href="#/">Open Home</a> <a class="btn btn--secondary" href="#/sitemap">See the full sitemap</a></p>
        </section>
      </div>`;
  }

  function truncate(text, max) {
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trim() + "…";
  }

  function ListStateBlock(label, emptyTitle, emptyMessage) {
    if (state.listState === "loading") {
      return `
        <div class="state-block" aria-busy="true" data-inspect="state.loading">
          <p class="sr-only">Loading ${esc(label)}</p>
          ${[1, 2, 3, 4].map(function () {
            return `
              <div class="skeleton-row" aria-hidden="true">
                <span class="skeleton skeleton--title"></span>
                <span class="skeleton skeleton--meta"></span>
              </div>`;
          }).join("")}
        </div>`;
    }

    if (state.listState === "error") {
      return `
        <div class="empty" data-inspect="state.error">
          <p class="empty__title">Could not load ${esc(label)}</p>
          <p class="muted">Check your connection, then try again.</p>
          <button type="button" class="btn btn--secondary btn--small" data-retry-list>Try again</button>
        </div>`;
    }

    return `
      <div class="empty" data-inspect="state.empty">
        <p class="empty__title">${esc(emptyTitle)}</p>
        <p class="muted">${esc(emptyMessage)}</p>
      </div>`;
  }

  function subjectStats(subject) {
    return subject.topics.reduce(function (total, topic) {
      total.done += topic.done;
      total.questions += topic.questionCount;
      return total;
    }, { done: 0, questions: 0 });
  }

  function uniqueValues(items, key) {
    var values = [];
    items.forEach(function (item) {
      if (item[key] !== null && values.indexOf(item[key]) === -1) values.push(item[key]);
    });
    return values;
  }

  function Breadcrumb(items) {
    return '<nav aria-label="Breadcrumb" data-inspect="breadcrumb"><ol class="breadcrumb">' +
      items.map(function (item, index) {
        var current = index === items.length - 1;
        if (current) return '<li><span aria-current="page">' + esc(item.label) + "</span></li>";
        return '<li><a href="#' + item.route + '">' + esc(item.label) + "</a></li>";
      }).join("") +
      "</ol></nav>";
  }

  function SubjectCard(subject) {
    var stats = subjectStats(subject);
    return `
      <a class="card subject-card" href="#/topics/${subject.id}" data-open-subject="${subject.id}" data-inspect="home.subjectCard">
        <span class="subject-card__head">
          <span class="eyebrow">${subject.code}</span>
          <span class="badge badge--panel">${subject.topics.length} topics</span>
        </span>
        <span class="subject-card__title">${esc(subject.name)}</span>
        <span class="muted">${stats.done} of ${stats.questions} questions done</span>
        <span class="progress" aria-hidden="true"><span style="width:${progressPercent(stats.done, stats.questions)}%"></span></span>
      </a>`;
  }

  function HomeScreen() {
    var current = continueTopic();
    var stats = SUBJECTS.reduce(function (total, subject) {
      var subjectTotal = subjectStats(subject);
      total.done += subjectTotal.done;
      total.questions += subjectTotal.questions;
      return total;
    }, { done: 0, questions: 0 });
    var attempts = ATTEMPTS.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    }).slice(0, 3);
    var posts = COMMUNITY_POSTS.slice(0, 2);
    var notes = TEACHER_NOTES.filter(function (note) {
      return note.isNew;
    }).slice(0, 2);

    return `
      <div class="screen flow" data-inspect="home.intro">
        <div class="page-head">
          <p class="eyebrow">Student · Home</p>
          <h1 class="page-title">Pick up where you left off</h1>
          <p class="lede">Your last topic, every subject in the catalogue and the marks you have earned recently, in one place.</p>
        </div>

        <section class="card card--featured continue-card" data-inspect="home.continue">
          <p class="eyebrow">Continue where you left off</p>
          <h2 class="section-title" style="margin-top: var(--space-2)">${esc(current.topic.name)}</h2>
          <p class="muted" style="margin-top: var(--space-2)">${esc(current.subject.name)} · ${current.topic.done} of ${current.topic.questionCount} questions done</p>
          <div class="progress" aria-hidden="true"><span style="width:${progressPercent(current.topic.done, current.topic.questionCount)}%"></span></div>
          <p style="margin-top: var(--space-5)">
            <a class="btn btn--primary" href="#/topic/${current.topic.id}">Continue topic</a>
          </p>
        </section>

        <section class="flow--tight" data-inspect="home.subjects">
          <div class="section-head">
            <h2 class="section-title">Browse by subject</h2>
            <p class="muted">${stats.done} of ${stats.questions} questions done across all subjects</p>
          </div>
          <div class="home-grid">${SUBJECTS.map(SubjectCard).join("")}</div>
        </section>

        <section class="flow--tight" data-inspect="home.activity">
          <div class="section-head">
            <h2 class="section-title">Recent activity</h2>
            <a class="muted" href="#/progress">See all</a>
          </div>
          <ul class="list">
            ${attempts.map(function (attempt) {
              var question = questionById(attempt.questionId);
              if (!question) return "";
              var found = topicById(question.topicId);
              return `
                <li>
                  <a class="list-row" href="#/result/${question.id}" data-inspect="home.attempt">
                    <span class="list-row__main">
                      <span class="list-row__title">${esc(found ? found.topic.name : question.topicId)}</span>
                      <span class="list-row__meta">${esc(truncate(question.stem, 58))} · ${formatDate(attempt.date)}</span>
                    </span>
                    <span class="list-row__end"><span class="badge">${attempt.awarded}/${attempt.total}</span>${ICONS.chevron}</span>
                  </a>
                </li>`;
            }).join("")}
          </ul>
        </section>

        <div class="home-split">
          <section class="card card--plain" data-inspect="home.community">
            <div class="section-head">
              <h2 class="subsection-title">From the community</h2>
              <a class="muted" href="#/community">See all</a>
            </div>
            <div class="preview-list">
              ${posts.map(function (post) {
                return `
                  <article class="preview-item" data-inspect="home.community">
                    <p class="preview-item__meta">${esc(post.author)} · ${esc(post.time)}</p>
                    <p class="preview-item__snippet">${esc(post.snippet)}</p>
                    <p class="muted">${post.likes} likes · ${post.comments} comments</p>
                  </article>`;
              }).join("")}
            </div>
          </section>

          <section class="card card--plain" data-inspect="home.notes">
            <div class="section-head">
              <h2 class="subsection-title">From your teacher</h2>
              <a class="muted" href="#/notes">See all</a>
            </div>
            <div class="preview-list">
              ${notes.map(function (note) {
                return `
                  <article class="preview-item" data-inspect="home.notes">
                    <p class="preview-item__meta">${esc(note.teacher)} · ${esc(note.time)}</p>
                    <p class="preview-item__title">${esc(note.title)}</p>
                    <p class="muted">${esc(note.excerpt)}</p>
                  </article>`;
              }).join("")}
            </div>
          </section>
        </div>
      </div>`;
  }

  function LoginScreen() {
    return `
      <div class="screen flow auth" data-inspect="login.intro">
        <div class="page-head">
          <p class="eyebrow">Student and teacher access</p>
          <h1 class="page-title">Welcome to Excelerate</h1>
          <p class="lede">Log in to keep your progress, or create an account to start practising. Reviewers are added by an admin.</p>
        </div>

        <div class="card card--plain auth-card" data-inspect="login.tabs">
          <div class="tabs" role="tablist" aria-label="Account" data-tabs>
            <button type="button" class="tab" role="tab" id="auth-tab-login" aria-selected="true" aria-controls="auth-panel-login" tabindex="0">Log in</button>
            <button type="button" class="tab" role="tab" id="auth-tab-signup" aria-selected="false" aria-controls="auth-panel-signup" tabindex="-1">Sign up</button>
          </div>

          <div role="tabpanel" id="auth-panel-login" aria-labelledby="auth-tab-login">
            <form class="flow" data-login-form data-inspect="login.loginForm">
              <div class="field">
                <label class="field__label" for="login-email">Email</label>
                <input class="input" id="login-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="field" data-inspect="login.forgot">
                <label class="field__label" for="login-password">Password</label>
                <input class="input" id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Your password">
                <button type="button" class="link-btn" data-forgot aria-expanded="false" aria-controls="login-forgot-note">Forgot password?</button>
                <p class="field__hint" id="login-forgot-note" data-forgot-note hidden>In the real app, a reset link would be sent to this email.</p>
              </div>
              <button type="submit" class="btn btn--primary btn--block">Log in</button>
            </form>
          </div>

          <div role="tabpanel" id="auth-panel-signup" aria-labelledby="auth-tab-signup" hidden>
            <form class="flow" data-signup-form data-inspect="login.signupForm">
              <fieldset class="field choice-field" data-inspect="login.role">
                <legend class="field__label">I am a</legend>
                <div class="choice-row">
                  <label class="choice"><input type="radio" name="signup-role" value="student" checked><span>Student</span></label>
                  <label class="choice"><input type="radio" name="signup-role" value="teacher"><span>Teacher</span></label>
                </div>
                <p class="field__hint">Reviewers are added by an admin, so they are not offered here.</p>
              </fieldset>

              <div class="field">
                <label class="field__label" for="signup-email">Email</label>
                <input class="input" id="signup-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="field">
                <label class="field__label" for="signup-password">Password</label>
                <input class="input" id="signup-password" name="password" type="password" autocomplete="new-password" placeholder="At least 8 characters">
                <p class="field__hint">Use at least 8 characters.</p>
              </div>
              <button type="submit" class="btn btn--primary btn--block">Create account</button>
            </form>
          </div>
        </div>
      </div>`;
  }

  function TopicsScreen(subjectFilter) {
    var current = subjectFilter ? subjectById(subjectFilter) : null;
    var entries = allTopics().filter(function (entry) {
      return !current || entry.subject.id === current.id;
    });
    var eyebrow = current ? current.name + " · " + current.code : "All subjects · Question bank";
    var placeholder = current ? "Search " + current.name + " topics" : "Search all topics";

    return `
      <div class="screen flow" data-inspect="topics.intro">
        <div class="page-head">
          <p class="eyebrow">${esc(eyebrow)}</p>
          <h1 class="page-title">Topics</h1>
          <p class="lede">Choose a topic, then pick past paper or practice questions. Every subject is open, and progress shows how much of each topic is done.</p>
        </div>

        <div class="search-row">
          <div class="field" data-inspect="topics.subjectFilter">
            <label class="field__label" for="topic-subject">Subject</label>
            <div class="select-wrap">
              <select class="select" id="topic-subject" data-topic-subject>
                <option value="">All subjects</option>
                ${SUBJECTS.map(function (subject) {
                  return '<option value="' + subject.id + '"' +
                    (current && current.id === subject.id ? " selected" : "") + ">" +
                    esc(subject.name) + "</option>";
                }).join("")}
              </select>
            </div>
          </div>
          <div class="field" data-inspect="topics.search">
            <label class="field__label" for="topic-search">Search topics</label>
            <input class="input" id="topic-search" type="search" placeholder="${esc(placeholder)}" data-topic-search>
          </div>
          <p class="muted" data-topic-count>${entries.length} topics</p>
        </div>

        <section class="flow--tight" data-inspect="topics.list">
          ${state.listState === "default" ? `
            <ul class="list">
              ${entries.map(function (entry) {
                var topic = entry.topic;
                return `
                  <li data-topic-row data-search="${esc(entry.subject.name + " " + entry.subject.code + " " + topic.name + " " + topic.description)}">
                    <a class="list-row list-row--topic" href="#/topic/${topic.id}" data-inspect="topics.row">
                      <span class="list-row__main">
                        <span class="list-row__title">${esc(topic.name)}</span>
                        <span class="list-row__meta">${topic.questionCount} questions · ${topic.done} of ${topic.questionCount} done</span>
                        <span class="progress progress--sm" aria-hidden="true"><span style="width:${progressPercent(topic.done, topic.questionCount)}%"></span></span>
                      </span>
                      <span class="list-row__end"><span class="badge">${esc(entry.subject.code)}</span>${ICONS.chevron}</span>
                    </a>
                  </li>`;
              }).join("")}
            </ul>
            <div class="empty" data-topic-empty hidden>
              <p class="empty__title">No topics match that search.</p>
              <p class="muted">Try a shorter word, or clear the search.</p>
            </div>` : ListStateBlock("topics", "No topics yet", "Topics will appear here once the syllabus is added.")}
        </section>
      </div>`;
  }

  function QuestionRows(items) {
    return items.map(function (question) {
      var status = question.attempted
        ? '<span class="badge">Attempted ' + question.awarded + "/" + question.marks + "</span>"
        : '<span class="badge badge--panel">Not attempted</span>';
      return `
        <li data-question-row data-kind="${question.kind}" data-year="${question.year || ""}" data-paper="${question.paper || ""}" data-difficulty="${esc(question.difficulty)}">
          <a class="list-row list-row--question" href="#/question/${question.id}" data-inspect="topic.questionRow">
            <span class="list-row__main">
              <span class="list-row__title">${esc(truncate(question.stem, 92))}</span>
              <span class="list-row__meta">${question.marks} marks · ${esc(question.difficulty)} · ${esc(question.source)}</span>
            </span>
            <span class="list-row__end">${status}${ICONS.chevron}</span>
          </a>
        </li>`;
    }).join("");
  }

  function TopicScreen(id, initialTab) {
    var found = topicById(id);
    if (!found) return NotFoundScreen();
    var topic = found.topic;
    var subject = found.subject;
    var practiceFirst = initialTab === "practice";
    var past = questionsFor(topic.id, "past");
    var practice = questionsFor(topic.id, "practice");
    var years = uniqueValues(past, "year").sort(function (a, b) {
      return b - a;
    });
    var papers = uniqueValues(past, "paper").sort();

    var pastPanel = past.length
      ? `<ul class="list">${QuestionRows(past)}</ul>
         <div class="empty" data-empty-filter data-inspect="topic.empty" hidden>
           <p class="empty__title">No past paper questions match these filters.</p>
           <p class="muted">Clear a filter to see the rest.</p>
         </div>`
      : `<div class="empty" data-inspect="topic.empty">
           <p class="empty__title">No past paper questions for this topic yet.</p>
         </div>`;

    var practicePanel = practice.length
      ? `<ul class="list">${QuestionRows(practice)}</ul>
         <div class="empty" data-empty-filter data-inspect="topic.empty" hidden>
           <p class="empty__title">No practice questions match these filters.</p>
           <p class="muted">Clear a filter to see the rest.</p>
         </div>`
      : `<div class="empty" data-inspect="topic.empty">
           <p class="empty__title">More practice questions for this topic are on the way.</p>
           <p class="muted">Try the past paper questions in the meantime.</p>
         </div>`;

    return `
      <div class="screen flow">
        ${Breadcrumb([
          { label: subject.name, route: "/topics" },
          { label: topic.name }
        ])}

        <div class="page-head" data-inspect="topic.intro">
          <p class="eyebrow">${esc(subject.name)} · ${subject.code}</p>
          <h1 class="page-title">${esc(topic.name)}</h1>
          <p class="lede">${esc(topic.description)}</p>
        </div>

        <div class="flow--tight" data-inspect="topic.tabs">
          <div class="tabs" role="tablist" aria-label="Question type" data-tabs data-question-tabs>
            <button type="button" class="tab" role="tab" id="topic-tab-past" aria-selected="${practiceFirst ? "false" : "true"}" aria-controls="topic-panel-past" tabindex="${practiceFirst ? "-1" : "0"}" data-kind="past">Past paper questions</button>
            <button type="button" class="tab" role="tab" id="topic-tab-practice" aria-selected="${practiceFirst ? "true" : "false"}" aria-controls="topic-panel-practice" tabindex="${practiceFirst ? "0" : "-1"}" data-kind="practice">Practice questions</button>
          </div>
        </div>

        <div class="filter-bar" data-question-filters data-inspect="topic.filters">
          <div class="field" data-filter-past>
            <label class="field__label" for="filter-year">Year</label>
            <div class="select-wrap">
              <select class="select" id="filter-year" data-filter="year">
                <option value="">Any year</option>
                ${years.map(function (year) { return '<option value="' + year + '">' + year + "</option>"; }).join("")}
              </select>
            </div>
          </div>
          <div class="field" data-filter-past>
            <label class="field__label" for="filter-paper">Paper</label>
            <div class="select-wrap">
              <select class="select" id="filter-paper" data-filter="paper">
                <option value="">Any paper</option>
                ${papers.map(function (paper) { return '<option value="' + paper + '">Paper ' + paper + "</option>"; }).join("")}
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="filter-difficulty">Difficulty</label>
            <div class="select-wrap">
              <select class="select" id="filter-difficulty" data-filter="difficulty">
                <option value="">Any difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div class="filter-bar__actions">
            <button type="button" class="btn btn--ghost btn--small" data-clear-filters>Clear</button>
          </div>
        </div>

        <div role="tabpanel" id="topic-panel-past" aria-labelledby="topic-tab-past" data-panel-kind="past"${practiceFirst ? " hidden" : ""}>
          ${pastPanel}
        </div>
        <div role="tabpanel" id="topic-panel-practice" aria-labelledby="topic-tab-practice" data-panel-kind="practice"${practiceFirst ? "" : " hidden"}>
          ${practicePanel}
        </div>
      </div>`;
  }

  /* ---------- 2D figures ---------- */

  function QuestionFigure(question) {
    var spec = FIGURES[question.id];
    if (!spec) return "";
    return `
      <figure class="figure-box" data-inspect="question.figure">
        ${Figures.render(spec)}
        <figcaption class="muted">${esc(Figures.caption(spec))}</figcaption>
      </figure>`;
  }

  function QuestionHeader(question) {
    var found = topicById(question.topicId);
    var topic = found ? found.topic : null;
    var subject = found ? found.subject : subjectById(question.subjectId);
    var isPractice = question.kind === "practice";

    return `
      ${Breadcrumb([
        { label: subject ? subject.name : "Subject", route: "/topics/" + question.subjectId },
        { label: topic ? topic.name : "Topic", route: "/topic/" + question.topicId },
        { label: "Question" }
      ])}

      <div class="page-head" data-inspect="question.header">
        <div class="badge-row">
          <span class="badge ${isPractice ? "badge--brand" : ""}">${isPractice ? "Practice question" : "Past paper"}</span>
          <span class="badge badge--panel">${question.marks} marks</span>
          <span class="badge badge--panel">${esc(question.difficulty)}</span>
        </div>
        <h1 class="page-title">${esc(topic ? topic.name : "Question")}</h1>
        <p class="muted">${esc(question.source)}</p>
      </div>

      <section class="card card--plain question-card" data-inspect="question.stem">
        <p class="question-text">${esc(question.stem)}</p>
        ${QuestionFigure(question)}
      </section>`;
  }

  function QuestionTabs(question, active) {
    var base = "/question/" + question.id;
    var tabs = [
      { id: "solve", label: "Solve", route: base },
      { id: "solutions", label: "Solutions", route: base + "/solutions" },
      { id: "discussion", label: "Discussion", route: base + "/discussion" },
      { id: "stats", label: "Stats", route: base + "/stats" }
    ];

    return '<nav class="question-tabs" aria-label="Question sections" data-inspect="question.tabs">' +
      tabs.map(function (tab) {
        return '<a class="tab" href="#' + tab.route + '"' +
          (tab.id === active ? ' aria-current="page"' : "") + ">" + tab.label + "</a>";
      }).join("") +
      "</nav>";
  }

  function ScanChecking() {
    return `
      <div class="scan-result scan-result--busy" data-inspect="question.scanChecking" aria-busy="true">
        <div class="scan-result__head">
          <p class="eyebrow">Checking</p>
          <span class="scan-dot" aria-hidden="true"></span>
        </div>
        <ul class="scan-steps">
          <li>Reading your working</li>
          <li>Comparing it with the mark scheme</li>
          <li>Estimating the mark</li>
        </ul>
        <p class="muted">This sample check does not read or upload your file.</p>
      </div>`;
  }

  function scanFeedback(question, draft, scan) {
    var lines = [];
    var missed = scan.points.filter(function (point) {
      return !point.covered;
    });
    var answer = (draft.answer || "").trim();

    if (scan.estimate === scan.total) {
      lines.push("Every mark-scheme point looks covered. In the real product a marker would still read the working line by line.");
    } else if (scan.estimate <= 1) {
      lines.push("Only one point looks covered. Start with the method line, substitute, then state the final value.");
    } else {
      lines.push("About " + scan.estimate + " of " + scan.total + " marks look covered — roughly " +
        Math.round((scan.estimate / scan.total) * 100) + "%.");
    }

    if (missed.length === 1) {
      lines.push("Still to show: “" + missed[0].point + "”.");
    } else if (missed.length > 1) {
      lines.push("Still to show: " + missed.map(function (point) {
        return "“" + point.point + "”";
      }).join(", ") + ".");
    }

    if (draft.fileName && !answer) {
      lines.push("You attached " + draft.fileName + " but typed nothing. The sample cannot open the file, so write the key values as well.");
    }

    if (answer && /[0-9]/.test(answer) && !/(\bm\b|\bs\b|\bN\b|\bJ\b|\bW\b|\bV\b|\bA\b|\bHz\b|\bkg\b|°C|m s|m\/s|Ω)/.test(answer)) {
      lines.push("Add a unit to the final value: a number without a unit often loses the last mark.");
    }

    if (question.workedSteps && question.workedSteps.length && scan.estimate < scan.total) {
      lines.push("Use Walk me through below if you want the full method for this question.");
    }

    return lines;
  }

  function ScanResult(question, draft, scan) {
    return `
      <div class="scan-result" data-inspect="question.scan">
        <div class="scan-result__head">
          <p class="eyebrow">Sample check</p>
          <p class="scan-result__score">${scan.estimate} / ${scan.total}</p>
        </div>
        <p class="muted">Estimated from this question's mark scheme. This prototype does not read or upload your file.</p>
        <ul class="scan-points">
          ${scan.points.map(function (point) {
            return `
              <li class="scan-point">
                <span class="badge ${point.covered ? "" : "badge--panel"}">${point.covered ? "Looks covered" : "Check this"}</span>
                <span class="scan-point__text">${esc(point.point)}</span>
              </li>`;
          }).join("")}
        </ul>
        <div class="scan-feedback" data-inspect="question.scanFeedback">
          ${scanFeedback(question, draft, scan).map(function (line) {
            return "<p>" + esc(line) + "</p>";
          }).join("")}
        </div>
      </div>`;
  }

  function SolvePanel(question) {
    var draft = draftFor(question.id);
    var found = topicById(question.topicId);
    var subject = found ? found.subject : subjectById(question.subjectId);
    var isCs = subject && subject.id === "cs";
    var hasFile = Boolean(draft.fileName);

    return `
      <section class="flow" data-inspect="question.solve">
        <form class="flow" data-answer-form data-question-id="${question.id}">
          <div class="field" data-inspect="question.answer">
            <label class="field__label" for="answer-${question.id}">Your answer</label>
            <textarea class="textarea" id="answer-${question.id}" name="answer" rows="6" placeholder="Show your working here" data-answer-input>${esc(draft.answer)}</textarea>
            <p class="field__hint">Marks are awarded for method as well as the final value.</p>
          </div>

          <div class="upload" data-inspect="question.upload">
            <p class="field__label">Upload your working</p>
            <div class="upload__drop">
              <input class="upload__input" id="answer-file-${question.id}" type="file" accept="image/*,.pdf" data-answer-file>
              <label class="upload__label" for="answer-file-${question.id}">
                <span class="upload__icon" aria-hidden="true">${ICONS.upload}</span>
                <span class="upload__title">Choose an image or PDF</span>
                <span class="upload__hint">or drop it here · nothing is uploaded</span>
              </label>
            </div>
            ${hasFile ? `
              <div class="upload__file" data-answer-file-card>
                <span class="upload__badge">${draft.fileType === "pdf" ? "PDF" : draft.fileType === "image" ? "IMG" : "FILE"}</span>
                <span class="upload__meta">
                  <span class="upload__name" data-answer-file-name>${esc(draft.fileName)}</span>
                  <span class="upload__size">${esc(draft.fileSize || "")}</span>
                </span>
                <button type="button" class="icon-btn" data-answer-file-remove aria-label="Remove the attachment" data-inspect="question.uploadRemove">${ICONS.close}</button>
              </div>` : ""}
            ${draft.fileUrl ? `
              <figure class="upload__preview" data-answer-preview>
                <img src="${esc(draft.fileUrl)}" alt="Preview of the attached image">
              </figure>` : ""}
          </div>

          <div class="flow--tight">
            <div class="actions-row">
              <button type="button" class="btn btn--secondary" data-scan-check data-inspect="question.scan"${draft.scanning ? " disabled" : ""}>${draft.scanning ? "Checking…" : "Scan and check"}</button>
            </div>
            <p class="field__error" data-scan-notice${draft.scanNotice ? "" : " hidden"}>${esc(draft.scanNotice || "")}</p>
            ${draft.scanning ? ScanChecking() : draft.scan ? ScanResult(question, draft, draft.scan) : ""}
          </div>

          <div class="actions-row" data-inspect="question.actions">
            <button type="submit" class="btn btn--primary">Submit answer</button>
            <button type="button" class="btn btn--secondary" data-open-modal="demoModal" data-inspect="question.save">Save for later</button>
            <a class="btn btn--ghost" href="#/${isCs ? "code" : "diagram"}/${question.id}" data-inspect="question.workspace">Open ${isCs ? "code" : "diagram"} workspace</a>
          </div>
        </form>

        <section class="help-card" data-question-help data-inspect="question.help">
          <div class="section-head">
            <h2 class="subsection-title">Question help</h2>
            <p class="muted">Sample replies</p>
          </div>
          <div class="help-card__modes" data-inspect="question.helpModes">
            <button type="button" class="btn btn--secondary btn--small" data-question-help-mode="hint">Hint</button>
            <button type="button" class="btn btn--secondary btn--small" data-question-help-mode="walk">Walk me through</button>
            <button type="button" class="btn btn--secondary btn--small" data-question-help-mode="check">Check my working</button>
          </div>
          <div class="help-thread" data-inspect="question.helpReply">
            ${draft.helpMessages.length ? draft.helpMessages.map(function (message) {
              return `
                <div class="help-message">
                  <p class="help-message__label">${esc(message.label)}</p>
                  <p class="help-reply">${esc(message.text)}</p>
                </div>`;
            }).join("") : '<p class="field__hint">Ask for a hint, the method steps, or a check of your working.</p>'}
          </div>
          <form class="help-form" data-question-help-form>
            <div class="field">
              <label class="field__label" for="help-${question.id}">Ask about this question</label>
              <input class="input" id="help-${question.id}" type="text" placeholder="e.g. Why is the height a distance?" data-question-help-input>
            </div>
            <button type="submit" class="btn btn--secondary btn--small">Ask</button>
          </form>
        </section>
      </section>`;
  }

  function questionStats(question) {
    var history = QUESTION_HISTORY[question.id];
    if (history) {
      return {
        years: history.years,
        papers: history.papers,
        frequency: history.frequency,
        label: history.frequency + " past paper " + (history.frequency === 1 ? "appearance" : "appearances")
      };
    }
    if (question.kind === "past" && question.year) {
      return {
        years: [question.year],
        papers: [question.paper],
        frequency: 1,
        label: "1 past paper appearance"
      };
    }
    return { years: [], papers: [], frequency: 0, label: "No past appearances yet" };
  }

  function addDiscussionComment(questionId, text) {
    if (!QUESTION_DISCUSSION[questionId]) QUESTION_DISCUSSION[questionId] = [];
    var comment = { author: "You", text: text, time: "Just now" };
    QUESTION_DISCUSSION[questionId].push(comment);
    return comment;
  }

  function DiscussionPanel(question) {
    var thread = QUESTION_DISCUSSION[question.id] || [];

    return `
      <section class="flow--tight" data-inspect="question.discussion">
        <div class="section-head">
          <h2 class="section-title">Discussion</h2>
          <p class="muted">${countComments(thread)} ${countComments(thread) === 1 ? "comment" : "comments"}</p>
        </div>
        ${thread.length ? CommentThread(thread, "discussion", question.id) : `
          <div class="empty" data-inspect="question.discussionEmpty">
            <p class="empty__title">No discussion yet</p>
            <p class="muted">Ask something about this question, or share how you read it.</p>
          </div>`}
        <form class="discussion-form" data-discussion-form data-question-id="${question.id}" data-inspect="question.discussionForm">
          <div class="field">
            <label class="field__label" for="discussion-input">Add a comment</label>
            <textarea class="textarea" id="discussion-input" rows="3" placeholder="Ask something about this question" data-discussion-input></textarea>
            <p class="field__error" data-discussion-error hidden>Write a comment first.</p>
          </div>
          <button type="submit" class="btn btn--primary">Post comment</button>
        </form>
      </section>`;
  }

  function StatsPanel(question) {
    var stats = questionStats(question);

    return `
      <section class="flow--tight" data-inspect="question.stats">
        <div class="stats-grid">
          <div class="stat">
            <span class="stat__value">${stats.frequency}</span>
            <span class="stat__label">${stats.frequency === 1 ? "appearance" : "appearances"}</span>
          </div>
          <div class="stat">
            <span class="stat__value">${question.marks}</span>
            <span class="stat__label">marks</span>
          </div>
          <div class="stat">
            <span class="stat__value stat__value--text">${esc(question.difficulty)}</span>
            <span class="stat__label">difficulty</span>
          </div>
        </div>

        <div class="section-head">
          <h2 class="section-title">Years seen</h2>
          <p class="muted">${esc(stats.label)}</p>
        </div>
        ${stats.years.length ? `
          <ul class="year-list" data-inspect="question.statsYears">
            ${stats.years.map(function (year) {
              return '<li class="badge">' + year + "</li>";
            }).join("")}
          </ul>` : '<p class="muted" data-inspect="question.statsYears">No past appearances yet</p>'}

        ${stats.papers.length ? `
          <div class="section-head">
            <h2 class="section-title">Papers</h2>
          </div>
          <ul class="year-list">
            ${stats.papers.map(function (paper) {
              return '<li class="badge badge--panel">Paper ' + paper + "</li>";
            }).join("")}
          </ul>` : ""}

        <p class="field__hint">${question.kind === "practice"
          ? "Practice questions have not appeared in a past paper."
          : "Appearance counts are mock data for this prototype."}</p>
      </section>`;
  }

  function QuestionScreen(id, tab) {
    var question = questionById(id);
    if (!question) return NotFoundScreen();
    var active = tab || "solve";
    var panel;
    if (active === "solutions") {
      panel = SolutionsPanel(question);
    } else if (active === "discussion") {
      panel = DiscussionPanel(question);
    } else if (active === "stats") {
      panel = StatsPanel(question);
    } else {
      panel = SolvePanel(question);
    }

    return `
      <div class="screen flow">
        ${QuestionHeader(question)}
        ${QuestionTabs(question, active)}
        ${panel}
      </div>`;
  }

  function commentInitials(name) {
    return String(name).split(/\s+/).map(function (part) {
      return part.charAt(0);
    }).join("").slice(0, 2).toUpperCase();
  }

  function countComments(comments) {
    return comments.reduce(function (total, comment) {
      return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
  }

  function CommentBlock(comment, threadKind, threadId, index) {
    var replies = comment.replies || [];
    return `
      <li class="comment">
        <div class="comment__avatar" aria-hidden="true">${esc(commentInitials(comment.author))}</div>
        <div class="comment__body">
          <div class="comment__head">
            <p class="comment__author">${esc(comment.author)}</p>
            <p class="muted">${esc(comment.time)}</p>
          </div>
          <p class="comment__text">${esc(comment.text)}</p>
          <div class="comment__actions">
            <button type="button" class="link-btn" data-comment-reply="${index}" data-comment-thread="${threadKind}:${threadId}" data-inspect="question.commentReply">Reply</button>
          </div>
          ${replies.length ? `
            <ul class="comment__replies">
              ${replies.map(function (reply) {
                return `
                  <li class="comment comment--reply">
                    <div class="comment__avatar" aria-hidden="true">${esc(commentInitials(reply.author))}</div>
                    <div class="comment__body">
                      <div class="comment__head">
                        <p class="comment__author">${esc(reply.author)}</p>
                        <p class="muted">${esc(reply.time)}</p>
                      </div>
                      <p class="comment__text">${esc(reply.text)}</p>
                    </div>
                  </li>`;
              }).join("")}
            </ul>` : ""}
          <form class="comment-reply-form" data-comment-reply-form data-comment-thread="${threadKind}:${threadId}" data-comment-index="${index}" hidden data-inspect="question.commentReplyForm">
            <label class="sr-only" for="reply-${threadKind}-${threadId}-${index}">Reply to ${esc(comment.author)}</label>
            <input class="input" id="reply-${threadKind}-${threadId}-${index}" type="text" placeholder="Reply to ${esc(comment.author)}" data-comment-reply-input>
            <div class="actions-row">
              <button type="submit" class="btn btn--secondary btn--small">Send reply</button>
              <button type="button" class="btn btn--ghost btn--small" data-comment-reply-cancel>Cancel</button>
            </div>
          </form>
        </div>
      </li>`;
  }

  function CommentThread(comments, threadKind, threadId) {
    return '<ul class="comment-thread">' + comments.map(function (comment, index) {
      return CommentBlock(comment, threadKind, threadId, index);
    }).join("") + "</ul>";
  }

  function threadFor(kind, id) {
    if (kind === "solution") {
      for (var i = 0; i < COMMUNITY_POSTS.length; i += 1) {
        if (COMMUNITY_POSTS[i].id === id) return COMMUNITY_POSTS[i].commentList || [];
      }
      return [];
    }
    return QUESTION_DISCUSSION[id] || [];
  }

  function solutionsFor(questionId) {
    return COMMUNITY_POSTS.filter(function (post) {
      return post.questionId === questionId;
    }).sort(function (a, b) {
      return b.likes - a.likes;
    });
  }

  function toggleSolutionLike(post) {
    post.liked = !post.liked;
    post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1));
  }

  function addSolutionComment(post, text) {
    if (!post.commentList) post.commentList = [];
    var comment = { author: "You", text: text, time: "Just now" };
    post.commentList.push(comment);
    post.comments += 1;
    return comment;
  }

  function SolutionRow(post, isTop) {
    var route = "#/question/" + post.questionId + "/solutions/" + post.id;
    return `
      <li class="solution-card" data-inspect="question.solutionRow">
        <div class="solution-card__head">
          <div>
            <p class="solution-card__author">${esc(post.author)}</p>
            <p class="solution-card__meta">${esc(post.time)}</p>
          </div>
          ${isTop ? '<span class="badge badge--solid top-solution">Top solution</span>' : ""}
        </div>
        <p class="solution-card__snippet">${esc(post.snippet)}</p>
        <div class="solution-card__actions">
          <button type="button" class="link-btn" data-solution-like="${post.id}" aria-pressed="${post.liked ? "true" : "false"}" data-inspect="question.solutionLike">${post.liked ? "Liked" : "Like"} <span data-solution-like-count>${post.likes}</span></button>
          <a class="link-btn" href="${route}" data-inspect="question.solutionComments">${post.comments} ${post.comments === 1 ? "comment" : "comments"}</a>
          <a class="link-btn" href="${route}">Read solution</a>
        </div>
      </li>`;
  }

  function SolutionsPanel(question) {
    var solutions = solutionsFor(question.id);

    return `
      <section class="flow--tight" data-inspect="question.solutions">
        <div class="section-head">
          <h2 class="section-title">Solutions</h2>
          <p class="muted">${solutions.length} ${solutions.length === 1 ? "solution" : "solutions"} · most liked first</p>
        </div>
        ${solutions.length ? `
          <ul class="solution-list">
            ${solutions.map(function (post, index) {
              return SolutionRow(post, index === 0 && solutions.length > 1);
            }).join("")}
          </ul>
          <div class="actions-row">
            <button type="button" class="btn btn--secondary" data-share-solution="${question.id}">Share a solution</button>
          </div>` : `
          <div class="empty" data-inspect="question.solutionEmpty">
            <p class="empty__title">No solutions yet</p>
            <p class="muted">Be the first to share how you worked this question out.</p>
            <button type="button" class="btn btn--secondary btn--small" data-share-solution="${question.id}">Share the first solution</button>
          </div>`}
      </section>`;
  }

  function SolutionDetailScreen(questionId, solutionId) {
    var question = questionById(questionId);
    var post = null;
    for (var i = 0; i < COMMUNITY_POSTS.length; i += 1) {
      if (COMMUNITY_POSTS[i].id === solutionId) post = COMMUNITY_POSTS[i];
    }
    if (!question || !post) return NotFoundScreen();
    var comments = post.commentList || [];

    return `
      <div class="screen solution-detail" data-inspect="question.solutionDetail">
        ${Breadcrumb([
          { label: "Question", route: "/question/" + question.id },
          { label: "Solutions", route: "/question/" + question.id + "/solutions" },
          { label: "Solution" }
        ])}

        <div class="page-head">
          <p class="eyebrow">Solution · ${esc(post.author)}</p>
          <h1 class="page-title">${esc(truncate(question.stem, 60))}</h1>
          <p class="muted">${esc(post.time)}</p>
        </div>

        <section class="card card--plain" data-inspect="question.stem">
          <p class="eyebrow">The question</p>
          <p class="question-text" style="margin-top: var(--space-3)">${esc(question.stem)}</p>
        </section>

        <section class="card card--plain" data-inspect="question.solutionDetail">
          <div class="section-head">
            <h2 class="subsection-title">${esc(post.author)}'s solution</h2>
            <button type="button" class="link-btn" data-solution-like="${post.id}" aria-pressed="${post.liked ? "true" : "false"}" data-inspect="question.solutionLike">${post.liked ? "Liked" : "Like"} <span data-solution-like-count>${post.likes}</span></button>
          </div>
          <p class="comment__text" style="margin-top: var(--space-3)">${esc(post.solution)}</p>
          ${post.code ? `
            <div class="try-code" style="margin-top: var(--space-4)">
              <p class="field__label">Their pseudocode</p>
              <pre class="code-block"><code>${esc(post.code)}</code></pre>
              <div class="actions-row">
                <button type="button" class="btn btn--secondary" data-try-solution="${post.id}" data-inspect="question.solutionTry">Try this solution</button>
              </div>
            </div>` : ""}
        </section>

        <section class="flow--tight" data-inspect="question.solutionComments">
          <div class="section-head">
            <h2 class="section-title">Comments</h2>
            <p class="muted">${countComments(comments)} ${countComments(comments) === 1 ? "comment" : "comments"}</p>
          </div>
          ${comments.length ? CommentThread(comments, "solution", post.id) : `
            <div class="empty">
              <p class="empty__title">No comments yet</p>
              <p class="muted">Start the conversation below.</p>
            </div>`}
        </section>

        <form class="comment-form" data-solution-comment-form data-post-id="${post.id}" data-inspect="question.solutionCommentForm">
          <div class="field">
            <label class="field__label" for="solution-comment">Add a comment</label>
            <textarea class="textarea" id="solution-comment" rows="3" placeholder="Ask about the method or add a tip" data-solution-comment-input></textarea>
            <p class="field__error" data-solution-comment-error hidden>Write a comment first.</p>
          </div>
          <button type="submit" class="btn btn--primary">Post comment</button>
        </form>
      </div>`;
  }

  function ResultScreen(id) {
    var question = questionById(id);
    if (!question) return NotFoundScreen();
    var found = topicById(question.topicId);
    var topic = found ? found.topic : null;
    var subject = found ? found.subject : subjectById(question.subjectId);
    var attempt = attemptFor(question.id);
    var earnedPoints = question.markScheme.filter(function (point) {
      return point.earned;
    }).length;
    var awarded = attempt ? attempt.awarded : earnedPoints;
    var total = attempt ? attempt.total : question.marks;
    var next = nextQuestion(question);
    var isPractice = question.kind === "practice";

    return `
      <div class="screen flow">
        ${Breadcrumb([
          { label: subject.name, route: "/topics" },
          { label: topic ? topic.name : "Topic", route: "/topic/" + question.topicId },
          { label: "Result" }
        ])}

        <div class="page-head">
          <p class="eyebrow">${isPractice ? "Practice question" : "Past paper question"} · ${esc(topic ? topic.name : "")}</p>
          <h1 class="page-title">Your result</h1>
        </div>

        <section class="card card--featured score-card" data-inspect="result.score">
          <p class="score"><span class="score__value">${awarded}</span><span class="score__total">/ ${total}</span></p>
          <p class="muted">${awarded === total ? "Every mark scheme point was met." : "Some mark scheme points were missed. The list below shows where."}</p>
        </section>

        <section class="flow--tight" data-inspect="result.markscheme">
          <div class="section-head">
            <h2 class="section-title">Mark scheme</h2>
            <p class="muted">${earnedPoints} of ${question.markScheme.length} points earned</p>
          </div>
          <ul class="mark-list">
            ${question.markScheme.map(function (point) {
              return `
                <li class="mark-point ${point.earned ? "is-earned" : "is-missed"}" data-inspect="result.point">
                  <span class="badge ${point.earned ? "" : "badge--panel"}">${point.earned ? "Earned" : "Missed"}</span>
                  <span class="mark-point__text">${esc(point.point)}</span>
                </li>`;
            }).join("")}
          </ul>
        </section>

        <section class="card card--plain" data-inspect="result.feedback">
          <p class="eyebrow">Feedback</p>
          <p style="margin-top: var(--space-3)">${esc(question.feedback)}</p>
        </section>

        <div class="actions-row" data-inspect="result.actions">
          ${next
            ? '<a class="btn btn--primary" href="#/question/' + next.id + '">Next question</a>'
            : '<span class="btn btn--primary" aria-disabled="true">Next question</span>'}
          <a class="btn btn--secondary" href="#/question/${question.id}">Retry</a>
          <button type="button" class="btn btn--ghost" data-share-solution="${question.id}">Share my solution</button>
        </div>
      </div>`;
  }

  /* ---------- Phase 2 screens ---------- */

  function topicMarkStats(topicId) {
    var awarded = 0;
    var total = 0;
    var count = 0;
    ATTEMPTS.forEach(function (attempt) {
      var question = questionById(attempt.questionId);
      if (question && question.topicId === topicId) {
        awarded += attempt.awarded;
        total += attempt.total;
        count += 1;
      }
    });
    return {
      awarded: awarded,
      total: total,
      count: count,
      percent: total ? Math.round((awarded / total) * 100) : 0
    };
  }

  function topicStatsList() {
    var topics = [];
    SUBJECTS.forEach(function (subject) {
      subject.topics.forEach(function (topic) {
        topics.push({ subject: subject, topic: topic, stats: topicMarkStats(topic.id) });
      });
    });
    return topics;
  }

  function weakTopics() {
    return topicStatsList().filter(function (item) {
      return item.stats.count > 0;
    }).sort(function (a, b) {
      return a.stats.percent - b.stats.percent;
    }).filter(function (item) {
      return item.stats.percent < 70;
    }).slice(0, 3);
  }

  function reviewStatusBadge(status) {
    var variant = "badge--panel";
    if (status === "AI-checked") variant = "";
    if (status === "Flagged" || status === "Rejected") variant = "badge--brand";
    if (status === "Approved" || status === "Published") variant = "badge--solid";
    return '<span class="badge ' + variant + '">' + esc(status) + "</span>";
  }

  function aiCheckBadge(check) {
    return '<span class="badge ' + (check === "Flagged" ? "badge--brand" : "badge--panel") + '">AI check: ' + esc(check) + "</span>";
  }

  function ReviewRow(item) {
    var question = questionById(item.questionId);
    if (!question) return "";
    var found = topicById(question.topicId);
    if (!found) return "";
    return `
      <li data-review-row data-subject="${found.subject.id}" data-topic="${question.topicId}">
        <a class="list-row list-row--review" href="#/review/${item.id}" data-inspect="queue.row">
          <span class="list-row__main">
            <span class="list-row__title">${esc(truncate(question.stem, 82))}</span>
            <span class="list-row__meta">${esc(found.subject.name)} · ${esc(found.topic.name)} · ${esc(question.difficulty)} · waiting ${esc(item.waiting)}</span>
            <span class="badge-row" style="margin-top: var(--space-2); margin-bottom: 0">
              ${reviewStatusBadge(item.status)}
              ${aiCheckBadge(item.aiCheck)}
            </span>
          </span>
          <span class="list-row__end">${ICONS.chevron}</span>
        </a>
      </li>`;
  }

  function ReviewerQueueScreen() {
    var topics = [];
    SUBJECTS.forEach(function (subject) {
      subject.topics.forEach(function (topic) {
        topics.push({ subject: subject, topic: topic });
      });
    });

    return `
      <div class="screen flow" data-inspect="queue.intro">
        <div class="page-head">
          <p class="eyebrow">Reviewer · Phase 2</p>
          <h1 class="page-title">Reviewer queue</h1>
          <p class="lede">Practice questions waiting for a human decision. The automatic check is a first pass; a reviewer makes the final call.</p>
        </div>

        <div class="filter-bar" data-review-filters data-inspect="queue.filters">
          <div class="field">
            <label class="field__label" for="review-subject">Subject</label>
            <div class="select-wrap">
              <select class="select" id="review-subject" data-review-subject>
                <option value="">All subjects</option>
                ${SUBJECTS.map(function (subject) { return '<option value="' + subject.id + '">' + esc(subject.name) + "</option>"; }).join("")}
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="review-topic">Topic</label>
            <div class="select-wrap">
              <select class="select" id="review-topic" data-review-topic>
                <option value="">All topics</option>
                ${topics.map(function (item) { return '<option value="' + item.topic.id + '">' + esc(item.subject.name) + " · " + esc(item.topic.name) + "</option>"; }).join("")}
              </select>
            </div>
          </div>
          <div class="filter-bar__actions">
            <button type="button" class="btn btn--ghost btn--small" data-clear-review-filters>Clear</button>
          </div>
        </div>

        <section class="flow--tight" data-inspect="queue.list">
          ${state.listState === "default" ? `
            <ul class="list">${REVIEW_ITEMS.map(ReviewRow).join("")}</ul>
            <div class="empty" data-review-empty hidden>
              <p class="empty__title">No questions match these filters.</p>
              <p class="muted">Clear a filter to see the rest of the queue.</p>
            </div>` : ListStateBlock("the review queue", "The queue is clear", "New practice questions will appear here for review.")}
        </section>
      </div>`;
  }

  function ReviewDetailScreen(id) {
    var review = reviewById(id);
    if (!review) return NotFoundScreen();
    var question = questionForReview(review);
    if (!question) return NotFoundScreen();
    var found = topicById(question.topicId);
    var subject = found ? found.subject : subjectById(question.subjectId);
    var topic = found ? found.topic : null;
    var similar = questionById(review.similarQuestionId);

    return `
      <div class="screen flow">
        ${Breadcrumb([
          { label: "Reviewer queue", route: "/queue" },
          { label: "Review" }
        ])}

        <div class="page-head" data-inspect="review.intro">
          <div class="badge-row">
            ${reviewStatusBadge(review.status)}
            ${aiCheckBadge(review.aiCheck)}
            <span class="badge badge--panel">${question.marks} marks</span>
          </div>
          <h1 class="page-title">${esc(topic ? topic.name : "Review")}</h1>
          <p class="muted">${esc(subject.name)} · submitted by ${esc(review.submittedBy)} · waiting ${esc(review.waiting)}</p>
        </div>

        <div class="review-grid">
          <section class="card card--plain" data-inspect="review.question">
            <p class="eyebrow">Practice question</p>
            <p class="question-text" data-review-stem style="margin-top: var(--space-3)">${esc(question.stem)}</p>
            <div class="field" data-review-editor hidden>
              <label class="field__label" for="review-question-text">Edit question text</label>
              <textarea class="textarea" id="review-question-text" data-review-textarea rows="6">${esc(question.stem)}</textarea>
            </div>
            <p class="muted" style="margin-top: var(--space-3)">${esc(question.difficulty)} · ${question.marks} marks</p>

            <h2 class="subsection-title" style="margin-top: var(--space-5)">Mark scheme</h2>
            <ul class="mark-list">
              ${question.markScheme.map(function (point) {
                return '<li class="mark-point"><span class="mark-point__text">' + esc(point.point) + "</span></li>";
              }).join("")}
            </ul>
          </section>

          <aside class="review-side">
            <section class="card card--plain ai-card" data-inspect="review.ai">
              <div class="section-head">
                <h2 class="subsection-title">Automatic check</h2>
                <span class="badge ${review.aiCheck === "Flagged" ? "badge--brand" : "badge--panel"}">${esc(review.aiCheck)}</span>
              </div>
              <ul class="check-list">
                ${review.reasons.map(function (reason) {
                  return '<li class="check-item"><span class="check-dot" aria-hidden="true"></span><span>' + esc(reason) + "</span></li>";
                }).join("")}
              </ul>
              <p class="field__hint">A first pass only. A reviewer makes the final decision.</p>
            </section>

            <section class="card card--plain" data-inspect="review.similar">
              <p class="eyebrow">Closest past paper question</p>
              ${similar ? `
                <p class="preview-item__title" style="margin-top: var(--space-3)">${esc(similar.source)}</p>
                <p style="margin-top: var(--space-2)">${esc(truncate(similar.stem, 170))}</p>
                <p class="muted">${similar.marks} marks · ${esc(similar.difficulty)}</p>
                <p style="margin-top: var(--space-3)"><a class="btn btn--secondary btn--small" href="#/question/${similar.id}">Open question</a></p>
              ` : '<p class="muted" style="margin-top: var(--space-3)">No close match found.</p>'}
            </section>
          </aside>
        </div>

        <section class="card card--plain" data-inspect="review.comment">
          <div class="field">
            <label class="field__label" for="review-comment">Reviewer comment</label>
            <textarea class="textarea" id="review-comment" rows="3" placeholder="Add a note for the author"></textarea>
          </div>
        </section>

        <div class="actions-row" data-inspect="review.actions">
          <button type="button" class="btn btn--primary" data-approve-review="${review.id}">Approve</button>
          <button type="button" class="btn btn--secondary" data-edit-review>Edit</button>
          <button type="button" class="btn btn--ghost" data-reject-review="${review.id}">Reject</button>
        </div>
        <div class="actions-row" data-review-save-row hidden>
          <button type="button" class="btn btn--primary" data-save-review="${review.id}">Save changes</button>
          <button type="button" class="btn btn--ghost" data-cancel-review>Cancel</button>
        </div>
      </div>`;
  }

  function assistantReply(text, question) {
    var lower = text.toLowerCase();
    if (lower.indexOf("roadmap") !== -1 || lower.indexOf("plan") !== -1 || lower.indexOf("week") !== -1) {
      var weak = weakTopics();
      if (!weak.length) {
        return "Start with one past paper question from each subject, then use the mark scheme to choose the next topic. This is a sample plan for the prototype.";
      }
      var lines = ["Here is a two-week plan based on your lowest marks:"];
      weak.forEach(function (item, index) {
        lines.push((index + 1) + ". " + item.topic.name + " — " +
          (index === 0 ? "two short practice attempts." : "one past paper question, then check the mark scheme."));
      });
      lines.push("Finish the week with a mixed set from " + weak[0].subject.name + ".");
      lines.push("This is a sample plan for the prototype.");
      return lines.join("\n");
    }
    if (lower.indexOf("revise") !== -1) {
      return "Start with the topics where your last marks were lowest. In Progress, the weak topics are listed with a direct link to practice. Two short attempts on a weak topic are more useful than rereading notes.";
    }
    if (lower.indexOf("lose") !== -1 || lower.indexOf("lost") !== -1) {
      return "Compare your answer with the mark scheme line by line. Most lost marks come from a missing method line, a missing unit, or an answer that stops before the final value. The Result screen shows exactly which points were missed.";
    }
    if (lower.indexOf("mark scheme") !== -1) {
      return "Read the mark scheme as a list of steps, not just a final answer. Each line is one mark. Write the equation or method first, then substitute, then state the answer with its unit." + (question ? " For this question, start with the first line of the scheme and work down." : "");
    }
    return "That is a good question. In the full product I would look at the question and mark scheme with you. For this prototype, try one of the suggested prompts or attach a question above.";
  }

  function AssistantScreen() {
    var questionOptions = QUESTIONS.map(function (question) {
      var found = topicById(question.topicId);
      var label = (found ? found.subject.name + " · " + found.topic.name : question.topicId) +
        " — " + truncate(question.stem, 42);
      return '<option value="' + question.id + '">' + esc(label) + "</option>";
    }).join("");

    return `
      <div class="screen flow" data-inspect="assistant.intro">
        <div class="page-head">
          <p class="eyebrow">Student · Coach</p>
          <h1 class="page-title">Study coach</h1>
          <p class="lede">A study helper for planning, mark schemes and general study help. It explains work you are already doing; it does not make new questions.</p>
        </div>

        <section class="card card--plain chat" data-inspect="assistant.chat">
          <div class="chat-log" data-chat-log aria-live="polite">
            ${assistantMessages.length ? assistantMessages.map(function (message) {
              return `
                <div class="chat-message chat-message--${message.from}">
                  <p class="chat-message__meta">${message.from === "user" ? "You" : "Study coach"}</p>
                  <p class="chat-message__body">${esc(message.text)}</p>
                  ${message.context ? '<p class="chat-context">Context: ' + esc(message.context) + "</p>" : ""}
                  ${message.file ? '<p class="chat-context">Attached: ' + esc(message.file) + "</p>" : ""}
                </div>`;
            }).join("") : `
              <div class="chat-empty" data-inspect="assistant.empty">
                <p class="empty__title">Start with a plan or a question</p>
                <p class="muted">Ask for a revision roadmap, a mark-scheme explanation or help with a question you are stuck on.</p>
              </div>`}
          </div>

          <div class="suggested-prompts" data-inspect="assistant.prompts">
            ${ASSISTANT_PROMPTS.map(function (prompt) {
              return '<button type="button" class="chip" data-prompt="' + esc(prompt) + '">' + esc(prompt) + "</button>";
            }).join("")}
          </div>

          <form class="chat-form" data-chat-form data-inspect="assistant.form">
            <div class="field">
              <label class="field__label" for="assistant-context">Attach a question</label>
              <div class="select-wrap">
                <select class="select" id="assistant-context" data-chat-context>
                  <option value="">No question attached</option>
                  ${questionOptions}
                </select>
              </div>
            </div>
            <div class="field" data-inspect="assistant.file">
              <label class="field__label" for="assistant-file">Attach a file or photo <span class="muted">(optional)</span></label>
              <input class="input file-input" id="assistant-file" type="file" accept="image/*,.pdf" data-coach-file>
              <p class="field__hint" data-coach-file-name${coachFile ? "" : " hidden"}>${coachFile ? "Attached: " + esc(coachFile) : ""}</p>
            </div>
            <div class="field">
              <label class="field__label" for="assistant-input">Your message</label>
              <textarea class="textarea" id="assistant-input" data-chat-input rows="3" placeholder="Ask about a mark scheme, a topic or how to plan your week"></textarea>
            </div>
            <button type="submit" class="btn btn--primary">Send</button>
          </form>
        </section>
      </div>`;
  }

  function ProgressScreen() {
    var topics = topicStatsList();

    var attempted = topics.filter(function (item) {
      return item.stats.count > 0;
    });
    var weak = weakTopics();

    var attempts = ATTEMPTS.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    var totalAwarded = ATTEMPTS.reduce(function (sum, attempt) { return sum + attempt.awarded; }, 0);
    var totalMarks = ATTEMPTS.reduce(function (sum, attempt) { return sum + attempt.total; }, 0);

    return `
      <div class="screen flow" data-inspect="progress.intro">
        <div class="page-head">
          <p class="eyebrow">Student · Progress</p>
          <h1 class="page-title">My progress</h1>
          <p class="lede">Marks per topic, the topics that need another look, and every attempt so far.</p>
        </div>

        <div class="stat-row" data-inspect="progress.summary">
          <div class="stat"><span class="stat__value">${totalAwarded}</span><span class="stat__label">marks earned</span></div>
          <div class="stat"><span class="stat__value">${ATTEMPTS.length}</span><span class="stat__label">attempts</span></div>
          <div class="stat"><span class="stat__value">${totalMarks ? Math.round((totalAwarded / totalMarks) * 100) : 0}%</span><span class="stat__label">average</span></div>
        </div>

        <section class="flow--tight" data-inspect="progress.topics">
          <div class="section-head">
            <h2 class="section-title">Marks per topic</h2>
            <p class="muted">Only topics you have attempted</p>
          </div>
          <ul class="mark-topic-list">
            ${attempted.map(function (item) {
              return `
                <li class="mark-topic" data-inspect="progress.topic">
                  <div class="mark-topic__head">
                    <span class="mark-topic__name">${esc(item.topic.name)}</span>
                    <span class="muted">${item.stats.awarded}/${item.stats.total} · ${item.stats.percent}%</span>
                  </div>
                  <div class="bar" aria-hidden="true"><span style="width:${item.stats.percent}%"></span></div>
                  <p class="muted">${esc(item.subject.name)} · ${item.stats.count} ${item.stats.count === 1 ? "attempt" : "attempts"}</p>
                </li>`;
            }).join("")}
          </ul>
        </section>

        <section class="flow--tight" data-inspect="progress.weak">
          <div class="section-head">
            <h2 class="section-title">Weak topics</h2>
            <p class="muted">Start here</p>
          </div>
          <ul class="list">
            ${weak.map(function (item) {
              return `
                <li>
                  <a class="list-row" href="#/topic/${item.topic.id}/practice" data-inspect="progress.weakRow">
                    <span class="list-row__main">
                      <span class="list-row__title">${esc(item.topic.name)}</span>
                      <span class="list-row__meta">${item.stats.percent}% on ${item.stats.count} ${item.stats.count === 1 ? "attempt" : "attempts"} · ${esc(item.subject.name)}</span>
                    </span>
                    <span class="list-row__end"><span class="badge badge--brand">Practise</span>${ICONS.chevron}</span>
                  </a>
                </li>`;
            }).join("")}
          </ul>
        </section>

        <section class="flow--tight" data-inspect="progress.history">
          <div class="section-head">
            <h2 class="section-title">Attempt history</h2>
            <p class="muted">${ATTEMPTS.length} attempts</p>
          </div>
          ${state.listState === "default" ? `
            <ul class="list">
              ${attempts.map(function (attempt) {
                var question = questionById(attempt.questionId);
                if (!question) return "";
                var found = topicById(question.topicId);
                return `
                  <li>
                    <a class="list-row" href="#/result/${question.id}" data-inspect="progress.attempt">
                      <span class="list-row__main">
                        <span class="list-row__title">${esc(found ? found.topic.name : "Question")}</span>
                        <span class="list-row__meta">${esc(truncate(question.stem, 58))} · ${formatDate(attempt.date)}</span>
                      </span>
                      <span class="list-row__end"><span class="badge">${attempt.awarded}/${attempt.total}</span>${ICONS.chevron}</span>
                    </a>
                  </li>`;
              }).join("")}
            </ul>` : ListStateBlock("attempt history", "No attempts yet", "Your results will appear here after you submit an answer.")}
        </section>
      </div>`;
  }

  /* ---------- Phase 3 screens ---------- */

  function codeDraftFor(questionId) {
    if (!state.codeDrafts[questionId]) {
      var workspace = CODE_WORKSPACES[questionId] || {};
      state.codeDrafts[questionId] = {
        code: workspace.starterCode || "// Write your pseudocode here\n",
        input: workspace.sampleInput || "",
        result: null,
        review: null,
        reviewing: false,
        fromSolution: ""
      };
    }
    return state.codeDrafts[questionId];
  }

  function tracksExtreme(facts, op) {
    return facts.ifs.some(function (info) {
      return info.op === op && info.assigned.some(function (name) {
        return info.names.indexOf(name) !== -1;
      });
    });
  }

  function criterionMet(id, facts) {
    switch (id) {
      case "declares": return facts.declares.length > 0;
      case "declares-array": return facts.arrays.length > 0;
      case "reads-input": return facts.inputs > 0;
      case "loops": return facts.fors.length + facts.whiles + facts.repeats > 0;
      case "tracks-max": return tracksExtreme(facts, ">");
      case "tracks-min": return tracksExtreme(facts, "<");
      case "outputs": return facts.outputs.length > 0;
      case "outputs-both": return facts.outputVariables >= 2;
      case "accumulates": return facts.selfAssigns.length > 0;
      default: return false;
    }
  }

  function buildReview(question, code) {
    var workspace = CODE_WORKSPACES[question.id] || {};
    var criteria = workspace.review || [];
    var analysis = Pseudo.analyse(code);
    var checks = criteria.map(function (criterion) {
      return {
        label: criterion.label,
        fix: criterion.fix,
        met: analysis.ok ? criterionMet(criterion.id, analysis.facts) : false
      };
    });
    return {
      ok: analysis.ok,
      error: analysis.error,
      line: analysis.line,
      checks: checks,
      findings: analysis.findings,
      met: checks.filter(function (check) { return check.met; }).length,
      total: checks.length
    };
  }

  function CodeReviewPanel(question, draft) {
    if (draft.reviewing) {
      return `
        <section class="review-card review-card--busy" data-inspect="code.review" aria-busy="true">
          <div class="review-card__head">
            <p class="eyebrow">Reviewing your code</p>
            <span class="scan-dot" aria-hidden="true"></span>
          </div>
          <ul class="scan-steps">
            <li>Reading the structure</li>
            <li>Checking the steps a marker looks for</li>
            <li>Writing feedback</li>
          </ul>
          <p class="muted">This review is rule-based and runs inside the page.</p>
        </section>`;
    }
    if (!draft.review) return "";

    var review = draft.review;
    if (!review.ok) {
      return `
        <section class="review-card review-card--error" data-inspect="code.review">
          <p class="eyebrow">Review stopped</p>
          <p class="console__status console__status--error">Line ${review.line}: ${esc(review.error)}</p>
          <p class="muted">Fix that line, then run the review again.</p>
        </section>`;
    }

    return `
      <section class="review-card" data-inspect="code.review">
        <div class="review-card__head">
          <div>
            <p class="eyebrow">Code review · prototype</p>
            <h2 class="subsection-title">What a marker looks for</h2>
          </div>
          <p class="review-card__score">${review.met} / ${review.total}</p>
        </div>
        <ul class="review-list">
          ${review.checks.map(function (check) {
            return `
              <li class="review-item ${check.met ? "is-met" : "is-missing"}">
                <span class="review-item__mark" aria-hidden="true">${check.met ? "✓" : "!"}</span>
                <span class="review-item__body">
                  <span class="review-item__label">${esc(check.label)}</span>
                  ${check.met ? "" : '<span class="review-item__fix">' + esc(check.fix) + "</span>"}
                </span>
              </li>`;
          }).join("")}
        </ul>
        ${review.findings.length ? `
          <div class="review-findings">
            <p class="field__label">Worth fixing</p>
            <ul class="review-findings__list">
              ${review.findings.map(function (finding) {
                return '<li class="review-finding">' + esc(finding.text) + "</li>";
              }).join("")}
            </ul>
          </div>` : ""}
        <p class="field__hint">A rule-based review of the code you wrote. It checks structure and common mistakes, not meaning — no live model is involved.</p>
      </section>`;
  }

  function codeLineNumbers(code) {
    var total = String(code).split("\n").length;
    var numbers = [];
    for (var i = 1; i <= total; i += 1) numbers.push(i);
    return numbers.join("\n");
  }

  function CodeConsole(result) {
    if (!result) return "";
    if (!result.ok) {
      return '<p class="console__status console__status--error">Line ' + result.line + ": " + esc(result.error) + "</p>" +
        (result.lines.length ? '<pre class="console__pre">' + esc(result.lines.join("\n")) + "</pre>" : "");
    }
    if (!result.lines.length) {
      return '<p class="console__status">The program ran and printed nothing. Add an OUTPUT line to see a result.</p>';
    }
    return '<pre class="console__pre">' + esc(result.lines.join("\n")) + "</pre>" +
      '<p class="console__meta">' + result.lines.length + (result.lines.length === 1 ? " line" : " lines") +
      " · " + result.steps + " steps</p>";
  }

  function CodeScreen(id) {
    var question = questionById(id);
    if (!question) return NotFoundScreen();
    var found = topicById(question.topicId);
    var topic = found ? found.topic : null;
    var subject = found ? found.subject : subjectById(question.subjectId);
    var workspace = CODE_WORKSPACES[question.id] || {
      starterCode: "// Write your pseudocode here\n",
      variables: ["i", "value"],
      rows: [["1", ""], ["2", ""], ["3", ""]]
    };

    if (state.codePrefill && state.codePrefill.questionId === question.id) {
      var loaded = codeDraftFor(question.id);
      loaded.code = state.codePrefill.code;
      loaded.result = null;
      loaded.fromSolution = state.codePrefill.author || "";
      state.codePrefill = null;
    }
    var draft = codeDraftFor(question.id);

    return `
      <div class="screen screen--wide flow" data-inspect="code.intro">
        ${Breadcrumb([
          { label: subject.name, route: "/topics" },
          { label: topic ? topic.name : "Topic", route: "/topic/" + question.topicId },
          { label: "Question", route: "/question/" + question.id },
          { label: "Code workspace" }
        ])}

        <div class="page-head">
          <p class="eyebrow">Computer Science · Code workspace</p>
          <h1 class="page-title">${esc(topic ? topic.name : "Code question")}</h1>
          <p class="lede">Write pseudocode and run it. The runner understands DECLARE, INPUT, OUTPUT, IF, FOR, WHILE, REPEAT, procedures and functions.</p>
        </div>

        ${draft.fromSolution ? `
          <div class="notice" data-inspect="question.solutionTry">
            <p><strong>${esc(draft.fromSolution)}'s solution</strong> is loaded in the editor. Run it, then edit it to try your own version.</p>
          </div>` : ""}

        <div class="code-layout">
          <section class="flow--tight" data-inspect="code.question">
            <div class="card card--plain">
              <div class="badge-row">
                <span class="badge ${question.kind === "practice" ? "badge--brand" : ""}">${question.kind === "practice" ? "Practice question" : "Past paper"}</span>
                <span class="badge badge--panel">${question.marks} marks</span>
                <span class="badge badge--panel">${esc(question.difficulty)}</span>
              </div>
              <p class="question-text">${esc(question.stem)}</p>
              ${QuestionFigure(question)}
            </div>

            <div class="card card--plain" data-inspect="code.template">
              <p class="eyebrow">Fixed template</p>
              <p class="muted" style="margin-top: var(--space-2)">Keep the shape of the starter code: declare at the top, read the input, process it, then OUTPUT. Marks come from that structure as much as from the final value.</p>
            </div>

            <div class="field" data-inspect="code.inputs">
              <label class="field__label" for="code-input">Input values</label>
              <textarea class="textarea" id="code-input" data-code-input rows="5" spellcheck="false" placeholder="One value per line">${esc(draft.input)}</textarea>
              <p class="field__hint">One value per line. ${workspace.sampleInput ? "Sample values are filled in." : "This program needs no input."}</p>
            </div>
          </section>

          <section class="flow--tight" data-inspect="code.editor">
            <div class="code-window">
              <div class="code-window__bar" data-inspect="code.toolbar">
                <span class="code-window__name">question.pseudo</span>
                <div class="actions-row">
                  <button type="button" class="btn btn--secondary btn--small" data-run-code>${ICONS.play} Run</button>
                  <button type="button" class="btn btn--secondary btn--small" data-review-code>${ICONS.spark} Review</button>
                  <button type="button" class="btn btn--ghost btn--small" data-reset-code>${ICONS.reset} Reset</button>
                </div>
              </div>
              <div class="code-editor-wrap">
                <pre class="code-gutter" data-code-gutter aria-hidden="true">${codeLineNumbers(draft.code)}</pre>
                <textarea class="code-editor" id="code-editor" data-code-editor spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off">${esc(draft.code)}</textarea>
              </div>
            </div>

            <div class="console" data-code-console data-inspect="code.console" aria-live="polite"${draft.result ? "" : " hidden"}>
              <div class="console__head">
                <span class="eyebrow">Output</span>
                <button type="button" class="link-btn" data-code-clear>Clear</button>
              </div>
              <div data-code-output-text>${CodeConsole(draft.result)}</div>
            </div>

            ${CodeReviewPanel(question, draft)}
          </section>
        </div>

        <section class="flow--tight" data-inspect="code.dryrun">
          <div class="section-head">
            <h2 class="section-title">Dry run</h2>
            <p class="muted">Track each variable by hand</p>
          </div>
          <div class="table-wrap">
            <table class="dry-table">
              <thead>
                <tr>
                  <th scope="col">Step</th>
                  ${workspace.variables.map(function (variable) { return '<th scope="col">' + esc(variable) + "</th>"; }).join("")}
                </tr>
              </thead>
              <tbody>
                ${workspace.rows.map(function (row, rowIndex) {
                  return "<tr><th scope=\"row\">" + (rowIndex + 1) + "</th>" +
                    workspace.variables.map(function (variable, columnIndex) {
                      return '<td><input class="dry-input" value="' + esc(row[columnIndex] || "") + '" aria-label="Step ' + (rowIndex + 1) + ", " + esc(variable) + '"></td>';
                    }).join("") +
                    "</tr>";
                }).join("")}
              </tbody>
            </table>
          </div>
          <p class="field__hint">Fill the table as you trace the code. It is not marked in this prototype.</p>
        </section>

        <form class="flow" data-answer-form data-question-id="${question.id}" data-inspect="code.answer">
          <div class="field">
            <label class="field__label" for="code-answer">Final answer</label>
            <textarea class="textarea" id="code-answer" rows="4" placeholder="Write the final answer or explain your code"></textarea>
          </div>
          <div class="actions-row">
            <button type="submit" class="btn btn--primary">Submit for marking</button>
            <a class="btn btn--secondary" href="#/question/${question.id}">Back to question</a>
          </div>
        </form>
      </div>`;
  }

  function DiagramScreen(id) {
    var question = questionById(id);
    if (!question) return NotFoundScreen();
    var found = topicById(question.topicId);
    var topic = found ? found.topic : null;
    var subject = found ? found.subject : subjectById(question.subjectId);

    return `
      <div class="screen screen--wide flow" data-inspect="diagram.intro">
        ${Breadcrumb([
          { label: subject.name, route: "/topics" },
          { label: topic ? topic.name : "Topic", route: "/topic/" + question.topicId },
          { label: "Question", route: "/question/" + question.id },
          { label: "Diagram workspace" }
        ])}

        <div class="page-head">
          <p class="eyebrow">Physics · Diagram workspace</p>
          <h1 class="page-title">${esc(topic ? topic.name : "Diagram question")}</h1>
          <p class="lede">Change the angle, the mass and the friction, and watch the forces resolve. Then write your answer below.</p>
        </div>

        <section class="card card--plain" data-inspect="diagram.question">
          <div class="badge-row">
            <span class="badge ${question.kind === "practice" ? "badge--brand" : ""}">${question.kind === "practice" ? "Practice question" : "Past paper"}</span>
            <span class="badge badge--panel">${question.marks} marks</span>
            <span class="badge badge--panel">${esc(question.difficulty)}</span>
          </div>
          <p class="question-text">${esc(question.stem)}</p>
        </section>

        <div class="workspace-grid">
          <section class="card card--plain" data-inspect="diagram.canvas">
            <div class="section-head">
              <h2 class="section-title">Diagram</h2>
              <button type="button" class="btn btn--ghost btn--small" data-reset-diagram>Reset diagram</button>
            </div>
            <div class="diagram-stage" data-figure-stage>
              ${Figures.render({
                builder: "inclinedPlane",
                params: {
                  angle: 25,
                  showForces: true,
                  showComponents: true,
                  weightLabel: "W = mg",
                  caption: "Block on a plane inclined at 25°"
                }
              })}
            </div>
            <div class="diagram-controls">
              <div class="field">
                <label class="field__label" for="angle-range">Angle <span data-angle-value>25°</span></label>
                <input class="range" id="angle-range" type="range" min="5" max="45" value="25" step="1" data-angle-range>
              </div>
              <div class="field">
                <label class="field__label" for="mass-range">Mass <span data-mass-value>4.0 kg</span></label>
                <input class="range" id="mass-range" type="range" min="1" max="20" value="4" step="0.5" data-mass-range>
              </div>
              <div class="field">
                <label class="field__label" for="friction-range">Friction <span data-friction-value>6.0 N</span></label>
                <input class="range" id="friction-range" type="range" min="0" max="20" value="6" step="0.5" data-friction-range>
              </div>
            </div>
            <dl class="kv diagram-readout">
              <dt>Weight</dt><dd data-out="weight">39.2 N</dd>
              <dt>Down the slope</dt><dd data-out="parallel">16.6 N</dd>
              <dt>Resultant</dt><dd data-out="resultant">10.6 N</dd>
              <dt>Acceleration</dt><dd data-out="acceleration">2.6 m s⁻²</dd>
            </dl>
            <p class="field__hint" data-plain-note hidden>The block stays at rest: friction is at least as large as the component of weight down the slope.</p>
          </section>

          <section class="flow--tight" data-inspect="diagram.notes">
            <div class="section-head">
              <h2 class="section-title">What the diagram shows</h2>
            </div>
            <p class="muted">The block sits on a rough plane. Its weight resolves into a component down the slope and a component into the slope; friction acts up the slope.</p>
            <ul class="check-list">
              <li class="check-item"><span class="check-dot" aria-hidden="true"></span><span>The component down the slope is mg sin θ; the component into the slope is mg cos θ.</span></li>
              <li class="check-item"><span class="check-dot" aria-hidden="true"></span><span>The block slides when mg sin θ is greater than the friction.</span></li>
              <li class="check-item"><span class="check-dot" aria-hidden="true"></span><span>The acceleration is the resultant force down the slope divided by the mass.</span></li>
            </ul>
            <p class="field__hint">A model built from the question's numbers. It is a teaching aid, not the marking scheme.</p>
          </section>
        </div>

        <form class="flow" data-answer-form data-question-id="${question.id}" data-inspect="diagram.answer">
          <div class="field">
            <label class="field__label" for="diagram-answer">Your answer</label>
            <textarea class="textarea" id="diagram-answer" rows="5" placeholder="Show your working and final answer"></textarea>
          </div>
          <div class="actions-row">
            <button type="submit" class="btn btn--primary">Submit for marking</button>
            <a class="btn btn--secondary" href="#/question/${question.id}">Back to question</a>
          </div>
        </form>
      </div>`;
  }

  /* ---------- Phase 4 screens ---------- */

  function CommunityPostCard(post) {
    var question = questionById(post.questionId);
    var found = topicById(post.topicId);
    var subject = subjectById(post.subjectId);
    var solutionRoute = "#/question/" + post.questionId + "/solutions/" + post.id;
    var isStudent = state.role === "student";

    var actions = isStudent
      ? '<button type="button" class="link-btn" data-solution-like="' + post.id + '" aria-pressed="' + (post.liked ? "true" : "false") + '" data-inspect="question.solutionLike">' +
          (post.liked ? "Liked" : "Like") + " <span data-solution-like-count>" + post.likes + "</span>" +
        "</button>" +
        '<a class="link-btn" href="' + solutionRoute + '" data-inspect="question.solutionComments">' + post.comments + " comments</a>" +
        '<a class="link-btn" href="' + solutionRoute + '">Read full solution</a>'
      : '<span class="muted">' + post.likes + " likes</span>" +
        '<button type="button" class="link-btn" data-comments="' + post.id + '">' + post.comments + " comments</button>" +
        '<button type="button" class="link-btn" data-read-solution="' + post.id + '">Read full solution</button>';

    return `
      <article class="feed-card" data-post-id="${post.id}" data-subject-id="${post.subjectId}" data-topic-id="${post.topicId}"
        data-kind="${question ? question.kind : ""}" data-year="${question && question.year ? question.year : ""}"
        data-search="${esc((question ? question.stem : "") + " " + post.snippet + " " + post.solution + " " + post.author + " " + (found ? found.topic.name : ""))}"
        data-inspect="community.card">
        <div class="feed-card__head">
          <div>
            <p class="feed-card__author">${esc(post.author)}</p>
            <p class="muted">${esc(post.time)}</p>
          </div>
          <div class="badge-row">
            <span class="badge badge--panel">${esc(subject ? subject.name : "")}</span>
            <span class="badge badge--panel">${esc(found ? found.topic.name : "")}</span>
          </div>
        </div>
        ${question ? '<a class="feed-card__question" href="#/question/' + question.id + '">' + esc(truncate(question.stem, 120)) + "</a>" : ""}
        <p class="feed-card__snippet">${esc(post.snippet)}</p>
        <div class="feed-card__actions">${actions}</div>
      </article>`;
  }

  function CommunityScreen() {
    return `
      <div class="screen screen--wide flow" data-inspect="community.intro">
        <div class="page-head page-head--row">
          <div>
            <p class="eyebrow">Student community</p>
            <h1 class="page-title">Solved questions</h1>
            <p class="lede">Worked solutions from other students. Open a post to read the method, or jump back to the question.</p>
          </div>
          ${state.role === "student" ? '<a class="btn btn--primary" href="#/post-solution" data-inspect="community.post">Post a solution</a>' : ""}
        </div>

        <div class="filter-bar" data-community-filters data-inspect="community.filters">
          <div class="field filter-bar__wide" data-inspect="community.search">
            <label class="field__label" for="community-search">Search</label>
            <input class="input" id="community-search" type="search" placeholder="Search a question, topic or author" data-community-search>
          </div>
          <div class="field">
            <label class="field__label" for="community-subject">Subject</label>
            <div class="select-wrap">
              <select class="select" id="community-subject" data-community-subject>
                <option value="">All subjects</option>
                ${SUBJECTS.map(function (subject) {
                  return '<option value="' + subject.id + '">' + esc(subject.name) + "</option>";
                }).join("")}
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="community-topic">Topic</label>
            <div class="select-wrap">
              <select class="select" id="community-topic" data-community-topic>
                <option value="">All topics</option>
              </select>
            </div>
          </div>
          <div class="field" data-inspect="community.kind">
            <label class="field__label" for="community-kind">Question type</label>
            <div class="select-wrap">
              <select class="select" id="community-kind" data-community-kind>
                <option value="">Any type</option>
                <option value="past">Past paper</option>
                <option value="practice">Practice</option>
              </select>
            </div>
          </div>
          <div class="field" data-inspect="community.year">
            <label class="field__label" for="community-year">Year</label>
            <div class="select-wrap">
              <select class="select" id="community-year" data-community-year>
                <option value="">Any year</option>
                ${uniqueValues(QUESTIONS.filter(function (question) {
                  return question.kind === "past" && question.year;
                }), "year").sort(function (a, b) { return b - a; }).map(function (year) {
                  return '<option value="' + year + '">' + year + "</option>";
                }).join("")}
              </select>
            </div>
          </div>
          <div class="filter-bar__actions">
            <button type="button" class="btn btn--ghost btn--small" data-clear-community>Clear</button>
          </div>
        </div>

        ${state.listState === "default" ? `
          <div class="feed" data-community-feed>
            ${COMMUNITY_POSTS.map(CommunityPostCard).join("")}
          </div>
          <div class="empty" data-community-empty hidden data-inspect="community.empty">
            <p class="empty__title">No solutions match these filters</p>
            <p class="muted">Try another subject, topic, type or year.</p>
          </div>` : ListStateBlock("solutions", "No solutions yet", "Be the first to share a worked solution.")}
      </div>`;
  }

  function PostSolutionScreen() {
    var questionOptions = QUESTIONS.map(function (question) {
      var found = topicById(question.topicId);
      var label = (found ? found.subject.name + " · " + found.topic.name : question.topicId) + " — " + truncate(question.stem, 64);
      return '<option value="' + question.id + '"' +
        (question.id === state.solutionQuestionId ? " selected" : "") + ">" +
        esc(label) + "</option>";
    }).join("");

    return `
      <div class="screen flow" data-inspect="postSolution.intro">
        ${Breadcrumb([{ label: "Community", route: "/community" }, { label: "Post a solution" }])}
        <div class="page-head">
          <p class="eyebrow">Community · Share your working</p>
          <h1 class="page-title">Post a solution</h1>
          <p class="lede">Pick the question you solved, explain your method and preview the post before it appears in the feed.</p>
        </div>

        <form class="flow" data-solution-form data-inspect="postSolution.form">
          <div class="field">
            <label class="field__label" for="solution-question">Question</label>
            <div class="select-wrap">
              <select class="select" id="solution-question" data-solution-question>${questionOptions}</select>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="solution-text">Your solution</label>
            <textarea class="textarea" id="solution-text" rows="7" data-solution-text placeholder="Explain the method step by step, then give the final answer"></textarea>
            <p class="field__hint">Explain the method, not just the final answer.</p>
          </div>

          <div class="field">
            <label class="field__label" for="solution-file">Attach a file or image <span class="muted">(optional)</span></label>
            <input class="input file-input" id="solution-file" type="file" accept="image/*,.pdf" data-solution-file>
            <p class="field__hint" data-solution-file-name hidden></p>
          </div>

          <p class="field__error" data-solution-error hidden>Write a solution before posting.</p>

          <div class="actions-row">
            <button type="button" class="btn btn--secondary" data-preview-solution>Preview</button>
            <button type="submit" class="btn btn--primary">Post solution</button>
            <a class="btn btn--ghost" href="#/community">Cancel</a>
          </div>
        </form>

        <section class="card card--plain" data-solution-preview hidden data-inspect="postSolution.preview">
          <p class="eyebrow">Preview</p>
          <h2 class="section-title" data-preview-question style="margin-top: var(--space-2)"></h2>
          <p class="preview-item__snippet" data-preview-text style="margin-top: var(--space-3)"></p>
          <p class="muted" data-preview-file hidden style="margin-top: var(--space-2)"></p>
        </section>
      </div>`;
  }

  function NotesScreen() {
    var groups = [];

    TEACHER_NOTES.forEach(function (note) {
      var found = topicById(note.topicId);
      var group = groups.find(function (item) {
        return item.topicId === note.topicId;
      });
      if (!group) {
        group = {
          topicId: note.topicId,
          topic: found ? found.topic : null,
          subject: found ? found.subject : null,
          notes: []
        };
        groups.push(group);
      }
      group.notes.push(note);
    });

    return `
      <div class="screen flow" data-inspect="notes.intro">
        <div class="page-head">
          <p class="eyebrow">From your teachers</p>
          <h1 class="page-title">Notes for your class</h1>
          <p class="lede">Notes shared with your class, grouped by topic. New notes are marked so you know what to read first.</p>
        </div>

        ${state.listState === "default" ? groups.map(function (group) {
          return `
            <section class="flow--tight" data-inspect="notes.group">
              <div class="section-head">
                <h2 class="section-title">${esc(group.topic ? group.topic.name : "Topic")}</h2>
                <span class="badge badge--panel">${esc(group.subject ? group.subject.name : "")}</span>
              </div>
              <ul class="list">
                ${group.notes.map(function (note) {
                  return `
                    <li>
                      <button type="button" class="list-row list-row--button" data-note="${note.id}" data-inspect="notes.note">
                        <span class="list-row__main">
                          <span class="list-row__title">${esc(note.title)} ${note.isNew ? '<span class="badge badge--brand" data-note-new>New</span>' : ""}</span>
                          <span class="list-row__meta">${esc(note.teacher)} · ${esc(note.time)}</span>
                          <span class="list-row__meta">${esc(note.excerpt)}</span>
                        </span>
                        <span class="list-row__end">${ICONS.chevron}</span>
                      </button>
                    </li>`;
                }).join("")}
              </ul>
            </section>`;
        }).join("") : ListStateBlock("notes", "No notes yet", "Notes shared with your class will appear here.")}
      </div>`;
  }

  function NotificationsScreen() {
    var items = NOTIFICATIONS.filter(function (item) {
      return item.audience === state.role;
    });
    var unread = items.filter(function (item) {
      return item.unread;
    }).length;

    return `
      <div class="screen flow" data-inspect="notifications.intro">
        <div class="page-head page-head--row">
          <div>
            <p class="eyebrow">Updates</p>
            <h1 class="page-title">Notifications</h1>
            <p class="lede">${unread ? unread + " unread" : "Everything is read"} · each item opens the screen it refers to.</p>
          </div>
          <button type="button" class="btn btn--secondary" data-mark-read ${unread ? "" : "disabled"}>Mark all as read</button>
        </div>

        ${state.listState === "default" ? (items.length ? `
          <ul class="list" data-notification-list>
            ${items.map(function (item) {
              return `
                <li>
                  <a class="list-row" href="#${item.route}" data-notification="${item.id}" data-inspect="notifications.item">
                    <span class="unread-dot${item.unread ? " is-unread" : ""}" aria-hidden="true"></span>
                    <span class="list-row__main">
                      <span class="list-row__title">${esc(item.text)}</span>
                      <span class="list-row__meta">${esc(item.time)}${item.unread ? " · Unread" : ""}</span>
                    </span>
                    <span class="list-row__end">${ICONS.chevron}</span>
                  </a>
                </li>`;
            }).join("")}
          </ul>` : `
          <div class="empty" data-inspect="notifications.empty">
            <p class="empty__title">No notifications yet</p>
            <p class="muted">Shared notes, replies and results will appear here.</p>
          </div>`) : ListStateBlock("notifications", "No notifications yet", "Shared notes, replies and results will appear here.")}
      </div>`;
  }

  function ClassCard(cls) {
    var subject = subjectById(cls.subjectId);

    return `
      <article class="class-card" data-inspect="dashboard.class">
        <div class="class-card__head">
          <div>
            <h3 class="class-card__title">${esc(cls.name)}</h3>
            <p class="muted">${esc(subject ? subject.name : "")} · ${cls.students} students</p>
          </div>
          <span class="badge badge--panel">${cls.students}</span>
        </div>
        <p class="class-card__code"><span class="muted">Class code</span> <span class="code-chip">${esc(cls.code)}</span></p>
        <div class="actions-row">
          <a class="btn btn--secondary btn--small" href="#/class/${cls.id}">Open class</a>
          <a class="btn btn--ghost btn--small" href="#/share">Share</a>
        </div>
      </article>`;
  }

  function TeacherDashboardScreen() {
    var totalStudents = CLASSES.reduce(function (total, cls) {
      return total + cls.students;
    }, 0);

    return `
      <div class="screen screen--wide flow" data-inspect="dashboard.intro">
        <div class="page-head page-head--row">
          <div>
            <p class="eyebrow">Teacher · Dashboard</p>
            <h1 class="page-title">Your classes</h1>
            <p class="lede">Student counts, class codes and a quick route into each class.</p>
          </div>
          <button type="button" class="btn btn--primary" data-open-modal="createClassModal" data-inspect="dashboard.create">Create class</button>
        </div>

        <div class="stat-row" data-inspect="dashboard.stats">
          <div class="stat">
            <span class="stat__value">${CLASSES.length}</span>
            <span class="stat__label">Classes</span>
          </div>
          <div class="stat">
            <span class="stat__value">${totalStudents}</span>
            <span class="stat__label">Students</span>
          </div>
          <div class="stat">
            <span class="stat__value">5</span>
            <span class="stat__label">Shared this week</span>
          </div>
        </div>

        <section class="flow--tight" data-inspect="dashboard.classes">
          <div class="section-head">
            <h2 class="section-title">Classes</h2>
            <a class="muted" href="#/classes">See all</a>
          </div>
          ${state.listState === "default"
            ? `<div class="class-grid">${CLASSES.map(ClassCard).join("")}</div>`
            : ListStateBlock("classes", "No classes yet", "Create a class to get started.")}
        </section>
      </div>`;
  }

  function TeacherClassesScreen() {
    return `
      <div class="screen screen--wide flow" data-inspect="classes.intro">
        <div class="page-head page-head--row">
          <div>
            <p class="eyebrow">Teacher · Classes</p>
            <h1 class="page-title">All classes</h1>
            <p class="lede">Open a class to see its students and everything shared with them.</p>
          </div>
          <button type="button" class="btn btn--primary" data-open-modal="createClassModal" data-inspect="classes.create">Create class</button>
        </div>

        ${state.listState === "default"
          ? `<div class="class-grid">${CLASSES.map(ClassCard).join("")}</div>`
          : ListStateBlock("classes", "No classes yet", "Create a class to get started.")}
      </div>`;
  }

  function ClassDetailScreen(id) {
    var cls = classById(id);
    if (!cls) return NotFoundScreen();

    var subject = subjectById(cls.subjectId);
    var students = CLASS_STUDENTS[cls.id] || [];
    var shared = CLASS_SHARED[cls.id] || [];
    var average = students.length ? Math.round(students.reduce(function (total, student) {
      return total + student.progress;
    }, 0) / students.length) : 0;

    return `
      <div class="screen screen--wide flow" data-inspect="class.intro">
        ${Breadcrumb([{ label: "Classes", route: "/classes" }, { label: cls.name }])}
        <div class="page-head">
          <p class="eyebrow">${esc(subject ? subject.name : "")} · Class detail</p>
          <h1 class="page-title">${esc(cls.name)}</h1>
          <p class="lede">${cls.students} students · Class code <span class="code-chip">${esc(cls.code)}</span></p>
        </div>

        <div class="stat-row" data-inspect="class.stats">
          <div class="stat">
            <span class="stat__value">${students.length}</span>
            <span class="stat__label">Shown here</span>
          </div>
          <div class="stat">
            <span class="stat__value">${average}%</span>
            <span class="stat__label">Average progress</span>
          </div>
          <div class="stat">
            <span class="stat__value">${shared.length}</span>
            <span class="stat__label">Items shared</span>
          </div>
        </div>

        <section class="flow--tight" data-inspect="class.students">
          <div class="section-head">
            <h2 class="section-title">Students</h2>
            <p class="muted">Progress across the subject</p>
          </div>
          ${state.listState === "default" ? (students.length ? `
            <ul class="list student-list">
              ${students.map(function (student) {
                return `
                  <li class="student-row" data-inspect="class.student">
                    <div class="student-row__main">
                      <span class="student-row__name">${esc(student.name)}</span>
                      <span class="student-row__meta">Last active ${esc(student.lastActive)}</span>
                      <span class="bar" aria-hidden="true"><span style="width:${student.progress}%"></span></span>
                    </div>
                    <span class="student-row__value">${student.progress}%</span>
                  </li>`;
              }).join("")}
            </ul>
            <p class="field__hint">Showing ${students.length} of ${cls.students} students in this prototype.</p>` : `
            <div class="empty" data-inspect="state.empty">
              <p class="empty__title">No students yet</p>
              <p class="muted">Students appear here once they join with the class code.</p>
            </div>`) : ListStateBlock("students", "No students yet", "Students appear here once they join with the class code.")}
        </section>

        <section class="flow--tight" data-inspect="class.shared">
          <div class="section-head">
            <h2 class="section-title">Shared with this class</h2>
            <a class="muted" href="#/share">Share something</a>
          </div>
          ${state.listState === "default" ? (shared.length ? `
            <ul class="list">
              ${shared.map(function (item) {
                if (item.type === "note") {
                  return `
                    <li>
                      <button type="button" class="list-row list-row--button" data-shared-note="${item.noteId}" data-inspect="class.sharedItem">
                        <span class="list-row__main">
                          <span class="list-row__title">${esc(item.title)}</span>
                          <span class="list-row__meta">Note · ${esc(item.detail)}</span>
                        </span>
                        <span class="list-row__end">${ICONS.chevron}</span>
                      </button>
                    </li>`;
                }
                return `
                  <li>
                    <button type="button" class="list-row list-row--button" data-shared-questions="${item.questionIds.join(",")}" data-inspect="class.sharedItem">
                      <span class="list-row__main">
                        <span class="list-row__title">${esc(item.title)}</span>
                        <span class="list-row__meta">Questions · ${esc(item.detail)}</span>
                      </span>
                      <span class="list-row__end">${ICONS.chevron}</span>
                    </button>
                  </li>`;
              }).join("")}
            </ul>` : `
            <div class="empty" data-inspect="state.empty">
              <p class="empty__title">Nothing shared yet</p>
              <p class="muted">Notes and question sets sent to this class will appear here.</p>
            </div>`) : ListStateBlock("shared work", "Nothing shared yet", "Notes and question sets sent to this class will appear here.")}
        </section>
      </div>`;
  }

  function ShareScreen() {
    var questions = QUESTIONS.slice();

    return `
      <div class="screen screen--wide flow" data-inspect="share.intro">
        <div class="page-head">
          <p class="eyebrow">Teacher · Share</p>
          <h1 class="page-title">Share with a class</h1>
          <p class="lede">Send a note or a set of questions to one or more classes.</p>
        </div>

        <form class="flow" data-share-form data-inspect="share.form">
          <fieldset class="choice-field" data-inspect="share.classes">
            <legend class="field__label">Classes</legend>
            <div class="choice-stack">
              ${CLASSES.map(function (cls) {
                return `
                  <label class="choice">
                    <input type="checkbox" name="share-class" value="${cls.id}" data-share-class>
                    <span>${esc(cls.name)}<span class="choice__meta">${cls.students} students</span></span>
                  </label>`;
              }).join("")}
            </div>
          </fieldset>

          <fieldset class="choice-field" data-inspect="share.type">
            <legend class="field__label">What are you sharing?</legend>
            <div class="choice-row">
              <label class="choice">
                <input type="radio" name="share-type" value="note" checked data-share-type>
                <span>A note</span>
              </label>
              <label class="choice">
                <input type="radio" name="share-type" value="questions" data-share-type>
                <span>Questions</span>
              </label>
            </div>
          </fieldset>

          <div class="field">
            <label class="field__label" for="share-title">Title</label>
            <input class="input" id="share-title" type="text" placeholder="e.g. Kinematics revision notes" data-share-title>
          </div>

          <div class="flow--tight" data-share-note-panel data-inspect="share.note">
            <div class="field">
              <label class="field__label" for="share-note">Note</label>
              <textarea class="textarea" id="share-note" rows="5" placeholder="Write the note your class will see" data-share-note></textarea>
            </div>
            <div class="field">
              <label class="field__label" for="share-file">Or upload a note <span class="muted">(optional)</span></label>
              <input class="input file-input" id="share-file" type="file" accept=".pdf,.doc,.docx,.txt,image/*" data-share-file>
              <p class="field__hint" data-share-file-name hidden></p>
            </div>
          </div>

          <div class="flow--tight" data-share-questions-panel hidden data-inspect="share.questions">
            <div class="field" data-inspect="share.subjectFilter">
              <label class="field__label" for="share-subject">Subject</label>
              <div class="select-wrap">
                <select class="select" id="share-subject" data-share-subject>
                  <option value="">All subjects</option>
                  ${SUBJECTS.map(function (subject) {
                    return '<option value="' + subject.id + '">' + esc(subject.name) + "</option>";
                  }).join("")}
                </select>
              </div>
            </div>
            <p class="field__label">Pick questions from the question bank</p>
            <div class="choice-stack">
              ${questions.map(function (question) {
                var found = topicById(question.topicId);
                var subject = found ? found.subject : null;
                return `
                  <label class="choice" data-share-question-row data-share-subject-id="${question.subjectId}">
                    <input type="checkbox" name="share-question" value="${question.id}" data-share-question>
                    <span>${esc(truncate(question.stem, 90))}<span class="choice__meta">${esc(subject ? subject.code : "")} · ${esc(found ? found.topic.name : "")} · ${question.marks} marks · ${esc(question.difficulty)}</span></span>
                  </label>`;
              }).join("")}
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="share-message">Message <span class="muted">(optional)</span></label>
            <textarea class="textarea" id="share-message" rows="3" placeholder="Add a short message for your class" data-share-message></textarea>
          </div>

          <p class="field__error" data-share-error hidden></p>

          <div class="actions-row">
            <button type="submit" class="btn btn--primary">Send</button>
            <a class="btn btn--secondary" href="#/dashboard">Cancel</a>
          </div>
        </form>
      </div>`;
  }

  function ProfileScreen() {
    var profile = PROFILES[state.role];

    return `
      <div class="screen flow" data-inspect="profile.intro">
        <div class="page-head">
          <p class="eyebrow">Account</p>
          <h1 class="page-title">Profile and settings</h1>
          <p class="lede">Your details and the way out of the prototype. Every subject is open, so there is nothing to choose here.</p>
        </div>

        <section class="card card--plain profile-card" data-inspect="profile.identity">
          <div class="avatar avatar--lg" aria-hidden="true">${esc(profile.initials)}</div>
          <div>
            <h2 class="section-title">${esc(profile.name)}</h2>
            <p class="muted">${esc(profile.email)}</p>
            <span class="badge badge--panel">${esc(ROLE_LABELS[state.role])}</span>
          </div>
        </section>

        <form class="flow" data-profile-form data-inspect="profile.form">
          <div class="field">
            <label class="field__label" for="profile-name">Name</label>
            <input class="input" id="profile-name" type="text" value="${esc(profile.name)}">
          </div>

          <div class="field">
            <label class="field__label" for="profile-email">Email</label>
            <input class="input" id="profile-email" type="email" value="${esc(profile.email)}">
          </div>

          <div class="actions-row">
            <button type="submit" class="btn btn--primary">Save changes</button>
            <button type="button" class="btn btn--secondary" data-sign-out>Sign out</button>
          </div>
        </form>
      </div>`;
  }

  function SitemapScreen() {
    var phases = [0, 1, 2, 3, 4, 5];
    return `
      <div class="screen flow" data-inspect="sitemap.intro">
        <div class="page-head">
          <p class="eyebrow">Prototype map</p>
          <h1 class="page-title">Sitemap</h1>
          <p class="lede">Every screen, grouped by the phase that builds it. Screens with a route are clickable; placeholders show their purpose while their phase is still to come.</p>
        </div>
        ${phases.map(PhaseGroup).join("")}
        <p class="muted">Phase 5 also covers the empty, loading and error states for the main lists.</p>
      </div>`;
  }

  function PhaseGroup(phase) {
    var screens = SCREENS.filter(function (item) {
      return item.phase === phase;
    });

    return `
      <section class="phase-group" data-inspect="sitemap.phase${phase}">
        <div class="phase-head">
          <p class="eyebrow">Phase ${phase}</p>
          <h2 class="phase-head__title">${PHASE_TITLES[phase]}</h2>
        </div>
        <ul class="list">
          ${screens.map(ScreenRow).join("")}
        </ul>
      </section>`;
  }

  function ScreenRow(item) {
    var badge = '<span class="badge badge--panel">Planned</span>';
    if (item.status === "built") badge = '<span class="badge badge--solid">Built</span>';
    if (item.status === "placeholder") badge = '<span class="badge">Placeholder</span>';

    var inner =
      '<span class="screen-row__code">' + item.code + "</span>" +
      '<span class="list-row__main">' +
        '<span class="list-row__title">' + esc(item.name) + "</span>" +
        '<span class="screen-row__note">' + esc(item.summary) + "</span>" +
      "</span>" +
      '<span class="list-row__end">' + badge + (item.route ? ICONS.chevron : "") + "</span>";

    if (item.route) {
      return '<li><a class="list-row" href="#' + item.route + '" data-screen-route="' + item.route + '" data-inspect="screen.' + item.id + '">' + inner + "</a></li>";
    }
    return '<li><div class="list-row list-row--static" data-inspect="screen.' + item.id + '">' + inner + "</div></li>";
  }

  function PlaceholderScreen(id) {
    var item = screenById(id);
    if (!item) return NotFoundScreen();

    return `
      <div class="screen flow" data-inspect="screen.${item.id}">
        <div class="page-head">
          <p class="eyebrow">${phaseLabel(item.phase)} · ${item.code}</p>
          <h1 class="page-title">${esc(item.name)}</h1>
          <p class="lede">${esc(item.summary)}</p>
        </div>

        <div class="card card--plain" data-inspect="placeholder.status">
          <span class="badge">Not built yet</span>
          <h2 class="section-title" style="margin-top: var(--space-4)">What this screen will hold</h2>
          <ul class="bullets placeholder-list">
            ${item.contents.map(function (line) {
              return "<li>" + esc(line) + "</li>";
            }).join("")}
          </ul>
        </div>

        <p class="muted">This placeholder keeps the navigation complete while the phase is built. The sitemap shows where it sits.</p>
      </div>`;
  }

  function NotFoundScreen() {
    return `
      <div class="screen flow">
        <div class="page-head">
          <p class="eyebrow">Not found</p>
          <h1 class="page-title">That screen is not in the map</h1>
          <p class="lede">The link may belong to a phase that has not been built yet.</p>
        </div>
        <p><a class="btn btn--primary" href="#/sitemap">Open the sitemap</a></p>
      </div>`;
  }

  /* ---------- Create class ---------- */

  var createClassForm = document.getElementById("createClassForm");
  if (createClassForm) {
    createClassForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var nameInput = document.getElementById("new-class-name");
      var subjectInput = document.getElementById("new-class-subject");
      var error = document.getElementById("newClassError");
      var name = nameInput ? nameInput.value.trim() : "";

      if (!name) {
        if (error) error.hidden = false;
        if (nameInput) nameInput.focus();
        return;
      }

      if (error) error.hidden = true;
      var subjectId = subjectInput ? subjectInput.value : "cs";
      var subject = subjectById(subjectId);
      var nextNumber = CLASSES.length + 1;
      var newClass = {
        id: "class-" + nextNumber,
        name: name,
        code: (subject ? subject.code : "CS") + "-NEW-" + nextNumber,
        students: 0,
        subjectId: subjectId
      };

      CLASSES.push(newClass);
      CLASS_STUDENTS[newClass.id] = [];
      CLASS_SHARED[newClass.id] = [];
      createClassForm.reset();
      closeModal(document.getElementById("createClassModal"));
      showToast("Class created. Share code " + newClass.code + ".");
      if (state.route === "/dashboard" || state.route === "/classes") render();
    });
  }

  /* ---------- Start ---------- */

  var initialRoute = hashRoute();
  if (!initialRoute) {
    history.replaceState(null, "", "#" + ROLE_HOME[state.role]);
  }
  syncRoute();
  updateProtoHeight();
  updateDeviceScale();
})();
