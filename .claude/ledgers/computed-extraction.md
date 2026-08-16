# Computed Extraction

Carries the `vue` skill's "Computed by cost and identity, never by use count" rule — and its
`references/computed-extraction.md` deep dive, which owns what counts as a finding — across the components
written before it.

Supersedes the single-use-computeds sweep, which ran a use-count rule and so inlined expensive derivations
(`marked.parse`, a full-sheet statistics scan) and prop-bound allocations (`:rules`, `:items`, merged prop
objects) alongside the trivial comparisons it was aimed at. Every unit it covered was swept again here, in
**both** directions — extracting what earns a computed and inlining what does not.

The pass was run by candidate shape rather than by reading all ~1,100 files: the three recipes below enumerate
every site matching the three grounds, and each match is then judged against the rule. A miss would have to be an
expression none of the three shapes catches.

Behaviour-preserving except where a fresh `:rules` array was making a Vuetify field re-validate on every render —
restoring the stable reference stops that, which is a fix, not a regression.

| Unit                                      | Swept      | Notes                                                             |
| :---------------------------------------- | :--------- | :---------------------------------------------------------------- |
| `app/components/Message`                  | 2026-08-16 |                                                                   |
| `app/components/Resource`                 | 2026-08-16 |                                                                   |
| `app/components/Styled` + `App`           | 2026-08-16 | Primitives — merged prop objects and rules arrays cluster here    |
| `app/components/Clicker`                  | 2026-08-16 |                                                                   |
| `app/components/Dungeons`                 | 2026-08-16 | Phaser `:configuration` literals — whole-expression trap applies  |
| `app/components` — the rest               | 2026-08-16 |                                                                   |
| `app/pages` + `app/layouts`               | 2026-08-16 |                                                                   |
| `app/composables`                         | 2026-08-16 | A returned computed is the composable's surface, not a find       |
| `app/store`                               | 2026-08-16 | A store's computed is read by consumers it cannot count           |
| `packages/vue-phaserjs`, `packages/infra` | 2026-08-16 | Nothing to change — a walk, a writable computed, and no computeds |

## Find recipe

The old recipe counted identifier occurrences, which is exactly the signal the rule no longer uses. There is no
grep for "does this expression do work" — the pass reads each file. These two locate the candidates worth reading
first, from the repository root:

```bash
# Prop-bound allocations that are not fully static — a literal with a spread, a call, or an identifier value
grep -rnE ':[a-z-]+="(\{[^"]*(\.\.\.|\w+\(|: *[a-z][a-zA-Z0-9]*[ ,}?])|\[[^"]*(\w+\(|\.\.\.))' \
  --include=*.vue packages/app/app | grep -vE ':(style|class)='

# Collection work inlined into a template
grep -rnE '(\{\{|:[a-z-]+=")[^"}]*\.(filter|map|toSorted|sort|reduce|flatMap|join)\(' --include=*.vue packages/app/app

# Every call in a render position, so the pass judges each callee's body rather than a guessed list of names
grep -rnoE '(\{\{[^}]*|:[a-z-]+="[^"]*)\b[a-z][a-zA-Z0-9]*\(' --include=*.vue packages/app/app |
  grep -oE '\b[a-z][a-zA-Z0-9]*\($' | sort -u
```

The third command is the one that matters and the easy one to skip. It deliberately matches **any** callee, not
a `get|format|build|…` prefix set: the first version of this recipe carried that allowlist and missed `emojify`
(a node-emoji lookup), `prettify` (two lookbehind regex passes, four call sites) and `unemojify` (a reverse
lookup over a constant menu) — every one of them work, none of them prefixed. Read the deduped callee list, drop
the CSS functions and framework slot predicates, and open what remains.

All three over-report — `:style="{ color }"` on a plain element binds to no child, `.map` over a two-element
array is not work, and most `getX` helpers are a property read. The rule decides; these only narrow what to open.

They also **under-report**, which is the direction that ends a sweep early. The first two match one line at a
time, so an attribute wrapped across lines by the formatter is invisible to them; the third finds the call but
never the callee's cost, and a helper reached through a store or a slot prop reads like a bare identifier. A
clean grep is the start of the pass, not its result.

## Next enforceable

Nothing here is lintable today. oxlint cannot resolve a template identifier back to its script declaration (the
SFC's two halves are separate ASTs to it), and neither half of the rule is syntactic anyway — "walks a
collection" and "is bound to a prop" both need the other side of the boundary. This stays a reading pass.
