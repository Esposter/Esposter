# Test Constant Scope

Carries the `testing` skill's "Nothing but functions and hoisted mocks lives at module scope" rule across the
test files written before it.

Every constant a test file declares — a literal, a fixture object, an entity built by a factory — belongs inside
the `describe` callback, so it dies with the block rather than being retained for the file's lifetime and
reachable from an unrelated `describe`. Module scope keeps only `import`s, pure helper **functions** (which hold
no state), and the `vi.hoisted` block, which `vi.mock` lifts above the imports and so cannot move inward.

A constant two sibling `describe`s share is declared in **each**. Duplicating two lines beats one file-scope
binding every block can reach — that shared binding is the thing the rule exists to remove, not a saving.

Behaviour-preserving throughout: this only narrows a binding's scope. A file where narrowing changes what a test
sees has a genuine shared-state coupling, and that is a finding to report rather than to preserve.

**Scope at the time of writing: 85 files, 144 constants, out of 713 test files.** Measured by the recipe below.

| Unit                                           | Swept | Notes                                                   |
| :--------------------------------------------- | :---- | :------------------------------------------------------ |
| `packages/app/content`                         |       | `docs.test.ts` alone holds 18 — the largest single file |
| `packages/app/app` — composables and services  |       |                                                         |
| `packages/app/app` — components and stores     |       |                                                         |
| `packages/app/server`                          |       |                                                         |
| `packages/virrun`                              |       | Second-densest package; several files with 3–4          |
| `packages/shared`, `shared-node`, `azure-mock` |       |                                                         |
| `packages/db-schema`, `db-mock`, the rest      |       |                                                         |

`packages/app/app/services/message/emoji`, `app/components/Styled/EmojiPicker` and
`app/composables/message/emoji` were written under the rule and need no sweep.

## Find recipe

Run from the repository root. It reports a module-scope `const`/`let` in every `*.test.ts`, skipping arrow
functions and the `vi.hoisted` block, which are the two legitimate module-scope forms:

```bash
python3 - <<'PY'
import io, glob, re
files = [f for f in glob.glob("packages/**/*.test.ts", recursive=True)
         if "node_modules" not in f and ".nuxt" not in f]
for f in files:
    lines = io.open(f, encoding="utf-8").read().split("\n")
    depth = 0
    for i, l in enumerate(lines):
        if l.strip().startswith(("describe(", "describe.")): depth += 1
        m = re.match(r"^(const|let)\s+([A-Za-z_$][\w$]*)\s*(=|:)", l)
        if m and depth == 0:
            rest = l.split("=", 1)[-1].strip()
            if (rest.startswith("(") and "=>" in l) or "vi.hoisted" in l: continue
            print(f"{f}:{i + 1}: {m.group(2)}")
PY
```

The `depth` counter only ever increments, which is deliberate: anything after the first `describe(` is inside a
block already and is not a finding. It over-reports a `const` declared between two top-level `describe`s only if
that file has none — which the rule forbids anyway.

## Judging a match

- **A function stays put.** `const getFoo = (x) => …` holds no state; moving it in buys nothing and costs a
  re-creation per block.
- **A type or interface stays put.** Types have no lifetime.
- **`vi.hoisted` and `vi.mock` stay put** — mechanically hoisted above the imports.
- **Everything else moves in**, including a factory _call_ (`const message = createMessageEntity(…)`), which is
  state even though a function produced it.
- **Used by several `describe`s → declare it in each.** Do not reach for an outer `describe` wrapper: the skill
  bans nested `describe` for sub-grouping, so wrapping to share a constant trades one violation for another.
