// SKILL.md Generator for codersite.dev/tools/skill-md-generator/
// Builds Agent Skills (SKILL.md) for common developer tasks, adapted to the project's stack.
// Everything runs in the browser: nothing is sent to a server.
// generate(state) is a pure function, also usable from Node.
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;

  // ---------- Stacks ----------

  var SPRING_TESTS = {
    fw: 'JUnit 5, AssertJ and Mockito',
    desc: 'Writes JUnit 5, AssertJ and Mockito unit tests for Spring Boot classes and services',
    where: 'in `src/test/java`, in the same package as the class under test',
    example: '`rejectsOrderWithoutItems()`',
    rules: [
      'Use test slices (`@WebMvcTest`, `@DataJpaTest`) when one layer is enough. Use `@SpringBootTest` only for full integration tests.',
      'Integration tests that touch the database run against a real database with Testcontainers, not H2.',
      'Assert with AssertJ (`assertThat(...)`), not JUnit `assertEquals`.'
    ]
  };

  var SPRING_ENDPOINT = [
    'Add a method to the `@RestController` for the resource, or create `<Resource>Controller` if there is none. Keep it thin: map the request, call the service, map the response.',
    'Request and response bodies are Java records. Validate input with Bean Validation (`@Valid`, `@NotBlank`, `@Positive` ...).',
    'Business logic goes in the `@Service`; data access goes through a Spring Data repository. Never return JPA entities from the controller.',
    'Map errors to `ProblemDetail` responses in the existing `@RestControllerAdvice` (create one if there is none).',
    'If the project uses springdoc-openapi, add `@Operation` and `@ApiResponse` annotations so the endpoint is documented in Swagger UI.',
    'Add a `@WebMvcTest` for the controller (status codes, validation errors, JSON shape) and a unit test for the service.'
  ];

  var SPRING_REVIEW = [
    '`@Transactional` belongs on service methods that change data, not on controllers. No remote calls inside a transaction.',
    'N+1 queries: lazy collections loaded inside a loop. Use a fetch join or `@EntityGraph`.',
    'Field injection (`@Autowired` on fields) instead of constructor injection.',
    'JPA entities returned from controllers, or request bodies without `@Valid`.',
    '`Optional.get()` without a check, and exceptions caught and ignored.'
  ];

  var SPRING_MIGRATION = {
    tool: 'Flyway',
    steps: [
      'Find the highest version in `src/main/resources/db/migration` and create the next file: `V<next>__<short_description>.sql`, for example `V7__add_status_to_orders.sql`.',
      'Write plain SQL for the project\'s database. Flyway applies the migration when the application starts, including in integration tests.'
    ],
    note: 'If the project uses Liquibase instead, add a new changeset to the changelog and never change an existing one.'
  };

  var STACKS = {
    'spring-maven': {
      label: 'Java / Spring Boot (Maven)',
      short: 'Spring Boot',
      lang: 'Java',
      cmd: {
        build: './mvnw clean verify',
        test: './mvnw test',
        single: './mvnw test -Dtest=OrderServiceTest',
        lint: ''
      },
      tests: SPRING_TESTS,
      endpoint: SPRING_ENDPOINT,
      review: SPRING_REVIEW,
      migration: SPRING_MIGRATION,
      deps: {
        file: '`pom.xml`',
        fileText: 'pom.xml',
        outdated: './mvnw versions:display-dependency-updates',
        tree: './mvnw dependency:tree',
        notes: [
          'Spring Boot manages the versions of most libraries. Upgrade the Spring Boot version instead of a single managed library, unless the user asks for one.',
          'For a Spring Boot upgrade, read the release notes and the migration guide for every version you skip.'
        ]
      },
      tools: {
        test: ['Bash(./mvnw test:*)', 'Bash(./mvnw clean verify:*)'],
        migration: [],
        deps: ['Bash(./mvnw versions:display-dependency-updates:*)', 'Bash(./mvnw dependency:tree:*)']
      }
    },
    'spring-gradle': {
      label: 'Java / Spring Boot (Gradle)',
      short: 'Spring Boot',
      lang: 'Java',
      cmd: {
        build: './gradlew build',
        test: './gradlew test',
        single: './gradlew test --tests OrderServiceTest',
        lint: ''
      },
      tests: SPRING_TESTS,
      endpoint: SPRING_ENDPOINT,
      review: SPRING_REVIEW,
      migration: SPRING_MIGRATION,
      deps: {
        file: '`build.gradle.kts` (or the version catalog `gradle/libs.versions.toml`)',
        fileText: 'build.gradle.kts',
        outdated: './gradlew dependencyUpdates',
        outdatedNote: ' (needs the Gradle Versions plugin; without it, check the versions on Maven Central)',
        tree: './gradlew dependencies',
        notes: [
          'Spring Boot manages the versions of most libraries. Upgrade the Spring Boot plugin version instead of a single managed library, unless the user asks for one.',
          'For a Spring Boot upgrade, read the release notes and the migration guide for every version you skip.'
        ]
      },
      tools: {
        test: ['Bash(./gradlew test:*)', 'Bash(./gradlew build:*)'],
        migration: [],
        deps: ['Bash(./gradlew dependencies:*)', 'Bash(./gradlew dependencyUpdates:*)']
      }
    },
    'nextjs': {
      label: 'TypeScript / Next.js',
      short: 'Next.js',
      lang: 'TypeScript',
      cmd: {
        build: 'npm run build',
        test: 'npm test',
        single: 'npm test -- src/lib/cart.test.ts',
        lint: 'npm run lint && npx tsc --noEmit'
      },
      tests: {
        fw: 'Vitest and React Testing Library',
        desc: 'Writes Vitest and React Testing Library tests for Next.js components and functions',
        where: 'next to the file under test, as `<name>.test.ts` or `<name>.test.tsx`',
        example: '`it(\'rejects an empty cart\')`',
        rules: [
          'Test components the way a user uses them: query by role and label (`getByRole`, `getByLabelText`), not by CSS class.',
          'Mock network calls at the boundary (`fetch` or MSW), never the module under test.',
          'Async Server Components are hard to unit test: test their data functions directly and leave whole pages to end-to-end tests.'
        ]
      },
      endpoint: [
        'Create a Route Handler in `app/api/<resource>/route.ts` (or `app/api/<resource>/[id]/route.ts`) that exports a function per HTTP method (`GET`, `POST` ...). If only this app\'s own forms call it, ask whether a Server Action fits better.',
        'Validate the body and the params with Zod (or the schema library the project already uses) and return `400` with the validation errors.',
        'Put business logic and data access in `lib/` (or `server/`), not in the route file. Return `NextResponse.json(...)` with an explicit status.',
        'Check authentication and authorization in the handler. Never trust ids sent by the client.',
        'Add tests for the logic in `lib/`, and for the handler by calling the exported function with a `Request`.'
      ],
      review: [
        'Server-only code or secrets imported into a Client Component (`"use client"`), or variables exposed with the `NEXT_PUBLIC_` prefix by mistake.',
        'Data fetched in `useEffect` that could be fetched on the server.',
        'Missing `key` props, effects with missing dependencies, and state that could be derived from props.',
        '`any` types, non-null assertions (`!`) and unchecked `as` casts.',
        'Server Actions and Route Handlers without input validation or auth checks.'
      ],
      migration: {
        tool: 'Prisma Migrate',
        steps: [
          'Change the model in `prisma/schema.prisma`.',
          'Create the migration: `npx prisma migrate dev --name <short_description>`. Read the generated SQL in `prisma/migrations/` before you continue.',
          '`prisma migrate dev` also regenerates the client. Fix the type errors it reveals: `npx tsc --noEmit`.'
        ],
        note: 'If the project uses Drizzle instead, change the schema and run `npx drizzle-kit generate`.'
      },
      deps: {
        file: '`package.json`',
        fileText: 'package.json',
        outdated: 'npm outdated',
        tree: 'npm ls <package>',
        notes: [
          'Update with `npm install <package>@<version>` so `package-lock.json` stays in sync. Never edit the lock file by hand.',
          'Upgrade `next`, `react` and `react-dom` together, and run the official codemods (`npx @next/codemod`) for a new major Next.js version.'
        ]
      },
      tools: {
        test: ['Bash(npm test:*)', 'Bash(npm run lint:*)', 'Bash(npm run build:*)', 'Bash(npx tsc:*)'],
        migration: ['Bash(npx prisma migrate dev:*)', 'Bash(npx prisma generate:*)'],
        deps: ['Bash(npm outdated:*)', 'Bash(npm ls:*)', 'Bash(npm install:*)']
      }
    },
    'python-fastapi': {
      label: 'Python / FastAPI (uv)',
      short: 'FastAPI',
      lang: 'Python',
      cmd: {
        build: '',
        test: 'uv run pytest',
        single: 'uv run pytest tests/test_orders.py::test_rejects_empty_order',
        lint: 'uv run ruff check . && uv run ruff format --check . && uv run mypy .'
      },
      tests: {
        fw: 'pytest',
        desc: 'Writes pytest tests for FastAPI endpoints, services and functions',
        where: 'in `tests/`, in a file named `test_<module>.py`',
        example: '`test_rejects_order_without_items`',
        rules: [
          'Put shared setup in fixtures (`conftest.py`) and use `@pytest.mark.parametrize` for the same test with different inputs.',
          'Test endpoints with FastAPI\'s `TestClient` (or `httpx.AsyncClient` in async tests). Replace dependencies with `app.dependency_overrides`, not with patching.',
          'Use plain `assert` statements.'
        ]
      },
      endpoint: [
        'Add the route to the router for the resource in `app/routers/` (create one and include it in the app if needed). Declare `response_model` and `status_code`.',
        'Define request and response models with Pydantic in `app/schemas/`. Never return ORM objects directly.',
        'Put business logic in `app/services/`. Get the database session and the current user with `Depends`.',
        'Raise `HTTPException` with a clear status and message for expected errors.',
        'Never call blocking code (a sync database driver, `requests`, `time.sleep`) inside an `async def` route: use a `def` route or an async library.',
        'Add tests with `TestClient` for the success case, validation errors (`422`) and not-found or forbidden cases.'
      ],
      review: [
        'Blocking calls (sync database driver, `requests`, `time.sleep`) inside `async def` functions.',
        'Mutable default arguments, bare `except:` and exceptions swallowed with `pass`.',
        'Missing type hints, or `Any` where a Pydantic model belongs.',
        'SQL built with f-strings instead of bound parameters.',
        'ORM objects returned instead of response schemas, which leaks internal fields.'
      ],
      migration: {
        tool: 'Alembic',
        steps: [
          'Change the SQLAlchemy model.',
          'Generate the migration: `uv run alembic revision --autogenerate -m "<short description>"`.',
          'Read the generated file in `alembic/versions/`. Autogenerate turns renames into drop and create, and misses some constraint changes: fix them by hand.',
          'Apply it locally with `uv run alembic upgrade head`, then test the downgrade: `uv run alembic downgrade -1` and `upgrade head` again.'
        ],
        note: ''
      },
      deps: {
        file: '`pyproject.toml`',
        fileText: 'pyproject.toml',
        outdated: 'uv pip list --outdated',
        tree: 'uv tree',
        notes: [
          'Upgrade with `uv add "<package>>=<version>"` or `uv lock --upgrade-package <package>`, so `uv.lock` stays in sync.',
          'Check the changelog for removed APIs and for a new minimum Python version.'
        ]
      },
      tools: {
        test: ['Bash(uv run pytest:*)', 'Bash(uv run ruff:*)', 'Bash(uv run mypy:*)'],
        migration: ['Bash(uv run alembic:*)'],
        deps: ['Bash(uv pip list:*)', 'Bash(uv tree:*)', 'Bash(uv add:*)', 'Bash(uv lock:*)']
      }
    },
    'go': {
      label: 'Go',
      short: 'Go',
      lang: 'Go',
      cmd: {
        build: 'go build ./...',
        test: 'go test ./...',
        single: 'go test ./internal/order -run TestCreateOrder',
        lint: 'go vet ./...'
      },
      tests: {
        fw: 'the standard `testing` package',
        desc: 'Writes table-driven Go tests for functions, methods and HTTP handlers',
        where: 'next to the code, in `<file>_test.go` in the same package',
        example: '`TestCreateOrder_RejectsEmptyOrder`',
        rules: [
          'Write table-driven tests, with a `t.Run` subtest for each case.',
          'Use `httptest` for HTTP handlers and small hand-written fakes for interfaces. Don\'t add a mocking library the project doesn\'t already use.',
          'Run concurrent code with the race detector: `go test -race ./...`.'
        ]
      },
      endpoint: [
        'Add the handler next to the existing handlers (for example in `internal/http/`) and register it with a method pattern such as `mux.HandleFunc("POST /orders", h.createOrder)`.',
        'Decode the JSON body into a request struct, validate it, and return `400` with a clear message on bad input.',
        'Put business logic in a service in `internal/<domain>/`. The handler only decodes, calls the service and encodes the response.',
        'Pass `r.Context()` down to the service and repository calls.',
        'Map errors to status codes in one place, for example with `errors.Is` on sentinel errors.',
        'Add a test with `httptest.NewRecorder` for the success case and each error case.'
      ],
      review: [
        'Errors ignored (`_ =`) or returned without context. Wrap them: `fmt.Errorf("create order: %w", err)`.',
        'Goroutines with no way to stop them, and `context.Context` not passed down.',
        'Data races: maps or slices written from several goroutines without a mutex.',
        '`defer` inside loops, and `rows` or response bodies that are never closed.',
        'Exported names without doc comments.'
      ],
      migration: {
        tool: 'golang-migrate',
        steps: [
          'Create the files: `migrate create -ext sql -dir db/migrations -seq <short_description>`.',
          'Write the change in the `.up.sql` file and its exact reverse in the `.down.sql` file.',
          'Apply it to the local database with the project\'s migrate command, then run the down migration and the up migration again.'
        ],
        note: 'If the project uses goose or Atlas instead, use its command to create the migration.'
      },
      deps: {
        file: '`go.mod`',
        fileText: 'go.mod',
        outdated: 'go list -u -m all',
        tree: 'go mod graph',
        notes: [
          'Upgrade with `go get <module>@<version>`, then run `go mod tidy`.',
          'A new major version has a new import path (`/v2`, `/v3`): update every import.'
        ]
      },
      tools: {
        test: ['Bash(go test:*)', 'Bash(go build:*)', 'Bash(go vet:*)'],
        migration: ['Bash(migrate create:*)'],
        deps: ['Bash(go list:*)', 'Bash(go get:*)', 'Bash(go mod tidy:*)', 'Bash(go mod graph:*)']
      }
    },
    'dotnet': {
      label: 'C# / ASP.NET Core',
      short: 'ASP.NET Core',
      lang: 'C#',
      cmd: {
        build: 'dotnet build',
        test: 'dotnet test',
        single: 'dotnet test --filter "FullyQualifiedName~OrderServiceTests"',
        lint: 'dotnet format --verify-no-changes'
      },
      tests: {
        fw: 'xUnit',
        desc: 'Writes xUnit tests for ASP.NET Core classes, services and endpoints',
        where: 'in the matching `*.Tests` project, in the same folder structure as the class under test',
        example: '`CreateOrder_WithoutItems_ReturnsValidationError`',
        rules: [
          'Use `[Theory]` with `[InlineData]` for the same test with different inputs.',
          'Test endpoints with `WebApplicationFactory<Program>` and its in-memory `HttpClient`.',
          'Use the mocking library the project already uses (Moq or NSubstitute). Don\'t add another one.'
        ]
      },
      endpoint: [
        'Follow the existing style: a controller action in `Controllers/`, or a Minimal API endpoint in the endpoint group for the resource.',
        'Use record types for request and response DTOs, validated with data annotations (or FluentValidation if the project uses it).',
        'Put business logic in a service registered in dependency injection, and inject it through the constructor.',
        'Make the handler `async`, accept a `CancellationToken` and pass it down to EF Core calls.',
        'Return explicit status codes (`TypedResults` or `ActionResult`) and `ProblemDetails` for errors.',
        'Add an integration test with `WebApplicationFactory` and a unit test for the service.'
      ],
      review: [
        '`async void`, `.Result` or `.Wait()` on tasks, and missing `CancellationToken` parameters.',
        'EF Core: queries inside loops (N+1), missing `AsNoTracking()` on read-only queries, and `ToList()` before filtering.',
        '`IDisposable` objects not disposed, and `HttpClient` created per request instead of with `IHttpClientFactory`.',
        'Nullable warnings silenced with `!` instead of handled.',
        'Secrets in `appsettings.json` instead of user secrets or environment variables.'
      ],
      migration: {
        tool: 'EF Core migrations',
        steps: [
          'Change the entity and its configuration.',
          'Add the migration: `dotnet ef migrations add <PascalCaseName>` (add `--project` and `--startup-project` if the `DbContext` lives in another project).',
          'Review the generated `Up` and `Down` methods in `Migrations/`: a rename often appears as drop and add, which loses data.',
          'Apply it locally: `dotnet ef database update`.'
        ],
        note: ''
      },
      deps: {
        file: 'the `.csproj` file (or `Directory.Packages.props` with central package management)',
        fileText: 'the .csproj file',
        outdated: 'dotnet list package --outdated',
        tree: 'dotnet list package --include-transitive',
        notes: [
          'Update with `dotnet add package <Package> --version <version>`, or change the version in `Directory.Packages.props`.',
          'Keep all `Microsoft.AspNetCore.*` and `Microsoft.EntityFrameworkCore.*` packages on the same version.'
        ]
      },
      tools: {
        test: ['Bash(dotnet test:*)', 'Bash(dotnet build:*)', 'Bash(dotnet format:*)'],
        migration: ['Bash(dotnet ef migrations add:*)', 'Bash(dotnet ef database update:*)'],
        deps: ['Bash(dotnet list package:*)', 'Bash(dotnet add package:*)']
      }
    }
  };

  // ---------- Skills ----------

  var READ_TOOLS = ['Read', 'Grep', 'Glob'];
  var GIT_READ = ['Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)'];

  function numbered(lines, start) {
    return lines.map(function (l, i) { return (i + (start || 1)) + '. ' + l; });
  }

  function bullets(lines) {
    return lines.map(function (l) { return '- ' + l; });
  }

  function code(cmd) { return '`' + cmd + '`'; }

  // ctx.cc: Claude Code target; ctx.target: how the body refers to the user's request
  var SKILLS = {
    'write-tests': {
      label: 'Write tests',
      name: 'write-tests',
      hint: '[class or file]',
      manual: false,
      description: function (s) {
        return s.tests.desc + ', including edge cases and error cases. ' +
          'Use when the user asks to add, write or improve tests, increase test coverage, or test a class, file or endpoint.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test); },
      body: function (s, ctx) {
        var out = ['# Write tests', '',
          'Write tests for: ' + ctx.target('the class, file or feature the user named') + '. If no target is given, ask which code to test.', '',
          '## Steps', ''];
        out = out.concat(numbered([
          'Read the code under test and the existing tests near it. Match their style, helpers and naming.',
          'List the behaviors to cover: the main success path, edge cases (empty input, missing values, boundaries, duplicates) and error cases. If there are more than 8, show the list and ask which to cover first.',
          'Write the tests with ' + s.tests.fw + ', ' + s.tests.where + '. One behavior per test, named after the behavior, for example ' + s.tests.example + '.',
          'Run only the new tests, for example ' + code(s.cmd.single) + '.',
          'Run the whole suite: ' + code(s.cmd.test) + '.'
        ]));
        out = out.concat(['', '## Rules', ''], bullets(s.tests.rules.concat([
          'Test behavior through the public API. Don\'t test private methods or implementation details.',
          'No real network calls, no sleeps, and no dependence on the current time or on test order.',
          'If a test fails because the code is wrong, stop and report the bug. Never change a correct test so that it passes, and don\'t change production code unless the user asks.'
        ])));
        out = out.concat(['', '## Done when', '',
          '- The new tests and the whole suite pass.',
          '- You listed the behaviors now covered, and any bugs you found.']);
        return out;
      }
    },

    'fix-bug': {
      label: 'Fix a bug',
      name: 'fix-bug',
      hint: '[issue, error or failing test]',
      manual: false,
      description: function (s) {
        return 'Finds the root cause of a bug in a ' + s.short + ' project, reproduces it with a failing test and fixes it. ' +
          'Use when the user reports a bug, an exception or stack trace, unexpected behavior, or a failing test.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test, ['Bash(git log:*)']); },
      body: function (s, ctx) {
        var out = ['# Fix a bug', '',
          'Problem: ' + ctx.target('the bug, error or failing test the user described') + '.', '',
          '## Steps', ''];
        out = out.concat(numbered([
          'Reproduce it first. Write a test that fails because of the bug, or run the failing test (for example ' + code(s.cmd.single) + '). If you can\'t reproduce it, stop and ask for the input, the full error and the expected result.',
          'Find the root cause. Start from the first stack trace line that belongs to this project and follow the data back to where it first goes wrong. Check recent changes to the files involved with `git log -p`.',
          'Fix the cause with the smallest change that makes the test pass.',
          'Run the test again, then the whole suite: ' + code(s.cmd.test) + (s.cmd.lint ? ', and ' + code(s.cmd.lint) : '') + '.',
          'Report the cause in one or two sentences, the fix, and the test that now guards against it.'
        ]));
        out = out.concat(['', '## Rules', ''], bullets([
          'Fix the cause, not the symptom: no swallowed exceptions, and no extra null checks or retries that hide the problem.',
          'Don\'t refactor or reformat unrelated code in the same change.',
          'Never delete, skip or weaken an existing test to make the suite pass.',
          'If the fix needs a design change or changes a public API, describe the options and ask first.'
        ]));
        return out;
      }
    },

    'add-endpoint': {
      label: 'Add a REST endpoint',
      name: 'add-endpoint',
      hint: '[METHOD /path and what it does]',
      manual: false,
      description: function (s) {
        return 'Adds a REST API endpoint to a ' + s.short + ' application, with input validation, error handling and tests. ' +
          'Use when the user asks for a new endpoint, route or API operation, or CRUD operations for a resource.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test); },
      body: function (s, ctx) {
        var out = ['# Add a REST endpoint', '',
          'Endpoint: ' + ctx.target('the endpoint the user described') + '.', '',
          '## Before you start', '',
          '- Read one existing endpoint for a similar resource and copy its structure, naming and error format.',
          '- If the path, the fields, who may call it or the status codes are unclear, ask before writing code.', '',
          '## Steps', ''];
        out = out.concat(numbered(s.endpoint.concat([
          'Run ' + code(s.cmd.test) + (s.cmd.lint ? ' and ' + code(s.cmd.lint) : '') + '.'
        ])));
        out = out.concat(['', '## Rules', ''], bullets([
          'Follow REST conventions: plural nouns in paths, `201 Created` with a `Location` header for creates, `204` for deletes, `404` for unknown ids, `400` or `422` for invalid input.',
          'Never expose stack traces, database errors or internal fields in responses.',
          'Keep the change focused on this endpoint. Don\'t change the behavior of other endpoints.'
        ]));
        return out;
      }
    },

    'review-changes': {
      label: 'Review my changes',
      name: 'review-changes',
      hint: '',
      manual: false,
      description: function (s) {
        return 'Reviews uncommitted ' + s.short + ' changes for bugs, security issues, missing tests and common ' + s.lang + ' pitfalls, and reports findings by severity. ' +
          'Use when the user asks for a code review, to check their changes, or before committing or opening a pull request.';
      },
      tools: function () { return READ_TOOLS.concat(GIT_READ); },
      body: function (s, ctx) {
        var out = ['# Review the current changes', ''];
        if (ctx.cc) {
          out = out.concat(['## Changed files', '', '!`git status --short`', '', '!`git diff --stat HEAD`', '',
            'Read the full diff with `git diff HEAD`, and the changed files where you need more context.']);
        } else {
          out.push('Run `git status` and `git diff HEAD` to see the changes. Read the changed files where you need more context.');
        }
        if (ctx.cc) out = out.concat(['', 'Focus on: $ARGUMENTS']);
        out = out.concat(['', '## Check for', '', '### Correctness', ''], bullets([
          'Logic errors, missed edge cases (empty, missing, zero, very large input) and off-by-one errors.',
          'Errors that are caught and ignored, or not handled where an operation can fail.'
        ]), ['', '### Security', ''], bullets([
          'Input used in SQL, shell commands, file paths or HTML without validation or escaping.',
          'Missing authentication or authorization checks, and secrets or tokens in code or logs.'
        ]), ['', '### ' + s.short, ''], bullets(s.review), ['', '### Tests', ''], bullets([
          'New behavior without tests, and tests that don\'t assert anything meaningful.'
        ]));
        out = out.concat(['', '## Report', '',
          'Group the findings by severity: **Must fix**, **Should fix**, **Consider**. For each one, give `file:line`, the problem and a concrete fix. End with one sentence on whether the change is ready to commit.',
          '', '## Rules', ''], bullets([
          'Report only. Don\'t edit files unless the user asks.',
          'Report only problems you can point to in the diff. Skip style issues that a formatter or linter catches.'
        ]));
        return out;
      }
    },

    'db-migration': {
      label: 'Create a database migration',
      name: 'db-migration',
      hint: '[schema change]',
      manual: false,
      description: function (s) {
        return 'Creates a ' + s.migration.tool + ' database migration for a schema change and checks that it is safe to deploy. ' +
          'Use when the user asks to add or change a table, column, index or constraint, or mentions a database migration.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test, s.tools.migration); },
      body: function (s, ctx) {
        var out = ['# Create a database migration', '',
          'Change: ' + ctx.target('the schema change the user described') + '.', '',
          '## Steps', ''];
        out = out.concat(numbered(s.migration.steps.concat(['Run the tests: ' + code(s.cmd.test) + '.'])));
        var rules = [
          'Never edit a migration that has already been applied anywhere (a shared database, CI or production). Create a new one.',
          'Keep each migration compatible with the version of the application that is running: add a nullable column (or one with a default), backfill it, and add the `NOT NULL` constraint in a later migration.',
          'Add an index for every new foreign key column, and for columns used in new `WHERE` clauses.',
          'One logical change per migration, with a name that says what it does.',
          'Only apply migrations to the local database. Never to a shared or production database.'
        ];
        if (s.migration.note) rules.push(s.migration.note);
        return out.concat(['', '## Rules', ''], bullets(rules));
      }
    },

    'upgrade-dependency': {
      label: 'Upgrade a dependency',
      name: 'upgrade-dependency',
      hint: '[library] [version]',
      manual: true,
      description: function (s) {
        return 'Upgrades a dependency in ' + s.deps.fileText + ' to a newer version, checks the release notes for breaking changes and fixes the build. ' +
          'Use when the user asks to update, bump or upgrade a library or ' + s.short + ' itself.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test, s.tools.deps); },
      body: function (s, ctx) {
        var out = ['# Upgrade a dependency', '',
          'Upgrade: ' + ctx.target('the library and version the user named') + '. If no version is given, use the latest stable release.', '',
          '## Steps', ''];
        out = out.concat(numbered([
          'Find the current version in ' + s.deps.file + ' and the available versions: ' + code(s.deps.outdated) + (s.deps.outdatedNote || '') + '.',
          'Read the release notes or changelog for every version between the current and the target version. List the breaking changes and deprecations, and search the code for the APIs they affect.',
          'Change the version.',
          'Build and test: ' + code(s.cmd.build || s.cmd.test) + (s.cmd.build ? ', then ' + code(s.cmd.test) : '') + '. Fix the compile errors and deprecation warnings that the upgrade causes.',
          'Check that the transitive dependencies didn\'t change unexpectedly: ' + code(s.deps.tree) + '.',
          'Report the old and new version, the breaking changes you found, the code you changed, and anything the user should check by hand.'
        ]));
        out = out.concat(['', '## Rules', ''], bullets(s.deps.notes.concat([
          'Upgrade one dependency (or one framework family) per change.',
          'Use the latest patch release of the target version. Never a pre-release, unless the user asks.',
          'If the upgrade needs large code changes, stop after step 2 and present a plan.'
        ])));
        return out;
      }
    },

    'commit': {
      label: 'Write a commit message and commit',
      name: 'commit',
      hint: '[optional note]',
      manual: true,
      description: function () {
        return 'Writes a Conventional Commits message for the staged changes and creates the commit. ' +
          'Use when the user asks to commit, or to write a commit message.';
      },
      tools: function () { return GIT_READ.concat(['Bash(git commit:*)']); },
      body: function (s, ctx) {
        var out = ['# Commit the staged changes', ''];
        if (ctx.cc) {
          out = out.concat(['## Staged changes', '', '!`git diff --cached --stat`', '', 'Notes from the user, if any: $ARGUMENTS', '']);
        }
        out = out.concat(['## Steps', '']);
        out = out.concat(numbered([
          'If nothing is staged, show `git status` and ask what to commit. Don\'t stage files unless the user asks.',
          'Read the staged diff: `git diff --cached`.',
          'Write the message in the Conventional Commits format shown below.',
          'Commit with `git commit -m "<message>"` and show the result with `git log -1 --stat`.'
        ]));
        out = out.concat(['', '## Message format', '', '```text',
          '<type>(<optional scope>): <summary>', '',
          '<body: what changed and why, wrapped at 72 characters>',
          '```', ''], bullets([
          '`type`: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`, `perf` or `chore`.',
          'Summary: imperative mood ("add", not "added"), no period at the end, under 72 characters.',
          'Body: explain why the change was needed. Leave it out for trivial changes.',
          'Breaking change: add `!` after the type and a `BREAKING CHANGE:` footer.'
        ]));
        out = out.concat(['', '## Rules', ''], bullets([
          'Never push, amend, rebase or use `--no-verify` unless the user asks.',
          'If the staged changes mix unrelated work, suggest splitting them into separate commits.',
          'If a pre-commit hook fails, fix the problem and commit again. Don\'t bypass the hook.'
        ]));
        return out;
      }
    },

    'refactor': {
      label: 'Refactor safely',
      name: 'refactor',
      hint: '[file, class or goal]',
      manual: false,
      description: function (s) {
        return 'Refactors ' + s.short + ' code without changing its behavior, in small steps checked by tests. ' +
          'Use when the user asks to refactor, clean up, simplify, rename, extract or restructure code.';
      },
      tools: function (s) { return READ_TOOLS.concat(s.tools.test); },
      body: function (s, ctx) {
        var out = ['# Refactor without changing behavior', '',
          'Target: ' + ctx.target('the code and the goal the user described') + '.', '',
          '## Steps', ''];
        out = out.concat(numbered([
          'Read the code and its tests. If tests don\'t cover the code, first write tests for its current behavior (odd behavior included) and run them, for example ' + code(s.cmd.single) + '.',
          'Before editing, say what you will change and why: duplication, a long method, unclear names, a class with too many responsibilities.',
          'Change in small steps: rename, extract, move, inline. Run ' + code(s.cmd.test) + ' after each step.',
          (s.cmd.lint ? 'Run ' + code(s.cmd.lint) + '. ' : '') + 'Report what changed and confirm that the behavior did not.'
        ]));
        out = out.concat(['', '## Rules', ''], bullets([
          'Behavior must not change: same inputs, same outputs, same errors, same side effects.',
          'Don\'t change public APIs, database schemas or configuration unless the user asks.',
          'Don\'t mix the refactoring with bug fixes or new features. If you find a bug, report it separately.',
          'Prefer the patterns the project already uses over new ones.'
        ]));
        return out;
      }
    }
  };

  var INVOCATIONS = {
    auto: { label: 'Claude decides, or I type /name' },
    manual: { label: 'Only when I type /name' },
    claude: { label: 'Only Claude (hidden from the / menu)' }
  };

  var TARGETS = {
    claude: { label: 'Claude Code' },
    portable: { label: 'Any agent (Agent Skills standard)' }
  };

  // ---------- Generation ----------

  function defaults(stackId, skillId) {
    var s = STACKS[stackId];
    var k = SKILLS[skillId];
    return {
      stackId: stackId,
      skillId: skillId,
      name: k.name,
      description: k.description(s),
      hint: k.hint,
      invocation: k.manual ? 'manual' : 'auto',
      target: 'claude',
      allowTools: true,
      extra: ''
    };
  }

  // YAML scalar: plain when safe, otherwise double-quoted (JSON strings are valid YAML).
  function yaml(v) {
    if (v === '') return '""';
    if (/^[A-Za-z0-9(]/.test(v) && !/: |\s#|^\s|\s$|["'`{}\[\]]|^(true|false|yes|no|on|off|null|~)$/i.test(v)) return v;
    return JSON.stringify(v);
  }

  function checkName(name) {
    var problems = [];
    if (!name) problems.push('The name is empty.');
    else {
      if (name.length > 64) problems.push('The name has ' + name.length + ' characters; the maximum is 64.');
      if (!/^[a-z0-9-]+$/.test(name)) problems.push('Use only lowercase letters, numbers and hyphens in the name.');
      else if (/^-|-$|--/.test(name)) problems.push('The name can\'t start or end with a hyphen, or contain two hyphens in a row.');
      if (/anthropic|claude/i.test(name)) problems.push('"anthropic" and "claude" are reserved words: claude.ai and the Skills API reject names that contain them.');
    }
    return problems;
  }

  function checkDescription(d) {
    var problems = [];
    var hints = [];
    if (!d.trim()) problems.push('The description is empty. It is the only text the agent sees before it decides to use the skill.');
    if (d.length > 1024) problems.push('The description has ' + d.length + ' characters; the maximum is 1,024.');
    if (/[<>]/.test(d)) problems.push('Remove < and > from the description: XML tags are not allowed.');
    if (/^\s*(i|i'm|i can|you|you can|this skill)\b/i.test(d)) hints.push('Write the description in the third person ("Writes tests...", not "I can..." or "You can..."): it is added to the agent\'s system prompt.');
    if (d.trim() && !/\buse (it )?(when|for|this when)\b/i.test(d)) hints.push('Add a "Use when ..." sentence with the words users say for this task. It is how the agent knows when to load the skill.');
    if (d.trim() && d.trim().length < 60) hints.push('The description is very short. Say what the skill does and when to use it, with specific keywords.');
    return { problems: problems, hints: hints };
  }

  function generate(st) {
    var s = STACKS[st.stackId];
    var k = SKILLS[st.skillId];
    var cc = st.target === 'claude';
    var name = (st.name || '').trim();
    var desc = (st.description || '').replace(/\s+/g, ' ').trim();
    var ctx = {
      cc: cc,
      target: function (portableText) { return cc ? '$ARGUMENTS' : portableText; }
    };

    var fm = ['---', 'name: ' + yaml(name || k.name), 'description: ' + yaml(desc)];
    if (cc) {
      if (st.hint && st.hint.trim()) fm.push('argument-hint: ' + JSON.stringify(st.hint.trim()));
      if (st.invocation === 'manual') fm.push('disable-model-invocation: true');
      if (st.invocation === 'claude') fm.push('user-invocable: false');
      if (st.allowTools) {
        fm.push('allowed-tools:');
        k.tools(s).forEach(function (t) { fm.push('  - ' + t); });
      }
    }
    fm.push('---', '');

    var body = k.body(s, ctx);
    var extra = (st.extra || '').split('\n').map(function (l) { return l.trim().replace(/^[-*]\s+/, ''); }).filter(Boolean);
    if (extra.length) body = body.concat(['', '## Project rules', ''], bullets(extra));

    var text = fm.concat(body).join('\n') + '\n';
    var lines = text.split('\n').length - 1;
    var bodyText = body.join('\n');
    var dirName = name || k.name;
    return {
      text: text,
      path: cc ? '.claude/skills/' + dirName + '/SKILL.md' : dirName + '/SKILL.md',
      file: 'SKILL.md',
      name: checkName(name),
      description: checkDescription(desc),
      stats: {
        lines: lines,
        descChars: desc.length,
        metaTokens: Math.ceil((name.length + desc.length) / 4) + 5,
        bodyTokens: Math.ceil(bodyText.length / 4)
      }
    };
  }

  if (isNode) {
    module.exports = { STACKS: STACKS, SKILLS: SKILLS, defaults: defaults, generate: generate, checkName: checkName, checkDescription: checkDescription };
    return;
  }

  // ---------- Browser UI ----------

  var form = document.getElementById('smgForm');
  if (!form) return;
  var output = document.getElementById('smgOutput');
  var status = document.getElementById('smgStatus');
  var copyBtn = document.getElementById('smgCopy');
  var downloadBtn = document.getElementById('smgDownload');
  var fileLabel = document.getElementById('smgFile');
  var descCount = document.getElementById('smgDescCount');
  var STORE = 'codersite-skill-md-generator';
  var state;

  function val(id) { return document.getElementById(id); }

  function fillSelect(id, map) {
    var sel = val(id);
    Object.keys(map).forEach(function (key) {
      var o = document.createElement('option');
      o.value = key;
      o.textContent = map[key].label;
      sel.appendChild(o);
    });
  }

  function toForm(st) {
    val('smgStack').value = st.stackId;
    val('smgSkill').value = st.skillId;
    val('smgName').value = st.name;
    val('smgDesc').value = st.description;
    val('smgHint').value = st.hint;
    val('smgInvocation').value = st.invocation;
    val('smgTarget').value = st.target;
    val('smgTools').checked = st.allowTools;
    val('smgExtra').value = st.extra;
  }

  function fromForm() {
    return {
      stackId: val('smgStack').value,
      skillId: val('smgSkill').value,
      name: val('smgName').value,
      description: val('smgDesc').value,
      hint: val('smgHint').value,
      invocation: val('smgInvocation').value,
      target: val('smgTarget').value,
      allowTools: val('smgTools').checked,
      extra: val('smgExtra').value
    };
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode: not remembered */ }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && STACKS[saved.stackId] && SKILLS[saved.skillId]) {
        var base = defaults(saved.stackId, saved.skillId);
        Object.keys(base).forEach(function (key) { if (saved[key] === undefined) saved[key] = base[key]; });
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
    var cc = state.target === 'claude';
    // Claude Code-only options don't apply to the portable format
    ['smgHint', 'smgInvocation', 'smgTools'].forEach(function (id) { val(id).disabled = !cc; });
    val('smgCcOnly').hidden = cc;

    var r = generate(state);
    output.textContent = r.text;
    fileLabel.textContent = r.path;
    descCount.textContent = r.stats.descChars.toLocaleString('en-US') + ' / 1,024';
    descCount.className = 'smg-count' + (r.stats.descChars > 1024 ? ' smg-over' : '');

    var problems = r.name.concat(r.description.problems);
    status.className = 'jt-status ' + (problems.length ? 'jt-error' : 'jt-ok');
    status.textContent = '';
    status.appendChild(el('strong', '', problems.length ? 'Fix before saving: ' : 'Valid SKILL.md · '));
    if (problems.length) {
      status.appendChild(el('span', '', problems.join(' ')));
    } else {
      status.appendChild(el('span', '', r.stats.lines + ' lines. The name and description add about ' + r.stats.metaTokens +
        ' tokens to every session; the rest (about ' + r.stats.bodyTokens.toLocaleString('en-US') + ' tokens) loads only when the skill is used.'));
    }
    r.description.hints.forEach(function (h) { status.appendChild(el('div', 'jt-hint', 'Tip: ' + h)); });
    if (r.stats.lines > 500) status.appendChild(el('div', 'jt-hint', 'Over 500 lines: move reference material into separate files next to SKILL.md.'));
    save();
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  }

  // A new stack or skill resets the fields that depend on them.
  function applyPreset() {
    var d = defaults(val('smgStack').value, val('smgSkill').value);
    val('smgName').value = d.name;
    val('smgDesc').value = d.description;
    val('smgHint').value = d.hint;
    val('smgInvocation').value = d.invocation;
    run();
  }

  fillSelect('smgStack', STACKS);
  fillSelect('smgSkill', SKILLS);
  fillSelect('smgInvocation', INVOCATIONS);
  fillSelect('smgTarget', TARGETS);

  var params = new URLSearchParams(location.search);
  var pStack = params.get('stack');
  var pSkill = params.get('skill');
  if ((pStack && STACKS[pStack]) || (pSkill && SKILLS[pSkill])) {
    state = defaults(STACKS[pStack] ? pStack : 'spring-maven', SKILLS[pSkill] ? pSkill : 'write-tests');
  } else {
    state = load() || defaults('spring-maven', 'write-tests');
  }
  toForm(state);

  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  // The target select sits next to the preview, outside the form element.
  val('smgTarget').addEventListener('change', run);
  val('smgStack').addEventListener('change', applyPreset);
  val('smgSkill').addEventListener('change', applyPreset);
  val('smgReset').addEventListener('click', function () {
    toForm(defaults(val('smgStack').value, val('smgSkill').value));
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
    a.download = 'SKILL.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  run();
})();
