# Component Granularity

Carries `vue-page-composition`'s "Maximal Component Granularity — One Action per Component" across the components written before it, including its `v-for` item-body clause and the page-decomposition rule above it. The simplification sweeps ran the opposite direction — collapsing duplicate components into shared primitives — so a tree dated on that ledger says nothing about this one.

**The `v-for` clause is where [computed-extraction](computed-extraction.md) hands work over.** A loop variable has no script scope, so an expression over it cannot become a `computed` however expensive it is — the computed sweep can only leave a note. Extracting the item body into a component gives that expression a `<script setup>`, and the finding becomes an ordinary extraction there. A row body that calls a helper per render, or calls the same one twice, is therefore a granularity finding first and a computed finding second.

| Unit                                                                                       | Swept      | Notes                                                                      |
| ------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------- |
| `pages/` + `layouts/`                                                                      | 2026-08-16 | The page-decomposition rule: a page holding no element's state             |
| `Resource/Sheet`                                                                           | 2026-08-15 | Find/replace bar split; cell shortcuts moved to a composable               |
| `Message/Model/Message`                                                                    | 2026-08-16 | Forward send button and emoji reaction extracted; poll option row split    |
| `Message/Model/Room`                                                                       | 2026-08-16 | Ban row split; role editor and settings menus are already one unit each    |
| `Message/Content/Call`                                                                     | 2026-08-16 | Health panel's status and device rows became two `v-for`s over one array   |
| `Message/Model/User`                                                                       | 2026-08-16 | Moderation-note row split                                                  |
| `Message` — the rest                                                                       | 2026-08-16 | Friends: one button component per action across the three lists            |
| `Resource` — the rest                                                                      | 2026-08-16 | Selection toolbar's three commands, the Home tab lists, the search row     |
| `Dungeons`                                                                                 | 2026-08-16 | Grid-engine wrappers: shape is the engine's, same ground as the exclusion  |
| `Clicker`                                                                                  | 2026-08-16 | Already config-array driven — the buy-quantity toggle is the allowed group |
| `Post`                                                                                     | 2026-08-16 | The comment editor's save _is_ its responsibility, so the button stays     |
| `Styled` + `App`                                                                           | 2026-08-16 | Primitives — as expected the rule found nothing to split                   |
| `User`, `Achievement`, `Docs`, `Dashboard`, `Dataset`, `FlowchartEditor`, `RichTextEditor` | 2026-08-16 | Docs search row became a real link; the rest are single-responsibility     |
| `Visual`, `Anime`, `About`, `Login`, `Nuxt`, `Transition`, `Fragment.vue`                  | 2026-08-16 | Canvas/animation effects — one concern each, splitting simplifies nothing  |

## Find recipe

```bash
# more than one action button in a file — the rule's loudest failure
grep -rlE "<(v-btn|StyledButton)" --include=*.vue packages/app/app | xargs grep -cE "<(v-btn|StyledButton)" | awk -F: '$2 > 1'
# a v-for whose item body carries its own handler
grep -rn -A 20 "v-for" --include=*.vue packages/app/app | grep "@click"
# a v-for whose item body calls a helper per row — the computed sweep's handover
grep -rn -A 18 'v-for=' --include=*.vue packages/app/app |
  grep -E '\b[a-z][a-zA-Z0-9]*\(' | grep -vE 'onClick|\$emit|emit\('
# repeated list items with no v-for — the array-and-loop rule
for f in $(grep -rl '<v-list-item' --include=*.vue packages/app/app/components); do
  [ "$(grep -c '<v-list-item' "$f")" -ge 3 ] && [ "$(grep -c 'v-for' "$f")" -eq 0 ] && echo "$f"
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

## Next enforceable

An oxlint rule counting `<v-btn>`/`<StyledButton>` per SFC — that one is a pure AST count and would end the first grep above.

The page-state grep does **not** become a rule by banning `ref(`/`computed(`/`useTemplateRef(` under `pages/**`. The rule is that a value belonging to _one interactive element_ moves into that element; a page may hold route-derived state and `<Head>` values, and today every hit is one of those. Deciding between them means following what the value feeds, which is the same judgement the `v-for` item-body clause needs. Both stay reading passes.
