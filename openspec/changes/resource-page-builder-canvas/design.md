# Canvas

Built on the [document model](../../specs/resource/page-builder/document-model/design.md), which holds the typed nodes the canvas renders and the patches its commands issue.

## The canvas

The canvas is a same-origin frame whose document starts empty from `srcdoc`; Vue renders the tree into its body through a teleport, so the frame holds only DOM while the component instances, reactivity and listeners stay in the app.

A frame, and not a region of the app's own document, because the canvas has to be the published page's rendering context and nothing else gives it that:

- **Viewport.** A media query and a `vw` unit read the frame's width, so the device toggle is honest by setting that width. In the app's document they read the window; a shadow root does too, and so would need every `@media` rewritten as a container query and every viewport unit as a container one, for as long as CSS grows new viewport-relative features.
- **Isolation both ways.** The app's preflight reset, its inherited type and its tokens never reach the page, and the page's `body`, `html` and element selectors never reach the app. A shadow root lets inherited properties through and has no `body` for a page's rules to match.
- **The published context.** The published page is served the same way, in a frame of its own, so the canvas and the page share one rendering context, not merely one stylesheet.

The cost is that pointer routing and hit testing cross a document boundary, which Vuetify 0's `useDragDrop` cannot: it hit-tests with the parent document's `elementFromPoint`, and its keyboard adapter moves a virtual pointer by pixels rather than through a tree. That cost is paid once, in one composable (see "Selection and drag"). The page's styles go into the frame as a constructed stylesheet through `adoptedStyleSheets`, rebuilt at most once per animation frame after a style patch, so the canvas adds no inline style element.

No script ever reaches the canvas, by construction rather than by policy: every element is created by Vue from a typed node, the one raw-HTML type is sanitised before it is inserted, and a style value may contain neither `<`, so it can never close a style element, nor `{` or `}`, so it can never leave its rule. Behaviour a published page runs as a script — the countdown's ticking, typed text, the tabs — runs in the canvas as the type's `canvas` component, in the app's own realm. The frame carries `sandbox="allow-same-origin"` as defence in depth, since listeners from the app's realm still fire inside it: the browser suite's sandbox test clicks a button teleported into a frame with that sandbox, and its Vue handler runs. `renderCanvasVNodes` folds the document through the same registry the publish render uses and returns VNodes, where a raw node's markup is inner HTML so no script in it runs, and each node's root element carries its id for the overlays.

**The browser suite.** The isolation, the frame's widths and the sandbox question need a layout engine, which the app's suites, under happy-dom, do not have. This change gives the app a browser suite of its own on `getVitestBrowserConfiguration`, as the Genshin packages have, in a configuration apart from the default run so an ordinary run never starts a browser. Nuxt's test utilities run Vitest's browser mode under the Nuxt environment, so a component's auto-imports resolve there as they do in the unit suites, and each `*.browser.test.ts` runs only in that suite, as in the Genshin packages. The rest of the canvas is component tests under happy-dom, as the library's are.

**Overlays** — the hover outline, the selection outline, the drop indicator — live in a layer inside the frame after the content root, positioned from each node's `getBoundingClientRect` and redrawn in one animation frame after a scroll, a resize or a patch. They read the library's accent and focus tokens through custom properties copied into the frame, so a theme or style switch restyles them, and the selection ring is a double ring that stays visible on any page colour. The node toolbar — select parent, move up, move down, Move to…, duplicate, delete, and the type's own actions — is library buttons in the app's document, placed from the frame's rect plus the node's; the same `Item` list is its overflow menu and the right-click menu through `useContextMenu`.

**Device widths** are the three the [style panel](../resource-page-builder-style-panel/design.md) edits, each inside its own breakpoint: tablet is 768 pixels wide and mobile 375, and desktop fills the pane but is never narrower than 992 pixels, one above the tablet breakpoint at 991, so the frame's media queries always read desktop. In a narrower pane the frame keeps that width and is scaled down to fit. The three widths and the two breakpoints they sit inside are named once, in the module this change creates, and the style panel's cascade reads the same breakpoints.

## Selection and drag

The [headless core](../../specs/headless-block-editor/editor-core/design.md) computes the types a slot accepts, a move, a move into the previous sibling, a paste and where focus goes after a delete. The rest of the navigation the canvas draws is added to the core by this change, as pure functions over the document beside those: the previous and next node in document order, every slot in the document that accepts a node, a move out after the parent, the rows the layers tree draws, and duplicate, a paste of the node's own copy straight after it. They hold no editor's node types, so they belong to the package rather than the app; this page draws, announces and binds them. Every pointer action has a keyboard path, because each is a registered command first, so the keyboard, a single pointer, the palette and the context menu all reach it, and `useCommands` lists each in the shortcuts dialog.

```mermaid
flowchart TD
  POINTER["pointer drag — palette block or node handle"] --> CAPTURE["pointer captured in the document it began in"]
  CAPTURE --> HIT["hit test the frame's document at the pointer, less its offset, over its scale"]
  HIT --> SLOT{"nearest slot whose allow list accepts the type?"}
  SLOT -->|no| NONE["no indicator; a drop cancels"]
  SLOT -->|yes| INDEX["index from child midpoints along the slot's axis"]
  INDEX --> DROP["release: insert or move patch"]
  KEYS["Alt+arrow on the selected node"] --> STRUCT["previous or next sibling, into the previous sibling's slot, or out after the parent"]
  STRUCT --> DROP
  MOVETO["Move to… in the toolbar, menu or palette"] --> SCOPE["command palette scope listing every slot that accepts the node"]
  SCOPE --> DROP
  DROP --> LIVE["live region: Moved Image to position 3 of 5 in Column 2"]
```

**Pointer.** A drag from the palette or a node's handle captures the pointer in the document it began in, so the drag keeps receiving events while the pointer crosses the frame, and hit-tests the frame's document at the pointer less the frame's offset, divided by its scale. The nearest ancestor slot whose allow list accepts the dragged type is the target, and the index is the first child whose midpoint along the slot's axis the pointer has not crossed — the resolution `useDragDrop` uses, cited rather than imported. The canvas finds a node's element by the `data-node-id` its render stamps, and the slot by the document rather than the DOM: from the node under the pointer outwards, the first node whose type's slot accepts the dragged type, where the root's content is the last candidate, and the midpoints are those of that slot's children's elements. A webpage type has at most one slot, so the node names the slot. The frame scrolls while the pointer rests near its top or bottom edge. Escape cancels. On touch a drag waits for the hold the library's reorderable list already waits for, so a swipe scrolls. A click on a palette block inserts it at the selection, so a drag is never the only way in.

**The layers tree** is the structure's keyboard surface: a new library component on Vuetify 0's `Treeview`, which gives the tree, treeitem and group roles, so the page builder imports nothing from Vuetify 0 itself. The arrows walk it, Home and End jump, type-ahead finds a node by its label, and selection follows focus, so the canvas outlines what the tree has focused and scrolls it into view. A node's label is its type's title, from a map in the app keyed by every webpage node type, so the typecheck holds it complete; the same title names a node in Move to's paths and in each move's announcement. Rejected: a title on the shared type definition, which the publish render never reads. The selection is a node id held per resource in the canvas store, so a move, which changes a node's pointer, keeps it selected, and a command reads the pointer from the layer rows when it needs one.

**Moves** use the chord the library already gives reordering. Alt+Up and Alt+Down move the selected node among its siblings, Alt+Right moves it into the end of the previous sibling's first slot that accepts it, and Alt+Left moves it out to just after its parent. Every move is announced in a polite live region, as the reorderable list reads out "Moved to position 3 of 8", and keeps focus on the node. Up and Down are `moveBlockNode` within the node's own slot at its index less one and plus one, whose post-removal index places it past the next sibling, and none moves past either end. The announcement names the node and where it landed, "Moved Image to position 3 of 5 in Column 2", with "the page" for the root's content.

**Move to…** opens a command palette scope listing every slot in the document that accepts the selected node, each named by its path ("Section 2 › Column 1"), so a move across a long page is one search rather than a chain of Alt presses. A path is the titles of the nodes from the root down to the slot's node, each with its position among the siblings of its own type, and "The page" for the root's content; choosing a target moves the node to the end of that slot. The scope is a `UiCommandScope` over `getAcceptingSlotPointers`, which the toolbar's Move to and its command open. With the toolbar's Move up and Move down it is the single-pointer alternative WCAG 2.2's Dragging Movements asks for.

**Insert** is the palette, a `UiCommandList` of the registry's blocks grouped by category: Enter inserts the block after the selected node, or into the selected container's first slot when it is empty, selects it and announces it. **Delete**, **duplicate**, **copy**, **cut** and **paste** are commands on the usual chords. After a delete, selection and focus land on the next sibling, else the previous one, else the parent, so focus is never dropped onto the page: the target is `getFocusAfterRemoval`'s, and the root's empty pointer selects nothing and focuses the tree. The clipboard carries the node as JSON, validated by the document schema and given fresh ids on paste, so a paste between two webpages works and one between a webpage and an email is refused with a message. The text names the editor it came from beside the nodes, so a paste whose editor differs is refused by name ("A webpage block cannot be pasted into an email") before the registry check, and one the slot refuses says so. A paste lands where an insert does: after the selected node, or in the selected container's slot when it is empty.

**Text editing.** Enter on a selected text node, in the tree or the canvas, mounts TipTap on that node inside the frame and moves focus into it; Escape leaves the text and returns focus to the tree row. Inside the text, TipTap's own keys and undo apply; leaving it commits one history entry. The editor is the Note's, over the node's `content`, and each change while it is open is an update-props edit of `content` under the session's interaction id, so the history merges the session into that one entry and the canvas never holds a draft of its own. Composition and paste are ProseMirror's, which reads an input method's text and pasted markup through its schema rather than through `execCommand` — where GrapesJS's IME and Word-paste defects above come from.

The canvas itself is one tab stop named after the page. With focus in it, Up and Down select the previous and next node in document order, Enter edits, and Escape selects the parent — the same commands as the tree, so neither surface is the only way to do anything.

## The shell

The editor around the frame is library parts: the palette and the layers tree in one pane, the canvas with its device toggle in the middle, and `UiTabs` over the Content, Style and Theme panels in the other, each pane sized by a `UiResizeHandle`, and an empty page drawn as a `UiEmptyState` offering the palette. The Content panel is `UiSchemaForm` over the selected node's type's `formSchema`, so a type gains its fields by declaring them; a survey or a column is offered through `itemsKey`, and an image's field uploads through `useUploadResourceFile`, offering the images already in the document beside it. Each field's change is one update-props command, so it reaches the history like any other edit. The Style and Theme panels are the [style panel](../resource-page-builder-style-panel/design.md)'s, and this change draws their tabs empty.

## Key files

| File                                                                         | Role after the change                                                                                                       |
| :--------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/composables/ui/useCommands.ts`                                 | every pointer and keyboard action registered as a command, listed in the shortcuts dialog                                   |
| `apps/web/app/composables/ui/useContextMenu.ts`                              | the right-click menu the node toolbar's overflow `Item` list also feeds                                                     |
| `apps/web/app/composables/resource/useUploadResourceFile.ts`                 | an image field's upload in the Content panel                                                                                |
| `packages/configuration/src/getVitestBrowserConfiguration.ts`                | the shared browser configuration the app's browser suite takes                                                              |
| `packages/headless-block-editor/src/services/getAcceptedTypes.ts`            | the slot check every listed Move to target passes                                                                           |
| `packages/headless-block-editor/src/services/pasteBlockNodes.ts`             | the paste a duplicate is, its copy placed straight after the node                                                           |
| `packages/headless-block-editor/src/services/getBlockLayerRows.ts`           | the layers tree's rows: every node in layer order, with its depth                                                           |
| `packages/headless-block-editor/src/services/getAdjacentBlockNodePointer.ts` | the previous and next node in document order, across slot boundaries                                                        |
| `packages/headless-block-editor/src/services/getAcceptingSlotPointers.ts`    | the slots Move to lists for a node, outside the node's own subtree                                                          |
| `packages/headless-block-editor/src/services/moveOutAfterParent.ts`          | the move Alt+Left makes, to just after the parent                                                                           |
| `packages/headless-block-editor/src/services/duplicateBlockNode.ts`          | the duplicate command, a paste of the node's copy after it                                                                  |
| `apps/web/app/components/PageBuilder/Canvas/Frame.vue`                       | the canvas frame: the page in its own document at its device's width, scaled down to fit a narrower pane                    |
| `apps/web/app/services/pageBuilder/renderCanvasVNodes.ts`                    | the document as the canvas's VNodes, folded through the publish render's registry, each root element carrying its node's id |
| `apps/web/shared/models/pageBuilder/PageBuilderDevice.ts`                    | the three devices the canvas draws at and the style panel edits                                                             |
| `apps/web/shared/services/pageBuilder/constants.ts`                          | the device widths and the two breakpoints they sit inside, named once                                                       |
| `apps/web/package.json`                                                      | the browser suite's script, apart from the default run                                                                      |
| `apps/web/vitest.browser.config.ts`                                          | the app's browser suite, each `*.browser.test.ts` under the Nuxt environment                                                |
| `apps/web/app/components/Ui/Tree/Index.vue`                                  | the layers tree's library component, on Vuetify 0's Treeview: selection follows focus and type-ahead walks it               |
| `apps/web/app/services/pageBuilder/getLayerTreeItems.ts`                     | the layers tree's items: each row nested by its depth, labelled by its type's title                                         |
| `apps/web/app/store/pageBuilder/canvas.ts`                                   | the canvas's selected node, held per open resource                                                                          |

New code lands here:

```text
apps/web/shared/services/pageBuilder/            the device widths and the breakpoints they sit inside
apps/web/app/store/pageBuilder/                  the selection and the device width, keyed by resource
apps/web/app/components/PageBuilder/             the shell, canvas frame, overlays, toolbar, palette, layers and Content panel
```

## Sources

- [Vuetify 0 — useDragDrop](https://0.vuetifyjs.com/composables/system/use-drag-drop) — the midpoint resolution of a drop index, taken; its hit test in one document, which a canvas frame rules out.
- [Vuetify 0 — Treeview](https://0.vuetifyjs.com/components/disclosure/treeview) — the tree, treeitem and group roles the layers tree is built on.
- [WAI-ARIA Authoring Practices — Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) — the layers tree's keys.
- [WCAG 2.2 — Understanding Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — a single-pointer alternative to every drag.
