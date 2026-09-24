# UI style

A feature drawing the voxel look by hand instead of through the library: an edge or a line written in steps, the pixel face or a heading drawn by hand, or an icon set named directly — each routed through a rule, a style token or an icon meaning so both design styles draw it.

| Unit                                                                      | Swept | Notes                                                                                 |
| ------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `app/components/Docs`                                                     | —     | the page content's headings, tables and rules; the navigation's guide lines           |
| `app/components/Resource`                                                 | —     | the blade header's and list toolbar's icons, the version history's line               |
| `app/services/resource`                                                   | —     | icon classes a service hands to a component                                           |
| `app/components/Post`, `Achievement`                                      | —     | the comment thread's lines, the leaderboard's separator                               |
| `app/components/App`, `AgentConsole`                                      | —     | the status page's face, the dock's separator, the console's own face                  |
| `app/components/Dashboard`, `FlowchartEditor`, `RichTextEditor`, `Styled` | —     | the canvas controls' rings and the toolbars' dividers                                 |
| `app/components/Message`                                                  | —     | migrated leak-free by the page migration's messaging units, which own these files now |
| `app/pages`, `app/layouts`                                                | —     | the privacy policy's headings                                                         |

## Exclusions

- `app/components/Ui`, `app/services/ui/UiIconMap.ts`, `configuration/UiStyleMap.ts` — the library and the style tier are where a style's drawing belongs.
- A length in steps that sizes or spaces something — a padding, a gap, a height — is the layout tier's, the same in every style; only an edge's or a line's width is drawing.

## Find recipe

```bash
git grep -nE "(shadow|border)[^;]*--ui-step|(shadow|b)=\"\[[^\"]*--ui-step" -- apps/web/app ':!apps/web/app/components/Ui'
git grep -nE "bg-border[^>]*\b(h|w)-1\b|\b(h|w)-1\b[^>]*bg-border" -- apps/web/app ':!apps/web/app/components/Ui'
git grep -nE "ui-font-pixel|VT323" -- apps/web/app
git grep -n "i-pixelarticons:" -- apps/web/app ':!apps/web/app/services/ui/UiIconMap.ts'
```

## Next enforceable

- The last recipe line, as an oxlint restriction on the `i-pixelarticons:` string outside `UiIconMap` once the tree is clean.
