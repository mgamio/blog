// JSON Validator and Formatter for codersite.dev/tools/json-validator/
// Everything runs in the browser: the input is never sent to a server.
// The parser lives in json-core.js, loaded before this script.
(function () {
  'use strict';

  var core = window.CodersiteJson;
  var JsonError = core.JsonError;
  var parse = core.parse;
  var position = core.position;
  var render = core.render;

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
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
