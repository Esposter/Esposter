# Page Builder

The Webpage and Email resource types are edited in GrapesJS. An editor component mounts it through `useGrapesJsEditor`, a dozen-odd plugins add the blocks, panels, an image editor, an exporter and the MJML compiler, and every save captures the HTML a published view serves, because only the live editor can produce it. GrapesJS is the page-builder engine on the [dependency admission](../../specs/architecture/dependency-admission/design.md) stop list, and its plugin belt is being absorbed into `apps/web/app/services/webpageEditor/plugins` one small plugin at a time ([resource roadmap](../resource-roadmap/tasks.md)).

This proposal replaces the engine rather than thinning it. The document becomes a typed tree of `{ type, props }` nodes in Puck's published data shape; a registry of node types replaces the plugin belt; Vue draws the tree into a same-origin canvas frame; every edit is a patch with its inverse; and every panel is the UI library. The hard algorithms stay engines: ProseMirror through TipTap for the text inside a block, MJML for email — moved to the server and onto its current major — CodeMirror for a code field, and the shared sanitiser for raw HTML. No saved document is migrated. The cutover deletes every webpage and email, in dev and in prod, in the change that ships the new editors and removes GrapesJS.

## Sub-pages

- [Headless core](../resource-page-builder-headless-core/design.md) — the editing model as a package of its own: the tree, the registry contract, the commands, the navigation and the history, with no editor's node types in it
- [Document model](../resource-page-builder-document-model/design.md) — the typed node tree, the node types a registry holds for each editor, and how a document renders and publishes
- [Canvas](../resource-page-builder-canvas/design.md) — the same-origin frame, its overlays, and the pointer, keyboard and layers paths that select and move nodes
- [Style panel](../resource-page-builder-style-panel/design.md) — styles kept on each node per breakpoint and state, drawn by the library's controls
- [Undo as patches](../resource-page-builder-undo-as-patches/design.md) — every edit a JSON Patch with its inverse, so undo and redo are patch lists
- [Email](../resource-page-builder-email/design.md) — the email node types over MJML compiled on the server, with the design canvas and Preview
- [Performance and proof](../resource-page-builder-performance-and-proof/design.md) — the targets the editors hold, and how their output is proved against the published page
- [Cutover](../resource-page-builder-cutover/design.md) — the one change that ships the editors, deletes every webpage and email, and removes GrapesJS

## Decision

Replace. The figures below were measured by bundling exactly what the editor components import with rolldown, minified, and compressing the output with gzip; the third-party files were fetched from the origins the plugins load them from. Each is a magnitude, since every one moves with a dependency update.

| Measure                                  | GrapesJS today                                                                  | Replacement                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Webpage editor script, gzipped           | about 375 KiB, of which the core is about 280                                   | at most 200 KiB, TipTap's ~115 among it and shared with the Note  |
| Email editor script, gzipped             | about 620 KiB, of which MJML in the browser is about 340                        | at most 200 KiB, with no MJML in the browser                      |
| Third-party origins an editor loads      | Font Awesome from cdnjs (~80 KiB, both), TUI with Fabric.js (~200 KiB, Webpage) | none                                                              |
| Everything fetched before the first edit | about 665 KiB (Webpage), 715 KiB (Email)                                        | at most 200 KiB each                                              |
| ARIA in the engine's own source          | none — every `aria-`, `role` and `tabindex` in its bundle is CodeMirror 5's     | every surface on the library's tested keyboard and ARIA contracts |
| A keyboard or single-pointer move        | none; the sorter is pointer-only, and the upstream issue is open                | structural moves, Move to…, and a command for every pointer act   |
| MJML                                     | one major behind, in the browser, compiled per component synchronously          | the current major, on the server, async                           |

Thinning cannot reach the right-hand column. The leanest GrapesJS build — the core plus our own block modules, with the image editor, the exporter, the PostCSS parser and Font Awesome removed — still ships the 280 KiB core, its Backbone views with no ARIA, a text editor built on the deprecated `document.execCommand`, an undo built on `backbone-undo`, which npm marks deprecated, and a sorter with no keyboard path. The email side cannot thin at all: the MJML plugin's component views compile each component's MJML synchronously as they render, so the newer MJML, whose compile returns a promise, does not fit it, and its compiler is most of the email editor's weight.

The stop list keeps accessibility-shaped engines because "our own version reliably ships worse here". That reasoning inverts for this engine: there is no ARIA to ship worse than, and the library already owns a tree, a reorderable list with Alt+arrow moves read out through a live region, a command palette, a context menu and a shortcut registry, each with a component test of its contract. This replacement has the shape the [admission page](../../specs/architecture/dependency-admission/design.md) asks of one: GrapesJS is mostly the behaviour layer (its interaction model, its panels, its style and selector model), while the hard algorithms it wraps are kept as engines.

What is kept, and why:

- **MJML** stays the email engine. Email-client HTML is a decade of table and conditional-comment workarounds MJML encodes; we write the MJML, it writes the HTML. It moves to the server, where its weight costs the reader nothing.
- **TipTap and ProseMirror** hold the text inside a text block, in the ProseMirror JSON the Note already stores and renders server-side through `@tiptap/html`. Rich text is on the stop list for good reason, and the app already pays for it.
- **CodeMirror** edits the raw-HTML block, through the code viewer the app already themes.
- **The shared sanitiser** cleans the raw-HTML block, in place of GrapesJS's parser, whose checks the [custom code page](../../specs/resource/webpage-plugin-custom-code/design.md) records as weaker than they look.

What goes with GrapesJS: Backbone, underscore, `backbone-undo`, CodeMirror 5, the vendored keymaster, every plugin package, `js-beautify`, the TUI image editor and the two CDN origins. An HTML or CSS parser does not stay either, because nothing imports HTML any more (see "What is deliberately not in it").

## What the editors use today

The editors reach GrapesJS through a small surface, which is what makes the replacement's scope countable. A couple of dozen files import it, mostly the absorbed plugin modules and their tests.

| GrapesJS module                   | What the app uses it for                                                                                                                   | Replaced by                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Editor and Storage                | `grapesJS.init` behind `useGrapesJsEditor`, a `document` storage adapter onto the content store, `load({ clear })` on a restore, `destroy` | the content store and the generic autosave       |
| Blocks                            | the palette; `setBlocks` re-syncing merge fields and survey invites wholesale                                                              | the node-type registry and its palette           |
| Components (DomComponents)        | a dozen `addType` calls across the absorbed plugins; `findType`, `append` and `remove` for the email's `mj-preview`                        | node types; the preview text as a root prop      |
| Traits                            | the countdown's and the forms' settings                                                                                                    | each type's form, drawn by `UiSchemaForm`        |
| Styles and Selectors              | the sectors in `WebpageEditorStyleManager`, `componentFirst`, and a `selector:add` listener hiding private classes                         | the style panel over per-node declarations       |
| Layers, Panels, Devices, Modal    | the webpage preset's panels, device buttons and import modal; the custom code modal                                                        | the layers tree, the device toggle, `UiDialog`   |
| Assets                            | the upload adapter onto the resource's file assets                                                                                         | the image field's upload                         |
| Canvas and Undo, Keymaps, RTE     | the frame, the default shortcuts, and text editing through `execCommand`                                                                   | the canvas frame, patches, `useCommands`, TipTap |
| Parser and CodeManager            | the custom code block's markup, the PostCSS parser, `getHtml` and `getCss` at save, a CodeMirror 5 viewer                                  | the renderer; CodeMirror for the code field      |
| Commands                          | `mjml-code-to-html` behind `getEmailHtml`, and the custom code modal                                                                       | the server's MJML compile                        |
| Events                            | `update`, to read the preview text back after every change                                                                                 | nothing — the field binds the root prop          |
| I18n, Pages, Symbols, DataSources | unused                                                                                                                                     | —                                                |

The published views render nothing of GrapesJS: `apps/web/app/components/Resource/Webpage/View.vue` and `apps/web/app/components/Resource/Email/View.vue` serve the HTML a save captured, through `apps/web/app/components/Resource/SrcdocIframe.vue`. That capture exists only because GrapesJS runs in the browser, and it goes.

## What GrapesJS costs

**Bytes.** The table above. Both editors also load Font Awesome 4 from cdnjs, because GrapesJS's default `cssIcons` names it and the style sectors use its classes; the webpage editor fetches the TUI image editor, which bundles Fabric.js, from `uicdn.toast.com` as soon as its plugin initialises, whether or not an image is ever edited. Both origins are entries in `apps/web/configuration/security.ts` for that reason.

**Architecture.** Every component is a Backbone model with a Backbone view rendering into the frame's document; tools such as the badge, the toolbar and the offsets are drawn in the parent over the frame. A project is pages of frames of component JSON — `type`, `tagName`, `attributes`, `components`, text as `textnode` children — beside an array of CSS rule objects with `selectors`, `style`, `mediaText` and `state`. HTML comes from each model's `toHTML`, CSS from the CSS composer. Its bundled ESM module runs to about seventy thousand lines, of which about fifty thousand are its own; in those, no `aria-` attribute, `role` or `tabindex` appears.

**Open defects our editors meet.** GrapesJS keeps a few dozen issues open and moves most bug reports to its discussions, which number nearly two thousand, so the tracker understates it. Of the open ones: a drag has no single-pointer or keyboard alternative ([#6582](https://github.com/GrapesJS/grapesjs/issues/6582)); dropping a block fails in Safari since 0.22 ([#6591](https://github.com/GrapesJS/grapesjs/issues/6591)); moving a component on a touch screen does not land with the touch plugin we install ([#6409](https://github.com/GrapesJS/grapesjs/issues/6409)); Japanese input adds an empty return ([#6420](https://github.com/GrapesJS/grapesjs/issues/6420)); a paste from Word splits attribute values ([#6535](https://github.com/GrapesJS/grapesjs/issues/6535)); a cross-level move in the layer manager breaks the sorter ([#6669](https://github.com/GrapesJS/grapesjs/issues/6669)); default component styles leak into device media queries ([#6629](https://github.com/GrapesJS/grapesjs/issues/6629)); a strict CSP fails on its inline styles ([#6690](https://github.com/GrapesJS/grapesjs/issues/6690)); and `backbone-undo` is deprecated ([#6687](https://github.com/GrapesJS/grapesjs/issues/6687)). The MJML plugin adds unsanitised component attributes ([mjml#391](https://github.com/GrapesJS/mjml/issues/391)), a redo that does not restore an image ([mjml#389](https://github.com/GrapesJS/mjml/issues/389)), an image that reloads on every attribute edit ([mjml#431](https://github.com/GrapesJS/mjml/issues/431)), an outdated compiler ([mjml#406](https://github.com/GrapesJS/mjml/issues/406)) and no `mj-preview` component ([mjml#351](https://github.com/GrapesJS/mjml/issues/351)), which [email preview text](../../specs/resource/email-preview-text/design.md) works around by writing markup into the head.

## How it reuses the UI library

The editor shell is library parts: `UiTabs` over the Content, Style and Theme panels; `UiSchemaForm` drawing each type's `formSchema`, with a survey or a column offered through `itemsKey` and a snapshot test per form schema as [schema forms](../../specs/architecture/schema-forms/design.md) require; `UiCommandList` for the palette and a `useCommandScope` for Move to…; `UiDialog` for the raw-HTML code field and the export; `UiFileField` for an image's upload through `useUploadResourceFile`, the images already in the document offered beside it; `UiAlert` for compile messages; `UiTooltip`, `UiIconButton` and `UiOverflowMenu` on the toolbar; `UiResizeHandle` on the panes; `UiEmptyState` on an empty canvas. The library grows by the tree on Vuetify 0's `Treeview` and token swatches on `UiColorField`, each in a commit of its own, tested against its keyboard and ARIA contract once per design style, and by the icon meanings the alignment and device controls need. The whole editor takes the design pass the `ui-library` skill sets.

## Phases

Phases one to three build behind the Editor blade, as the admission page asks of a replacement: each ships green and tested, mounted by its own tests, while `ResourceEditorComponentMap` still mounts GrapesJS. The fourth is the swap.

1. **The model and its output.** The headless core first, with the tree, the registry contract, the recursive document schema, the commands and the history; then the webpage and email node types over it; the element tree, its serialiser and the CSS emitter; patches, inverses and history; every webpage type's `render` and every email type's MJML; the server's compile service on MJML's Node package. Unit tests, the render and patch benches, and the MJML defaults test.
2. **The webpage editor.** The canvas frame, overlays and toolbar; the pointer drag and every keyboard path; the layers tree; the palette; the content, style and theme panels; text editing; device widths; Export. Component tests and a browser suite for what only a layout engine can show.
3. **The email editor.** The email canvas components, Preview, merge fields, the preview text, survey invites, and the personalized export from compiled HTML.
4. **The cutover.** One change, below.

The small-plugin absorption stops now: every module it produces is deleted at the cutover, and the roadmap's plugin-belt item becomes this proposal.

## What is deliberately not in it

- **HTML and CSS import.** The preset's Import modal goes, and nothing replaces it as a feature. A typed tree cannot hold arbitrary HTML faithfully: an importer either wraps it in raw-HTML nodes, gaining nothing over pasting it into one, or maps it into types by guesswork — the path GrapesJS's own paste and reload defects come from. Pasted markup belongs in a Custom HTML node, and pasted rich text in a text node, where ProseMirror's schema keeps what it can represent.
- **Image editing.** The TUI editor's crop, filters and drawing go with their third-party load; an image is prepared before it is uploaded. Crop and rotate on the platform's canvas would be the cheap form if an owner asks.
- **A code view.** Export gives the HTML whole.
- **Shared classes and a free stylesheet.** Tokens, Copy style and duplication cover reuse; a named class shared by nodes is the first thing to add if they stop doing so, as a document-level map the nodes reference.
- **Forms.** The editor offers no form block today and gains none.
- **Collaboration.** Patches are data, which keeps the door open, but [resource collaboration](../../deferred/resource/document-collaboration/design.md) stays deferred.

## Notes

- [Webpage social preview](../../specs/resource/webpage-social-preview/design.md) shipped its description and share image on the Webpage content. The cutover moves those two fields to root props.
- A Video or Map embed is a third-party frame, and the security config names no `frame-src`, so `default-src 'self'` refuses those frames in the canvas and inside the published view's frame, which inherits the app's policy — reading the policy says the current blocks embed nothing that loads. Phase 2 confirms it in the browser, and the two types ship either with the providers' origins named or as uploaded video only.
- An external image loads in the canvas and on the published page only from the hosts the image whitelist names, for the same reason, so the image field offers upload first and says why a pasted address from elsewhere shows nothing.
- [Program invites](../../specs/resource/program-resource/design.md) (shipped) took the compile per participant from the live editor: the bound email's captured html is read server-side, so the export needs no mounted editor.
- [AI-native resources](../architecture-ai-native-resources-program/design.md) is this editor's agent surface. Its content tools apply the same JSON Patch operations an edit here records, on the server and through the same document schema, so a webpage or an email is an agent's to edit the day the cutover lands, with nothing built for it here. `applyPatches` is written once for all three of its consumers, in `@esposter/shared`, since the headless core is a package and cannot import the app.

## Key files

| File                                                           | Role after the change                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/web/app/components/Resource/Webpage/Editor.vue`          | the webpage editor shell over the page builder, in place of the GrapesJS container   |
| `apps/web/app/components/Resource/Email/Editor.vue`            | the email editor shell: the dataset picker and the preview text bound to a root prop |
| `apps/web/app/services/resource/ResourceEditorComponentMap.ts` | unchanged entries; its comment no longer names GrapesJS                              |

New code lands here:

```text
packages/headless-block-editor/                the tree, registry contract, document schema, commands, navigation, history
packages/shared/src/services/jsonPatch/        applyPatches, the RFC 6902 applier the core and the content tools share
apps/web/shared/models/pageBuilder/            the webpage and email documents, the element-tree and style models
apps/web/shared/services/pageBuilder/          the serialiser, CSS emitter
apps/web/shared/services/pageBuilder/webpage/  WebpageNodeType, WebpageNodeTypeMap, one module per type
apps/web/shared/services/pageBuilder/email/    EmailNodeType, EmailNodeTypeMap, one module per type, the MJML render
apps/web/server/services/emailEditor/          the MJML compile service
apps/web/app/store/pageBuilder/                selection, active breakpoint and state, history — keyed by resource
apps/web/app/components/PageBuilder/           the shell, canvas frame, overlays, toolbar, palette, panels, fields
apps/web/app/components/Ui/                    the tree on Vuetify 0's Treeview
```

## Sources

- The GrapesJS and GrapesJS MJML issues linked in "What GrapesJS costs", read on their trackers.
