# Dashboard grid controls

The grid package places items and runs their gestures; the dashboard draws them. This change draws what the package already builds and that the editor did not show: every edge and corner of resize, a palette drop, a keyboard step, grow-to-content, the layout settings, and a drop preview. Each control is shown only where its use earns it, so the editor is the canvas and its occasional commands sit one step away.

## Surface

Every visible control of the dashboard, in the editor and on the published page, with the task it serves, how often it is used, where it lives and why it is there. A control that cannot answer all five is removed rather than shown.

| Control                | Task it serves                                                                   | How often          | Where it lives                                             | Why there                                                                                                              |
| :--------------------- | :------------------------------------------------------------------------------- | :----------------- | :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Visual count           | Says how much the canvas holds                                                   | every edit         | editor header, left                                        | Reads before the one action; the header is the canvas's bar                                                            |
| Add visual             | Adds an area visual at the first free cell                                       | every edit         | editor header, right, the one accent action                | The only primary action on the surface, so the eye finds it first                                                      |
| Layout                 | Sets how visuals pack and what a drop does                                       | rarely             | editor header, quiet, a popover                            | A setting of the whole canvas belongs in its bar, and a popover keeps it one click away without taking the grid's room |
| Visuals palette        | Chooses a visual type to drop or press                                           | sometimes          | a collapsible panel above the grid                         | Types are chosen where they land; above the grid, a row of chips costs no width                                        |
| Palette tile           | Adds a visual of its type                                                        | sometimes          | a tile in the palette panel                                | Dragging lands it where dropped; pressing or activating it is the touch and keyboard path                              |
| Visual menu (⋯)        | Holds a visual's occasional actions: edit, duplicate, export, fit height, delete | sometimes          | the top-right corner of each editor visual, always shown   | One place for the occasional actions; always shown because a touch screen has no hover to reveal it                    |
| Edit visual            | Opens the visual's edit form                                                     | every edit         | the visual itself, by press or Enter; also the menu        | Pressing a visual is how it is opened, so it needs no button; the menu repeats it for those who look there             |
| Resize handles         | Resize from the eight edges and corners                                          | every edit         | the visual's edges and corners, drawn on hover or focus    | The cursor and an outline say "resizable"; permanent dots would clutter every visual                                   |
| Copy link to this view | Shares the reader's view of one visual                                           | rarely             | the visual's corner, in both views                         | The visual is drawn by one renderer in both views, so the mark stays where the reader already finds it                 |
| Refresh data           | Re-reads a bound visual's rows                                                   | sometimes          | the visual's corner, when bound and live                   | Shown only where a read exists to refresh                                                                              |
| Export CSV             | Downloads a bound visual's rows                                                  | sometimes          | the published visual's corner; the editor's menu           | A viewer's download stays on the page; in the editor it is occasional, so it waits in the menu                         |
| Fit height to content  | Takes a table's rows from its content                                            | sometimes          | the visual's menu, tables only                             | Only a table has content that sets its height, so no chart carries the item                                            |
| Duplicate visual       | Copies a visual beside itself                                                    | sometimes          | the visual's menu                                          | Occasional, and beside the visual's own menu                                                                           |
| Delete visual          | Removes a visual after confirmation                                              | rarely             | the visual's menu, marked as danger, then a confirm dialog | Destructive, so it is off the visual's face and asks first                                                             |
| Keyboard step          | Moves or resizes a focused visual                                                | sometimes          | no control; listed in the shortcuts dialog                 | Keys need no chrome; the dialog is where the keys are listed                                                           |
| Empty state            | Says how to add the first visual                                                 | once per dashboard | the grid's place when there are no visuals                 | Says what the header and palette do, so nothing is left to guess                                                       |

Nothing else is visible. The published page keeps its title, Export PNG and the visuals; the palette, the Layout control, the visual menu and the keys do not render for a viewer.

### Layout, desktop and phone

On desktop the editor is a header over the canvas. The header holds the count, Layout and Add visual on one row. Beneath it the palette panel is open by default, a row of type chips that wraps, and the grid takes the full width at twelve columns. Each visual shows its menu mark at the top right and its handles on hover.

On a phone, the header keeps the same three marks, and the count truncates before a control does. The palette panel is closed by default, so the grid, not the chips, is the first thing on the screen; the reader opens it to add a visual. The grid keeps twelve columns, since the editor's cell size is the same on every width and a narrower grid would change where saved visuals land. The Layout popover is a popover anchored to its mark and sized to the viewport with `min()`, never a sheet. Visual menus stay visible on touch, since no hover exists there to reveal them. Handles are not drawn on a touch screen: the press on a visual's edge is its move, and resizing on a phone is done from the menu's fit height or the keyboard.

### States

- **Empty dashboard.** The empty state names both ways to add a visual: the header's Add visual, and dropping a palette tile on the grid.
- **Drag in progress.** The pressed visual lifts above the others with a lifted shadow and follows the pointer; the other visuals move aside as the push or swap setting says.
- **Drop target.** The placeholder is drawn in the accent tint over the cell the visual would land on, the cell after any compaction.
- **Invalid drop.** Under block overlap the placeholder is drawn in the error tint at the attempted cell, and the release changes nothing, so the refusal is visible before the release.
- **Resize.** The visual resizes live with its edge; the placeholder outlines the cell it would take, and a visual is never smaller than one cell.
- **Small visual where handles overlap.** Corners take priority: a corner handle is a square at the corner, and the edge handles are inset by a corner's length, so a visual too small for both loses its edge handles and keeps its corners. The keyboard reaches every size.
- **Loading and error.** A bound visual's skeleton and error state are the visual's own, unchanged.

### Keyboard model

The editor's visuals are tab stops in their order. Tab moves between them, Enter opens the focused visual's edit form, the arrow keys move it one cell, and Shift with an arrow key resizes it one cell from its bottom-right corner. Each step is saved as it is made, so there is no pick-up mode to cancel. A step that would leave the grid, or land on another visual under block overlap, changes nothing. The keys are the grid's own, listed as two rows in the shortcuts dialog and never bound as global shortcuts, so they do nothing while a field has focus.

## How it works

`Grid/Index.vue` binds `useGridLayout` to the visuals, the column count, the row height and the dashboard's collision and compaction settings. Each visual is a `Grid/Tile.vue`, which carries eight handles, the keyboard step and, for a table with fit height on, its own measured height. The palette and Layout control live beside the grid in the editor only.

A press on a visual's edge or corner is a gesture of the package, and the grid previews the layout it would leave. A drop from the palette is the package's external drag: the grid previews the landing cell and refuses it under block overlap. A release that is not refused hands the store the cell the package placed the new visual in, and the package commits the visuals that drop pushed, once. A keyboard step is a single placement committed at once. The editor writes each committed change into the visual store, which autosaves the dashboard.

Fit height is a flag on the visual. A tile whose visual fits its height has no fixed height of its own; the tile measures what its table draws and reports it, and the package takes the whole rows that hold it, as one commit.

The layout settings are two fields on the dashboard's content, each a closed set with a default: how items pack, and how a drop on another item resolves. A stored dashboard without them reads with the defaults, so no migration is needed. The published view passes the same two settings to the same grid.

```mermaid
flowchart TD
  P["Palette tile pressed or dropped"] -->|"drop over the grid, at the cell the grid placed it in"| SD["The store saves the dropped visual at that cell"]
  P -->|"drop over the grid"| G["Grid commits the visuals a drop pushed, once"]
  P -->|"press or Enter"| S["The store adds the type at the first free cell"]
  K["Focused visual: arrows or Shift and arrows"] -->|"one placement per step"| G
  H["Edge or corner pressed"] -->|"gesture, released"| G
  L["Layout popover"] -->|"save, revert on refusal"| D["Dashboard content: packing and collision"]
  G --> V["Visual store writes each change, autosave"]
  D --> GR["Grid reads the settings"]
  GR --> G
```

## Decisions

- **Handles are drawn on hover or focus, not permanently.** Eight permanent dots on every visual were rejected: they are the noisiest thing on the canvas and say nothing a cursor and an outline do not say.
- **The palette is a panel above the grid, closed by default on a phone.** A sidebar was rejected: it takes a column of a phone's narrow width, and on a desktop it competes with the grid's twelve columns. A row above the grid wraps and collapses.
- **Add visual stays the one accent action.** Making the palette the primary action was rejected: the palette chooses a type, and the common case is one default visual, which the accent button already adds.
- **The occasional actions wait in one menu.** A row of buttons on every visual was rejected for the menu the reader already knows from a list. Delete asks first and is marked as danger.
- **Layout is a popover, not a panel.** A panel in the editor would be permanent chrome for a setting used rarely; the popover is one click away and closes when done.
- **The keyboard steps the visual, with no pick-up mode.** A pick-up, move and drop mode was rejected: each step is already a complete, valid placement, so saving each one needs no cancel, and a mode needs more announcement than a step.
- **Fit height measures the tile, not the chart.** A chart's height is its own choice, so only a table, whose rows set its height, offers the item.
- **Copy link and Refresh stay on the visual's corner in the editor.** Removing them from the editor needed a second visual renderer or a prop that the one renderer would carry to every caller; they are the visual's own marks, and the editor's corner has room for three.
- **A new item's cell is the grid's own placement.** The palette does not compute its cell: the package does, so the drop, the press and the refusal agree.
- **The grid package drops cross-grid moves and nested presses.** Nothing draws either, and the dashboard shows one grid at a time. Keeping them meant a registry and a routing branch with no consumer. The palette drop keeps the registry it needs.

## Not built

- **Move to page.** The dashboard has no pages to move a visual to: its content is one list of visuals, and pages were decided against in `openspec/rejected/resource/dashboard-pages/design.md`, since a page would be a second dashboard inside the explorer's own hierarchy. Reopening that decision is out of this change.
- **A group visual that holds its own grid.** The dashboard's content is a flat list: `Visual` has no children, the visual store addresses a visual by its id at the top level, and the published transform walks one level for its snapshots. A group needs a recursive visual schema, store writes addressed by path, and a nested grid bound to its children. That is the missing piece; it belongs in a roadmap item, since the package's nested press is removed until a group exists.

## Notes

- The Layout control and the palette are editor-only, and are not built into the published view, so the viewer's page holds no control that the editor's would need.
- The package's collision and compaction names are its own (`CollisionMode`, `CompactType`); the labels a reader sees are the plain words in the Surface table.

## Key files

| File                                                                  | Role                                                                                  |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `packages/vue-grid-layout-headless/src/composables/useGridLayout.ts`  | The gestures, the keyboard step, the external drop preview and the auto-height report |
| `packages/vue-grid-layout-headless/src/services/startExternalDrag.ts` | A palette press that previews and drops onto the grid under the pointer               |
| `packages/vue-grid-layout-headless/src/placement/getFirstFreeCell.ts` | The first cell a new visual's span fits in                                            |
| `apps/web/app/components/Dashboard/Grid/Index.vue`                    | The grid: binds the package, emits the commit, holds the keyboard commands            |
| `apps/web/app/components/Dashboard/Grid/Tile.vue`                     | One visual's tile: eight handles, the keyboard step, the fit-height measure           |
| `apps/web/app/components/Dashboard/Palette/Index.vue`                 | The collapsible palette of visual types                                               |
| `apps/web/app/components/Dashboard/Editor/Layout.vue`                 | The Layout popover: two radio groups                                                  |
| `apps/web/app/components/Dashboard/Editor/Header.vue`                 | The count, Layout and Add visual                                                      |
| `apps/web/app/components/Dashboard/Editor/Content.vue`                | The editor binding: writes each commit, adds a dropped visual                         |
| `apps/web/app/components/Dashboard/Visual/Preview/Container.vue`      | The editor's visual wrapper: the one menu                                             |
| `apps/web/app/components/Dashboard/Visual/Preview/ActionsMenu.vue`    | The visual's menu: edit, duplicate, export, fit height, delete                        |
| `apps/web/app/components/Dashboard/Index.vue`                         | The published view: the saved packing, no editing control                             |
| `apps/web/app/store/dashboard/visual.ts`                              | Create at the first free cell, add, and the auto-height write                         |
| `apps/web/app/store/dashboard/index.ts`                               | The layout settings write, reverted on a refused save                                 |
| `apps/web/shared/models/dashboard/data/Dashboard.ts`                  | The content's packing and collision settings, with their defaults                     |
| `apps/web/shared/models/dashboard/data/Visual.ts`                     | The visual's fit-height flag, with its default                                        |

## Sources

- [WAI-ARIA Authoring Practices, keyboard interface for grids and sortable lists](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/): a focusable item with arrow keys to reposition it, and the one-step commit the model uses.
- [Pointer Events, W3C](https://www.w3.org/TR/pointerevents/): pointer capture for the palette press and the touch path.
