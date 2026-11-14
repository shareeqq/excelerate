/* ============================================================
   Excelerate — ink and annotations
   Turns a small list of marks (underline, circle, arrow, freehand)
   into hand-drawn looking SVG paths. The wobble is generated from a
   deterministic hash, so re-rendering the same step looks identical.

   Usage:
     Ink.render(marks, width, height) -> "<svg …>…</svg>"
   ============================================================ */

var Ink = (function () {
  "use strict";

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  function noise(seed) {
    var value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value) - 0.5;
  }

  function wobblyLine(x1, y1, x2, y2, seed, steps) {
    var points = [];
    var total = steps || 16;
    for (var i = 0; i <= total; i += 1) {
      var t = i / total;
      points.push({
        x: x1 + (x2 - x1) * t + noise(seed + i * 3.7) * 1.5,
        y: y1 + (y2 - y1) * t + noise(seed + 11 + i * 2.3) * 1.5
      });
    }
    return points;
  }

  function wobblyEllipse(cx, cy, rx, ry, seed) {
    var points = [];
    var total = 44;
    for (var i = 0; i <= total; i += 1) {
      var angle = (i / total) * Math.PI * 2 + 0.35;
      var scale = 1 + noise(seed + i * 1.7) * 0.05;
      points.push({
        x: cx + Math.cos(angle) * rx * scale,
        y: cy + Math.sin(angle) * ry * scale
      });
    }
    return points;
  }

  function smoothPath(points) {
    if (!points || !points.length) return "";
    if (points.length === 1) return "M" + round(points[0].x) + " " + round(points[0].y);
    var path = "M" + round(points[0].x) + " " + round(points[0].y);
    for (var i = 1; i < points.length - 1; i += 1) {
      var midX = (points[i].x + points[i + 1].x) / 2;
      var midY = (points[i].y + points[i + 1].y) / 2;
      path += " Q" + round(points[i].x) + " " + round(points[i].y) + " " + round(midX) + " " + round(midY);
    }
    var last = points[points.length - 1];
    path += " L" + round(last.x) + " " + round(last.y);
    return path;
  }

  var styles = {
    pen: { stroke: "var(--ink)", width: 2, opacity: 0.92 },
    accent: { stroke: "var(--brand)", width: 2.1, opacity: 0.95 },
    highlight: { stroke: "var(--brand)", width: 11, opacity: 0.13 },
    muted: { stroke: "var(--muted)", width: 1.6, opacity: 0.8 }
  };

  function pathFor(mark, index) {
    var seed = index * 7.31 + (mark.seed || 0);
    if (mark.points) return smoothPath(mark.points);

    switch (mark.type) {
      case "underline":
        return smoothPath(wobblyLine(mark.x1, mark.y1, mark.x2, mark.y2, seed));
      case "circle":
        return smoothPath(wobblyEllipse(mark.cx, mark.cy, mark.rx, mark.ry, seed));
      case "arrow": {
        var line = smoothPath(wobblyLine(mark.x1, mark.y1, mark.x2, mark.y2, seed, 12));
        var angle = Math.atan2(mark.y2 - mark.y1, mark.x2 - mark.x1);
        var size = mark.head || 8;
        var left = {
          x: mark.x2 - size * Math.cos(angle - 0.45),
          y: mark.y2 - size * Math.sin(angle - 0.45)
        };
        var right = {
          x: mark.x2 - size * Math.cos(angle + 0.45),
          y: mark.y2 - size * Math.sin(angle + 0.45)
        };
        return line + " M" + round(left.x) + " " + round(left.y) + " L" + round(mark.x2) + " " + round(mark.y2) +
          " L" + round(right.x) + " " + round(right.y);
      }
      default:
        return "";
    }
  }

  function markPath(mark, index) {
    var style = styles[mark.style || "pen"] || styles.pen;
    var path = pathFor(mark, index);
    if (!path) return "";
    return '<path d="' + path + '" fill="none" stroke="' + style.stroke + '" stroke-width="' + style.width +
      '" stroke-linecap="round" stroke-linejoin="round" opacity="' + style.opacity + '"/>';
  }

  function render(marks, width, height) {
    var list = (marks || []).map(markPath).join("");
    return '<svg viewBox="0 0 ' + (width || 360) + " " + (height || 200) +
      '" preserveAspectRatio="none" aria-hidden="true">' + list + "</svg>";
  }

  return {
    render: render,
    smoothPath: smoothPath
  };
})();
