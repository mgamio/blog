// LLM API Cost Calculator for codersite.dev/tools/llm-api-cost-calculator/
// Everything runs in the browser: nothing is sent to a server.
// Prices come from _data/llm_prices.yml (window.LLM_PRICES). costPerRequest() is a pure function,
// also used from Node to test the calculation.
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;

  var PRESETS = [
    { id: 'chat', label: 'Chatbot reply', input: 1500, output: 300, cached: 0 },
    { id: 'rag', label: 'RAG answer (retrieved documents)', input: 8000, output: 500, cached: 50 },
    { id: 'agent', label: 'Coding agent step', input: 40000, output: 1500, cached: 80 },
    { id: 'classify', label: 'Classification or tagging', input: 300, output: 5, cached: 0 },
    { id: 'summary', label: 'Summarize a long document', input: 250000, output: 2000, cached: 0 }
  ];

  var DAYS_PER_MONTH = 30;

  // The prices that apply to one request: long-context and Batch rules included.
  function pricesFor(model, inputTokens, batch) {
    var useLong = model.long && inputTokens > model.long.over;
    var base = useLong ? model.long : model;
    var p = { input: base.input, cached: base.cached, output: base.output, long: !!useLong };
    if (batch) {
      if (base.batch) {
        p.input = base.batch.input;
        p.cached = base.batch.cached;
        p.output = base.batch.output;
      } else {
        p.input = base.input / 2;
        p.cached = base.cached / 2;
        p.output = base.output / 2;
      }
    }
    return p;
  }

  // Cost in USD of one request. cachedPercent is the share of input tokens read from the cache.
  function costPerRequest(model, usage) {
    var input = Math.max(0, usage.input || 0);
    var output = Math.max(0, usage.output || 0);
    var share = Math.min(100, Math.max(0, usage.cachedPercent || 0)) / 100;
    var p = pricesFor(model, input, usage.batch);
    var cachedTokens = input * share;
    var freshTokens = input - cachedTokens;
    var cost = (freshTokens * p.input + cachedTokens * p.cached + output * p.output) / 1e6;
    return { cost: cost, long: p.long, prices: p };
  }

  // About 4 characters per token for English text; code and other languages usually need more tokens.
  function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  // Small amounts keep two significant digits, so per-request costs stay comparable.
  function formatMoney(value) {
    if (value === 0) return '$0';
    if (value < 0.01) return '$' + value.toPrecision(2).replace(/0+$/, '');
    if (value < 1) return '$' + value.toFixed(3).replace(/0$/, '');
    if (value < 100) return '$' + value.toFixed(2);
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  if (isNode) {
    module.exports = { pricesFor: pricesFor, costPerRequest: costPerRequest, estimateTokens: estimateTokens, formatMoney: formatMoney, PRESETS: PRESETS };
    return;
  }

  var DATA = window.LLM_PRICES;
  if (!DATA) return;

  var STORE_KEY = 'codersite.llmCostCalculator';
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    preset: $('lcPreset'), input: $('lcInput'), output: $('lcOutput'), requests: $('lcRequests'),
    cached: $('lcCached'), cachedValue: $('lcCachedValue'), batch: $('lcBatch'), text: $('lcText'),
    textInfo: $('lcTextInfo'), useText: $('lcUseText'), providers: $('lcProviders'),
    body: $('lcBody'), status: $('lcStatus'), sort: document.querySelectorAll('[data-lc-sort]')
  };

  var sortKey = 'cost';
  var sortAsc = true;

  PRESETS.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.label + ' (' + p.input.toLocaleString('en-US') + ' in, ' + p.output.toLocaleString('en-US') + ' out)';
    el.preset.appendChild(o);
  });
  var custom = document.createElement('option');
  custom.value = 'custom';
  custom.textContent = 'Custom';
  el.preset.appendChild(custom);

  function readNumber(input, fallback) {
    var n = parseFloat(String(input.value).replace(/[,\s_]/g, ''));
    return isFinite(n) && n >= 0 ? n : fallback;
  }

  function state() {
    var providers = [];
    el.providers.querySelectorAll('input[type=checkbox]').forEach(function (c) { if (c.checked) providers.push(c.value); });
    return {
      preset: el.preset.value,
      input: readNumber(el.input, 0),
      output: readNumber(el.output, 0),
      requests: readNumber(el.requests, 0),
      cachedPercent: readNumber(el.cached, 0),
      batch: el.batch.checked,
      providers: providers
    };
  }

  function save(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable */ }
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
  }

  function applyPreset(id) {
    var p = PRESETS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    el.input.value = p.input;
    el.output.value = p.output;
    el.cached.value = p.cached;
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }

  function render() {
    var s = state();
    el.cachedValue.textContent = Math.round(s.cachedPercent) + '%';
    save(s);

    var rows = DATA.models
      .filter(function (m) { return s.providers.indexOf(m.provider) !== -1; })
      .map(function (m) {
        var r = costPerRequest(m, s);
        return { model: m, perRequest: r.cost, perDay: r.cost * s.requests, perMonth: r.cost * s.requests * DAYS_PER_MONTH, long: r.long };
      });

    rows.sort(function (a, b) {
      var x = sortKey === 'name' ? a.model.name.localeCompare(b.model.name) : a.perRequest - b.perRequest;
      return sortAsc ? x : -x;
    });

    var cheapest = rows.length ? Math.min.apply(null, rows.map(function (r) { return r.perRequest; })) : 0;
    el.body.innerHTML = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      if (r.perRequest === cheapest && rows.length > 1) tr.className = 'lc-cheapest';
      var notes = [];
      if (r.long) notes.push('Long-prompt price: more than ' + r.model.long.over.toLocaleString('en-US') + ' input tokens.');
      if (r.model.change) notes.push('Price changes on ' + formatDate(r.model.change.date) + ': ' + formatMoney(r.model.change.input) + ' in / ' + formatMoney(r.model.change.output) + ' out per 1M tokens.');
      if (r.model.note) notes.push(r.model.note);
      tr.innerHTML =
        '<td class="lc-model"><span class="lc-prov lc-prov-' + r.model.provider.toLowerCase() + '">' + r.model.provider + '</span>' +
          '<span class="lc-name"></span><code class="lc-id"></code>' +
          (notes.length ? '<span class="lc-note"></span>' : '') + '</td>' +
        '<td class="lc-num">' + formatMoney(r.perRequest) + '</td>' +
        '<td class="lc-num">' + formatMoney(r.perDay) + '</td>' +
        '<td class="lc-num lc-month">' + formatMoney(r.perMonth) + '</td>';
      tr.querySelector('.lc-name').textContent = r.model.name;
      tr.querySelector('.lc-id').textContent = r.model.id;
      if (notes.length) tr.querySelector('.lc-note').textContent = notes.join(' ');
      el.body.appendChild(tr);
    });

    if (!rows.length) {
      el.status.textContent = 'Choose at least one provider.';
      el.status.className = 'jt-status jt-error';
      return;
    }
    var winners = rows.filter(function (r) { return r.perRequest === cheapest; });
    var names = winners.map(function (r) { return r.model.name; });
    el.status.className = 'jt-status jt-ok';
    el.status.textContent = 'Cheapest for this workload: ' +
      (names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + ' (same price)' : names[0]) + ', ' +
      formatMoney(winners[0].perMonth) + ' per month for ' + s.requests.toLocaleString('en-US') + ' requests a day' +
      (s.batch ? ' with the Batch API.' : '.');
  }

  function updateTextInfo() {
    var text = el.text.value;
    var tokens = estimateTokens(text);
    el.textInfo.textContent = text
      ? text.length.toLocaleString('en-US') + ' characters, about ' + tokens.toLocaleString('en-US') + ' tokens'
      : 'Paste text to estimate its tokens.';
    el.useText.disabled = !text;
  }

  // Restore the last settings, or start from the first preset
  var saved = load();
  if (saved) {
    el.preset.value = saved.preset || 'custom';
    el.input.value = saved.input;
    el.output.value = saved.output;
    el.requests.value = saved.requests;
    el.cached.value = saved.cachedPercent;
    el.batch.checked = !!saved.batch;
    if (saved.providers) {
      el.providers.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = saved.providers.indexOf(c.value) !== -1; });
    }
  } else {
    el.preset.value = PRESETS[0].id;
    applyPreset(PRESETS[0].id);
  }

  el.preset.addEventListener('change', function () { applyPreset(el.preset.value); render(); });
  [el.input, el.output, el.cached].forEach(function (i) {
    i.addEventListener('input', function () { el.preset.value = 'custom'; render(); });
  });
  [el.requests, el.batch].forEach(function (i) { i.addEventListener('input', render); });
  el.batch.addEventListener('change', render);
  el.providers.addEventListener('change', render);
  el.text.addEventListener('input', updateTextInfo);
  el.useText.addEventListener('click', function () {
    el.input.value = estimateTokens(el.text.value);
    el.preset.value = 'custom';
    render();
  });
  el.sort.forEach(function (th) {
    th.addEventListener('click', function () {
      var key = th.getAttribute('data-lc-sort');
      sortAsc = key === sortKey ? !sortAsc : true;
      sortKey = key;
      el.sort.forEach(function (t) { t.removeAttribute('aria-sort'); });
      th.setAttribute('aria-sort', sortAsc ? 'ascending' : 'descending');
      render();
    });
  });

  updateTextInfo();
  render();
})();
