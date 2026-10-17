---
title: "AGENTS.md Template for Go"
short_title: "Go"
description: "An AGENTS.md for Go services: gofmt and go vet, error wrapping with %w, context as the first parameter, small interfaces, table-driven tests and a cmd/internal layout for AI coding agents."
lead: "An AGENTS.md for a Go service. It teaches your AI agent idiomatic Go: wrapped errors, contexts, small interfaces and table-driven tests."
file: "AGENTS.md"
stack: go
arch: none
order: 6
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Shipping Service

  HTTP service that calculates shipping rates and creates shipments.

  ## Tech stack

  - Go
  - standard library net/http

  ## Commands

  - Build: `go build ./...`
  - Run locally: `go run ./cmd/app`
  - Run all tests: `go test ./...`
  - Run one test: `go test ./internal/orders -run TestCreateOrder`
  - Lint and format: `gofmt -l . && go vet ./...`

  ## Code style

  - Code is formatted with `gofmt`.
  - Handle every error. Wrap it with context: `fmt.Errorf("load order %d: %w", id, err)`.
  - `context.Context` is the first parameter of functions that do I/O.
  - Define small interfaces where they are used, not where they are implemented.
  - No `panic` in library code; return errors.

  ## Testing

  - Table-driven tests with the standard `testing` package.
  - Test files live next to the code (`orders_test.go`).
  - Use `httptest` for HTTP handlers.

  ## Working rules

  - Every change comes with new or updated tests.
  - Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.
  - Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.
  - Keep changes focused on the task. Don't refactor, rename or reformat unrelated code.
  - Ask before adding a new dependency.
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Layout: `cmd/app` holds `main.go`; everything else lives in `internal/`, one package per feature (`internal/rates`, `internal/shipments`).
  - No global state. Pass dependencies through constructors, for example `shipments.NewService(repo, clock)`.
  - Ask before adding a module; prefer the standard library.
---
Go has strong conventions, and agents mostly follow them. Where they slip is in the details that make Go code easy to debug: errors without context, missing `context.Context`, interfaces defined in the wrong package. This template makes those details explicit.

## Why These Rules

- **`gofmt` and `go vet` as the lint command.** Both ship with Go, so the agent can always run them. `gofmt -l` lists unformatted files, and `go vet` catches mistakes the compiler doesn't.
- **Wrap errors with `%w`.** `fmt.Errorf("load order %d: %w", id, err)` gives every error a trail you can read in the logs, and `errors.Is` still works. Agents often return bare errors or format them with `%v`, which breaks `errors.Is`.
- **`context.Context` first.** It carries cancellation and deadlines through every I/O call. Without the rule, agents add it in some functions and not in others.
- **Small interfaces where they are used.** In Go, the consumer defines the interface it needs. Agents coming from Java tend to declare big interfaces next to the implementation.
- **Table-driven tests.** One test function with a table of cases is the Go way, and it makes adding a case a one-line change.
- **No global state.** Dependencies passed to constructors can be replaced in tests.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Using a router or framework** such as chi or Gin? Add it to the tech stack line, so the agent doesn't write plain `net/http` handlers.
- **Using golangci-lint?** Replace the lint command with `golangci-lint run` in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=go&arch=none){:target="_blank"}.
- **Ports and adapters in Go?** Choose the hexagonal preset in the generator; the rules are language-neutral.

Go's "small interfaces where they are used" is the interface segregation principle in its simplest form. My book *Software Design Principles* covers it together with SOLID, coupling and cohesion, ideas that apply in Go as much as in Java:

<div>
{%- include softwareDesign.html -%}
</div>
