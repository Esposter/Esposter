# Editor compact chrome

A palette is the same thing in every editor, a set of kinds the reader picks from, so it is one component fed by a keyed map, and the chrome around it takes one density.

```mermaid
flowchart LR
  MAP["map keyed by every kind: category, title, icon"] --> SHELL["palette shell"]
  QUERY["search text"] --> SHELL
  SHELL --> GROUPS["groups, collapsible, filtered"]
  GROUPS --> TILE["tile: icon and title"]
  TILE -->|"click"| INSERT["insert"]
  TILE -->|"pointer down"| DRAG["drag session"]
```

## Decisions

- **Categories and icons live in the app, keyed by every kind.** The typecheck then holds each map complete, as the page builder's icon maps already do. Rejected: a category and an icon on the headless packages' kind definitions, which the survey runner and the publish render never read.
- **The survey's groups are by what the reader asks.** Text, Choice, Scale and ranking, Grids and repeats, Content and Layout, each holding the kinds that answer the same question. Rejected: the earlier "Input" and "Choice grids and lists", which put a ranking beside a dynamic panel and unlike kinds in one list.
- **One palette shell, two feeds.** The palette shell takes groups of `{ kind, title, icon }`, filters by title, collapses a group and emits an insert and a drag start, and it is the content of the survey's Add tab and the page builder's Blocks tab. The whiteboard has no palette and no search: its kinds are its toolbar's, with the shapes in one slot, so there is nothing to filter. A label that is one long word wraps at a slash, and a tile's side padding is tight, so no label spills over its neighbour. Rejected: a search in each editor's own palette, which is what drifted. Rejected: the whiteboard's palette and its search beside its toolbar, which is two places to look for the one thing a freeform editor is for.
- **The whiteboard's properties panel opens over the canvas.** It floats over the canvas edge, below the toolbar's row so a narrow canvas never puts the two on each other, and a selection changes nothing beneath it. On a compact window the strip below the canvas, which holds the buttons that open the sheets, is the one thing a selection adds to the flow, and it moves only the canvas's bottom edge. The page builder's and the survey's panes are regions of the editor shell: a column beside the canvas on an expanded window and a sheet opened from a button below the canvas on a compact or medium one. Rejected: keeping each editor's panes in fixed places, which no check can read, which repeats the same responsive rules once per editor, and which on a compact window swapped the canvas away to show one pane. Rejected: reflowing the canvas, which moves the thing the reader just selected.
- **The survey canvas has a readable width.** Its questions are capped at a measure a form is read at and centred, and the structure and inspector regions beside it keep the rest. Rejected: filling the centre, which stretches a text field across the screen.
- **Density comes from tokens.** Tab panels, toolbars and sectors use the UI library's spacing, and the shared tab panel's top padding is the tighter one for every panel.
- **Overflow folds into one menu.** A toolbar that cannot fit its controls keeps the primary ones and moves the rest into a menu, rather than wrapping or scrolling, and an occasional command can be flagged to stay in the menu at every width. The survey's bar and the whiteboard's toolbar, which holds every tool, are the two that need the fold, and both fold through the shell's one toolbar. The page builder's device toggle is a few icon buttons that fit any width an editor opens at, so it sits in the bar of the webpage and email editors at any width.

## Key files

| Path                                                              | Role                                             |
| :---------------------------------------------------------------- | :----------------------------------------------- |
| `apps/web/app/components/Ui/Palette/Index.vue`                    | the palette shell: groups, collapse, search      |
| `apps/web/app/services/resource/survey/getSurveyPaletteGroups.ts` | the survey's groups, from the icon map           |
| `apps/web/app/components/Resource/Survey/Creator/Palette.vue`     | the survey palette                               |
| `apps/web/app/components/PageBuilder/Palette.vue`                 | the page builder palette                         |
| `apps/web/app/components/Resource/Whiteboard/Editor.vue`          | the whiteboard editor, drawn by the editor shell |
| `apps/web/app/components/Editor/Toolbar.vue`                      | the toolbar a tool region draws, with its fold   |
| `apps/web/app/components/Resource/Survey/Creator/Toolbar.vue`     | the survey's bar, drawn by the shared toolbar    |
| `apps/web/app/components/Ui/Tabs.vue`                             | the shared tab panel and its padding             |

## Sources

- The page builder's [canvas design](../page-builder/canvas/design.md) and the survey Creator's [design](../survey-creator/design.md), whose layouts this tightens.
