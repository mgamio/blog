// Shared strict JSON parser for the codersite.dev developer tools (RFC 8259).
// Gives exact line/column positions with a suggested fix, and keeps every number
// as written, so large Java long IDs are not rounded the way JSON.parse rounds them.
// Exposes window.CodersiteJson in the browser and module.exports in Node (tests).
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

  var api = { JsonError: JsonError, parse: parse, position: position, render: render };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.CodersiteJson = api;
  }
})();
