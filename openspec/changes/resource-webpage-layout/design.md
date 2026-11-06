# Webpage layout

The webpage editor on the [editor shell](../resource-editor-shell/design.md), the program's middle case. It is a part of the [editor layout program](../resource-editor-layout-program/design.md) and it changes the arrangement of the page builder's webpage editor, not its [canvas](../../specs/resource/page-builder/canvas/design.md), its [style panel](../../specs/resource/page-builder/style-panel/design.md) or its [critique](../../specs/resource/page-builder/critique/design.md).

A webpage is guided by its block tree, where each slot accepts some kinds, and free within it, since a page has no mail client to satisfy. Its findings, a low contrast or a fixed width, tell the author what to improve and never stop a save. So the layout is the email's shape without a compile to wait for, and with a theme.

## How it works

| Region    | Edge        | Opens        | Holds                                                                   |
| :-------- | :---------- | :----------- | :---------------------------------------------------------------------- |
| Bar       | top, docked | always       | the device toggle and the problems surface                              |
| Blocks    | start       | on demand    | tabs Blocks and Layers: the palette and the layers tree                 |
| Inspector | end         | with content | the selection's tabs, below                                             |
| Canvas    | the rest    | always       | the frame that draws the page, with the node toolbar over the selection |

With nothing selected the inspector shows two tabs, Page and Theme: the page's own settings and the theme's tokens. With a node selected it shows Content and Style, where Style edits the node's values for the device width the toggle has chosen. The critique's findings are listed in the problems surface as warnings, each naming its node, and choosing one selects the node. The Check tab is removed, since its content is the problems surface's.

```mermaid
flowchart TD
  SELECT["the selection: nothing or a node"] --> TABS{"which inspector tabs?"}
  TABS -->|nothing| PAGE["Page and Theme"]
  TABS -->|a node| NODE["Content and Style, for the chosen device width"]
  DOC["the document"] --> CRITIQUE["the critique walks it"]
  CRITIQUE --> FINDINGS["warnings, each with its node"]
  FINDINGS --> SURFACE["the problems surface in the bar"]
  SURFACE -->|"choose one"| SELECTNODE["its node is selected"]
  TOGGLE["the device toggle in the bar"] --> FRAME["the frame's width"]
  TOGGLE --> NODE
```

**The device toggle is in the bar.** It chooses the width the frame draws at and the breakpoint the Style tab edits, so it governs two regions and belongs above both, not floating on the canvas. Its three widths are the ones the style panel already edits.

**A compact window** keeps the canvas and opens Blocks and the inspector as sheets from their buttons.

## Decisions

- **The inspector's tabs follow the selection.** A page-wide theme next to a paragraph's content invites editing the wrong thing. Rejected: four tabs for every selection.
- **The Check tab becomes the problems surface.** A count in the bar is seen without opening anything, and one place lists findings across editors. Rejected: a tab seen only when opened, which an author must remember to open.
- **Findings stay warnings.** The critique reports what to improve before publishing, and it computes from the document, so it is advisory. A warning never refuses a save. Rejected: gating a save on contrast, which turns a design judgement into a rule the author cannot override.
- **The device toggle governs the bar, not the canvas.** It sets the frame's width and the Style tab's breakpoint. Rejected: the toggle over the canvas, which hid that it also sets which values the Style tab edits.
- **Layers keeps its tab.** The tree is the keyboard path to every move, as the canvas design settles, and a webpage nests deeper than an email.
- **The webpage uses the page builder's editor type.** The shell keys each editor's reader state by `EditorType`, and the webpage and the email are one page builder, so the webpage keeps `EditorType.PageBuilder` rather than a member of its own. The two share region ids, and the shell's parse drops whatever a layout does not name. Rejected: a webpage member, which would split one page builder's sizes in two, and which the email's change would then have to match. Whether the email gets a member of its own is that change's call.
- **A region with several panels draws them as tabs, through the shell.** The Blocks region's two tabs and the settings' tabs chosen by the selection need one tab strip, and the shell had none, so it draws a tab list over a region's present panels and sets the reader's active panel when a tab is chosen. A tab's title comes from a map keyed by panel id, beside the region-name map, since a layout names no text. Rejected: a tab strip inside each editor's content, which would hand the one arrangement back to every editor. The shell's own design does not yet state this; the shell change owes it.
- **A medium window draws the side regions as sheets too.** Two columns of the default width leave the canvas about 80 pixels at the medium class's narrowest edge, so the page's drawers' band is the band where these become sheets. Rejected: docked columns at medium, which leave no canvas to edit in.
- **The bar is held at one size.** The shell draws a docked region with a handle, and the bar holds one row of controls, so its minimum and maximum are its default size and the handle has nothing to move. Rejected: a bar that resizes, which would resize the row of controls. The shell owes a region with no handle, which this change does not add.
- **Leaving a text edit shows the Layers tab before it focuses the row.** The row is a node of the tree, and the tree is the Layers tab, which the shell draws only while it is the active tab, so the edit's return selects that tab first. Rejected: focusing the canvas instead, which would move the reader off the node the edit was on.
- **The email keeps its arrangement until its change lands.** The shared page builder host takes its layout from the editor it is mounted for, so the email's layout states what the email shows today, with no theme and no check, and its own change refines it. Rejected: leaving the shared host on the old panes for the email, which keeps two arrangements in one file.

## Not in this change

- **New critique rules and a publish gate.** The critique's rules and the publish flow are as they are.
- **A different canvas.** The same-origin frame, its overlays and its node toolbar are unchanged.

## Key files

| File                                                             | Role                                                             |
| :--------------------------------------------------------------- | :--------------------------------------------------------------- |
| `apps/web/app/components/PageBuilder/Editor.vue`                 | the page builder host, drawn on the shell with its layout        |
| `apps/web/app/services/pageBuilder/webpageLayout.ts`             | the webpage's layout: the settings tabs chosen by the selection  |
| `apps/web/app/services/pageBuilder/pageBuilderLayout.ts`         | the regions, panels and names both page builder layouts share    |
| `apps/web/app/components/PageBuilder/Bar.vue`                    | the bar: the device toggle and the problems surface              |
| `apps/web/app/components/Editor/Problems.vue`                    | the problems surface the bar draws                               |
| `apps/web/app/components/Editor/Shell.vue`                       | the shell, which draws the regions and now their tabs            |
| `apps/web/app/components/PageBuilder/Palette.vue`                | the palette, registered as the Blocks tab                        |
| `apps/web/app/components/PageBuilder/Layers.vue`                 | the layers tree, registered as the Layers tab                    |
| `apps/web/app/components/PageBuilder/Canvas/DeviceToggle.vue`    | the device toggle, which moves into the bar                      |
| `apps/web/app/composables/pageBuilder/usePageBuilderCritique.ts` | the critique's findings, mapped to the problems surface          |
| `openspec/specs/resource/page-builder/canvas/design.md`          | the canvas design, whose device toggle placement this supersedes |
| `openspec/specs/resource/page-builder/critique/design.md`        | the critique design, whose Check panel sentences this supersedes |

## Sources

- [Webflow's Navigator](https://help.webflow.com/hc/en-us/articles/33961320786451-Navigator) and [Wix Studio's layers panel](https://support.wix.com/en/article/studio-editor-using-the-layers-panel) (fetched): a tree of the page's elements in a panel at the left of the editor, which Webflow lets the reader pin open beside the canvas on a wide window. Webflow moves an element into another parent by dragging it, while Wix reorders only within a parent. The Layers tab.
- [GrapesJS's layer manager](https://grapesjs.com/docs/modules/Layers.html): the page's component tree as its own panel (fetched).
- [GrapesJS's device manager](https://grapesjs.com/docs/api/device_manager.html) and [its device](https://grapesjs.com/docs/api/device.html) (fetched): a device sets the canvas width and a separate width for media queries. The device toggle.
- [Puck's overrides](https://next.puckeditor.com/docs/api-reference/overrides) (experimental): an outline and a fields panel as separate replaceable parts, with the fields following the selected item.
