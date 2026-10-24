## 1. Design canvas

- [ ] 1.1 Draw sections, columns and leaves on the design canvas, stacking columns below 480 pixels, each leaf with the attributes the MJML blocks' cascade resolves. Verify: tests named after the scenarios 'columns stack below the mobile breakpoint' and 'a new text shows the default font and padding'.

## 2. Preview

- [ ] 2.1 Show the open document, compiled by the server, in a frame at desktop and mobile width, with the validator's messages above it. Verify: tests named after the scenarios 'Preview shows the compiled email at mobile width' and 'Validator messages show above the preview'.

## 3. Fields

- [ ] 3.1 Bind the preview text to the root's field, so every change updates the compiled email. Verify: a test named after the scenario 'Editing the preview text updates the compiled email'.
- [ ] 3.2 Insert merge fields by typing two braces or by dragging a column into a text. Verify: tests named after the scenarios 'Typing two braces offers the dataset's columns' and 'Dragging a column into a text inserts a merge field'.
- [ ] 3.3 Give email nodes their attribute fields from the MJML blocks' field descriptors, drawn by the style panel's field components, each unset field showing the cascade's value, with no breakpoints or states. Verify: tests named after the scenarios 'An email text has no breakpoint or state choice' and 'Clearing a field restores the root's default'.

## 4. Import

- [ ] 4.1 Import MJML source through the MJML blocks' read back, replacing the document as one history entry, or naming what did not fit. Verify: tests named after the scenarios 'Importing MJML replaces the email' and 'An import that does not fit leaves the email as it was'.

## Handoff

Written at the end of a session that stopped under the usage reserve (no code-writing agents until the weekly window resets). Each item says what is done, the calls made, and the next step, so it can be picked up cold.

### Done on `ai/queue`

- `e1e12376` — `getEmailAttributeValue` resolves a node's own prop, then its component's MJML default.
- `0a740f51` — `checkIsStackedColumns` at `EMAIL_MOBILE_BREAKPOINT = 480`. Call made: the breakpoint is inclusive (`<= 480`), following MJML's `max-width: 480px` media query, not the design note's "below 480".
- `1cdfbdd0` — the root's `attributes` join the cascade: node prop → root `attributes[node.type]` → root `attributes["mj-all"]` → component default. The helper now takes the root's `attributes` as its third argument. Its only caller is its test.
- `c6eb6f5a` — `getEmailColumnWidths`: a column's own width when it sets one, else an equal share of the percentage the set widths leave; a pixel width is kept and takes none of the share. Its four tests pass, and an overflowing set width leaves the unset columns `0%` rather than a negative share; nothing renders it yet.
- `c3996b74` — lint and naming. Email test titles are lowercase, so the scenario names in `spec.md` and above are lowercase too. The starter email comment is rewrapped with capitalised continuation lines.

Verified at `c3996b74`: the six email suites pass (11 tests); `vue-tsc -p .nuxt/tsconfig.app.json` exits 0; oxlint and ESLint are clean on `apps/web/shared/services/pageBuilder/email/`.

### Calls already made

- The email document type is `z.output<typeof emailDocumentSchema>`, derived from the app's schema, not `MjmlDocument` from `mjml-blocks`. Importing `MjmlDocument` gives `never` leaves in the app program, because `apps/web/shared/models/pageBuilder/EmailSurveyInviteNode.ts` augments `MjmlLeafNodes`.
- The document store stays webpage-only until the email canvas holds an email document. Widening it to `WebpageDocument | EmailDocument` was tried twice (8 errors, then 61) and reverted. The union belongs with the email canvas.

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
