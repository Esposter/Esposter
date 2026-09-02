# Testing

Every test-file convention the `testing` skill owns, carried across the suites written before each was written
down. Standing: a unit's date says the rules below all held there on that date, and the pass resumes from the
files changed since.

Consolidates the former **test-trimming** and **test-constant-scope** ledgers — one subject, one skill, one set
of units, and a suite is read once against all of it rather than once per convention.

## Rules

| Rule                                                       | Owner                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| A test earns its line or is deleted; fixtures written once | `testing` — "What to Test", `references/test-data.md` |
| Constants inside the `describe`, never module scope        | `testing` — "Structure"                               |
| Mock cleanup follows how the mock was created              | `testing` — `references/module-mocks.md`              |
| `expect.hasAssertions()`, exact assertions, no polling     | `testing` — "Assertions"                              |
| The cheapest environment that runs the file (`app` only)   | this ledger — "The environment a suite declares"      |

The row **`vi.fn` always takes its signature** has left this table.
`packages/configuration/eslint/restrictedTestSyntaxes.js` bans the bare zero-argument form, and a pass on
2026-08-18 confirmed the repo holds — it fails on the line that writes it, so there is nothing left to sweep.

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state. The environment row is the one exception, and only because
its scope is narrower than the ledger's: `packages/app` is the sole package whose vitest config offers a choice
of environment, so the rule cannot fail anywhere else and the rows outside it keep their dates.
Trimming last ran across every unit on 2026-08-12.

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping.

| Area                      | What it holds                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------ |
| [app-shell](app-shell.md) | the chrome, the routes, and the cross-cutting service, composable and store layers   |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and routers                 |
| [platform](platform.md)   | the resource explorer, the sheet editor and the other editors                        |
| [products](products.md)   | the smaller products — posts, the clicker, achievements                              |
| [dungeons](dungeons.md)   | the game                                                                             |
| [server](server.md)       | `packages/app/server` — routers, procedure builders, guards and services             |
| [shared](shared.md)       | `packages/app/shared` and `app/components/Styled` — what both halves of the app read |
| [packages](packages.md)   | every workspace package outside `packages/app`                                       |
| [tooling](tooling.md)     | `scripts/`, `.agents/`, the app's root config suites and `content/`                  |

The area names are [quality](../quality/)'s, so "was this area swept, for which question, and when" reads off one
set of names across both ledgers.

Most rows opened at `—` when the ledger split on 2026-08-30. The thirteen rows it replaced were trees, not
units: one of them named 133 suites and another 155, which is a tree a pass greps rather than reads, and a grep
pass that ticks its row records a sweep that never happened (`sweeps` skill). Only the rows whose whole unit was
small enough to have been read keep their dates.

## Find recipe

Constant scope, from the repository root. A line-anchored regex is not enough on its own: it reads a multi-line
arrow as a constant, because the `=>` lands on a later line, and it cannot tell where a declaration ends, since a
template literal's `${…}` and a `;` inside a string both fool a bracket count. This scanner skips strings,
template substitutions, and both comment forms, so a declaration ends at the first `;` genuinely at depth zero and a statement is classified by its **whole**
text. The `await` and `function` exemptions match on a word boundary, or `awaitable()` and `functionFactory()`
would be exempted by their prefixes alone. Helper files are skipped outright — a `*.test.ts` ending in
`describe.todo` holds module state by design (`references/test-helper-files.md`).

```bash
python3 - <<'PY'
import glob, io, re

def scan(text):
    stack, quote, i = [], "", 0
    while i < len(text):
        c = text[i]
        if quote:
            if c == "\\": i += 2; continue
            if c == quote: quote = ""
        elif stack and stack[-1] == "`":
            if c == "\\": i += 2; continue
            if c == "`": stack.pop()
            elif text.startswith("${", i): stack.append("{"); i += 2; continue
        elif c in "\"'": quote = c
        elif text.startswith("//", i): i = text.find("\n", i) % (len(text) + 1); continue
        elif text.startswith("/*", i): i = (text.find("*/", i) + 2) or len(text); continue
        elif c in "([{`": stack.append(c)
        elif c in ")]}" and stack: stack.pop()
        else: yield c, len(stack)
        i += 1

for f in sorted(glob.glob("packages/**/*.test.ts", recursive=True) + glob.glob(".agents/**/*.test.ts", recursive=True)):
    if "node_modules" in f or ".nuxt" in f: continue
    lines = io.open(f, encoding="utf-8").read().split("\n")
    if any(l.startswith("describe.todo(") for l in lines): continue
    i = 0
    while i < len(lines):
        name = re.match(r"^(?:const|let)\s+([\w$]+)\s*[:=]", lines[i])
        if name:
            end = i
            while end < len(lines) and [t for t in scan("\n".join(lines[i:end + 1])) if not t[0].isspace()][-1:] != [(";", 0)]:
                end += 1
            text = "\n".join(lines[i:end + 1])
            tokens = list(scan(text))
            assign = next((j for j, (c, d) in enumerate(tokens) if c == "=" and d == 0), None)
            after = tokens[assign + 1:] if assign is not None else []
            body = "".join(c for c, _ in after).strip()
            arrow = any(after[j] == ("=", 0) and after[j + 1:j + 2] == [(">", 0)] for j in range(len(after) - 1))
            if not (arrow or "vi.hoisted" in text or re.match(r"^(?:await|function)\b", body)):
                print(f"{f}:{i + 1}: {name.group(1)}")
            i = end
        i += 1
PY
```

Everything it still reports on a swept repo is one of the exceptions below, so a clean pass is a **known** list
rather than an empty one: `app/content/docs/index.test.ts`'s top-level-await cluster, the `mockDb` a hoisted `vi.mock`
factory returns in each `azure-functions` suite, virrun's two mocked path constants, and each `scripts/oxlint` rule
name, which names its own `describe` and so is evaluated before the callback the scope rule would move it into.

## Judging a match

- **A function stays at module scope.** It holds no state, so nothing about it can leak between suites. But a
  helper that **captures** one of these constants is not that pure kind — it moves in alongside it. `oxlint`'s
  `unicorn/consistent-function-scoping` does not count a default parameter value as a capture, so a helper whose
  only capture is `(name = blobName)` takes a disable rather than a move back out.
- **A type or interface stays.** Types have no lifetime.
- **`vi.hoisted` and `vi.mock` stay** — mechanically hoisted above the imports.
- **Anything a `vi.mock` factory closes over stays**, for the same reason the factory does: `let mockDb` read by
  a `get db()` factory, or a path constant a mocked resolver returns, is reached from above the imports, where a
  `describe` scope is invisible. This is the repo's largest exception — one per `azure-functions` suite.
- **A `const` initialized by top-level `await` stays**, because a `describe` callback is synchronous and cannot
  hold one. Converting it to `let` + `beforeAll` is worse: it makes a read-only fixture look like rebuilt state,
  which is the distinction the skill's `let` rule exists to carry. `content/docs/index.test.ts` is the repo's case, and
  the module-scope helpers reading those fixtures pin the constants they read out there too.
- **Everything else moves in**, including a factory _call_ (`const message = createMessageEntity(…)`), which is
  state even though a function produced it.
- **Used by several `describe`s → declare it in each.** Never wrap them in an outer `describe` to share one: the
  skill bans nested `describe` for sub-grouping, so that trades one violation for another.
- **A hook belongs to the suite it tears down.** An `afterEach` registered at module scope moves in with the
  state it cleans up.

## The environment a suite declares

`packages/app`'s vitest config leaves every file in the node environment and lets `// @vitest-environment nuxt`
opt in, because the nuxt environment builds the app per file — it is the difference between the suite's plain
files averaging well under a second and its nuxt files averaging several. So the directive is part of what a
test costs, and a suite that carries it without needing it is the same waste as a test that proves nothing.

Read what the file actually reaches for. A suite that mounts a component, resolves the router, or reads the nuxt
app (`useNuxtApp`, `useState`, a `$trpc` call, runtime config) needs the environment. One that only needs a
**DOM** — `window`, `DOMParser`, `navigator` — takes `happy-dom` instead, and one that needs neither takes the
default by carrying no directive at all. The check is empirical: drop to the cheaper environment and run the
file, because the failure names the global that was missing.

## Exclusions

- Coverage thresholds are not a reason to keep a test — a number that only holds because a test restates a
  constant is measuring nothing.
- `packages/app/uno.config.test.ts` and `packages/app/vuetify.config.test.ts` read as config restatements and are
  not: both snapshot **resolved** output, so the edit they catch is a `unocss` or `vuetify` bump moving a derived
  rule, colour or default with no diff in this repo. The `unocss` skill owns the reason; a pass that reaches them
  reads that first. They were deleted once on the restatement rule alone, which is why the reason is written
  down in two places rather than inferred from the files.

## Next enforceable

**Constant scope cannot be linted yet, and the attempt is recorded so nobody repeats it.** The selector itself is
easy — `Program > VariableDeclaration > VariableDeclarator[init]` minus function expressions, `AwaitExpression`
and `vi.hoisted` initializers — and `export const` is excluded for free, since an exported declaration's parent
is the `ExportNamedDeclaration`. What defeats it is **helper files**: a `*.test.ts` that exports one helper and
ends in `describe.todo` (`references/test-helper-files.md`) legitimately holds module-scope state, and
`mswTrpc.test.ts`'s `const server = setupServer()` is exactly the shape the rule is aimed at. Telling the two
apart means asking whether the file has a real `describe`, which is a whole-Program question an AST selector
cannot ask.

The `vi.mock`-factory exception defeats it a second time and in the same way: whether a binding is read from a
hoisted factory is a whole-Program question too. A custom oxlint plugin has both answers available at once, so it
is the one remaining path — that, or helper files taking a distinct suffix.
