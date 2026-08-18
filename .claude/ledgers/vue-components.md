# Vue Components

The two reading rules that decide a component tree's shape, carried across the components written before them.
Standing: a unit's date says both held there on that date, and the pass resumes from the files changed since.

Consolidates the former **component-granularity** and **computed-extraction** ledgers. They always ran over the
same files and handed work to each other in both directions, so reading a tree twice only meant reading it twice.

## Rules

| Rule                                                     | Owner                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| Maximal component granularity — one action per component | `vue-page-composition`, incl. its `v-for` item-body clause |
| Computed by cost and identity, never by use count        | `vue`, `references/computed-extraction.md`                 |

**They meet at the `v-for` item body, which is why they are one ledger.** A loop variable has no script scope, so
an expression over it cannot become a `computed` however expensive it is. Extracting the item body into a
component gives that expression a `<script setup>`, and the finding becomes an ordinary extraction there. A row
body that calls a helper per render, or the same one twice, is a granularity finding first and a computed
finding second — under one ledger that is a single decision instead of a note handed between two.

Both directions are in scope: extract what earns a computed, inline what does not; split what holds two actions,
leave what holds one. The simplification sweeps ran the _opposite_ direction on granularity — collapsing
duplicate components into shared primitives — so a tree dated there says nothing about this ledger.

Behaviour-preserving, except that restoring a stable `:rules` reference stops a Vuetify field re-validating
every render. That is a fix, not a regression.

Every row resets when a rule joins this table. Granularity and computed extraction each last ran across every
unit on 2026-08-15/16, before the emoji picker landed.

| Unit                                                                                       | Swept | Notes                                                                     |
| ------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------- |
| `pages/` + `layouts/`                                                                      |       | The page-decomposition rule: a page holding no element's state            |
| `Message/Model/Message`                                                                    |       | Gained the reaction hover card and Reactions dialog                       |
| `Message/Model/Room`                                                                       |       |                                                                           |
| `Message/Model/User`                                                                       |       |                                                                           |
| `Message/Content/Call`                                                                     |       |                                                                           |
| `Message` — the rest                                                                       |       |                                                                           |
| `Resource/Sheet`                                                                           |       |                                                                           |
| `Resource` — the rest                                                                      |       |                                                                           |
| `Styled` + `App`                                                                           |       | Primitives; `Styled/EmojiPicker` was written under both rules             |
| `Dungeons`                                                                                 |       | Grid-engine wrappers: shape is the engine's, same ground as the exclusion |
| `Clicker`                                                                                  |       | Already config-array driven                                               |
| `Post`                                                                                     |       |                                                                           |
| `User`, `Achievement`, `Docs`, `Dashboard`, `Dataset`, `FlowchartEditor`, `RichTextEditor` |       |                                                                           |
| `Visual`, `Anime`, `About`, `Login`, `Nuxt`, `Transition`, `Fragment.vue`                  |       | Canvas/animation effects — one concern each                               |
| `app/composables`, `app/store`                                                             |       | Computed rule only; a returned computed is the surface, not a find        |

## Find recipe — granularity

```bash
# more than one action button in a file — the rule's loudest failure
grep -rlE "<(v-btn|StyledButton)" --include=*.vue packages/app/app | xargs grep -cE "<(v-btn|StyledButton)" | awk -F: '$2 > 1'
# a v-for whose item body carries its own handler
grep -rn -A 20 "v-for" --include=*.vue packages/app/app | grep "@click"
# a v-for whose item body calls a helper per row — the computed sweep's handover
grep -rn -A 18 'v-for=' --include=*.vue packages/app/app |
  grep -E '\b[a-z][a-zA-Z0-9]*\(' | grep -vE 'onClick|\$emit|emit\('
# repeated list items with no v-for — the array-and-loop rule. The trailing [ >] matters: without it
# every v-list-item-title and -subtitle counts as another row and each single-row shell reads as a hit
for f in $(grep -rlE '<v-list-item[ >]' --include=*.vue packages/app/app/components); do
  [ "$(grep -cE '<v-list-item[ >]' "$f")" -ge 3 ] && [ "$(grep -c 'v-for' "$f")" -eq 0 ] && echo "$f"
done
# a dialog mounted per row
grep -rn -A 25 'v-for=' --include=*.vue packages/app/app | grep -E '<(v-dialog|v-menu)'
# a page or layout owning an element's state
grep -rlE "\b(ref|computed|useTemplateRef)\(" --include=*.vue packages/app/app/pages packages/app/app/layouts
```

Both greps fire on shape, so read what a hit feeds before calling it a finding. The last one's current hits are
all allowed: a `<Head><Title>` computed and route orchestration in `pages/`, and in `layouts/` the fixed-layout
measurements and the drawer-open flags — a flag shared by a hamburger and the drawer it opens belongs to their
common ancestor, which is the layout. The `-A 18` window on the loop greps is a false-negative boundary: an item
body longer than that is only reached by reading the file.

On the third: the same helper called **twice** in one row body is the strongest signal, because extracting the
row collapses both calls into one `computed`. A row already rendering a single child component is not a finding —
the body is extracted; if that child's props are rebuilt per row, the fix is hoisting the props to one keyed
`computed` in the parent, not another component.

## Exclusions

- `app/assets/dashboard/demo/icon/*.vue` — chart-icon SVG markup with no script block, so there is no responsibility to split.
- `packages/vue-phaserjs` — engine wrappers whose shape is fixed by Phaser's object model, not app UI.

## Find recipe — computed extraction

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

The first recipe's largest cluster is the `Dungeons` `:configuration` literals, and none of them is a finding:
`useInitializeGameObjectSetters` watches `() => configuration[key]` **per key**, so the wrapper never reads the
object's identity and a fresh one costs nothing. Its siblings in that list are static literals, which the
compiler hoists. What remains after those two are subtracted is the real set.

They also **under-report**, which is the direction that ends a sweep early. The first two match one line at a
time, so an attribute wrapped across lines by the formatter is invisible to them; the third finds the call but
never the callee's cost, and a helper reached through a store or a slot prop reads like a bare identifier. A
clean grep is the start of the pass, not its result.

## Exclusions

- `app/assets/dashboard/demo/icon/*.vue` — chart-icon SVG markup with no script block, so there is no responsibility to split.
- `packages/vue-phaserjs`, `packages/infra` — engine wrappers whose shape is fixed by Phaser's object model, not app UI.

## Next enforceable

An oxlint rule counting `<v-btn>`/`<StyledButton>` per SFC is a pure AST count and would end the first
granularity grep.

Nothing else here is lintable. The page-state grep does **not** become a rule by banning `ref(`/`computed(`
under `pages/**`: a page may hold route-derived state and `<Head>` values, and today every hit is one of those,
so deciding between them means following what the value feeds. Computed extraction is worse — oxlint cannot
resolve a template identifier back to its script declaration (the SFC's two halves are separate ASTs to it), and
neither half of that rule is syntactic anyway, since "walks a collection" and "is bound to a prop" both need the
other side of the boundary. Both stay reading passes.
