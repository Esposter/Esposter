# Computed Extraction

Carries the `vue` skill's "Computed by cost and identity, never by use count" rule — and its
`references/computed-extraction.md` deep dive, which owns what counts as a finding — across the components
written before it.

Supersedes the single-use-computeds sweep, which ran a use-count rule and so inlined expensive derivations
(`marked.parse`, a full-sheet statistics scan) and prop-bound allocations (`:rules`, `:items`, merged prop
objects) alongside the trivial comparisons it was aimed at. Every unit it covered is unswept again here: the pass
runs in **both** directions, extracting what earns a computed and inlining what does not, so a unit is only done
once both have been applied to it.

Behaviour-preserving except where a fresh `:rules` array was making a Vuetify field re-validate on every render —
restoring the stable reference stops that, which is a fix, not a regression.

| Unit                                      | Swept | Notes                                                            |
| :---------------------------------------- | :---- | :--------------------------------------------------------------- |
| `app/components/Message`                  |       |                                                                  |
| `app/components/Resource`                 |       |                                                                  |
| `app/components/Styled` + `App`           |       | Primitives — merged prop objects and rules arrays cluster here   |
| `app/components/Clicker`                  |       |                                                                  |
| `app/components/Dungeons`                 |       | Phaser `:configuration` literals — whole-expression trap applies |
| `app/components` — the rest               |       |                                                                  |
| `app/pages` + `app/layouts`               |       |                                                                  |
| `app/composables`                         |       | A returned computed is the composable's surface, not a find      |
| `app/store`                               |       | A store's computed is read by consumers it cannot count          |
| `packages/vue-phaserjs`, `packages/infra` |       |                                                                  |

## Find recipe

The old recipe counted identifier occurrences, which is exactly the signal the rule no longer uses. There is no
grep for "does this expression do work" — the pass reads each file. These two locate the candidates worth reading
first, from the repository root:

```bash
# Prop-bound allocations: an object, array or call result built inline in a binding
grep -rnE ':[a-z-]+="(\[|\{|mergeProps\()' --include=*.vue packages/app/app

# Work inlined into a template: a call on a collection, or a known-expensive helper
grep -rnE '\{\{[^}]*\.(filter|map|sort|reduce|toSorted)\(|marked\.parse|compute[A-Z]\w*\(' \
  --include=*.vue packages/app/app
```

Both over-report — a `:style="{ color }"` on a plain element binds to no child, and `.map` over a two-element
array is not work. The rule decides; these only narrow what to open.

## Next enforceable

Nothing here is lintable today. oxlint cannot resolve a template identifier back to its script declaration (the
SFC's two halves are separate ASTs to it), and neither half of the rule is syntactic anyway — "walks a
collection" and "is bound to a prop" both need the other side of the boundary. This stays a reading pass.
