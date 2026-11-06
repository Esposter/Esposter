# Editor compact chrome

## Why

The survey palette is twenty full-width text buttons with no icons and no search, the page builder's palette is a flat grid, and the whiteboard's items have no icons or search either. Every editor spends its panes on padding: the survey canvas fills the whole centre with no readable width, the side panes are fixed pixel widths, the properties column of the whiteboard moves the canvas whenever a selection appears, every tab panel opens with the same top padding, and the page builder's style panel opens thirty-seven properties at once.

## What Changes

Every editor's palette is grouped, iconed and searchable, and the chrome is one compact density.

- The survey kinds are grouped as Text, Choice, Scale and ranking, Grids and repeats, Content and Layout, each kind with an icon, from a map in the app keyed by every kind.
- Each palette has a search field that filters across its groups, and its groups collapse; a narrow palette shows one tile per row, a wide one a grid.
- The survey canvas has a readable width, and the page builder's and whiteboard's panes open over the canvas, not beside it, so a selection never moves it.
- Tab panels, toolbars and sectors take one spacing from the UI library's tokens, and a toolbar that cannot fit folds its overflow into one menu.
- The page builder's style panel opens its first sector and collapses the rest.

## Capabilities

- **resource/editor-compact-chrome** (new)

## Impact

The survey palette's groups and icons move into one keyed map, the three palettes gain a shared search and grouping shell, and the shared tab panel's padding and the editors' pane widths change.
