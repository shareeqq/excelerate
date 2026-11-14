/* ============================================================
   Excelerate — pseudocode runner
   A small interpreter for the CAIE-style pseudocode used by the
   Computer Science questions. It is deliberately limited: no file
   I/O, no classes, one-dimensional arrays only.

   Usage:
     var result = Pseudo.run(source, inputText);
     // { ok: true, output: ["Line 1", ...], steps: 12 }
     // { ok: false, error: "Unknown variable x", line: 4, output: [...] }

   Everything is local and synchronous. Nothing leaves the page.
   ============================================================ */

var Pseudo = (function () {
  "use strict";

  var MAX_STEPS = 400000;
  var MAX_DEPTH = 60;
  var MAX_OUTPUT = 200;

  /* ---------- Tokenizer (for expressions on one line) ---------- */

  function tokenize(source) {
    var tokens = [];
    var index = 0;
    while (index < source.length) {
      var character = source.charAt(index);
      if (/\s/.test(character)) {
        index += 1;
        continue;
      }
      if (character === '"' || character === "'") {
        var quote = character;
        var text = "";
        index += 1;
        while (index < source.length && source.charAt(index) !== quote) {
          if (source.charAt(index) === "\\" && index + 1 < source.length) {
            index += 1;
            text += source.charAt(index);
          } else {
            text += source.charAt(index);
          }
          index += 1;
        }
        if (index >= source.length) throw { message: "Unclosed text string" };
        index += 1;
        tokens.push({ type: "string", value: text });
        continue;
      }
      if (/[0-9]/.test(character) || (character === "." && /[0-9]/.test(source.charAt(index + 1)))) {
        var number = "";
        while (index < source.length && /[0-9.]/.test(source.charAt(index))) {
          number += source.charAt(index);
          index += 1;
        }
        if ((number.match(/\./g) || []).length > 1) throw { message: "Bad number " + number };
        tokens.push({ type: "number", value: Number(number) });
        continue;
      }
      if (/[A-Za-z_]/.test(character)) {
        var word = "";
        while (index < source.length && /[A-Za-z0-9_]/.test(source.charAt(index))) {
          word += source.charAt(index);
          index += 1;
        }
        tokens.push({ type: "word", value: word });
        continue;
      }
      var pair = source.substr(index, 2);
      if (pair === "<-" || pair === "<>" || pair === "<=" || pair === ">=") {
        tokens.push({ type: "op", value: pair });
        index += 2;
        continue;
      }
      if ("+-*/^&()[],:<>=".indexOf(character) !== -1) {
        tokens.push({ type: "op", value: character });
        index += 1;
        continue;
      }
      throw { message: "Unexpected character " + character };
    }
    return tokens;
  }

  /* ---------- Expression parser ---------- */

  function Parser(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  Parser.prototype.peek = function () {
    return this.tokens[this.position] || null;
  };

  Parser.prototype.next = function () {
    var token = this.tokens[this.position];
    if (!token) throw { message: "The line ends too early" };
    this.position += 1;
    return token;
  };

  Parser.prototype.isOp = function (value) {
    var token = this.peek();
    return token && token.type === "op" && token.value === value;
  };

  Parser.prototype.isWord = function (value) {
    var token = this.peek();
    return token && token.type === "word" && token.value.toUpperCase() === value;
  };

  Parser.prototype.acceptOp = function (value) {
    if (!this.isOp(value)) return false;
    this.position += 1;
    return true;
  };

  Parser.prototype.acceptWord = function (value) {
    if (!this.isWord(value)) return false;
    this.position += 1;
    return true;
  };

  Parser.prototype.expectOp = function (value) {
    if (!this.acceptOp(value)) throw { message: "Expected " + value };
  };

  Parser.prototype.parse = function () {
    var node = this.parseOr();
    if (this.peek()) {
      var token = this.peek();
      throw { message: "Unexpected " + (token.value === undefined ? token.type : token.value) };
    }
    return node;
  };

  Parser.prototype.parseOr = function () {
    var node = this.parseAnd();
    while (this.isWord("OR")) {
      this.next();
      node = { type: "binary", op: "OR", left: node, right: this.parseAnd() };
    }
    return node;
  };

  Parser.prototype.parseAnd = function () {
    var node = this.parseNot();
    while (this.isWord("AND")) {
      this.next();
      node = { type: "binary", op: "AND", left: node, right: this.parseNot() };
    }
    return node;
  };

  Parser.prototype.parseNot = function () {
    if (this.isWord("NOT")) {
      this.next();
      return { type: "unary", op: "NOT", value: this.parseNot() };
    }
    return this.parseCompare();
  };

  Parser.prototype.parseCompare = function () {
    var node = this.parseAdd();
    while (this.peek() && this.peek().type === "op" &&
      ["=", "<>", "<", ">", "<=", ">="].indexOf(this.peek().value) !== -1) {
      var op = this.next().value;
      node = { type: "binary", op: op, left: node, right: this.parseAdd() };
    }
    return node;
  };

  Parser.prototype.parseAdd = function () {
    var node = this.parseMul();
    while (this.peek() && this.peek().type === "op" && ["+", "-", "&"].indexOf(this.peek().value) !== -1) {
      var op = this.next().value;
      node = { type: "binary", op: op, left: node, right: this.parseMul() };
    }
    return node;
  };

  Parser.prototype.parseMul = function () {
    var node = this.parseUnary();
    for (;;) {
      if (this.peek() && this.peek().type === "op" && ["*", "/"].indexOf(this.peek().value) !== -1) {
        var op = this.next().value;
        node = { type: "binary", op: op, left: node, right: this.parseUnary() };
        continue;
      }
      if (this.isWord("DIV") || this.isWord("MOD")) {
        var word = this.next().value.toUpperCase();
        node = { type: "binary", op: word, left: node, right: this.parseUnary() };
        continue;
      }
      return node;
    }
  };

  Parser.prototype.parseUnary = function () {
    if (this.isOp("-")) {
      this.next();
      return { type: "unary", op: "-", value: this.parseUnary() };
    }
    if (this.isOp("+")) {
      this.next();
      return this.parseUnary();
    }
    return this.parsePower();
  };

  Parser.prototype.parsePower = function () {
    var node = this.parsePrimary();
    if (this.isOp("^")) {
      this.next();
      node = { type: "binary", op: "^", left: node, right: this.parseUnary() };
    }
    return node;
  };

  Parser.prototype.parsePrimary = function () {
    var token = this.next();
    if (token.type === "number") return { type: "number", value: token.value };
    if (token.type === "string") return { type: "string", value: token.value };
    if (token.type === "word") {
      var upper = token.value.toUpperCase();
      if (upper === "TRUE") return { type: "boolean", value: true };
      if (upper === "FALSE") return { type: "boolean", value: false };
      var name = token.value.toLowerCase();
      if (this.isOp("(")) {
        this.next();
        var args = [];
        if (!this.isOp(")")) {
          args.push(this.parseOr());
          while (this.acceptOp(",")) args.push(this.parseOr());
        }
        this.expectOp(")");
        return { type: "call", name: name, args: args };
      }
      if (this.isOp("[")) {
        this.next();
        var first = this.parseOr();
        if (this.acceptOp(",")) {
          var second = this.parseOr();
          this.expectOp("]");
          return { type: "index2", name: name, row: first, column: second };
        }
        this.expectOp("]");
        return { type: "index", name: name, index: first };
      }
      return { type: "name", name: name };
    }
    if (token.type === "op" && token.value === "(") {
      var inner = this.parseOr();
      this.expectOp(")");
      return inner;
    }
    throw { message: "Unexpected " + (token.value === undefined ? token.type : token.value) };
  };

  /* ---------- Line helpers ---------- */

  function stripComment(line) {
    var out = "";
    var inString = false;
    var quote = "";
    for (var i = 0; i < line.length; i += 1) {
      var character = line.charAt(i);
      if (inString) {
        out += character;
        if (character === quote) inString = false;
        continue;
      }
      if (character === '"' || character === "'") {
        inString = true;
        quote = character;
        out += character;
        continue;
      }
      if (character === "/" && line.charAt(i + 1) === "/") break;
      out += character;
    }
    return out;
  }

  function parseExpression(source) {
    if (!source || !source.trim()) throw { message: "Missing expression" };
    return new Parser(tokenize(source)).parse();
  }

  function splitArguments(source) {
    var parts = [];
    var depth = 0;
    var current = "";
    var inString = false;
    var quote = "";
    for (var i = 0; i < source.length; i += 1) {
      var character = source.charAt(i);
      if (inString) {
        current += character;
        if (character === quote) inString = false;
        continue;
      }
      if (character === '"' || character === "'") {
        inString = true;
        quote = character;
        current += character;
        continue;
      }
      if (character === "(" || character === "[") depth += 1;
      if (character === ")" || character === "]") depth -= 1;
      if (character === "," && depth === 0) {
        parts.push(current);
        current = "";
        continue;
      }
      current += character;
    }
    if (current.trim()) parts.push(current);
    return parts;
  }

  function topLevelIndex(source, character) {
    var depth = 0;
    var inString = false;
    var quote = "";
    for (var i = 0; i < source.length; i += 1) {
      var current = source.charAt(i);
      if (inString) {
        if (current === quote) inString = false;
        continue;
      }
      if (current === '"' || current === "'") {
        inString = true;
        quote = current;
        continue;
      }
      if (current === "(" || current === "[") depth += 1;
      if (current === ")" || current === "]") depth -= 1;
      if (depth === 0 && current === character) return i;
    }
    return -1;
  }

  function splitTopLevel(source, keyword) {    var parts = [];
    var depth = 0;
    var inString = false;
    var quote = "";
    var upper = source.toUpperCase();
    var index = 0;
    var start = 0;
    while (index < source.length) {
      var character = source.charAt(index);
      if (inString) {
        if (character === quote) inString = false;
        index += 1;
        continue;
      }
      if (character === '"' || character === "'") {
        inString = true;
        quote = character;
        index += 1;
        continue;
      }
      if (character === "(" || character === "[") depth += 1;
      if (character === ")" || character === "]") depth -= 1;
      if (depth === 0 && upper.substr(index, keyword.length) === keyword) {
        parts.push(source.slice(start, index));
        index += keyword.length;
        start = index;
        continue;
      }
      index += 1;
    }
    parts.push(source.slice(start));
    return parts;
  }

  /* ---------- Statement parser ---------- */

  function Program(source) {
    this.lines = [];
    var raw = String(source).replace(/\r\n?/g, "\n").split("\n");
    for (var i = 0; i < raw.length; i += 1) {
      var text = stripComment(raw[i]).trim();
      // Accept "END IF", "END PROCEDURE" and the one-word forms.
      text = text.replace(/^END\s+(IF|WHILE|PROCEDURE|FUNCTION|FOR|CASE)\b/i, function (match, keyword) {
        return "END" + keyword.toUpperCase();
      });
      if (text) this.lines.push({ text: text, line: i + 1 });
    }
    this.position = 0;
    this.blocks = [];
  }

  Program.prototype.firstWord = function () {
    var match = this.lines[this.position].text.match(/^([A-Za-z]+)/);
    return match ? match[1].toUpperCase() : "";
  };

  Program.prototype.parseBlock = function (stops) {
    var statements = [];
    while (this.position < this.lines.length) {
      var word = this.firstWord();
      if (stops.indexOf(word) !== -1) break;
      statements.push(this.parseStatement());
    }
    return statements;
  };

  Program.prototype.expectWord = function (word, anchorLine) {
    var atEnd = this.position >= this.lines.length;
    var line = atEnd
      ? (anchorLine || (this.lines.length ? this.lines[this.lines.length - 1].line : 0))
      : this.lines[this.position].line;
    if (atEnd || this.firstWord() !== word) {
      throw { message: "Expected " + word, line: line };
    }
    this.position += 1;
  };

  Program.prototype.parseStatement = function () {
    var entry = this.lines[this.position];
    var text = entry.text;
    var line = entry.line;
    var word = this.firstWord();
    var rest = text.slice(word.length).trim();
    var statement;

    if (word === "IF") {
      var conditionText = text.replace(/^IF\s+/i, "").replace(/\s+THEN\s*$/i, "");
      if (!/\sTHEN\s*$/i.test(text)) throw { message: "IF needs THEN at the end", line: line };
      this.position += 1;
      var thenBody = this.parseBlock(["ELSE", "ENDIF"]);
      var elseBody = [];
      if (this.position < this.lines.length && this.firstWord() === "ELSE") {
        this.position += 1;
        elseBody = this.parseBlock(["ENDIF"]);
      }
      this.expectWord("ENDIF", line);
      statement = { type: "if", test: parseExpression(conditionText), then: thenBody, otherwise: elseBody, line: line };
      return statement;
    }

    if (word === "FOR") {
      var matchFor = text.match(/^FOR\s+([A-Za-z_][A-Za-z0-9_]*)\s*<-\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i);
      if (!matchFor) throw { message: "FOR needs: FOR i <- start TO end", line: line };
      this.position += 1;
      var body = this.parseBlock(["NEXT"]);
      this.expectWord("NEXT", line);
      return {
        type: "for",
        name: matchFor[1].toLowerCase(),
        from: parseExpression(matchFor[2]),
        to: parseExpression(matchFor[3]),
        step: matchFor[4] ? parseExpression(matchFor[4]) : null,
        body: body,
        line: line
      };
    }

    if (word === "WHILE") {
      var conditionWhile = text.replace(/^WHILE\s+/i, "").replace(/\s+DO\s*$/i, "");
      this.position += 1;
      var whileBody = this.parseBlock(["ENDWHILE"]);
      this.expectWord("ENDWHILE", line);
      return { type: "while", test: parseExpression(conditionWhile), body: whileBody, line: line };
    }

    if (word === "REPEAT") {
      this.position += 1;
      var repeatBody = this.parseBlock(["UNTIL"]);
      this.expectWord("UNTIL", line);
      var untilEntry = this.lines[this.position - 1];
      var untilCondition = untilEntry.text.replace(/^UNTIL\s+/i, "");
      return { type: "repeat", test: parseExpression(untilCondition), body: repeatBody, line: line };
    }

    if (word === "PROCEDURE" || word === "FUNCTION") {
      var matchRoutine = text.match(/^(PROCEDURE|FUNCTION)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\))?\s*(?:RETURNS\s+[A-Za-z]+)?$/i);
      if (!matchRoutine) throw { message: word + " needs a name", line: line };
      var kind = matchRoutine[1].toUpperCase();
      var params = matchRoutine[3] ? splitArguments(matchRoutine[3]).map(function (part) {
        return part.split(":")[0].trim().toLowerCase();
      }) : [];
      this.position += 1;
      var routineBody = this.parseBlock([kind === "PROCEDURE" ? "ENDPROCEDURE" : "ENDFUNCTION"]);
      this.expectWord(kind === "PROCEDURE" ? "ENDPROCEDURE" : "ENDFUNCTION", line);
      return {
        type: "routine",
        kind: kind,
        name: matchRoutine[2].toLowerCase(),
        params: params,
        body: routineBody,
        line: line
      };
    }

    if (word === "CALL") {
      this.position += 1;
      var matchCall = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\))?$/);
      if (!matchCall) throw { message: "CALL needs a procedure name", line: line };
      return {
        type: "call",
        name: matchCall[1].toLowerCase(),
        args: matchCall[2] ? splitArguments(matchCall[2]).map(parseExpression) : [],
        line: line
      };
    }

    if (word === "RETURN") {
      this.position += 1;
      return { type: "return", value: parseExpression(rest), line: line };
    }

    if (word === "DECLARE" || word === "CONST" || word === "CONSTANT") {
      this.position += 1;
      return this.parseDeclaration(word, rest, line);
    }

    if (word === "OUTPUT" || word === "PRINT" || word === "WRITE") {
      this.position += 1;
      return {
        type: "output",
        values: splitArguments(rest).map(parseExpression),
        line: line
      };
    }

    if (word === "INPUT" || word === "READ") {
      this.position += 1;
      return {
        type: "input",
        targets: splitArguments(rest).map(parseExpression),
        line: line
      };
    }

    throw { message: "Cannot understand " + word + ". Use IF, FOR, WHILE, DECLARE, OUTPUT, INPUT or an assignment.", line: line };
  };

  Program.prototype.parseDeclaration = function (word, rest, line) {
    var constant = word !== "DECLARE";
    var colon = topLevelIndex(rest, ":");
    var equals = constant ? topLevelIndex(rest, "=") : -1;

    if (constant && equals !== -1) {
      var constName = rest.slice(0, equals).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(constName)) {
        throw { message: "Cannot read the constant name", line: line };
      }
      return {
        type: "declare",
        names: [{ name: constName.toLowerCase(), bounds: null }],
        elementType: "INTEGER",
        initial: parseExpression(rest.slice(equals + 1)),
        constant: true,
        line: line
      };
    }

    var namePart = colon === -1 ? rest : rest.slice(0, colon);
    var typePart = colon === -1 ? "" : rest.slice(colon + 1).trim();
    var boundsMatch = typePart.match(/ARRAY\s*\[([^\]]+)\]\s*OF\s*([A-Za-z]+)/i);
    var elementType = boundsMatch
      ? boundsMatch[2].toUpperCase()
      : (typePart ? typePart.split(/\s+/)[0].toUpperCase() : "INTEGER");

    var names = namePart.split(",").map(function (part) {
      var match = part.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[([^\]]*)\])?$/);
      if (!match) throw { message: "Cannot read the name " + part.trim() + " in this declaration", line: line };
      return {
        name: match[1].toLowerCase(),
        bounds: match[2] || (boundsMatch ? boundsMatch[1] : null)
      };
    }).filter(function (entry) { return entry.name; });

    if (!names.length) throw { message: "Cannot read the declaration", line: line };

    return {
      type: "declare",
      names: names,
      elementType: elementType,
      initial: null,
      constant: false,
      line: line
    };
  };

  /* ---------- Values ---------- */

  function formatValue(value) {
    if (Array.isArray(value)) {
      return "[" + value.map(formatValue).join(", ") + "]";
    }
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "number") {
      if (!isFinite(value)) return "0";
      if (Number.isInteger(value)) return String(value);
      return String(Math.round(value * 1000000) / 1000000);
    }
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function toNumber(value, description) {
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) return Number(value);
    throw { message: (description || "A value") + " should be a number, but it was " + formatValue(value) };
  }

  function toBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value.length > 0;
    return Boolean(value);
  }

  function emptyArray(bounds, elementType) {
    var range = parseBounds(bounds);
    var array = [];
    for (var i = range.lower; i <= range.upper; i += 1) {
      array[i] = elementType === "STRING" ? "" : elementType === "BOOLEAN" ? false : 0;
    }
    array.lower = range.lower;
    array.upper = range.upper;
    return array;
  }

  function parseBounds(bounds) {
    var parts = String(bounds).split(":");
    if (parts.length !== 2) throw { message: "Array bounds should look like 1:10" };
    var lower = Number(parts[0].trim());
    var upper = Number(parts[1].trim());
    if (!Number.isInteger(lower) || !Number.isInteger(upper) || upper < lower) {
      throw { message: "Array bounds should look like 1:10" };
    }
    if (upper - lower > 5000) throw { message: "That array is too large for this prototype" };
    return { lower: lower, upper: upper };
  }

  /* ---------- Runtime ---------- */

  function Runtime() {
    this.globals = Object.create(null);
    this.frames = [];
    this.outputs = [];
    this.steps = 0;
    this.inputs = [];
    this.inputPosition = 0;
    this.depth = 0;
    this.line = 0;
    this.routines = Object.create(null);
  }

  Runtime.prototype.scope = function () {
    return this.frames.length ? this.frames[this.frames.length - 1] : this.globals;
  };

  Runtime.prototype.tick = function () {
    this.steps += 1;
    if (this.steps > MAX_STEPS) {
      throw { message: "The program ran for too long. Check for a loop that never ends.", line: this.line };
    }
  };

  Runtime.prototype.lookup = function (name) {
    for (var i = this.frames.length - 1; i >= 0; i -= 1) {
      if (name in this.frames[i]) return this.frames[i][name];
    }
    if (name in this.globals) return this.globals[name];
    throw { message: "Unknown variable " + name, line: this.line };
  };

  Runtime.prototype.assign = function (name, value) {
    for (var i = this.frames.length - 1; i >= 0; i -= 1) {
      if (name in this.frames[i]) {
        this.frames[i][name] = value;
        return;
      }
    }
    this.globals[name] = value;
  };

  function getIndex(runtime, node, array) {
    var index = toNumber(runtime.evaluate(node), "An array index");
    if (!Number.isInteger(index)) {
      throw { message: "An array index should be a whole number, but it was " + formatValue(index), line: runtime.line };
    }
    if (Array.isArray(array) && array.lower !== undefined) {
      if (index < array.lower || index > array.upper) {
        throw { message: "Index " + index + " is outside the array (" + array.lower + ":" + array.upper + ")", line: runtime.line };
      }
    }
    return index;
  }

  Runtime.prototype.evaluate = function (node) {
    switch (node.type) {
      case "number":
      case "string":
      case "boolean":
        return node.value;
      case "name":
        return this.lookup(node.name);
      case "index": {
        var array = this.lookup(node.name);
        if (!Array.isArray(array)) throw { message: node.name + " is not an array", line: this.line };
        return array[getIndex(this, node.index, array)];
      }
      case "index2": {
        var table = this.lookup(node.name);
        if (!Array.isArray(table)) throw { message: node.name + " is not a 2D array", line: this.line };
        var row = table[getIndex(this, node.row, table)];
        if (!Array.isArray(row)) throw { message: node.name + " is not a 2D array", line: this.line };
        return row[getIndex(this, node.column, row)];
      }
      case "call": {
        var routine = this.routines[node.name];
        if (!routine) throw { message: "Unknown function " + node.name, line: this.line };
        if (routine.kind !== "FUNCTION") throw { message: node.name + " is a procedure, so use CALL", line: this.line };
        var args = node.args.map(this.evaluate, this);
        return this.invoke(routine, args);
      }
      case "unary": {
        var operand = this.evaluate(node.value);
        if (node.op === "-") return -toNumber(operand, "The value after -");
        return !toBoolean(operand);
      }
      case "binary":
        return this.binary(node);
      default:
        throw { message: "Cannot evaluate this expression", line: this.line };
    }
  };

  Runtime.prototype.binary = function (node) {
    if (node.op === "AND") {
      return toBoolean(this.evaluate(node.left)) && toBoolean(this.evaluate(node.right));
    }
    if (node.op === "OR") {
      return toBoolean(this.evaluate(node.left)) || toBoolean(this.evaluate(node.right));
    }
    var left = this.evaluate(node.left);
    var right = this.evaluate(node.right);
    switch (node.op) {
      case "+":
        return toNumber(left, "The left side of +") + toNumber(right, "The right side of +");
      case "-":
        return toNumber(left, "The left side of -") - toNumber(right, "The right side of -");
      case "*":
        return toNumber(left, "The left side of *") * toNumber(right, "The right side of *");
      case "/": {
        var divisor = toNumber(right, "The right side of /");
        if (divisor === 0) throw { message: "Cannot divide by zero", line: this.line };
        return toNumber(left, "The left side of /") / divisor;
      }
      case "DIV": {
        var divDivisor = toNumber(right, "The right side of DIV");
        if (divDivisor === 0) throw { message: "Cannot divide by zero", line: this.line };
        return Math.trunc(toNumber(left, "The left side of DIV") / divDivisor);
      }
      case "MOD": {
        var modDivisor = toNumber(right, "The right side of MOD");
        if (modDivisor === 0) throw { message: "Cannot divide by zero", line: this.line };
        return toNumber(left, "The left side of MOD") % modDivisor;
      }
      case "^":
        return Math.pow(toNumber(left, "The left side of ^"), toNumber(right, "The right side of ^"));
      case "&":
        return formatValue(left) + formatValue(right);
      case "=":
        return compareValues(left, right) === 0;
      case "<>":
        return compareValues(left, right) !== 0;
      case "<":
        return compareValues(left, right) < 0;
      case ">":
        return compareValues(left, right) > 0;
      case "<=":
        return compareValues(left, right) <= 0;
      case ">=":
        return compareValues(left, right) >= 0;
      default:
        throw { message: "Unknown operator " + node.op, line: this.line };
    }
  };

  function compareValues(left, right) {
    if (typeof left === "number" && typeof right === "number") return left - right;
    if (typeof left === "boolean" || typeof right === "boolean") {
      return (toBoolean(left) ? 1 : 0) - (toBoolean(right) ? 1 : 0);
    }
    var a = formatValue(left);
    var b = formatValue(right);
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  Runtime.prototype.invoke = function (routine, args) {
    if (this.depth >= MAX_DEPTH) {
      throw { message: "Too many nested calls. Check for a routine that calls itself forever.", line: this.line };
    }
    var frame = Object.create(null);
    for (var i = 0; i < routine.params.length; i += 1) {
      frame[routine.params[i]] = i < args.length ? args[i] : 0;
    }
    this.depth += 1;
    this.frames.push(frame);
    try {
      var signal = this.run(routine.body);
      if (routine.kind === "FUNCTION") {
        if (!signal || signal.type !== "return") {
          throw { message: "The function " + routine.name + " ended without RETURN", line: routine.line };
        }
        return signal.value;
      }
      return undefined;
    } finally {
      this.frames.pop();
      this.depth -= 1;
    }
  };

  Runtime.prototype.run = function (statements) {
    for (var i = 0; i < statements.length; i += 1) {
      var signal = this.execute(statements[i]);
      if (signal) return signal;
    }
    return null;
  };

  Runtime.prototype.execute = function (statement) {
    this.tick();
    this.line = statement.line;
    switch (statement.type) {
      case "declare": {
        for (var declared = 0; declared < statement.names.length; declared += 1) {
          var entry = statement.names[declared];
          var value;
          if (statement.initial) {
            value = this.evaluate(statement.initial);
          } else if (entry.bounds) {
            value = emptyArray(entry.bounds, statement.elementType);
          } else if (statement.elementType === "STRING" || statement.elementType === "CHAR") {
            value = "";
          } else if (statement.elementType === "BOOLEAN") {
            value = false;
          } else {
            value = 0;
          }
          this.scope()[entry.name] = value;
        }
        return null;
      }
      case "output": {
        if (this.outputs.length >= MAX_OUTPUT) {
          throw { message: "The program printed too much. Check for a loop that never ends.", line: this.line };
        }
        var line = statement.values.map(this.evaluate, this).map(formatValue).join("");
        this.outputs.push(line);
        return null;
      }
      case "input": {
        for (var i = 0; i < statement.targets.length; i += 1) {
          if (this.inputPosition >= this.inputs.length) {
            throw {
              message: "The program asked for INPUT, but there are no more input values. Add them in the Input box.",
              line: this.line
            };
          }
          this.store(statement.targets[i], this.inputs[this.inputPosition]);
          this.inputPosition += 1;
        }
        return null;
      }
      case "if": {
        if (toBoolean(this.evaluate(statement.test))) return this.run(statement.then);
        return this.run(statement.otherwise);
      }
      case "for": {
        var from = toNumber(this.evaluate(statement.from), "The start of FOR");
        var to = toNumber(this.evaluate(statement.to), "The end of FOR");
        var step = statement.step ? toNumber(this.evaluate(statement.step), "The FOR step") : (to >= from ? 1 : -1);
        if (step === 0) throw { message: "The FOR step cannot be zero", line: this.line };
        this.scope()[statement.name] = from;
        var guard = 0;
        for (var counter = from; step > 0 ? counter <= to : counter >= to; counter += step) {
          this.scope()[statement.name] = counter;
          guard += 1;
          if (guard > MAX_STEPS) {
            throw { message: "This FOR loop runs too many times", line: this.line };
          }
          var signal = this.run(statement.body);
          if (signal) return signal;
        }
        return null;
      }
      case "while": {
        var checks = 0;
        while (toBoolean(this.evaluate(statement.test))) {
          checks += 1;
          if (checks > MAX_STEPS) {
            throw { message: "This WHILE loop never ends", line: this.line };
          }
          var whileSignal = this.run(statement.body);
          if (whileSignal) return whileSignal;
        }
        return null;
      }
      case "repeat": {
        var rounds = 0;
        do {
          rounds += 1;
          if (rounds > MAX_STEPS) {
            throw { message: "This REPEAT loop never ends", line: this.line };
          }
          var repeatSignal = this.run(statement.body);
          if (repeatSignal) return repeatSignal;
        } while (!toBoolean(this.evaluate(statement.test)));
        return null;
      }
      case "routine":
        this.routines[statement.name] = statement;
        return null;
      case "call": {
        var target = this.routines[statement.name];
        if (!target) throw { message: "Unknown procedure " + statement.name, line: this.line };
        this.invoke(target, statement.args.map(this.evaluate, this));
        return null;
      }
      case "return":
        return { type: "return", value: this.evaluate(statement.value) };
      case "assign":
        this.store(statement.target, this.evaluate(statement.value));
        return null;
      default:
        throw { message: "Cannot run this statement", line: this.line };
    }
  };

  Runtime.prototype.store = function (target, value) {
    if (target.type === "name") {
      this.assign(target.name, value);
      return;
    }
    if (target.type === "index") {
      var array = this.lookup(target.name);
      if (!Array.isArray(array)) throw { message: target.name + " is not an array", line: this.line };
      array[getIndex(this, target.index, array)] = value;
      return;
    }
    throw { message: "Cannot store a value here", line: this.line };
  };

  /* ---------- Assignment statements ---------- */

  Program.prototype.parseAssignment = function () {
    var entry = this.lines[this.position];
    var parts = entry.text.split("<-");
    if (parts.length < 2) {
      throw { message: "Expected an assignment with <-", line: entry.line };
    }
    var targetText = parts.shift().trim();
    var valueText = parts.join("<-").trim();
    var targetTokens = tokenize(targetText);
    var target;
    if (targetTokens.length === 1 && targetTokens[0].type === "word") {
      target = { type: "name", name: targetTokens[0].value.toLowerCase() };
    } else if (targetTokens.length > 1 && targetTokens[0].type === "word" && targetTokens[1].value === "[") {
      var inner = targetText.slice(targetText.indexOf("[") + 1, targetText.lastIndexOf("]"));
      target = { type: "index", name: targetTokens[0].value.toLowerCase(), index: parseExpression(inner) };
    } else {
      throw { message: "Cannot store a value in " + targetText, line: entry.line };
    }
    this.position += 1;
    return { type: "assign", target: target, value: parseExpression(valueText), line: entry.line };
  };

  /* Patch the statement parser so an unknown keyword may still be an assignment. */
  var baseParseStatement = Program.prototype.parseStatement;
  Program.prototype.parseStatement = function () {
    var entry = this.lines[this.position];
    if (entry && entry.text.indexOf("<-") !== -1 && /^[A-Za-z_][A-Za-z0-9_]*(\s*\[[^\]]*\])?\s*<-/.test(entry.text)) {
      return this.parseAssignment();
    }
    return baseParseStatement.call(this);
  };

  /* ---------- Public entry point ---------- */

  function run(source, inputText) {
    var runtime = new Runtime();
    runtime.inputs = String(inputText || "")
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (line, index, all) { return line !== "" || index < all.length - 1; });

    var program;
    try {
      program = new Program(source);
      var statements = program.parseBlock([]);
      if (program.position < program.lines.length) {
        throw { message: "Unexpected " + program.lines[program.position].text, line: program.lines[program.position].line };
      }
      runtime.run(statements);
      return { ok: true, output: runtime.outputs, steps: runtime.steps, error: null, line: 0 };
    } catch (error) {
      var message = error && error.message ? error.message : "Something in the program could not be read";
      return {
        ok: false,
        output: runtime.outputs,
        steps: runtime.steps,
        error: message,
        line: error && error.line ? error.line : runtime.line
      };
    }
  }

  /* ---------- Facts, lints and review ---------- */

  function newFacts() {
    return {
      declares: [],
      arrays: [],
      inputs: 0,
      outputs: [],
      outputVariables: 0,
      fors: [],
      whiles: 0,
      repeats: 0,
      ifs: [],
      routines: [],
      calls: [],
      assigns: [],
      selfAssigns: [],
      returns: 0,
      reads: []
    };
  }

  function collectNames(node, out) {
    if (!node) return;
    switch (node.type) {
      case "name":
        out.push(node.name);
        return;
      case "index":
        out.push(node.name);
        collectNames(node.index, out);
        return;
      case "index2":
        out.push(node.name);
        collectNames(node.row, out);
        collectNames(node.column, out);
        return;
      case "unary":
        collectNames(node.value, out);
        return;
      case "binary":
        collectNames(node.left, out);
        collectNames(node.right, out);
        return;
      case "call":
        node.args.forEach(function (argument) {
          collectNames(argument, out);
        });
        return;
      default:
        return;
    }
  }

  function literalNumber(node) {
    if (!node) return null;
    if (node.type === "number") return node.value;
    if (node.type === "unary" && node.op === "-" && node.value.type === "number") return -node.value.value;
    return null;
  }

  function conditionInfo(test) {
    var info = { op: null, names: [], otherNames: [] };
    if (!test) return info;
    if (test.type === "binary" && ["=", "<>", "<", ">", "<=", ">="].indexOf(test.op) !== -1) {
      info.op = test.op;
      collectNames(test.left, info.names);
      collectNames(test.right, info.otherNames);
      info.names = info.names.concat(info.otherNames);
    }
    return info;
  }

  function assignedNames(statements, out) {
    statements.forEach(function (statement) {
      switch (statement.type) {
        case "assign":
          out.push(statement.target.name);
          break;
        case "input":
          statement.targets.forEach(function (target) {
            if (target.type === "name") out.push(target.name);
            if (target.type === "index") out.push(target.name);
          });
          break;
        case "if":
          assignedNames(statement.then, out);
          assignedNames(statement.otherwise, out);
          break;
        case "for":
        case "while":
        case "repeat":
          assignedNames(statement.body, out);
          break;
        case "routine":
          assignedNames(statement.body, out);
          break;
        default:
          break;
      }
    });
    return out;
  }

  function collectFacts(statements, facts) {
    statements.forEach(function (statement) {
      switch (statement.type) {
        case "declare":
          statement.names.forEach(function (entry) {
            facts.declares.push(entry.name);
            if (entry.bounds) facts.arrays.push(entry.name);
          });
          break;
        case "input":
          facts.inputs += statement.targets.length;
          statement.targets.forEach(function (target) {
            if (target.type === "index") collectNames(target.index, facts.reads);
          });
          break;
        case "output":
          var variables = [];
          statement.values.forEach(function (value) {
            collectNames(value, variables);
          });
          facts.outputs.push({ count: statement.values.length, variables: variables.length });
          facts.outputVariables += variables.length;
          statement.values.forEach(function (value) {
            collectNames(value, facts.reads);
          });
          break;
        case "assign":
          facts.assigns.push(statement.target.name);
          var selfNames = [];
          collectNames(statement.value, selfNames);
          if (selfNames.indexOf(statement.target.name) !== -1 &&
            statement.value.type === "binary" && statement.value.op === "+") {
            facts.selfAssigns.push(statement.target.name);
          }
          if (statement.target.type === "index") collectNames(statement.target.index, facts.reads);
          collectNames(statement.value, facts.reads);
          break;
        case "if":
          var info = conditionInfo(statement.test);
          facts.ifs.push({
            op: info.op,
            names: info.names,
            assigned: assignedNames(statement.then, []),
            line: statement.line
          });
          collectNames(statement.test, facts.reads);
          collectFacts(statement.then, facts);
          collectFacts(statement.otherwise, facts);
          break;
        case "for":
          var from = literalNumber(statement.from);
          var to = literalNumber(statement.to);
          facts.fors.push({ name: statement.name, from: from, to: to, line: statement.line });
          collectNames(statement.from, facts.reads);
          collectNames(statement.to, facts.reads);
          if (statement.step) collectNames(statement.step, facts.reads);
          collectFacts(statement.body, facts);
          break;
        case "while":
          facts.whiles += 1;
          collectNames(statement.test, facts.reads);
          collectFacts(statement.body, facts);
          break;
        case "repeat":
          facts.repeats += 1;
          collectNames(statement.test, facts.reads);
          collectFacts(statement.body, facts);
          break;
        case "routine":
          facts.routines.push({ name: statement.name, kind: statement.kind, params: statement.params });
          collectFacts(statement.body, facts);
          break;
        case "call":
          facts.calls.push(statement.name);
          statement.args.forEach(function (argument) {
            collectNames(argument, facts.reads);
          });
          break;
        case "return":
          facts.returns += 1;
          collectNames(statement.value, facts.reads);
          break;
        default:
          break;
      }
    });
    return facts;
  }

  function lint(source, facts) {
    var findings = [];
    if (!String(source).trim()) {
      return [{ level: "error", text: "The editor is empty. Start from the template." }];
    }

    if (!facts.outputs.length) {
      findings.push({ level: "warn", text: "Nothing is ever OUTPUT, so a marker cannot see a result." });
    } else if (facts.outputVariables === 0) {
      findings.push({ level: "warn", text: "Every OUTPUT prints a fixed value. Print the variables so the output follows the input." });
    }

    var known = {};
    facts.declares.forEach(function (name) { known[name] = true; });
    facts.fors.forEach(function (loop) { known[loop.name] = true; });
    facts.routines.forEach(function (routine) {
      routine.params.forEach(function (param) { known[param] = true; });
    });

    var undeclared = [];
    facts.reads.concat(facts.assigns).forEach(function (name) {
      if (!known[name] && undeclared.indexOf(name) === -1) undeclared.push(name);
    });
    if (undeclared.length) {
      findings.push({
        level: "warn",
        text: "Used without a DECLARE: " + undeclared.slice(0, 4).join(", ") +
          ". A marker expects every variable to be declared first."
      });
    }

    facts.fors.forEach(function (loop) {
      if (facts.assigns.filter(function (name) { return name === loop.name; }).length &&
        loop.line) {
        findings.push({
          level: "warn",
          text: "Line " + loop.line + ": the FOR counter " + loop.name +
            " is also assigned inside the program. Let the loop control it."
        });
      }
    });

    if (facts.routines.some(function (routine) { return routine.kind === "FUNCTION"; }) && facts.returns === 0) {
      findings.push({ level: "warn", text: "A FUNCTION is declared but never uses RETURN." });
    }

    return findings;
  }

  function analyse(source) {
    var program;
    try {
      program = new Program(source);
      var statements = program.parseBlock([]);
      if (program.position < program.lines.length) {
        throw { message: "Unexpected " + program.lines[program.position].text, line: program.lines[program.position].line };
      }
      var facts = collectFacts(statements, newFacts());
      return { ok: true, facts: facts, findings: lint(source, facts), error: null, line: 0 };
    } catch (error) {
      return {
        ok: false,
        facts: newFacts(),
        findings: [],
        error: error && error.message ? error.message : "Something in the program could not be read",
        line: error && error.line ? error.line : 0
      };
    }
  }

  return { run: run, analyse: analyse };
})();
