// JSON to Java POJO Converter for codersite.dev/tools/json-to-java/
// Everything runs in the browser: the input is never sent to a server.
// Uses the strict parser from json-core.js, which keeps numbers as written,
// so the generator can tell int from long from BigInteger exactly.
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;
  var core = isNode ? require('./json-core.js') : window.CodersiteJson;

  var IND = '    ';
  var KEYWORDS = ('abstract assert boolean break byte case catch char class const continue default do double else enum ' +
    'extends final finally float for goto if implements import instanceof int interface long native new package private ' +
    'protected public return short static strictfp super switch synchronized this throw throws transient try void volatile ' +
    'while true false null var record yield sealed permits when').split(' ');
  // Class names that would clash with java.lang, imports or annotations used in the generated code.
  var RESERVED_TYPES = ('Object String Integer Long Double Float Short Byte Boolean Character Number Void Class Record Enum ' +
    'System Math Thread Runtime Process Package Module Exception Error Iterable Comparable Runnable Override Deprecated ' +
    'List Map BigDecimal BigInteger LocalDate LocalDateTime OffsetDateTime JsonProperty JsonIgnoreProperties ' +
    'Data NoArgsConstructor AllArgsConstructor').split(' ');
  var DATE_TYPES = { date: 'LocalDate', local: 'LocalDateTime', offset: 'OffsetDateTime' };
  var NUM_RANK = { int: 1, long: 2, bigint: 3 };
  var INT_MIN = BigInt(-2147483648), INT_MAX = BigInt(2147483647);
  var LONG_MIN = BigInt('-9223372036854775808'), LONG_MAX = BigInt('9223372036854775807');

  // ---- 1. Infer a merged shape from the parsed JSON ----

  function numberKind(raw) {
    if (!/^-?\d+$/.test(raw)) return 'decimal';
    var v = BigInt(raw);
    if (v >= INT_MIN && v <= INT_MAX) return 'int';
    if (v >= LONG_MIN && v <= LONG_MAX) return 'long';
    return 'bigint';
  }

  function dateKind(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(s);
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return null;
    if (!m[4]) return 'date';
    return m[5] ? 'offset' : 'local';
  }

  function shapeOf(node) {
    switch (node.type) {
      case 'object': {
        var fields = [];
        var index = Object.create(null);
        node.members.forEach(function (m) {
          var t = shapeOf(m.value);
          if (index[m.key] !== undefined) {
            fields[index[m.key]].type = merge(fields[index[m.key]].type, t);
          } else {
            index[m.key] = fields.length;
            fields.push({ name: m.key, type: t, seen: 1 });
          }
        });
        return { t: 'object', fields: fields, count: 1 };
      }
      case 'array': {
        var item = { t: 'empty' };
        node.items.forEach(function (v) { item = merge(item, shapeOf(v)); });
        return { t: 'array', item: item };
      }
      case 'string':
        return { t: 'string', date: dateKind(JSON.parse(node.raw)) };
      case 'number':
        return { t: numberKind(node.raw) };
      default:
        return node.raw === 'null' ? { t: 'null' } : { t: 'bool' };
    }
  }

  function mergeObjects(a, b) {
    var fields = a.fields.map(function (f) { return { name: f.name, type: f.type, seen: f.seen }; });
    var index = Object.create(null);
    fields.forEach(function (f, k) { index[f.name] = k; });
    b.fields.forEach(function (f) {
      var k = index[f.name];
      if (k === undefined) {
        index[f.name] = fields.length;
        fields.push({ name: f.name, type: f.type, seen: f.seen });
      } else {
        fields[k].type = merge(fields[k].type, f.type);
        fields[k].seen += f.seen;
      }
    });
    return { t: 'object', fields: fields, count: a.count + b.count };
  }

  function merge(a, b) {
    if (a.t === 'empty') return b;
    if (b.t === 'empty') return a;
    var nullable = !!(a.nullable || b.nullable);
    var r;
    if (a.t === 'null' && b.t === 'null') {
      r = { t: 'null' };
    } else if (a.t === 'null' || b.t === 'null') {
      r = Object.assign({}, a.t === 'null' ? b : a);
      nullable = true;
    } else if (a.t === b.t) {
      if (a.t === 'object') r = mergeObjects(a, b);
      else if (a.t === 'array') r = { t: 'array', item: merge(a.item, b.item) };
      else if (a.t === 'string') r = { t: 'string', date: a.date === b.date ? a.date : null };
      else r = { t: a.t };
    } else if (NUM_RANK[a.t] && NUM_RANK[b.t]) {
      r = { t: NUM_RANK[a.t] > NUM_RANK[b.t] ? a.t : b.t };
    } else if ((NUM_RANK[a.t] || a.t === 'decimal') && (NUM_RANK[b.t] || b.t === 'decimal')) {
      r = { t: 'decimal' };
    } else {
      r = { t: 'any' };
    }
    if (nullable) r.nullable = true;
    return r;
  }

  // ---- 2. Java names ----

  function words(s) {
    return s.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  }

  function toFieldName(json) {
    if (/^\p{Ll}[\p{L}\p{N}]*$/u.test(json) && KEYWORDS.indexOf(json) < 0) return json;
    var w = words(json);
    if (!w.length) return 'field';
    var name = w.map(function (x, k) {
      x = x.toLowerCase();
      return k === 0 ? x : x.charAt(0).toUpperCase() + x.slice(1);
    }).join('');
    if (/^\p{N}/u.test(name)) name = '_' + name;
    if (KEYWORDS.indexOf(name) >= 0) name += 'Value';
    return name;
  }

  function toClassName(hint) {
    var w = words(hint);
    var name = w.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join('');
    if (!name) return 'Item';
    if (/^\p{N}/u.test(name)) name = 'Item' + name;
    if (RESERVED_TYPES.indexOf(name) >= 0) name += 'Type';
    return name;
  }

  // "items" -> "item", "categories" -> "category", "addresses" -> "address", "data" -> "dataItem"
  function singular(name) {
    if (/ies$/i.test(name)) return name.slice(0, -3) + 'y';
    if (/(sses|xes|ches|shes|zes|uses)$/i.test(name)) return name.slice(0, -2);
    if (/(ss|us|is)$/i.test(name)) return name + 'Item';
    if (/s$/i.test(name)) return name.slice(0, -1);
    return name + 'Item';
  }

  function javaString(s) {
    return '"' + s.replace(/[\\"]/g, '\\$&').replace(/[\u0000-\u001f]/g, function (c) {
      return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
    }) + '"';
  }

  // ---- 3. Build classes ----

  function build(rootShape, opts) {
    var classes = [];
    var bySignature = Object.create(null);
    var usedNames = Object.create(null);
    var notes = [];

    function note(text) {
      if (notes.indexOf(text) < 0) notes.push(text);
    }

    function reserveName(hint) {
      var base = hint;
      var name = base;
      for (var k = 2; usedNames[name]; k++) name = base + k;
      usedNames[name] = true;
      return name;
    }

    function classFor(shape, hint, path) {
      var name = reserveName(hint);
      var cls = { name: name, fields: [] };
      classes.push(cls);
      var javaNames = Object.create(null);
      shape.fields.forEach(function (f) {
        var optional = f.seen < shape.count || !!f.type.nullable;
        var fieldPath = path ? path + '.' + f.name : f.name;
        var type = typeFor(f.type, f.name, optional, fieldPath);
        var javaName = toFieldName(f.name);
        if (opts.style !== 'record') {
          // Getter-based classes: Jackson derives the property name from the getter. isActive()
          // becomes "active" and getEMail() becomes "EMail", so pick names that keep the field,
          // getter and setter linked; @JsonProperty keeps the original JSON name.
          if (type === 'boolean' && /^is\p{Lu}/u.test(javaName)) {
            javaName = javaName.charAt(2).toLowerCase() + javaName.slice(3);
          }
          if (/^\p{Ll}\p{Lu}/u.test(javaName)) {
            javaName = javaName.charAt(0) + javaName.charAt(1).toLowerCase() + javaName.slice(2);
          }
          if (KEYWORDS.indexOf(javaName) >= 0) javaName += 'Value';
        }
        var base = javaName;
        for (var k = 2; javaNames[javaName]; k++) javaName = base + k;
        javaNames[javaName] = true;
        cls.fields.push({ jsonName: f.name, javaName: javaName, type: type });
      });
      // Reuse an identical class (same JSON names and types) instead of generating Address2.
      var signature = cls.fields.map(function (f) { return f.jsonName + ':' + f.type; }).join(',');
      if (bySignature[signature]) {
        classes.splice(classes.indexOf(cls), 1);
        delete usedNames[name];
        return bySignature[signature];
      }
      bySignature[signature] = name;
      return name;
    }

    function typeFor(s, fieldName, optional, path) {
      var primitive = opts.primitives && !optional && !s.nullable;
      switch (s.t) {
        case 'int': return primitive ? 'int' : 'Integer';
        case 'long': return primitive ? 'long' : 'Long';
        case 'bigint': return 'BigInteger';
        case 'decimal': return opts.bigDecimal ? 'BigDecimal' : (primitive ? 'double' : 'Double');
        case 'bool': return primitive ? 'boolean' : 'Boolean';
        case 'string': return opts.dates && s.date ? DATE_TYPES[s.date] : 'String';
        case 'array':
          if (s.item.t === 'empty') note('"' + path + '" is an empty array, so its element type is unknown: it is typed as List<Object>.');
          return 'List<' + typeFor(s.item, singular(fieldName), true, path + '[]') + '>';
        case 'object':
          if (!s.fields.length) return 'Map<String, Object>';
          return classFor(s, toClassName(fieldName), path);
        case 'null':
          note('"' + path + '" is null in the sample, so it is typed as Object. Replace it with the real type.');
          return 'Object';
        case 'any':
          note('"' + path + '" has values of different types, so it is typed as Object.');
          return 'Object';
        default:
          return 'Object';
      }
    }

    var rootName = toClassName(opts.rootName || 'Root');
    classFor(rootShape, rootName, '');
    classes.forEach(function (cls) {
      cls.fields.forEach(function (f) {
        f.prop = opts.allProperties || f.javaName !== f.jsonName;
      });
    });
    return { classes: classes, notes: notes };
  }

  // ---- 4. Render Java source ----

  function importsFor(classes, opts) {
    var set = Object.create(null);
    classes.forEach(function (cls) {
      cls.fields.forEach(function (f) {
        if (/\bList</.test(f.type)) set['java.util.List'] = 1;
        if (/\bMap</.test(f.type)) set['java.util.Map'] = 1;
        if (/\bBigDecimal\b/.test(f.type)) set['java.math.BigDecimal'] = 1;
        if (/\bBigInteger\b/.test(f.type)) set['java.math.BigInteger'] = 1;
        if (/\bLocalDate\b/.test(f.type)) set['java.time.LocalDate'] = 1;
        if (/\bLocalDateTime\b/.test(f.type)) set['java.time.LocalDateTime'] = 1;
        if (/\bOffsetDateTime\b/.test(f.type)) set['java.time.OffsetDateTime'] = 1;
        if (f.prop) set['com.fasterxml.jackson.annotation.JsonProperty'] = 1;
      });
    });
    if (opts.ignoreUnknown) set['com.fasterxml.jackson.annotation.JsonIgnoreProperties'] = 1;
    if (opts.style === 'lombok') {
      set['lombok.AllArgsConstructor'] = 1;
      set['lombok.Data'] = 1;
      set['lombok.NoArgsConstructor'] = 1;
    }
    var all = Object.keys(set).sort();
    var other = all.filter(function (i) { return i.indexOf('java.') !== 0; });
    var java = all.filter(function (i) { return i.indexOf('java.') === 0; });
    var lines = other.map(function (i) { return 'import ' + i + ';'; });
    if (other.length && java.length) lines.push('');
    return lines.concat(java.map(function (i) { return 'import ' + i + ';'; }));
  }

  function classAnnotations(opts) {
    var a = [];
    if (opts.ignoreUnknown) a.push('@JsonIgnoreProperties(ignoreUnknown = true)');
    if (opts.style === 'lombok') a.push('@Data', '@NoArgsConstructor', '@AllArgsConstructor');
    return a;
  }

  function renderClass(cls, opts, level, nested, top) {
    var pad = IND.repeat(level);
    var pad1 = IND.repeat(level + 1);
    var out = classAnnotations(opts).map(function (a) { return pad + a; });
    var mods = top || opts.style === 'record' ? 'public ' : 'public static ';
    var nestedSrc = nested.map(function (n) { return renderClass(n, opts, level + 1, [], false); });

    if (opts.style === 'record') {
      var comps = cls.fields.map(function (f) {
        return (f.prop ? '@JsonProperty(' + javaString(f.jsonName) + ') ' : '') + f.type + ' ' + f.javaName;
      });
      var oneLine = pad + mods + 'record ' + cls.name + '(' + comps.join(', ') + ') {';
      var header = comps.length <= 3 && oneLine.length <= 100
        ? oneLine
        : pad + mods + 'record ' + cls.name + '(\n' + comps.map(function (c) { return pad1 + c; }).join(',\n') + '\n' + pad + ') {';
      if (!nestedSrc.length) return out.concat(header + '}').join('\n');
      return out.concat(header, '', nestedSrc.join('\n\n'), pad + '}').join('\n');
    }

    out.push(pad + mods + 'class ' + cls.name + ' {');
    var body = [];
    cls.fields.forEach(function (f) {
      if (f.prop) body.push(pad1 + '@JsonProperty(' + javaString(f.jsonName) + ')');
      body.push(pad1 + 'private ' + f.type + ' ' + f.javaName + ';');
    });
    if (opts.style === 'pojo') {
      cls.fields.forEach(function (f) {
        var suffix = f.javaName.charAt(0).toUpperCase() + f.javaName.slice(1);
        var getter = (f.type === 'boolean' ? 'is' : 'get') + suffix;
        body.push('',
          pad1 + 'public ' + f.type + ' ' + getter + '() {',
          pad1 + IND + 'return ' + f.javaName + ';',
          pad1 + '}',
          '',
          pad1 + 'public void set' + suffix + '(' + f.type + ' ' + f.javaName + ') {',
          pad1 + IND + 'this.' + f.javaName + ' = ' + f.javaName + ';',
          pad1 + '}');
      });
    }
    if (body.length) out.push('', body.join('\n'));
    if (nestedSrc.length) out.push('', nestedSrc.join('\n\n'));
    out.push(pad + '}');
    return out.join('\n');
  }

  function fileHeader(classes, opts) {
    var lines = [];
    if (opts.packageName) lines.push('package ' + opts.packageName + ';', '');
    var imports = importsFor(classes, opts);
    if (imports.length) lines.push(imports.join('\n'), '');
    return lines.length ? lines.join('\n') + '\n' : '';
  }

  function generate(text, opts) {
    var parsed = core.parse(text);
    var root = parsed.root;
    var isArray = root.type === 'array';
    var shape = shapeOf(root);
    if (isArray) {
      if (shape.item.t !== 'object' || !shape.item.fields.length) {
        return { error: 'The JSON is an array of ' + (shape.item.t === 'empty' ? 'nothing' : 'values that are not objects') +
          '. Paste an object, or an array of objects, to generate classes.' };
      }
      shape = shape.item;
    } else if (shape.t !== 'object') {
      return { error: 'The JSON is a single value, not an object. Paste an object, or an array of objects, to generate classes.' };
    } else if (!shape.fields.length) {
      return { error: 'The JSON is an empty object, so there are no fields to generate.' };
    }

    var built = build(shape, opts);
    var classes = built.classes;
    var root0 = classes[0];
    var code;
    if (opts.separateFiles) {
      code = classes.map(function (cls) {
        return '// ' + cls.name + '.java\n' + fileHeader([cls], opts) + renderClass(cls, opts, 0, [], true);
      }).join('\n\n');
    } else {
      code = fileHeader(classes, opts) + renderClass(root0, opts, 0, classes.slice(1), true);
    }
    var usage = isArray
      ? 'List<' + root0.name + '> list = mapper.readValue(json, new TypeReference<List<' + root0.name + '>>() {});'
      : root0.name + ' ' + root0.name.charAt(0).toLowerCase() + root0.name.slice(1) + ' = mapper.readValue(json, ' + root0.name + '.class);';
    return {
      code: code + '\n',
      rootName: root0.name,
      classCount: classes.length,
      notes: built.notes,
      // Large integers are already handled by choosing Long/BigInteger; keep the other notes (duplicate keys).
      warnings: parsed.warnings.filter(function (w) { return w.message.indexOf('Large integer') !== 0; }),
      usage: usage,
      isArray: isArray
    };
  }

  if (isNode) {
    module.exports = { generate: generate, toFieldName: toFieldName, toClassName: toClassName, singular: singular };
    return;
  }

  // ---- Page wiring ----
  var input = document.getElementById('j2jInput');
  if (!input) return;
  var output = document.getElementById('j2jOutput');
  var status = document.getElementById('j2jStatus');
  var copyBtn = document.getElementById('j2jCopy');
  var downloadBtn = document.getElementById('j2jDownload');
  var timer = null;
  var lastFileName = 'Root.java';

  var SAMPLE = '{\n' +
    '  "order_id": 9007199254740993,\n' +
    '  "status": "SHIPPED",\n' +
    '  "created_at": "2026-10-17T09:30:00Z",\n' +
    '  "delivery_date": "2026-10-20",\n' +
    '  "paid": true,\n' +
    '  "customer": {\n' +
    '    "id": 42,\n' +
    '    "full_name": "Ada Lovelace",\n' +
    '    "email": "ada@example.com",\n' +
    '    "address": {"street": "Main St 1", "city": "Berlin", "zip": "10115"}\n' +
    '  },\n' +
    '  "items": [\n' +
    '    {"sku": "BOOK-42", "title": "Software Design Principles", "quantity": 1, "unit_price": 29.90},\n' +
    '    {"sku": "MUG-07", "title": "Coffee mug", "quantity": 2, "unit_price": 9.5, "gift_wrap": true}\n' +
    '  ],\n' +
    '  "coupon": null\n' +
    '}';

  function val(id) { return document.getElementById(id); }

  function options() {
    return {
      rootName: val('j2jRoot').value.trim() || 'Root',
      packageName: val('j2jPackage').value.trim().replace(/;$/, ''),
      style: val('j2jStyle').value,
      separateFiles: val('j2jSeparate').checked,
      dates: val('j2jDates').checked,
      bigDecimal: val('j2jBigDecimal').checked,
      primitives: val('j2jPrimitives').checked,
      ignoreUnknown: val('j2jIgnore').checked,
      allProperties: val('j2jAllProps').checked
    };
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

  function run() {
    var text = input.value;
    if (!text.trim()) {
      status.className = 'jt-status';
      status.textContent = 'Paste JSON above, or click Sample. The Java code is generated as you type.';
      setOutput('');
      return;
    }
    var opts = options();
    if (opts.packageName && !/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(opts.packageName)) {
      status.className = 'jt-status jt-error';
      status.textContent = 'The package name "' + opts.packageName + '" is not valid. Use something like com.example.model.';
      setOutput('');
      return;
    }
    var result;
    try {
      result = generate(text, opts);
    } catch (e) {
      if (!(e instanceof core.JsonError)) throw e;
      var where = core.position(text, e.pos);
      status.className = 'jt-status jt-error';
      status.textContent = '';
      status.appendChild(el('strong', '', 'Invalid JSON'));
      status.appendChild(el('span', '', ' at line ' + where.line + ', column ' + where.column + ': ' + e.message));
      if (e.hint) status.appendChild(el('div', 'jt-hint', 'Fix: ' + e.hint));
      var link = el('div', 'jt-hint');
      link.appendChild(document.createTextNode('Find and fix every error with the '));
      var a = el('a', '', 'JSON Validator');
      a.href = '/tools/json-validator/';
      link.appendChild(a);
      link.appendChild(document.createTextNode('.'));
      status.appendChild(link);
      setOutput('');
      return;
    }
    if (result.error) {
      status.className = 'jt-status jt-error';
      status.textContent = result.error;
      setOutput('');
      return;
    }
    lastFileName = opts.separateFiles ? result.rootName + '-classes.java' : result.rootName + '.java';
    status.className = 'jt-status jt-ok';
    status.textContent = '';
    status.appendChild(el('strong', '', 'Generated ' + result.classCount + (result.classCount === 1 ? ' class' : ' classes')));
    status.appendChild(el('span', '', ' · read it with Jackson: '));
    status.appendChild(el('code', 'j2j-usage', result.usage));
    result.notes.concat(result.warnings.map(function (w) { return w.message; })).forEach(function (n) {
      status.appendChild(el('div', 'jt-warn', 'Note: ' + n));
    });
    setOutput(result.code);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 250);
  }

  input.addEventListener('input', schedule);
  ['j2jRoot', 'j2jPackage'].forEach(function (id) { val(id).addEventListener('input', schedule); });
  ['j2jStyle', 'j2jSeparate', 'j2jDates', 'j2jBigDecimal', 'j2jPrimitives', 'j2jIgnore', 'j2jAllProps'].forEach(function (id) {
    val(id).addEventListener('change', run);
  });
  val('j2jSample').addEventListener('click', function () { input.value = SAMPLE; run(); });
  val('j2jClear').addEventListener('click', function () { input.value = ''; run(); input.focus(); });
  copyBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(output.textContent).then(function () {
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    });
  });
  downloadBtn.addEventListener('click', function () {
    var blob = new Blob([output.textContent], { type: 'text/x-java' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = lastFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  run();
})();
