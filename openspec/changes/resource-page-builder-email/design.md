# Email

The email editor, built over the node types and the renderer contract the [document model](../../specs/resource/page-builder/document-model/design.md) defines, inside the frame and shell the [canvas](../resource-page-builder-canvas/design.md) draws, with the field components the [style panel](../resource-page-builder-style-panel/design.md) builds.

## Email

MJML stays the engine, and the email's node types are its components from the [MJML blocks](../../specs/mjml-blocks/README.md) package: their attributes, MJML's defaults, their nesting and the head as the root's props. That package owns what an email may hold. This page is what the editor draws over it, plus the one type the app adds, the survey invite, an `mj-button` whose survey link prop indexes the invite as the webpage's does.

The preview text is a root prop, so the bar's field binds it through a patch like any other edit, and `readEmailPreviewText`, `writeEmailPreviewText` and `getEmailPreview` go with the read-back after every change. A merge field is an inline node in the text, inserted by typing `{{` — the mention suggestion the composer already uses, offering the bound dataset's columns — or by dragging a column from the Merge fields category; it renders as the `{{column}}` token `toMergeField` writes today.

**The design canvas** draws each email type with its `canvas` component:

- a section as a full-width band around a centred body-width container;
- its columns side by side, as MJML lays them on a desktop client, and stacked below MJML's 480-pixel breakpoint in the mobile width;
- each leaf with what the MJML blocks' cascade resolves for it. The cascade is the node's own attributes, then the root's `mj-attributes`, then MJML's defaults, which the package holds equal to the installed release. A new text therefore shows in Ubuntu, Helvetica, Arial at 13 pixels with 10 by 25 of padding, and a button in #414141 with a 3-pixel radius, until the author or the root says otherwise.

**Style fields.** An email node has no breakpoints and no states: email clients honour media queries unevenly, so MJML's own column stacking is the responsive model. Its style fields are its MJML attributes, such as padding, colours, font, alignment, border and background image. Each control is chosen from the package's field descriptor for the attribute, drawn by the style panel's field components, and stored as a prop. A field the author has not set shows the cascade's value as its inherited placeholder, and clearing it removes the prop, so the root's `mj-attributes` apply again. The Style tab shows no breakpoint or state choice for an email.

**Import MJML** is the one import the editor offers. Because the types are MJML's own components, MJML source from another tool reads back faithfully through the package's `parseMjmlDocument`, unlike the HTML import the [program](../resource-page-builder-program/design.md) leaves out. The command opens a code field. An accepted import replaces the document as one history entry. A refused one leaves the document as it was and names the tag or attribute that did not fit.

**Preview** is the truth: a toggle beside the device widths shows the open document compiled by the server, through a query that passes the document to the document model's compile service, debounced like the autosave so Preview shows an edit before it is saved and reads nothing GrapesJS still writes. It draws in the sandboxed frame the published view uses, at desktop and mobile width, with MJML's validation messages above it as an alert. The design canvas is where an email is edited and Preview is what a client receives, because email-client HTML — nested tables and conditional comments — is output to inspect, not a surface to edit in place.

The compile runs in the app server, on MJML's Node package in place of the browser build bundled inside `grapesjs-mjml`.

## The shell's document kind

The shell is one set of components and composables for both documents, so the email is not a second editor. What differs between the two is the document kind, one object per kind, which the document store records beside each open document. The kind holds the parts the shell reads and no more: the document's schema, its block registry and children port, the defaults a new node of each type is inserted with, the titles its node types show, the palette's categories and the root's defaults. A composable reads the kind of the resource it edits, the same resource id it already takes, so no composable imports a kind's constants.

Two parts are not data and are chosen by kind in the shell instead: the canvas, which draws a webpage in its frame and an email in the design canvas, and the settings tab's style panel, which draws a webpage's breakpoints and states and an email's attribute fields. Everything else in the shell is shared, so the webpage's behaviour is the one behaviour both documents keep.

The kind's document type is the union of the two node types the registry holds, with the webpage and email each narrowed where a composable reads its own type's props. The store keeps the document under the union, and a kind's functions take the narrowed type, so a composable that reads a webpage's `style` never reads it from an email.

## Key files

| File                                                       | Role after the change                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/web/server/trpc/routers/email.ts`                    | the query compiling an open email document for Preview, with the validator's messages |
| `apps/web/app/services/emailEditor/toMergeField.ts`        | the `{{column}}` token a merge field renders as                                       |
| `apps/web/app/models/richTextEditor/RichTextSuggestion.ts` | the mention suggestion typing two braces opens                                        |

New code lands here:

```text
apps/web/app/components/PageBuilder/Email/      the design canvas's email types, Preview, the import and the merge field node
```

## Handoff

Written at the end of a session that stopped under the usage reserve (no code-writing agents until the weekly window resets). Each item says what is done, the calls made, and the next step, so it can be picked up cold.

### Done on `ai/queue`

- `e1e12376` — `getEmailAttributeValue` resolves a node's own prop, then its component's MJML default.
- `0a740f51` — `checkIsStackedColumns` at `EMAIL_MOBILE_BREAKPOINT = 480`. Call made: the breakpoint is inclusive (`<= 480`), following MJML's `max-width: 480px` media query, not the design note's "below 480".
- `1cdfbdd0` — the root's `attributes` join the cascade: node prop → root `attributes[node.type]` → root `attributes["mj-all"]` → component default. The helper now takes the root's `attributes` as its third argument. Its only caller is its test.
- `c6eb6f5a` — `getEmailColumnWidths`: a column's own width when it sets one, else an equal share of the percentage the set widths leave; a pixel width is kept and takes none of the share. Its four tests pass, and an overflowing set width leaves the unset columns `0%` rather than a negative share; nothing renders it yet.
- `c3996b74` — lint and naming. Email test titles are lowercase, so the two scenario names that have tests (`columns stack below the mobile breakpoint`, `a new text shows the default font and padding`) are lowercase in `spec.md` and `tasks.md`. The other scenario names stay capitalised there until their tests exist; each is lowercased in the commit that writes its test, so the names and the test titles match. The starter email comment is rewrapped with capitalised continuation lines.

Verified at `c3996b74`: the six email suites pass (11 tests); `vue-tsc -p .nuxt/tsconfig.app.json` exits 0; oxlint and ESLint are clean on `apps/web/shared/services/pageBuilder/email/`.

### Calls already made

- The email document type is `z.output<typeof emailDocumentSchema>`, derived from the app's schema, not `MjmlDocument` from `mjml-blocks`. Importing `MjmlDocument` gives `never` leaves in the app program, because `apps/web/shared/models/pageBuilder/EmailSurveyInviteNode.ts` augments `MjmlLeafNodes`.
- The document store holds an email beside a webpage under its resource type. The webpage getters (`getDocument`, `getKind`, `getOpenDocument`) still read webpages only, and `getEmailDocument` reads emails. The history store applies and commits either by type (`applyEdit` dispatches on it), and its tests cover an email edit and its undo. Widening the webpage getters to the union was tried twice (8 errors, then 59 to 61) and reverted, since each composable still takes a webpage.

### Open items

1. **Design canvas (1.1).** Partly started. Done: `renderEmailCanvasVNodes` (`apps/web/app/services/pageBuilder/email/`) draws sections, which lay their columns side by side or stack them via `checkIsStackedColumns`, widths from `getEmailColumnWidths`, text with the cascade's font and padding, and labelled leaves for everything else. `apps/web/app/components/PageBuilder/Email/Canvas.vue` mounts it in the shared frame at the device's width. Its test checks the tablet frame width, and the two scenario tests pass. Not done: the webpage canvas's interaction (hover outlines, selection, keyboard, drag from the palette), the drawings of the leaves that are still labelled (button, image, divider, spacer, table, social, navbar, carousel, accordion, raw, hero), and the store that holds the email document (item 5). The email document is passed as a prop until then, so this canvas is not yet reachable from the editor. Paths: `apps/web/app/components/PageBuilder/Canvas/` for the webpage canvas to mirror, `apps/web/app/models/pageBuilder/EmailKind.ts`, `apps/web/app/services/pageBuilder/emailKind.ts`. Next step: a section, column and leaf component. Sections are full-width bands around a centred body-width container. Columns sit side by side and stack via `checkIsStackedColumns`. Leaves take their attributes from `getEmailAttributeValue(node, attribute, root.attributes)`. Then the two named scenario tests.
2. **Preview (2.1).** Not started. Needs a server query through the document model's compile service, debounced like autosave, drawn in a sandboxed frame at desktop and mobile width, with validator messages above it. Check `apps/web/server/trpc/routers/email.ts` first.
3. **Fields (3.1–3.3).** Not started. Preview text is a root prop bound through a patch (`readEmailPreviewText`, `writeEmailPreviewText`, `getEmailPreview`). Merge fields: `{{` opens the mention suggestion, and a column dragged from a Merge fields category renders as `{{column}}` via `toMergeField` (`apps/web/app/services/emailEditor/toMergeField.ts`, `apps/web/app/models/richTextEditor/RichTextSuggestion.ts`). Attribute fields come from `getMjmlAttributeFields` in `mjml-blocks`, drawn by `apps/web/app/components/PageBuilder/StylePanel/Field.vue`. Note that `Field.vue` is also being edited by another session, so take its on-disk state as current.
4. **MJML import (4.1).** Not started. Read back with `parseMjmlDocument`. An accepted import replaces the document as one history entry (`applyEdit` in `apps/web/app/store/pageBuilder/history.ts`). A refused one names the tag or attribute that did not fit.
5. **Store union for email documents.** Partly done: `usePageBuilderDocumentStore` holds each open document under its resource type (`OpenWebpageDocument` or `OpenEmailDocument`). `getDocument`, `getKind` and `getOpenDocument` read webpages only; `getEmailDocument` and `setEmailDocument` read and write emails. A probe that made `getOpenDocument` return the union gave 59 errors across 18 files (`usePageBuilderMoves` 12, `usePageBuilderClipboard` 11, `usePageBuilderSelection` 5, `TextEditor.vue` 5, `history.ts` 3, `usePageBuilderTheme` 3, `usePageBuilderStyle` 3, `Editor.vue` 3, `Overlays.vue` 3, and fewer elsewhere). That count is the size of the generalization, so the composables move over one at a time. Each keeps its webpage behaviour and takes the kind from the open document. Then `usePageBuilderDocumentStore` holds a discriminated union, and the webpage composables narrow to `WebpageDocument`. The 61-error list from the attempt is a guide, not a plan.
6. **Email editor cutover (5.1–5.3).** Not started. Scope: `createContentData` binding with `onRead`; publish compiles and refuses invalid markup; `generateEmailHtml` and personalised export with the editor closed; remove the `useEmailEditorStore` live-editor bridge (`apps/web/app/store/emailEditor/index.ts`); the `ResourceEditorComponentMap` Email entry; the survey invite as a resource link. Replace `apps/web/app/components/Resource/Email/Editor.vue` (GrapesJS) once the canvas exists. `apps/web/server/services/emailEditor/transformPublishedEmail.ts` requires `html`.
7. **GrapesJS removal (4.1).** Not started. Files: `apps/web/package.json`, `pnpm-workspace.yaml` catalog, `osv-scanner.toml` exception, `apps/web/configuration/security.ts` origins, `apps/web/shared/services/grapesjs/constants.ts`, `apps/web/shared/models/grapesjs/AGrapesJsEditor.ts`, `apps/web/app/composables/grapesjs/*`, `apps/web/app/types/grapesjs.d.ts`, `apps/web/app/models/grapesjs/GrapesJsBlock.ts`, `apps/web/app/services/grapesjs/*`, `apps/web/app/store/emailEditor/exportDialog.ts` (decision needed), `.agents/skills/grapesjs/`, `.agents/ledgers/grapesjs.md`. Replace the skill and ledger with a page-builder equivalent. Do this only after items 1–6 are done.
8. **Spec rewrites (4.2).** Not started. `openspec/specs/resource/webpage-plugin-*`, `webpage-survey-invite-blocks`, `webpage-social-preview`, `email-personalization`, `email-preview-text`, `email-web-view`, `explorer`, `resource-file-assets`, `resource-save-state`, `page-builder/document-model`, `resource/README.md`, `mjml-blocks/README.md`.
9. **Canvas hover and select (performance-and-proof 2.1).** Open. A test on the canvas overlay with `attachTo: document.body` failed with an unmount `nextSibling` error, so it was dropped. The overlay selection test stays. Needs a browser proof or a workable test.
10. **Background layers for the style panel.** Not started. Colour, image and gradient layers.
11. **Bundle budget (cutover 6.1).** Open. 200 KiB gzipped. Measure after the GrapesJS removal (item 7).
12. **Browser proofs.** Open: performance-and-proof 1.1, 3.1–3.3, 4.1, 5.1.
13. **Performance budgets. Calls not yet made.** `renderWebpageDocument.bench.ts`: 2000 nodes take about 5.8 s against a 20 ms budget, because each text node calls `renderNoteHtml`, which runs tiptap's `generateHTML` with a new happy-dom window. `applyWebpageEdit.bench.ts`: an edit takes about 7.1 ms against 0.5 ms, because `applyBlockEdit` re-parses the whole document per edit. Recommendation: revise the spec numbers to measured values with a margin, record the cost, and fix the render path in a separate change. The user has not chosen yet.
14. **Final review and finishing audit.** Not started. Run `code-review` (both lanes) and `finishing` over the whole change, after items 1–13. Then push.

Blueprint backfill (cutover 2.2) is excluded. It needs explicit dev and prod go-aheads.

## Sources

- [MJML documentation](https://documentation.mjml.io/) — `mj-column`'s stacking below the body breakpoint and the default attributes the canvas draws with until a node sets its own.
- [MJML 5.0.0 release](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) — the major the server compiles on (5.4.1 installed), its new minifiers, and the browser build's size.
