---
title: "CLAUDE.md Template for Python and FastAPI"
short_title: "Python FastAPI"
description: "A CLAUDE.md for Python FastAPI projects with uv, Ruff and pytest: type hints, Pydantic models, async rules, Alembic migrations and dependency injection with Depends."
lead: "A CLAUDE.md for a FastAPI service managed with uv, linted with Ruff and tested with pytest. Copy it into your repository and adjust the notes."
file: "CLAUDE.md"
stack: python-fastapi
arch: layered
order: 5
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Inventory API

  REST API that tracks product stock across warehouses.

  ## Tech stack

  - Python 3.13
  - FastAPI
  - Pydantic v2
  - uv

  ## Commands

  - Build: `uv sync`
  - Run locally: `uv run fastapi dev`
  - Run all tests: `uv run pytest`
  - Run one test: `uv run pytest tests/test_orders.py::test_create_order`
  - Lint and format: `uv run ruff check . && uv run ruff format .`

  ## Architecture

  - Three layers: controller (HTTP only) → service (business logic, transactions) → repository (data access).
  - Controllers never call repositories directly.
  - Business rules live in services, not in controllers or in persistence code.
  - Each layer depends only on the layer below it.

  ## Code style

  - Type hints on every function signature.
  - Request and response bodies are Pydantic models, never plain dicts.
  - Use `async def` for routes that do I/O; never call blocking libraries inside them.
  - Inject sessions and services with `Depends`, not module-level globals.
  - Never use a bare `except:`. Log with the `logging` module, not `print`.

  ## Testing

  - pytest with fixtures in `tests/conftest.py`.
  - Test endpoints through FastAPI's `TestClient`.
  - Every bug fix starts with a test that reproduces the bug.

  ## Working rules

  - Every change comes with new or updated tests.
  - Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.
  - Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.
  - Keep changes focused on the task. Don't refactor, rename or reformat unrelated code.
  - Ask before adding a new dependency.
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Database migrations use Alembic. Generate them with `uv run alembic revision --autogenerate -m "message"` and review them before committing.
  - Settings come from environment variables through one `pydantic-settings` class in `app/config.py`.
  - Run `uv add <package>` to add dependencies; never edit `uv.lock` by hand.
---
Python gives an agent many ways to do the same thing: pip, Poetry or uv; dicts or models; sync or async. Most bugs in AI-written FastAPI code come from mixing them. This template picks one way for each and says so.

## Why These Rules

- **uv for everything.** The commands use `uv run`, so the agent runs tools in the project's environment instead of the system Python. "Never edit `uv.lock` by hand" prevents a lock file that no longer matches `pyproject.toml`.
- **Ruff for linting and formatting.** One fast tool replaces Black, isort and Flake8, and the agent can run it after every change.
- **Pydantic models for requests and responses.** They validate input and generate the OpenAPI documentation. Plain dicts do neither.
- **No blocking calls in `async def` routes.** One synchronous database driver or `requests` call inside an async route blocks the whole event loop. It's a mistake agents make often, and it doesn't show up in tests.
- **`Depends` instead of globals.** Dependencies passed through `Depends` can be replaced in tests; module-level globals can't.
- **A test that reproduces each bug.** It proves the fix works and keeps the bug from coming back.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Using Django or Flask?** Keep the uv, Ruff and pytest parts, and replace the FastAPI rules with your framework's conventions.
- **Using Poetry or pip?** Change the commands in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=python-fastapi&arch=layered){:target="_blank"}. Exact commands matter more than any other line.
- **Add your folder layout**, for example `app/routers`, `app/services` and `app/models`, so the layered rules point at real paths.

The layered rules in this template, routers that only handle HTTP and services that hold the logic, are design principles that work in any language. My book *Software Design Principles* explains them, and when to break them, with practical examples:

<div>
{%- include softwareDesign.html -%}
</div>
