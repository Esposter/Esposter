# Component Granularity

Carries `vue-page-composition`'s "Maximal Component Granularity — One Action per Component" across the components written before it, including its `v-for` item-body clause and the page-decomposition rule above it. The simplification sweeps ran the opposite direction — collapsing duplicate components into shared primitives — so a tree dated on that ledger says nothing about this one.

| Unit                                                                                       | Swept      | Notes                                                          |
| ------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------- |
| `pages/` + `layouts/`                                                                      | 2026-08-15 | The page-decomposition rule: a page holding no element's state |
| `Resource/Sheet`                                                                           | —          |                                                                |
| `Message/Model/Message`                                                                    | —          |                                                                |
| `Message/Model/Room`                                                                       | —          |                                                                |
| `Message/Content/Call`                                                                     | —          |                                                                |
| `Message/Model/User`                                                                       | —          |                                                                |
| `Message` — the rest                                                                       | —          |                                                                |
| `Resource` — the rest                                                                      | —          |                                                                |
| `Dungeons`                                                                                 | —          |                                                                |
| `Clicker`                                                                                  | —          |                                                                |
| `Post`                                                                                     | —          |                                                                |
| `Styled` + `App`                                                                           | —          | Primitives — the rule bites least here, so they go late        |
| `User`, `Achievement`, `Docs`, `Dashboard`, `Dataset`, `FlowchartEditor`, `RichTextEditor` | —          |                                                                |
| `Visual`, `Anime`, `About`, `Login`, `Nuxt`, `Transition`, `Fragment.vue`                  | —          |                                                                |

## Find recipe

```bash
# more than one action button in a file — the rule's loudest failure
grep -rlE "<(v-btn|StyledButton)" --include=*.vue packages/app/app | xargs grep -cE "<(v-btn|StyledButton)" | awk -F: '$2 > 1'
# a v-for whose item body carries its own handler
grep -rn -A 20 "v-for" --include=*.vue packages/app/app | grep "@click"
# a page owning an element's state
grep -rlE "\b(ref|computed|useTemplateRef)\(" --include=*.vue packages/app/app/pages
```

## Exclusions

- `app/assets/dashboard/demo/icon/*.vue` — chart-icon SVG markup with no script block, so there is no responsibility to split.
- `packages/vue-phaserjs` — engine wrappers whose shape is fixed by Phaser's object model, not app UI.

## Next enforceable

An oxlint rule counting `<v-btn>`/`<StyledButton>` per SFC, and one banning `ref(`/`computed(`/`useTemplateRef(` under `pages/**`. Both are template/AST-shaped and would end the two find-recipe greps above; the `v-for` item-body clause needs judgement and stays a reading pass.
