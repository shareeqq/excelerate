/* ============================================================
   Excelerate — 2D and pseudo-3D figures
   A small drawing kit: primitives, an oblique projection helper
   and semantic builders (inclined plane, velocity–time graph,
   free body, projectile, pulley, ray diagram, field lines).

   Usage:
     Figures.render(spec)  -> "<svg …>…</svg>"
   where spec is either:
     { caption, width, height, items: [primitive, …] }
   or
     { builder: "inclinedPlane", params: { … }, caption }

   Everything draws with currentColor and the brand token, so a
   figure follows the page theme and stays crisp at any zoom.
   ============================================================ */

var Figures = (function () {
  "use strict";

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  /* ---------- Projection ---------- */

  var DEPTH = Math.PI / 6; // 30° for the oblique depth axis

  function oblique(x, y, z, scale) {
    var k = scale === undefined ? 0.62 : scale;
    return {
      x: x + z * k * Math.cos(DEPTH),
      y: y - z * k * Math.sin(DEPTH)
    };
  }

  /* ---------- Primitives ---------- */

  function figureArrow(spec, stroke, opacity) {
    var angle = Math.atan2(spec.y2 - spec.y1, spec.x2 - spec.x1);
    var size = spec.size || 7;
    var ax = spec.x2 - size * Math.cos(angle - 0.42);
    var ay = spec.y2 - size * Math.sin(angle - 0.42);
    var bx = spec.x2 - size * Math.cos(angle + 0.42);
    var by = spec.y2 - size * Math.sin(angle + 0.42);
    return '<line x1="' + round(spec.x1) + '" y1="' + round(spec.y1) + '" x2="' + round(spec.x2) + '" y2="' + round(spec.y2) +
      '" fill="none" stroke="' + stroke + '" stroke-width="1.3" opacity="' + opacity + '"/>' +
      '<path d="M' + round(spec.x2) + " " + round(spec.y2) + " L" + round(ax) + " " + round(ay) +
      " L" + round(bx) + " " + round(by) + ' Z" fill="' + stroke + '" opacity="' + opacity + '"/>';
  }

  function wavePath(spec) {
    var steps = 64;
    var points = [];
    var cycles = spec.cycles || 4;
    var phase = spec.phase || 0;
    for (var i = 0; i <= steps; i += 1) {
      var x = spec.x + (spec.width * i) / steps;
      var y = spec.y - spec.amp * Math.sin((i / steps) * cycles * Math.PI * 2 + phase);
      points.push((i === 0 ? "M" : "L") + round(x) + " " + round(y));
    }
    return points.join(" ");
  }

  function arcPath(spec) {
    var start = spec.start * Math.PI / 180;
    var end = spec.end * Math.PI / 180;
    var x1 = spec.cx + spec.r * Math.cos(start);
    var y1 = spec.cy + spec.r * Math.sin(start);
    var x2 = spec.cx + spec.r * Math.cos(end);
    var y2 = spec.cy + spec.r * Math.sin(end);
    var large = Math.abs(spec.end - spec.start) > 180 ? 1 : 0;
    var sweep = spec.end > spec.start ? 1 : 0;
    return "M" + round(x1) + " " + round(y1) + " A" + spec.r + " " + spec.r + " 0 " + large + " " + sweep +
      " " + round(x2) + " " + round(y2);
  }

  function axes(spec) {
    var out = [];
    var stroke = "currentColor";
    out.push('<line x1="' + spec.x + '" y1="' + spec.y + '" x2="' + (spec.x + spec.width) + '" y2="' + spec.y +
      '" stroke="' + stroke + '" stroke-width="1.3"/>');
    out.push('<line x1="' + spec.x + '" y1="' + spec.y + '" x2="' + spec.x + '" y2="' + (spec.y - spec.height) +
      '" stroke="' + stroke + '" stroke-width="1.3"/>');
    (spec.xTicks || []).forEach(function (tick) {
      var x = spec.x + spec.width * tick.at;
      out.push('<line x1="' + round(x) + '" y1="' + spec.y + '" x2="' + round(x) + '" y2="' + (spec.y + 4) +
        '" stroke="' + stroke + '" opacity="0.6"/>');
      out.push('<text x="' + round(x) + '" y="' + (spec.y + 15) + '" fill="currentColor" font-size="9" text-anchor="middle" opacity="0.75">' +
        esc(tick.label) + "</text>");
    });
    (spec.yTicks || []).forEach(function (tick) {
      var y = spec.y - spec.height * tick.at;
      out.push('<line x1="' + (spec.x - 4) + '" y1="' + round(y) + '" x2="' + spec.x + '" y2="' + round(y) +
        '" stroke="' + stroke + '" opacity="0.6"/>');
      out.push('<text x="' + (spec.x - 7) + '" y="' + round(y + 3) + '" fill="currentColor" font-size="9" text-anchor="end" opacity="0.75">' +
        esc(tick.label) + "</text>");
    });
    if (spec.xLabel) {
      out.push('<text x="' + (spec.x + spec.width) + '" y="' + (spec.y + 28) + '" fill="currentColor" font-size="10" text-anchor="end">' +
        esc(spec.xLabel) + "</text>");
    }
    if (spec.yLabel) {
      out.push('<text x="' + (spec.x - 6) + '" y="' + (spec.y - spec.height - 6) + '" fill="currentColor" font-size="10" text-anchor="end">' +
        esc(spec.yLabel) + "</text>");
    }
    return out.join("");
  }

  function primitive(spec) {
    if (!spec) return "";
    var stroke = spec.accent ? "var(--brand)" : "currentColor";
    var opacity = spec.muted ? "0.5" : "1";
    var dash = spec.dash ? ' stroke-dasharray="4 4"' : "";
    var common = ' fill="none" stroke="' + stroke + '" stroke-width="1.3" opacity="' + opacity + '"' + dash;

    switch (spec.t) {
      case "line":
        return '<line x1="' + round(spec.x1) + '" y1="' + round(spec.y1) + '" x2="' + round(spec.x2) +
          '" y2="' + round(spec.y2) + '"' + common + "/>";
      case "arrow":
        return figureArrow(spec, stroke, opacity);
      case "rect":
        return '<rect x="' + round(spec.x) + '" y="' + round(spec.y) + '" width="' + round(spec.w) + '" height="' + round(spec.h) +
          '" fill="' + (spec.fill ? "var(--panel)" : "none") + '" stroke="' + stroke + '" stroke-width="1.3" opacity="' + opacity + '"' + dash + "/>";
      case "circle":
        return '<circle cx="' + round(spec.cx) + '" cy="' + round(spec.cy) + '" r="' + round(spec.r) +
          '" fill="' + (spec.fill ? "var(--panel)" : "none") + '" stroke="' + stroke + '" stroke-width="1.3" opacity="' + opacity + '"/>';
      case "path":
        return '<path d="' + spec.d + '" fill="' + (spec.fill ? "var(--panel)" : "none") + '" stroke="' + stroke +
          '" stroke-width="1.3" opacity="' + opacity + '"' + dash + "/>";
      case "polygon":
        return '<polygon points="' + spec.points + '" fill="' + (spec.fill ? "var(--panel)" : "none") + '" stroke="' + stroke +
          '" stroke-width="1.3" opacity="' + opacity + '"' + dash + "/>";
      case "arc":
        return '<path d="' + arcPath(spec) + '" fill="none" stroke="' + stroke + '" stroke-width="1.1" opacity="' +
          (spec.muted ? "0.7" : opacity) + '"/>';
      case "wave":
        return '<path d="' + wavePath(spec) + '" fill="none" stroke="' + stroke + '" stroke-width="1.4" opacity="' + opacity + '"' + dash + "/>";
      case "text":
        return '<text x="' + round(spec.x) + '" y="' + round(spec.y) + '" fill="' + stroke + '" font-size="' + (spec.size || 11) +
          '" opacity="' + opacity + '" text-anchor="' + (spec.anchor || "start") + '">' + esc(spec.text) + "</text>";
      case "axes":
        return axes(spec);
      case "group":
        return '<g transform="' + spec.transform + '">' + (spec.items || []).map(primitive).join("") + "</g>";
      case "dim": {
        var vertical = spec.x1 === spec.x2;
        var tick = 4;
        var midX = (spec.x1 + spec.x2) / 2;
        var midY = (spec.y1 + spec.y2) / 2;
        var ticks = vertical
          ? '<line x1="' + (spec.x1 - tick) + '" y1="' + spec.y1 + '" x2="' + (spec.x1 + tick) + '" y2="' + spec.y1 + '"' + common + "/>" +
            '<line x1="' + (spec.x2 - tick) + '" y1="' + spec.y2 + '" x2="' + (spec.x2 + tick) + '" y2="' + spec.y2 + '"' + common + "/>"
          : '<line x1="' + spec.x1 + '" y1="' + (spec.y1 - tick) + '" x2="' + spec.x1 + '" y2="' + (spec.y1 + tick) + '"' + common + "/>" +
            '<line x1="' + spec.x2 + '" y1="' + (spec.y2 - tick) + '" x2="' + spec.x2 + '" y2="' + (spec.y2 + tick) + '"' + common + "/>";
        return '<line x1="' + spec.x1 + '" y1="' + spec.y1 + '" x2="' + spec.x2 + '" y2="' + spec.y2 + '"' + common + "/>" + ticks +
          '<text x="' + round(midX) + '" y="' + round(vertical ? midY : midY - 6) + '" fill="' + stroke +
          '" font-size="10" opacity="' + opacity + '" text-anchor="middle">' + esc(spec.label) + "</text>";
      }
      default:
        return "";
    }
  }

  /* ---------- Builders ---------- */

  function text(x, y, value, size, anchor, accent) {
    return { t: "text", x: x, y: y, text: value, size: size || 10, anchor: anchor || "start", accent: accent };
  }

  function arrowLine(x1, y1, x2, y2, accent, dash) {
    return { t: "arrow", x1: x1, y1: y1, x2: x2, y2: y2, accent: accent, dash: dash };
  }

  var builders = {};

  /* An inclined plane seen in oblique projection, with a block and the
     forces or components on it. */
  builders.inclinedPlane = function (params) {
    var angle = (params.angle === undefined ? 25 : params.angle) * Math.PI / 180;
    var width = 400;
    var height = 236;
    var baseX = 44;
    var baseY = 178;
    var run = params.run || 232;
    var depth = params.depth || 52;
    var rise = run * Math.tan(angle);
    var back = oblique(0, 0, depth, 0.55);

    var A = { x: baseX, y: baseY };
    var B = { x: baseX + run, y: baseY };
    var C = { x: baseX + run, y: baseY - rise };
    var Ad = { x: A.x + back.x, y: A.y + back.y };
    var Bd = { x: B.x + back.x, y: B.y + back.y };
    var Cd = { x: C.x + back.x, y: C.y + back.y };

    var items = [];
    items.push({ t: "polygon", points: [A, C, Cd, Ad].map(function (p) { return round(p.x) + "," + round(p.y); }).join(" "), fill: true });
    items.push({ t: "polygon", points: [A, B, Bd, Ad].map(function (p) { return round(p.x) + "," + round(p.y); }).join(" ") });
    items.push({ t: "polygon", points: [B, C, Cd, Bd].map(function (p) { return round(p.x) + "," + round(p.y); }).join(" ") });
    items.push({ t: "line", x1: A.x, y1: A.y, x2: B.x, y2: B.y });
    items.push({ t: "line", x1: A.x, y1: A.y, x2: C.x, y2: C.y });
    items.push({ t: "line", x1: C.x, y1: C.y, x2: Cd.x, y2: Cd.y, muted: true });
    items.push({ t: "line", x1: Ad.x, y1: Ad.y, x2: Cd.x, y2: Cd.y, muted: true });

    var arcR = 46;
    items.push({ t: "arc", cx: A.x, cy: A.y, r: arcR, start: -angle * 180 / Math.PI, end: 0, muted: true });
    items.push(text(A.x + arcR + 4, A.y - 5, (params.angle === undefined ? 25 : params.angle) + "°", 9));

    var t = params.blockAt === undefined ? 0.5 : params.blockAt;
    var centre = { x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t };
    var size = 28;
    var normal = { x: Math.sin(angle), y: -Math.cos(angle) };
    var along = { x: Math.cos(angle), y: -Math.sin(angle) };
    var block = [
      { x: centre.x - along.x * size / 2, y: centre.y - along.y * size / 2 },
      { x: centre.x + along.x * size / 2, y: centre.y + along.y * size / 2 },
      { x: centre.x + along.x * size / 2 + normal.x * size, y: centre.y + along.y * size / 2 + normal.y * size },
      { x: centre.x - along.x * size / 2 + normal.x * size, y: centre.y - along.y * size / 2 + normal.y * size }
    ];
    items.push({ t: "polygon", points: block.map(function (p) { return round(p.x) + "," + round(p.y); }).join(" "), fill: true });

    var origin = { x: centre.x + normal.x * size * 0.5, y: centre.y + normal.y * size * 0.5 };
    var length = 58;

    if (params.showForces !== false) {
      items.push(arrowLine(origin.x, origin.y, origin.x, origin.y + length, true));
      items.push(text(origin.x + 7, origin.y + length + 2, params.weightLabel || "W", 10));
      items.push(arrowLine(origin.x, origin.y, origin.x + normal.x * length, origin.y + normal.y * length, true));
      items.push(text(origin.x + normal.x * length - 6, origin.y + normal.y * length - 5, params.normalLabel || "N", 10, "end"));
      if (params.friction !== false) {
        items.push(arrowLine(origin.x, origin.y, origin.x + along.x * length, origin.y + along.y * length, true));
        items.push(text(origin.x + along.x * length + 7, origin.y + along.y * length - 1, params.frictionLabel || "F", 10));
      }
    }

    if (params.showComponents) {
      var compLength = 46;
      items.push(arrowLine(origin.x, origin.y, origin.x - along.x * compLength, origin.y - along.y * compLength, false, true));
      items.push(arrowLine(origin.x, origin.y, origin.x - normal.x * compLength, origin.y - normal.y * compLength, false, true));
    }

    items.push(text(width / 2, height - 8,
      params.legend || "W = mg  ·  dashed: W sin θ down the slope, W cos θ into the slope", 9, "middle"));

    return {
      caption: params.caption || "Block on a rough plane inclined at " + (params.angle === undefined ? 25 : params.angle) + "°",
      width: width,
      height: height,
      items: items
    };
  };

  /* A velocity–time curve approaching terminal velocity, with a tangent
     at one instant so the acceleration can be read as a gradient. */
  builders.velocityTime = function (params) {
    var terminal = params.terminal || 40;
    var tau = params.tau || 6;
    var tMax = params.tMax || 30;
    var t0 = params.tangentAt === undefined ? 9 : params.tangentAt;
    var left = 48;
    var right = 332;
    var top = 30;
    var bottom = 168;
    var vMax = terminal * 1.12;

    var xFor = function (value) { return left + (value / tMax) * (right - left); };
    var yFor = function (value) { return bottom - (value / vMax) * (bottom - top); };

    var points = [];
    for (var i = 0; i <= 120; i += 1) {
      var time = (i / 120) * tMax;
      var speed = terminal * (1 - Math.exp(-time / tau));
      points.push((i === 0 ? "M" : "L") + round(xFor(time)) + " " + round(yFor(speed)));
    }

    var items = [
      { t: "axes", x: left, y: bottom, width: right - left, height: bottom - top, xLabel: "t / s", yLabel: "v / m s⁻¹",
        xTicks: [{ at: 0, label: "0" }, { at: 0.33, label: "10" }, { at: 0.67, label: "20" }, { at: 1, label: "30" }],
        yTicks: [{ at: 0, label: "0" }, { at: 0.45, label: String(Math.round(terminal * 0.5)) }, { at: 0.9, label: String(Math.round(terminal * 1.0)) }] },
      { t: "path", d: points.join(" ") }
    ];

    // terminal velocity marker
    items.push({ t: "line", x1: left, y1: yFor(terminal), x2: right, y2: yFor(terminal), dash: true, muted: true });
    items.push(text(right - 4, yFor(terminal) - 6, "terminal velocity", 9, "end"));

    // tangent at t0
    var speedAt = terminal * (1 - Math.exp(-t0 / tau));
    var gradient = (terminal / tau) * Math.exp(-t0 / tau);
    var dt = 5;
    var x1 = xFor(Math.max(0, t0 - dt));
    var y1 = yFor(speedAt - gradient * dt);
    var x2 = xFor(t0 + dt);
    var y2 = yFor(speedAt + gradient * dt);
    items.push({ t: "line", x1: x1, y1: y1, x2: x2, y2: y2, accent: true });
    items.push({ t: "circle", cx: xFor(t0), cy: yFor(speedAt), r: 3, accent: true });
    items.push(text(xFor(t0) + 8, yFor(speedAt) - 10, "gradient = acceleration", 9, "start", true));

    return {
      caption: params.caption || "Velocity–time graph approaching terminal velocity",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* An object with a set of labelled force arrows. */
  builders.freeBody = function (params) {
    var cx = 180;
    var cy = 100;
    var size = params.size || 34;
    var items = [];
    if (params.shape === "circle") {
      items.push({ t: "circle", cx: cx, cy: cy, r: size / 2, fill: true });
    } else {
      items.push({ t: "rect", x: cx - size / 2, y: cy - size / 2, w: size, h: size, fill: true });
    }
    (params.forces || []).forEach(function (force) {
      var angle = (force.angle || 0) * Math.PI / 180;
      var length = force.length || 52;
      var x2 = cx + Math.cos(angle) * length;
      var y2 = cy - Math.sin(angle) * length;
      items.push(arrowLine(cx, cy, x2, y2, force.accent !== false));
      items.push(text(x2 + Math.cos(angle) * 6, y2 - Math.sin(angle) * 6 + 4, force.label, 10,
        Math.cos(angle) < -0.2 ? "end" : "start"));
    });
    return {
      caption: params.caption || "Forces on an object",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* A projectile path with its initial velocity resolved into components. */
  builders.projectile = function (params) {
    var angle = (params.angle === undefined ? 35 : params.angle) * Math.PI / 180;
    var speed = params.speed || 24;
    var toScreen = function (px, py) {
      return { x: 44 + px * 1.1, y: 168 - py * 1.1 };
    };
    var items = [];
    items.push({ t: "line", x1: 30, y1: 168, x2: 330, y2: 168 });
    var points = [];
    var flight = 2 * speed * Math.sin(angle) / 9.81;
    for (var i = 0; i <= 80; i += 1) {
      var time = (i / 80) * flight;
      var px = speed * Math.cos(angle) * time;
      var py = speed * Math.sin(angle) * time - 0.5 * 9.81 * time * time;
      var point = toScreen(px, py);
      points.push((i === 0 ? "M" : "L") + round(point.x) + " " + round(point.y));
    }
    items.push({ t: "path", d: points.join(" "), accent: true });
    var start = toScreen(0, 0);
    items.push(arrowLine(start.x, start.y, start.x + speed * Math.cos(angle) * 2.4,
      start.y - speed * Math.sin(angle) * 2.4, true));
    items.push(text(start.x + 8, start.y - 10, params.speedLabel || "u", 10));
    items.push({ t: "line", x1: start.x, y1: start.y, x2: start.x + speed * Math.cos(angle) * 2.4, y2: start.y, dash: true, muted: true });
    items.push(text(start.x + 20, start.y + 14, "u cos θ", 9));
    items.push(text(start.x + 2, start.y - 30, "u sin θ", 9));
    return {
      caption: params.caption || "Projectile motion",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* Two masses hanging over a pulley. */
  builders.pulley = function (params) {
    var left = 140;
    var right = 240;
    var top = 54;
    var items = [
      { t: "line", x1: left, y1: 22, x2: right, y2: 22 },
      { t: "circle", cx: (left + right) / 2, cy: top, r: 18, fill: true },
      { t: "line", x1: left, y1: 22, x2: left, y2: 130 },
      { t: "line", x1: right, y1: 22, x2: right, y2: 96 },
      { t: "rect", x: left - 26, y: 130, w: 52, h: 40, fill: true },
      { t: "rect", x: right - 22, y: 96, w: 44, h: 34, fill: true }
    ];
    items.push(text(left, 184, (params.m1 || "m₁") + " g", 10, "middle"));
    items.push(text(right, 148, (params.m2 || "m₂") + " g", 10, "middle"));
    items.push(arrowLine(right, 96, right, 62, true));
    items.push(text(right + 6, 76, "T", 10));
    items.push(arrowLine(left, 130, left, 96, true));
    items.push(text(left - 6, 110, "T", 10, "end"));
    return {
      caption: params.caption || "Two masses over a pulley",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* Ray diagram for a converging or diverging lens. */
  builders.rayDiagram = function (params) {
    var axis = 110;
    var lensX = 180;
    var height = params.height || 34;
    var items = [
      { t: "line", x1: 20, y1: axis, x2: 340, y2: axis, muted: true },
      { t: "path", d: "M" + lensX + " " + (axis - 56) + " q -18 56 0 112 q 18 -56 0 -112", muted: true },
      { t: "arrow", x1: 70, y1: axis, x2: 70, y2: axis - height, accent: true },
      { t: "text", x: 64, y: axis - height - 6, text: "object", size: 9, anchor: "end" }
    ];
    // ray 1: parallel to the axis, then through the focal point
    items.push({ t: "path", d: "M70 " + (axis - height) + " H" + lensX + " L" + (lensX + 90) + " " + (axis + 40), muted: true });
    // ray 2: through the centre, undeviated
    items.push({ t: "path", d: "M70 " + (axis - height) + " L" + (lensX + 90) + " " + (axis + 60), muted: true });
    items.push({ t: "arrow", x1: lensX + 90, y1: axis + 40, x2: lensX + 90, y2: axis, accent: true });
    items.push({ t: "text", x: lensX + 96, y: axis + 30, text: "image", size: 9 });
    items.push(text(lensX, axis + 78, "lens", 9, "middle"));
    return {
      caption: params.caption || "Ray diagram for a converging lens",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* Radial field lines around a point charge. */
  builders.fieldLines = function (params) {
    var cx = 180;
    var cy = 100;
    var count = params.count || 8;
    var items = [{ t: "circle", cx: cx, cy: cy, r: 6, fill: true, accent: true }];
    for (var i = 0; i < count; i += 1) {
      var angle = (i / count) * Math.PI * 2;
      var x1 = cx + Math.cos(angle) * 16;
      var y1 = cy + Math.sin(angle) * 16;
      var x2 = cx + Math.cos(angle) * 76;
      var y2 = cy + Math.sin(angle) * 76;
      items.push({ t: "arrow", x1: x1, y1: y1, x2: x2, y2: y2, size: 5 });
    }
    items.push(text(cx, cy + 96, params.label || "field lines around a point charge", 9, "middle"));
    return {
      caption: params.caption || "Radial field lines",
      width: 360,
      height: 200,
      items: items
    };
  };

  /* ---------- Entry point ---------- */

  function render(spec) {
    if (!spec) return "";
    var figure = spec.builder && builders[spec.builder]
      ? builders[spec.builder](spec.params || {})
      : spec;
    var width = figure.width || 360;
    var height = figure.height || 200;
    var body = (figure.items || []).map(primitive).join("");
    return '<svg class="figure" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' +
      esc(figure.caption || spec.caption || "Diagram") + '">' + body + "</svg>";
  }

  function caption(spec) {
    if (!spec) return "";
    if (spec.builder && builders[spec.builder]) {
      var built = builders[spec.builder](spec.params || {});
      return built.caption || spec.caption || "";
    }
    return spec.caption || "";
  }

  return {
    render: render,
    caption: caption,
    builders: builders
  };
})();
