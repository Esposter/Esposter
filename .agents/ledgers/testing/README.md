# Testing

Every test-file convention the `testing` skill owns, carried across the suites written before each was written
down. Standing: a unit's date says the rules below all held there on that date, and the pass resumes from the
files changed since.

## Rules

| Rule                                                       | Owner                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| A test earns its line or is deleted; fixtures written once | `testing` — "What to Test", `references/test-data.md` |
| Constants inside the `describe`, never module scope        | `testing` — "Structure"                               |
| Mock cleanup follows how the mock was created              | `testing` — `references/module-mocks.md`              |
| `expect.hasAssertions()`, exact assertions, no polling     | `testing` — "Assertions"                              |
| The cheapest environment that runs the file (`app` only)   | this ledger — "The environment a suite declares"      |

A bare zero-argument `vi.fn` is not in this table because
`packages/configuration/eslint/restrictedTestSyntaxes.js` fails on the line that writes it.

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state. The environment row is the one exception, and only because
its scope is narrower than the ledger's: `packages/app` is the sole package whose vitest config offers a choice
of environment, so the rule cannot fail anywhere else and the rows outside it keep their dates.

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

## Find recipe

Constant scope, from the repository root. A line-anchored regex is not enough on its own: it reads a multi-line
arrow as a constant, because the `=>` lands on a later line, and it cannot tell where a declaration ends, since a
template literal's `${…}` and a `;` inside a string both fool a bracket count. This scanner skips strings,
template substitutions, and both comment forms, so a declaration ends at the first `;` genuinely at depth zero and a
statement is classified by its **whole** text. The `await` and `function` exemptions match on a word boundary, or
`awaitable()` and `functionFactory()` would be exempted by their prefixes alone. Helper files are skipped outright —
a `*.test.ts` ending in `describe.todo` holds module state by design (`references/test-helper-files.md`).

It runs on **node**, which the repo's toolchain guarantees. It was written against `python3`, which on a Windows
checkout is an App Execution Alias that prints a Microsoft Store notice to stdout and **exits 0** — no findings, no
error, indistinguishable from a swept tree. That is the silent-pass trap the `sweeps` skill names, walked into by
the recipe meant to avoid it, so prove this one still reports a planted violation before believing a clean run.

The file list is `git ls-files --cached --others --exclude-standard`: `--others` is load-bearing, because a suite
written and not yet added would otherwise be out of scope and the run would read as clean.

```js
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

// Yields every character that is real code — outside strings, template substitutions and both comment forms —
// Paired with its bracket depth, so a `;` at depth 0 is the end of a declaration and a `;` inside a string is not.
function* scanCode(text) {
  const stack = [];
  let quote = "";
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (quote) {
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === quote) quote = "";
    } else if (stack.at(-1) === "`") {
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === "`") stack.pop();
      else if (text.startsWith("${", index)) {
        stack.push("{");
        index += 2;
        continue;
      }
    } else if (character === '"' || character === "'") quote = character;
    else if (text.startsWith("//", index)) {
      const newline = text.indexOf("\n", index);
      index = newline === -1 ? text.length : newline;
      continue;
    } else if (text.startsWith("/*", index)) {
      const close = text.indexOf("*/", index);
      index = close === -1 ? text.length : close + 2;
      continue;
    } else if ("([{`".includes(character)) stack.push(character);
    else if (")]}".includes(character) && stack.length > 0) stack.pop();
    else yield [character, stack.length];
    index += 1;
  }
}

const DECLARATION_REGEX = /^(?:const|let)\s+(?<name>[\w$]+)\s*[:=]/u;
const EXEMPT_BODY_REGEX = /^(?:await|function)\b/u;

// --others keeps a suite that is written but not yet added in scope; without it a new file reads as clean
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "*.test.ts"], {
  encoding: "utf8",
  maxBuffer: 1 << 28,
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.includes("node_modules/") && !file.includes("/.nuxt/"));

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  // A helper file legitimately holds module state — see the ledger README
  if (lines.some((line) => line.startsWith("describe.todo("))) continue;
  let index = 0;
  while (index < lines.length) {
    const name = DECLARATION_REGEX.exec(lines[index])?.groups?.name;
    if (!name) {
      index += 1;
      continue;
    }
    let end = index;
    const isTerminated = () => {
      const tokens = [...scanCode(lines.slice(index, end + 1).join("\n"))].filter(([character]) => character.trim());
      const last = tokens.at(-1);
      return last?.[0] === ";" && last[1] === 0;
    };
    while (end < lines.length && !isTerminated()) end += 1;
    const text = lines.slice(index, end + 1).join("\n");
    const tokens = [...scanCode(text)];
    const assignment = tokens.findIndex(([character, depth]) => character === "=" && depth === 0);
    const after = assignment === -1 ? [] : tokens.slice(assignment + 1);
    const body = after
      .map(([character]) => character)
      .join("")
      .trim();
    const isArrow = after.some(
      ([character, depth], position) =>
        character === "=" && depth === 0 && after[position + 1]?.[0] === ">" && after[position + 1][1] === 0,
    );
    if (!isArrow && !text.includes("vi.hoisted") && !EXEMPT_BODY_REGEX.test(body))
      console.log(`${file}:${(index + 1).toString()}: ${name}`);
    index = end + 1;
  }
}
```

Everything it still reports on a swept repo is one of the exceptions below, so a clean pass is a **known** list
rather than an empty one: the top-level-await clusters in `app/content/docs/index.test.ts`, `app/components/index.test.ts`
and `app/store/index.test.ts` — each with the constants their module-scope readers pin out there alongside them —
the `mockDb` a hoisted `vi.mock` factory returns in each `azure-functions` suite, virrun's two mocked path constants,
and each `scripts/oxlint` rule name, which names its own `describe` and so is evaluated before the callback the scope
rule would move it into.

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
