// CLAUDE.md and AGENTS.md Generator for codersite.dev/tools/claude-md-generator/
// Everything runs in the browser: nothing is sent to a server.
// generate(state) is a pure function, also used from Node to build the template pages.
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;

  var STACKS = {
    'spring-maven': {
      label: 'Java / Spring Boot (Maven)',
      stack: 'Java 25, Spring Boot 4, Maven',
      commands: {
        build: './mvnw clean verify',
        run: './mvnw spring-boot:run',
        test: './mvnw test',
        single: './mvnw test -Dtest=OrderServiceTest',
        lint: ''
      },
      style: [
        'Use constructor injection. Never use field injection with `@Autowired`.',
        'Use records for DTOs. Never return JPA entities from controllers.',
        'Validate request bodies with Bean Validation (`@Valid`) and map errors in one `@RestControllerAdvice`.',
        'Use `java.time` types, never `java.util.Date`.',
        'Return `Optional` for values that can be absent; never use it for fields or parameters.',
        'Log with SLF4J. Never use `System.out.println`.'
      ],
      testing: [
        'JUnit and AssertJ for all tests; Mockito for unit tests.',
        'Use test slices (`@WebMvcTest`, `@DataJpaTest`) instead of `@SpringBootTest` when one layer is enough.',
        'Integration tests run against a real database with Testcontainers, not H2.'
      ]
    },
    'spring-gradle': {
      label: 'Java / Spring Boot (Gradle)',
      stack: 'Java 25, Spring Boot 4, Gradle (Kotlin DSL)',
      commands: {
        build: './gradlew build',
        run: './gradlew bootRun',
        test: './gradlew test',
        single: './gradlew test --tests OrderServiceTest',
        lint: ''
      },
      style: null, // same as Maven
      testing: null
    },
    'nextjs': {
      label: 'TypeScript / Next.js',
      stack: 'TypeScript (strict), Next.js App Router, React, Tailwind CSS',
      commands: {
        build: 'npm run build',
        run: 'npm run dev',
        test: 'npm test',
        single: 'npm test -- src/lib/cart.test.ts',
        lint: 'npm run lint'
      },
      style: [
        'TypeScript strict mode. Never use `any`; use `unknown` and narrow it.',
        'Components are Server Components by default. Add `"use client"` only for state, effects or browser APIs.',
        'Fetch data in Server Components or Server Actions, not in `useEffect`.',
        'Style with Tailwind utility classes. No inline styles and no new CSS files.',
        'Use named exports, except where Next.js requires a default export (pages, layouts).'
      ],
      testing: [
        'Unit tests with Vitest and Testing Library, next to the file they test (`*.test.ts`).',
        'Test behavior the user sees, not implementation details.',
        'End-to-end tests with Playwright in `e2e/`.'
      ]
    },
    'python-fastapi': {
      label: 'Python / FastAPI',
      stack: 'Python 3.13, FastAPI, Pydantic v2, uv',
      commands: {
        build: 'uv sync',
        run: 'uv run fastapi dev',
        test: 'uv run pytest',
        single: 'uv run pytest tests/test_orders.py::test_create_order',
        lint: 'uv run ruff check . && uv run ruff format .'
      },
      style: [
        'Type hints on every function signature.',
        'Request and response bodies are Pydantic models, never plain dicts.',
        'Use `async def` for routes that do I/O; never call blocking libraries inside them.',
        'Inject sessions and services with `Depends`, not module-level globals.',
        'Never use a bare `except:`. Log with the `logging` module, not `print`.'
      ],
      testing: [
        'pytest with fixtures in `tests/conftest.py`.',
        'Test endpoints through FastAPI\'s `TestClient`.',
        'Every bug fix starts with a test that reproduces the bug.'
      ]
    },
    'python-ai': {
      label: 'Python / AI and LLM app (RAG)',
      stack: 'Python 3.13, uv, FastAPI, LLM API SDK, PostgreSQL with pgvector',
      commands: {
        build: 'uv sync',
        run: 'uv run fastapi dev',
        test: 'uv run pytest',
        single: 'uv run pytest tests/test_retrieval.py',
        lint: 'uv run ruff check . && uv run ruff format .'
      },
      style: [
        'Type hints on every function signature.',
        'Prompts live in `prompts/` as files under version control, not as strings spread through the code.',
        'Model names, token limits and temperature come from configuration, never hard-coded.',
        'Validate every model response with a Pydantic model before using it, and handle invalid output.',
        'Every model and embedding call has a timeout, and retries with backoff on rate-limit errors.',
        'Treat user input and retrieved documents as untrusted: they never change the system prompt or trigger tools without checks.',
        'Never log full prompts or responses that can contain personal data.'
      ],
      testing: [
        'Unit tests never call a real model; replace the client with a fake.',
        'Changes to prompts or retrieval are checked against the evaluation set in `evals/` before merging.',
        'pytest with fixtures in `tests/conftest.py`.'
      ]
    },
    'go': {
      label: 'Go',
      stack: 'Go, standard library net/http',
      commands: {
        build: 'go build ./...',
        run: 'go run ./cmd/app',
        test: 'go test ./...',
        single: 'go test ./internal/orders -run TestCreateOrder',
        lint: 'gofmt -l . && go vet ./...'
      },
      style: [
        'Code is formatted with `gofmt`.',
        'Handle every error. Wrap it with context: `fmt.Errorf("load order %d: %w", id, err)`.',
        '`context.Context` is the first parameter of functions that do I/O.',
        'Define small interfaces where they are used, not where they are implemented.',
        'No `panic` in library code; return errors.'
      ],
      testing: [
        'Table-driven tests with the standard `testing` package.',
        'Test files live next to the code (`orders_test.go`).',
        'Use `httptest` for HTTP handlers.'
      ]
    },
    'generic': {
      label: 'Other / generic',
      stack: '',
      commands: { build: '', run: '', test: '', single: '', lint: '' },
      style: [],
      testing: []
    }
  };
  STACKS['spring-gradle'].style = STACKS['spring-maven'].style;
  STACKS['spring-gradle'].testing = STACKS['spring-maven'].testing;

  var ARCHITECTURES = {
    'none': { label: 'No specific architecture', rules: [] },
    'layered': {
      label: 'Layered (controller, service, repository)',
      rules: [
        'Three layers: controller (HTTP only) → service (business logic, transactions) → repository (data access).',
        'Controllers never call repositories directly.',
        'Business rules live in services, not in controllers or in persistence code.',
        'Each layer depends only on the layer below it.'
      ]
    },
    'hexagonal': {
      label: 'Hexagonal / Clean Architecture',
      rules: [
        '`domain/` holds the business model and rules. It has no framework, database or HTTP imports.',
        '`application/` holds the use cases and the ports (interfaces) they need.',
        '`adapters/` (web, persistence, messaging) implement the ports.',
        'Dependencies point inward: adapters → application → domain, never the other way.',
        'Never put SQL, HTTP calls or framework annotations in `domain/`.'
      ]
    },
    'ddd': {
      label: 'Domain-Driven Design',
      rules: [
        'Code is organized by bounded context, not by technical layer.',
        'An aggregate protects its invariants: change its state only through its own methods.',
        'Aggregates reference other aggregates by ID, never by object reference.',
        'Value objects are immutable and validate themselves on creation.',
        'Use the domain\'s ubiquitous language for class and method names.',
        'Side effects in other aggregates happen through domain events.'
      ]
    },
    'microservices': {
      label: 'Microservices',
      rules: [
        'Each service owns its data. Never read or write another service\'s database.',
        'Services talk through documented APIs (OpenAPI) or events.',
        'Public API changes must be backward compatible; breaking changes need a new version.',
        'Every call to another service has a timeout and handles failure.'
      ]
    },
    'event-driven': {
      label: 'Event-driven (Kafka, messaging)',
      rules: [
        'Events describe something that happened and are named in the past tense, for example `OrderPlaced`.',
        'Events are immutable and versioned. Add fields; never rename or remove them.',
        'Consumers are idempotent: handling the same event twice has the same effect as handling it once.',
        'Save the state change and the event in one transaction with the transactional outbox; never publish to the broker inside a business transaction.',
        'After a limited number of retries, failed messages go to a dead-letter topic; they never block the partition.',
        'Ordering is guaranteed only within a partition: when order matters, use the aggregate ID as the message key.'
      ]
    },
    'modular-monolith': {
      label: 'Modular monolith',
      rules: [
        'Each module lives in its own package and exposes a small public API.',
        'Other modules use only that public API, never a module\'s internal classes.',
        'No cyclic dependencies between modules.',
        'Modules don\'t share database tables.'
      ]
    }
  };

  var GUARDRAILS = [
    { id: 'tests', label: 'Write or update tests with every change', on: true,
      text: 'Every change comes with new or updated tests.' },
    { id: 'tdd', label: 'Test first (TDD)', on: false,
      text: 'Write a failing test first, then the code that makes it pass.' },
    { id: 'verify', label: 'Run build and tests before finishing', on: true,
      text: 'Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.' },
    { id: 'complete', label: 'No placeholder code', on: true,
      text: 'Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.' },
    { id: 'scope', label: 'Small changes, no unrelated refactoring', on: true,
      text: 'Keep changes focused on the task. Don\'t refactor, rename or reformat unrelated code.' },
    { id: 'deps', label: 'Ask before adding dependencies', on: true,
      text: 'Ask before adding a new dependency.' },
    { id: 'plan', label: 'Explain the plan before large changes', on: false,
      text: 'For changes that touch more than a few files, explain the plan and wait for approval.' },
    { id: 'secrets', label: 'Never commit secrets', on: true,
      text: 'Never commit secrets, API keys or passwords. Read them from environment variables.' },
    { id: 'nocommit', label: 'Don\'t commit or push unless asked', on: true,
      text: 'Don\'t commit or push unless asked.' },
    { id: 'conventional', label: 'Conventional Commits', on: false,
      text: 'Commit messages follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.' }
  ];

  var FORMATS = {
    'agents': { file: 'AGENTS.md', label: 'AGENTS.md (Codex, Cursor, Copilot and most agents)' },
    'claude': { file: 'CLAUDE.md', label: 'CLAUDE.md (Claude Code)' },
    'gemini': { file: 'GEMINI.md', label: 'GEMINI.md (Gemini CLI)' },
    'copilot': { file: 'copilot-instructions.md', path: '.github/copilot-instructions.md', label: '.github/copilot-instructions.md (GitHub Copilot)' },
    'cursor': { file: 'project.mdc', path: '.cursor/rules/project.mdc', label: '.cursor/rules/project.mdc (Cursor)' }
  };

  var COMMAND_LABELS = [
    ['build', 'Build'], ['run', 'Run locally'], ['test', 'Run all tests'], ['single', 'Run one test'], ['lint', 'Lint and format']
  ];

  function defaults(stackId) {
    var s = STACKS[stackId] || STACKS['spring-maven'];
    var guard = {};
    GUARDRAILS.forEach(function (g) { guard[g.id] = g.on; });
    return {
      name: 'Order Service',
      summary: 'REST API that manages customer orders.',
      stackId: stackId || 'spring-maven',
      stack: s.stack,
      commands: {
        build: s.commands.build, run: s.commands.run, test: s.commands.test,
        single: s.commands.single, lint: s.commands.lint
      },
      architecture: 'layered',
      stackRules: true,
      guard: guard,
      extra: '',
      format: 'agents'
    };
  }

  function bullets(lines) {
    return lines.map(function (l) { return '- ' + l; }).join('\n');
  }

  function generate(st) {
    var stack = STACKS[st.stackId] || STACKS.generic;
    var out = [];
    var fmt = FORMATS[st.format] || FORMATS.agents;

    if (st.format === 'cursor') {
      out.push('---\ndescription: Project rules for ' + (st.name.trim() || 'this project') + '\nalwaysApply: true\n---\n');
    }

    out.push('# ' + (st.name.trim() || 'Project'));
    if (st.summary.trim()) out.push('\n' + st.summary.trim());

    if (st.stack.trim()) {
      out.push('\n## Tech stack\n\n' + bullets(st.stack.split(',').map(function (s) { return s.trim(); }).filter(Boolean)));
    }

    var cmds = COMMAND_LABELS.filter(function (c) { return (st.commands[c[0]] || '').trim(); })
      .map(function (c) { return c[1] + ': `' + st.commands[c[0]].trim() + '`'; });
    if (cmds.length) out.push('\n## Commands\n\n' + bullets(cmds));

    var arch = ARCHITECTURES[st.architecture] || ARCHITECTURES.none;
    if (arch.rules.length) out.push('\n## Architecture\n\n' + bullets(arch.rules));

    if (st.stackRules && stack.style && stack.style.length) out.push('\n## Code style\n\n' + bullets(stack.style));

    var testing = st.stackRules && stack.testing ? stack.testing.slice() : [];
    if (testing.length) out.push('\n## Testing\n\n' + bullets(testing));

    var rules = GUARDRAILS.filter(function (g) { return st.guard[g.id]; }).map(function (g) { return g.text; });
    if (rules.length) out.push('\n## Working rules\n\n' + bullets(rules));

    var extra = st.extra.split('\n').map(function (l) { return l.replace(/^\s*[-*]\s*/, '').trim(); }).filter(Boolean);
    if (extra.length) out.push('\n## Project notes\n\n' + bullets(extra));

    var text = out.join('\n') + '\n';
    return { text: text, file: fmt.file, path: fmt.path || fmt.file, stats: stats(text) };
  }

  function stats(text) {
    var lines = text.replace(/\n$/, '').split('\n').length;
    var words = (text.match(/\S+/g) || []).length;
    // About 4 characters per token for English text and code; a rough estimate, not a tokenizer.
    var tokens = Math.round(text.length / 4);
    return { lines: lines, words: words, tokens: tokens };
  }

  if (isNode) {
    module.exports = { STACKS: STACKS, ARCHITECTURES: ARCHITECTURES, GUARDRAILS: GUARDRAILS, FORMATS: FORMATS,
      defaults: defaults, generate: generate };
    return;
  }

  // ---- Page wiring ----
  var form = document.getElementById('cmgForm');
  if (!form) return;
  var output = document.getElementById('cmgOutput');
  var status = document.getElementById('cmgStatus');
  var copyBtn = document.getElementById('cmgCopy');
  var downloadBtn = document.getElementById('cmgDownload');
  var fileLabel = document.getElementById('cmgFile');
  var STORE = 'codersite-claude-md-generator';
  var state;

  function val(id) { return document.getElementById(id); }

  function fillSelect(id, map) {
    var sel = val(id);
    Object.keys(map).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = map[k].label;
      sel.appendChild(o);
    });
  }

  function buildGuardrails() {
    var box = val('cmgGuard');
    GUARDRAILS.forEach(function (g) {
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'cmgG_' + g.id;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + g.label));
      box.appendChild(label);
    });
  }

  function toForm(st) {
    val('cmgName').value = st.name;
    val('cmgSummary').value = st.summary;
    val('cmgStack').value = st.stackId;
    val('cmgStackText').value = st.stack;
    COMMAND_LABELS.forEach(function (c) { val('cmgCmd_' + c[0]).value = st.commands[c[0]] || ''; });
    val('cmgArch').value = st.architecture;
    val('cmgStackRules').checked = st.stackRules;
    GUARDRAILS.forEach(function (g) { val('cmgG_' + g.id).checked = !!st.guard[g.id]; });
    val('cmgExtra').value = st.extra;
    val('cmgFormat').value = st.format;
  }

  function fromForm() {
    var st = {
      name: val('cmgName').value,
      summary: val('cmgSummary').value,
      stackId: val('cmgStack').value,
      stack: val('cmgStackText').value,
      commands: {},
      architecture: val('cmgArch').value,
      stackRules: val('cmgStackRules').checked,
      guard: {},
      extra: val('cmgExtra').value,
      format: val('cmgFormat').value
    };
    COMMAND_LABELS.forEach(function (c) { st.commands[c[0]] = val('cmgCmd_' + c[0]).value; });
    GUARDRAILS.forEach(function (g) { st.guard[g.id] = val('cmgG_' + g.id).checked; });
    return st;
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode: not remembered */ }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && STACKS[saved.stackId]) {
        var base = defaults(saved.stackId);
        Object.keys(base).forEach(function (k) { if (saved[k] === undefined) saved[k] = base[k]; });
        return saved;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function run() {
    state = fromForm();
    var r = generate(state);
    output.textContent = r.text;
    fileLabel.textContent = r.path;
    downloadBtn.setAttribute('data-file', r.file);
    status.className = 'jt-status ' + (r.stats.lines > 200 ? 'jt-error' : 'jt-ok');
    status.textContent = '';
    status.appendChild(el('strong', '', r.stats.lines + ' lines · ' + r.stats.words + ' words · about ' +
      r.stats.tokens.toLocaleString('en-US') + ' tokens'));
    status.appendChild(el('span', '', ' loaded into every agent session.'));
    if (r.stats.lines > 200) {
      status.appendChild(el('div', 'jt-hint', 'Over 200 lines: agents follow long files less reliably. Move rules that apply to only part of the code into path-scoped rules.'));
    }
    if (state.format === 'claude') {
      status.appendChild(el('div', 'jt-hint', 'Tip: if the repository also has an AGENTS.md, keep the shared rules there and put just @AGENTS.md in CLAUDE.md to import them.'));
    }
    save();
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  }

  fillSelect('cmgStack', STACKS);
  fillSelect('cmgArch', ARCHITECTURES);
  fillSelect('cmgFormat', FORMATS);
  buildGuardrails();

  var params = new URLSearchParams(location.search);
  var preset = params.get('stack');
  state = (preset && STACKS[preset]) ? defaults(preset) : (load() || defaults('spring-maven'));
  if (preset && params.get('arch') && ARCHITECTURES[params.get('arch')]) state.architecture = params.get('arch');
  toForm(state);

  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  // The format select sits next to the preview, outside the form element, so its events don't bubble to the form.
  val('cmgFormat').addEventListener('change', run);

  // A new stack replaces the stack line and the commands with that stack's defaults.
  val('cmgStack').addEventListener('change', function () {
    var s = STACKS[val('cmgStack').value];
    val('cmgStackText').value = s.stack;
    COMMAND_LABELS.forEach(function (c) { val('cmgCmd_' + c[0]).value = s.commands[c[0]]; });
    run();
  });

  val('cmgReset').addEventListener('click', function () {
    toForm(defaults(val('cmgStack').value));
    run();
  });

  copyBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(output.textContent).then(function () {
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1500);
    });
  });

  downloadBtn.addEventListener('click', function () {
    var blob = new Blob([output.textContent], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = downloadBtn.getAttribute('data-file') || 'AGENTS.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  run();
})();
