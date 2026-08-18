# Tests

Every test-file convention the `testing` skill owns, carried across the suites written before each was written
down. Standing: a unit's date says the rules below all held there on that date, and the pass resumes from the
files changed since.

Consolidates the former **test-trimming** and **test-constant-scope** ledgers — one subject, one skill, one set
of units, and a suite is read once against all of it rather than once per convention.

## Rules

| Rule                                                       | Owner                                          |
| ---------------------------------------------------------- | ---------------------------------------------- |
| A test earns its line or is deleted; fixtures written once | `testing` — "What to Test", "Shared Test Data" |
| Constants inside the `describe`, never module scope        | `testing` — "Structure"                        |
| `vi.fn` always takes its signature                         | `testing` — "Mocking"                          |
| Mock cleanup follows how the mock was created              | `testing` — "Mocking"                          |
| `expect.hasAssertions()`, exact assertions, no polling     | `testing` — "Assertions"                       |

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state. Trimming last ran across every unit on 2026-08-12.

| Unit                                               | Swept      | Notes                                                  |
| -------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `app/app/services`                                 | 2026-08-18 |                                                        |
| `app/app/composables`                              | 2026-08-18 | `message/emoji` written under the rules                |
| `app/app/store`, `app/app/models`                  | 2026-08-18 |                                                        |
| `app/app/components`, `app/app/util`               | 2026-08-18 | `Styled/EmojiPicker` written under the rules           |
| `app/content`                                      |            | `docs.test.ts` — top-level await fixtures, see below   |
| `app/server/services`, `app/server/trpc/procedure` | 2026-08-18 |                                                        |
| `app/server/trpc/routers`, rest                    |            |                                                        |
| `app/shared`                                       |            |                                                        |
| `virrun`                                           |            | Second-densest package for module-scope constants      |
| `azure-functions`, `azure-mock`, `db*`             |            |                                                        |
| `parse-tmx`, `vue-phaserjs`, `xml2js`, rest        |            | plus `shared`, `shared-node`, `configuration`, `infra` |
| `.claude/workflows`                                |            | the vitest `claude` project                            |

## Find recipe

Constant scope, from the repository root. Every file here is Prettier-formatted, so **column zero is module
scope** — the anchored regex is the whole scope test, and it catches a declaration before, between and after
sibling `describe`s alike. Counting `describe` openings instead misses the last two, because such a counter has
nothing to decrement it on the closing brace. Arrow functions and the `vi.hoisted` block are the two legitimate
module-scope forms, so both are skipped:

```bash
python3 - <<'PY'
import io, glob, re
files = [f for f in glob.glob("packages/**/*.test.ts", recursive=True)
         if "node_modules" not in f and ".nuxt" not in f]
for f in files:
    for i, l in enumerate(io.open(f, encoding="utf-8").read().split("\n")):
        m = re.match(r"^(const|let)\s+([A-Za-z_$][\w$]*)\s*(=|:)", l)
        if not m: continue
        rest = l.split("=", 1)[-1].strip()
        if (rest.startswith("(") and "=>" in l) or "vi.hoisted" in l: continue
        print(f"{f}:{i + 1}: {m.group(2)}")
PY
```

Untyped mocks, which lint reports only once a recorded call is destructured:

```bash
grep -rn "vi\.fn()" --include=*.test.ts packages | grep -v "vi.fn<"
```

## Judging a match

- **A function stays at module scope.** It holds no state; moving it in costs a re-creation per block.
- **A type or interface stays.** Types have no lifetime.
- **`vi.hoisted` and `vi.mock` stay** — mechanically hoisted above the imports.
- **A `const` initialized by top-level `await` stays**, because a `describe` callback is synchronous and cannot
  hold one. Converting it to `let` + `beforeAll` is worse: it makes a read-only fixture look like rebuilt state,
  which is the distinction the skill's `let` rule exists to carry. `content/docs.test.ts` is the repo's case.
- **Everything else moves in**, including a factory _call_ (`const message = createMessageEntity(…)`), which is
  state even though a function produced it.
- **Used by several `describe`s → declare it in each.** Never wrap them in an outer `describe` to share one: the
  skill bans nested `describe` for sub-grouping, so that trades one violation for another.

## Exclusions

- Coverage thresholds are not a reason to keep a test — a number that only holds because a test restates a
  constant is measuring nothing.

## Next enforceable

**`vi.fn` is done** — `packages/configuration/eslint/restrictedTestSyntaxes.js` bans the bare zero-argument
`vi.fn()`, appended to the script-side bans for `**/*.test.ts` the same way the date bans are for `.vue`. The
repo had zero violations when it landed, so it is purely a ratchet. Drop that rule from the table above once a
pass confirms it has held.

**Constant scope cannot be linted yet, and the attempt is recorded so nobody repeats it.** The selector itself is
easy — `Program > VariableDeclaration > VariableDeclarator[init]` minus function expressions, `AwaitExpression`
and `vi.hoisted` initializers — and `export const` is excluded for free, since an exported declaration's parent
is the `ExportNamedDeclaration`. What defeats it is **helper files**: a `*.test.ts` that exports one helper and
ends in `describe.todo` (`references/test-helper-files.md`) legitimately holds module-scope state, and
`mswTrpc.test.ts`'s `const server = setupServer()` is exactly the shape the rule is aimed at. Telling the two
apart means asking whether the file has a real `describe`, which is a whole-Program question an AST selector
cannot ask. It becomes enforceable via a custom oxlint plugin that can look at the Program before deciding, or
if helper files ever take a distinct suffix.
