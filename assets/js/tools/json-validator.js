// JSON Validator and Formatter for codersite.dev/tools/json-validator/
// Everything runs in the browser: the input is never sent to a server.
// A small strict parser (RFC 8259) gives exact line/column positions and
// keeps numbers as written, so large Java long IDs are not rounded.
(function () {
  'use strict';

  function JsonError(message, pos, hint) {
    this.message = message;
    this.pos = pos;
    this.hint = hint || '';
  }

  var NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
  var WORD = /[A-Za-z_$][\w$]*/y;
  var MAX_DEPTH = 1000;

  function describe(c) {
    if (c === undefined) return 'the end of the input';
    if (c === '\n' || c === '\r') return 'a line break';
    return '\'' + c + '\'';
  }

  function parse(text) {
    var i = 0;
    var n = text.length;
    var warnings = [];
    var stats = { keys: 0, values: 0, maxDepth: 0, bigNumbers: 0 };

    function ws() {
      while (i < n) {
        var c = text[i];
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
          i++;
        } else if (c === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
          throw new JsonError('Comments are not allowed in JSON', i,
            'Remove the comment. JSON has no comment syntax (JSON5 and YAML do).');
        } else if (c === '\uFEFF') {
          throw new JsonError('Byte order mark (BOM) found', i,
            'Save the file as UTF-8 without BOM, or delete the invisible first character.');
        } else {
          break;
        }
      }
    }

    function value(depth) {
      ws();
      if (depth > MAX_DEPTH) {
        throw new JsonError('Nesting is deeper than ' + MAX_DEPTH + ' levels, which this tool does not support', i,
          'The JSON may still be valid, but real documents rarely nest more than 20 levels. Check for a generated loop.');
      }
      if (depth > stats.maxDepth) stats.maxDepth = depth;
      stats.values++;
      var c = text[i];
      if (c === '{') return object(depth);
      if (c === '[') return array(depth);
      if (c === '"') return { type: 'string', raw: string() };
      if (c === '-' || (c >= '0' && c <= '9')) return number();
      if (text.startsWith('true', i)) { i += 4; return { type: 'literal', raw: 'true' }; }
      if (text.startsWith('false', i)) { i += 5; return { type: 'literal', raw: 'false' }; }
      if (text.startsWith('null', i)) { i += 4; return { type: 'literal', raw: 'null' }; }
      if (c === undefined) throw new JsonError('Unexpected end of input: a value is missing', i);
      if (c === '\'') {
        throw new JsonError('Strings must use double quotes', i,
          'Replace the single quotes with double quotes: "text".');
      }
      if (c === '+') throw new JsonError('Numbers cannot start with a plus sign', i, 'Remove the +.');
      if (c === '.') throw new JsonError('Numbers must start with a digit', i, 'Add a leading zero, for example 0.5.');
      WORD.lastIndex = i;
      var m = WORD.exec(text);
      if (m) {
        var word = m[0];
        if (word === 'undefined' || word === 'NaN' || word === 'Infinity') {
          throw new JsonError(word + ' is not a valid JSON value', i,
            'Use null, a number or a string instead.');
        }
        var lower = word.toLowerCase();
        if (lower === 'true' || lower === 'false' || lower === 'null') {
          throw new JsonError('JSON literals must be lowercase', i, 'Write ' + lower + ' instead of ' + word + '.');
        }
        if (word === 'None') throw new JsonError('None is Python, not JSON', i, 'Use null instead.');
        throw new JsonError('Unexpected word ' + word, i, 'Text values must be in double quotes: "' + word + '".');
      }
      if (c === ',' || c === ']' || c === '}') {
        throw new JsonError('Unexpected ' + describe(c) + ': a value is missing', i,
          'Check for a double comma, or a comma right after [ or {.');
      }
      throw new JsonError('Unexpected character ' + describe(c) + ': expected a value', i);
    }

    function object(depth) {
      var start = i;
      var members = [];
      var seen = Object.create(null);
      var lastComma = -1;
      i++;
      ws();
      if (text[i] === '}') { i++; return { type: 'object', members: members }; }
      for (;;) {
        ws();
        var c = text[i];
        if (c !== '"') {
          if (c === '}' && lastComma >= 0) {
            throw new JsonError('Trailing comma before }', lastComma, 'Remove the comma after the last property.');
          }
          if (c === undefined) throw unclosed('object', '}', start);
          if (c === '\'') {
            throw new JsonError('Property names must use double quotes', i,
              'Replace the single quotes with double quotes: "name".');
          }
          WORD.lastIndex = i;
          var m = WORD.exec(text);
          if (m) {
            throw new JsonError('Property names must be in double quotes', i,
              'Write "' + m[0] + '": instead of ' + m[0] + ':');
          }
          throw new JsonError('Expected a property name in double quotes, found ' + describe(c), i);
        }
        var keyPos = i;
        var raw = string();
        var key = JSON.parse(raw);
        if (seen[key]) {
          warnings.push({ pos: keyPos, message: 'Duplicate key ' + raw + '. Most parsers keep only the last value; Jackson with STRICT_DUPLICATE_DETECTION rejects it.' });
        }
        seen[key] = true;
        stats.keys++;
        ws();
        if (text[i] !== ':') {
          throw new JsonError('Expected \':\' after the property name ' + raw + ', found ' + describe(text[i]), i);
        }
        i++;
        var v = value(depth + 1);
        members.push({ raw: raw, key: key, value: v });
        ws();
        c = text[i];
        if (c === ',') { lastComma = i; i++; continue; }
        if (c === '}') { i++; return { type: 'object', members: members }; }
        if (c === undefined) throw unclosed('object', '}', start);
        if (c === '"') {
          throw new JsonError('Missing comma between properties', i, 'Add a comma after the previous value.');
        }
        throw new JsonError('Expected \',\' or \'}\' after a property value, found ' + describe(c), i);
      }
    }

    function array(depth) {
      var start = i;
      var items = [];
      var lastComma = -1;
      i++;
      ws();
      if (text[i] === ']') { i++; return { type: 'array', items: items }; }
      for (;;) {
        ws();
        if (text[i] === ']' && lastComma >= 0) {
          throw new JsonError('Trailing comma before ]', lastComma, 'Remove the comma after the last element.');
        }
        if (text[i] === undefined) throw unclosed('array', ']', start);
        items.push(value(depth + 1));
        ws();
        var c = text[i];
        if (c === ',') { lastComma = i; i++; continue; }
        if (c === ']') { i++; return { type: 'array', items: items }; }
        if (c === undefined) throw unclosed('array', ']', start);
        if (c === '}') {
          throw new JsonError('Found } but the array is still open', i, 'Close the array with ] first.');
        }
        throw new JsonError('Missing comma between array elements, found ' + describe(c), i,
          'Add a comma after the previous element.');
      }
    }

    function unclosed(kind, closer, start) {
      var where = position(text, start);
      return new JsonError('Unexpected end of input: the ' + kind + ' that starts at line ' + where.line +
        ', column ' + where.column + ' is not closed', n, 'Add the missing ' + closer + '.');
    }

    function string() {
      var start = i;
      i++;
      while (i < n) {
        var c = text[i];
        if (c === '"') { i++; return text.slice(start, i); }
        if (c === '\\') {
          var e = text[i + 1];
          if (e === 'u') {
            if (!/^[0-9a-fA-F]{4}$/.test(text.substr(i + 2, 4))) {
              throw new JsonError('Invalid Unicode escape: \\u needs 4 hex digits', i);
            }
            i += 6;
            continue;
          }
          if (e !== undefined && '"\\/bfnrt'.indexOf(e) >= 0) { i += 2; continue; }
          throw new JsonError('Invalid escape sequence \\' + (e === undefined ? '' : e), i,
            'To write a backslash, use \\\\ (for example in Windows paths: "C:\\\\temp").');
        }
        if (c < ' ') {
          if (c === '\n' || c === '\r') {
            throw new JsonError('Line break inside a string', i,
              'Close the string with a double quote, or write the line break as \\n.');
          }
          throw new JsonError('Control character inside a string', i, 'Escape it, for example \\t for a tab.');
        }
        i++;
      }
      throw new JsonError('Unterminated string: the closing double quote is missing', start);
    }

    function number() {
      var start = i;
      NUMBER.lastIndex = i;
      var m = NUMBER.exec(text);
      if (!m) throw new JsonError('Invalid number: expected a digit after the minus sign', i);
      i = NUMBER.lastIndex;
      var raw = m[0];
      var next = text[i];
      if (next >= '0' && next <= '9') {
        throw new JsonError('Numbers cannot have leading zeros', start, 'Remove the leading zero, or use a string for codes like "007".');
      }
      if (next === 'x' || next === 'X') throw new JsonError('Hexadecimal numbers are not allowed', start, 'Convert the number to decimal.');
      if (next === '.') throw new JsonError('A decimal point must be followed by digits', i, 'Write ' + raw + '.0 or ' + raw + '.');
      if (next === 'e' || next === 'E') throw new JsonError('An exponent must be followed by digits', i);
      if (/^-?\d+$/.test(raw) && raw.replace('-', '').length >= 16 && !Number.isSafeInteger(Number(raw))) {
        if (stats.bigNumbers === 0) {
          warnings.push({ pos: start, message: 'Large integer ' + raw + ' is beyond JavaScript\'s safe range (2^53 - 1). JSON.parse in a browser would round it; a Java long keeps it. This tool keeps the exact digits.' });
        }
        stats.bigNumbers++;
      }
      return { type: 'number', raw: raw };
    }

    ws();
    if (i >= n) throw new JsonError('The input is empty', 0, 'Paste some JSON, or click Sample.');
    var root = value(0);
    ws();
    if (i < n) {
      throw new JsonError('Unexpected ' + describe(text[i]) + ' after the end of the JSON value', i,
        'JSON has exactly one top-level value. To send several values, wrap them in an array: [ ... ].');
    }
    return { root: root, warnings: warnings, stats: stats };
  }

  function position(text, pos) {
    var line = 1;
    var lineStart = 0;
    for (var k = 0; k < pos && k < text.length; k++) {
      if (text[k] === '\n') { line++; lineStart = k + 1; }
    }
    return { line: line, column: pos - lineStart + 1, lineStart: lineStart };
  }

  function compareKeys(a, b) {
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  }

  function render(node, indent, sortKeys, level) {
    if (node.type === 'object') {
      if (!node.members.length) return '{}';
      var members = sortKeys ? node.members.slice().sort(compareKeys) : node.members;
      if (indent === '') {
        return '{' + members.map(function (m) { return m.raw + ':' + render(m.value, indent, sortKeys, level + 1); }).join(',') + '}';
      }
      var pad = indent.repeat(level + 1);
      return '{\n' + members.map(function (m) {
        return pad + m.raw + ': ' + render(m.value, indent, sortKeys, level + 1);
      }).join(',\n') + '\n' + indent.repeat(level) + '}';
    }
    if (node.type === 'array') {
      if (!node.items.length) return '[]';
      if (indent === '') {
        return '[' + node.items.map(function (v) { return render(v, indent, sortKeys, level + 1); }).join(',') + ']';
      }
      var p = indent.repeat(level + 1);
      return '[\n' + node.items.map(function (v) {
        return p + render(v, indent, sortKeys, level + 1);
      }).join(',\n') + '\n' + indent.repeat(level) + ']';
    }
    return node.raw;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  // Expose the parser for tests (node) without needing the page.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parse: parse, render: render, position: position };
    return;
  }

  // ---- Page wiring ----
  var input = document.getElementById('jtInput');
  if (!input) return;
  var output = document.getElementById('jtOutput');
  var status = document.getElementById('jtStatus');
  var indentSelect = document.getElementById('jtIndent');
  var sortBox = document.getElementById('jtSort');
  var copyBtn = document.getElementById('jtCopy');
  var downloadBtn = document.getElementById('jtDownload');
  var formatBtn = document.getElementById('jtFormat');
  var minifyBtn = document.getElementById('jtMinify');
  var mode = 'format';
  var timer = null;
  var LIVE_LIMIT = 2 * 1024 * 1024;

  var SAMPLE = '{\n  "orderId": 9007199254740993,\n  "customer": {"name": "Ada Lovelace", "email": "ada@example.com"},\n' +
    '  "items": [\n    {"sku": "BOOK-42", "title": "Software Design Principles", "quantity": 1, "price": 29.90},\n' +
    '    {"sku": "MUG-07", "title": "Coffee mug", "quantity": 2, "price": 9.50}\n  ],\n  "paid": true,\n  "coupon": null\n}';

  function indentValue() {
    var v = indentSelect.value;
    return v === 'tab' ? '\t' : ' '.repeat(Number(v));
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function setOutput(text) {
    output.textContent = text;
    copyBtn.disabled = !text;
    downloadBtn.disabled = !text;
  }

  function showError(text, err) {
    var where = position(text, err.pos);
    var lineEnd = text.indexOf('\n', where.lineStart);
    var lineText = text.slice(where.lineStart, lineEnd < 0 ? text.length : lineEnd).replace(/\t/g, ' ');
    var col = where.column - 1;
    // Keep long lines readable: show a window around the error.
    var from = Math.max(0, col - 60);
    var excerpt = (from > 0 ? '…' : '') + lineText.slice(from, col + 60) + (lineText.length > col + 60 ? '…' : '');
    var caretAt = col - from + (from > 0 ? 1 : 0);

    status.className = 'jt-status jt-error';
    status.textContent = '';
    status.appendChild(el('strong', '', 'Invalid JSON'));
    status.appendChild(el('span', 'jt-where', ' at line ' + where.line + ', column ' + where.column + ': '));
    status.appendChild(el('span', '', err.message));
    if (err.hint) status.appendChild(el('div', 'jt-hint', 'Fix: ' + err.hint));
    var pre = el('pre', 'jt-excerpt');
    pre.textContent = excerpt + '\n' + ' '.repeat(Math.max(0, caretAt)) + '^';
    status.appendChild(pre);
    var go = el('button', 'jt-link', 'Show in input');
    go.type = 'button';
    go.addEventListener('click', function () { selectAt(err.pos); });
    status.appendChild(go);
    setOutput('');
  }

  function selectAt(pos) {
    input.focus();
    input.setSelectionRange(pos, Math.min(pos + 1, input.value.length));
    var line = position(input.value, pos).line;
    var lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 20;
    input.scrollTop = Math.max(0, (line - 4) * lineHeight);
  }

  function showValid(text, result) {
    var bytes = new TextEncoder().encode(text).length;
    var root = result.root.type === 'object' ? 'object' : result.root.type === 'array' ? 'array' : result.root.type;
    status.className = 'jt-status jt-ok';
    status.textContent = '';
    status.appendChild(el('strong', '', 'Valid JSON'));
    status.appendChild(el('span', '', ' · top-level ' + root + ' · ' + result.stats.keys + ' keys · depth ' +
      result.stats.maxDepth + ' · ' + formatBytes(bytes)));
    result.warnings.forEach(function (w) {
      var where = position(text, w.pos);
      status.appendChild(el('div', 'jt-warn', 'Note (line ' + where.line + '): ' + w.message));
    });
  }

  function run(force) {
    var text = input.value;
    if (!text.trim()) {
      status.className = 'jt-status';
      status.textContent = 'Paste JSON above. It is checked as you type, in your browser.';
      setOutput('');
      return;
    }
    if (!force && text.length > LIVE_LIMIT) {
      status.className = 'jt-status';
      status.textContent = 'Large input (' + formatBytes(text.length) + '): click Format or Minify to check it.';
      return;
    }
    var result;
    try {
      result = parse(text);
    } catch (e) {
      if (e instanceof JsonError) { showError(text, e); return; }
      throw e;
    }
    showValid(text, result);
    setOutput(render(result.root, mode === 'minify' ? '' : indentValue(), sortBox.checked, 0));
  }

  function setMode(m) {
    mode = m;
    formatBtn.classList.toggle('jt-active', m === 'format');
    minifyBtn.classList.toggle('jt-active', m === 'minify');
    run(true);
  }

  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { run(false); }, 250);
  });
  input.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); setMode('format'); }
  });
  formatBtn.addEventListener('click', function () { setMode('format'); });
  minifyBtn.addEventListener('click', function () { setMode('minify'); });
  indentSelect.addEventListener('change', function () { run(true); });
  sortBox.addEventListener('change', function () { run(true); });
  document.getElementById('jtSample').addEventListener('click', function () {
    input.value = SAMPLE;
    setMode('format');
  });
  document.getElementById('jtClear').addEventListener('click', function () {
    input.value = '';
    run(true);
    input.focus();
  });
  copyBtn.addEventListener('click', function () {
    var done = function () {
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output.textContent).then(done, function () { selectOutput(); });
    } else {
      selectOutput();
    }
  });
  function selectOutput() {
    var range = document.createRange();
    range.selectNodeContents(output);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  downloadBtn.addEventListener('click', function () {
    var blob = new Blob([output.textContent], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = mode === 'minify' ? 'minified.json' : 'formatted.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  run(true);
})();
