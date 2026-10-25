## 1. Design canvas

- [x] 1.1 Draw sections, columns and leaves on the design canvas, stacking columns below 480 pixels, each leaf with the attributes the MJML blocks' cascade resolves. Verify: tests named after the scenarios 'columns stack below the mobile breakpoint' and 'a new text shows the default font and padding'.
  - Done at `daaa5a830b`: every leaf draws the attributes its component takes, through one attribute-to-CSS map, and a divider draws the rule its border names. Tested by 'a labelled leaf draws the attributes its component takes' and 'a divider is drawn as the rule its border attributes name'. Owed, browser proof: the leaves' look against MJML's own render, at both widths.

## 2. Preview

- [x] 2.1 Show the open document, compiled by the server, in a frame at desktop and mobile width, with the validator's messages above it. Verify: tests named after the scenarios 'preview shows the compiled email at mobile width' and 'validator messages show above the preview' in `apps/web/app/components/PageBuilder/Email/Preview.test.ts`.
  - Done at `6efaabbb45`: the email editor's header holds a Design / Preview toggle beside the dataset picker, and Preview takes the design's place with the device toggle above it, while the design stays mounted. Owed, browser proof: the toggle in the running editor, since the blade has no test of its own.

## 3. Fields

- [x] 3.1 Bind the preview text to the root's field, so every change updates the compiled email. Verify: a test named after the scenario 'Editing the preview text updates the compiled email'.
- [x] 3.2 Insert merge fields by typing two braces or by dragging a column into a text. Verify: tests named after the scenarios 'typing two braces offers the dataset's columns' and 'dragging a column into a text inserts a merge field'.
  - Done: typing two braces was built with the palette's merge fields at `33a232002d`. A column dragged from the Merge fields group onto a text is appended to that text's rich text at `a1c8ea100e`, tested by 'dragging a column into a text inserts a merge field'. The drop appends at the end of the text, not at the caret. Owed, browser proof: the drag's feel, and whether a text drop needs an indicator, which no text drop draws.
- [x] 3.3 Give email nodes their attribute fields from the MJML blocks' field descriptors, drawn by the style panel's field components, each unset field showing the cascade's value, with no breakpoints or states. Verify: tests named after the scenarios 'an email text has no breakpoint or state choice' and 'clearing a field restores the root's default'.
  - Done at `2ea2babd9d`: an enum is a select of its options, a colour a colour field and a boolean a switch, each reset by a Reset control once the node sets the field. The email's style controls are `PageBuilder/Email/StyleField.vue` over the library's controls; the webpage's `StylePanel/Field.vue` takes the webpage's style property and is not used. Owed, browser proof: each control's look and the reset in the running editor.
- [x] 3.4 The preview text's field shows the length its schema allows, beside the field. Verify: a test named after the scenario 'an email's preview text shows the length its schema allows beside the field'.
  - Done at `eed2e584ba`: `MAX_EMAIL_PREVIEW_LENGTH` (140) is the schema's `max`, and the schema form counts a text field against its JSON schema's `maxLength`.

## 4. Import

- [x] 4.1 Import MJML source through the MJML blocks' read back, replacing the document as one history entry, or naming what did not fit. Verify: tests named after the scenarios 'Importing MJML replaces the email' and 'An import that does not fit leaves the email as it was'.

## 5. Merge fields in the stored output

- [x] 5.1 Substitute a merge field in the one form the compile writes. Verify: the test 'a merge field's token compiles to the one form substitution matches' in `apps/web/server/services/emailEditor/compileEmailDocument.test.ts`, and the substitution tests.
  - Done at `22fa6edf14`: the compile writes `&` and `<` and `>` escaped and leaves quotes, so substitution matches the text escape of the token, not the raw form and not the attribute escape.

## Owed

Browser proofs, each needing a running editor and the owner's eye, so none is ticked:

- 1.1: the leaves drawn against MJML's own render, at desktop and mobile width.
- 2.1: the Design / Preview toggle in the running editor, and the preview frame at both widths.
- 3.2: the drag of a column onto a text, its feel, and whether a text drop needs an indicator.
- 3.3: the enum, colour and boolean controls and their reset, in the running editor.

Owed, not browser proofs, with the reason each is not done in this change:

- Store union (the email design's "The shell's document kind"): done for the shell. The composables and children the shell mounts for both documents take the shell's kind: `Canvas/Overlays.vue` and `ContentPanel.vue` type their document and kind as `AnyPageBuilderDocument` and `AnyPageBuilderKind`, and `Canvas/NodeToolbar.vue` takes the kind as a prop. Every MJML definition carries a `formSchema`, which the content panel draws, and the shell's kind requires it. Still webpage-narrowed by design: `usePageBuilderStyle` and `usePageBuilderTheme` read the webpage's own style and theme through the document store's webpage getter, and the history store's preview, which only a webpage has. The style panel is chosen by kind, and the Theme tab is listed only for a webpage, since an email has no theme controls (`1eeee921d2`). `vue-tsc` on `apps/web` exits 2 with 25 errors, none in the page builder, the email or MJML; the 29 on `ai/queue` before this change were the same 25 plus the page builder's and email's four.
- Bundle budget (cutover 6.1): each editor's script at most 200 KiB gzipped on the production build. Measured by CI's production build, not in a session.
- Canvas hover and select test (performance-and-proof 2.1): the overlay's hover and selection outlines are tested by `Overlays.test.ts`, which runs clean. The variant that mounts the overlay on `document.body` is restored as "a hovered node is outlined in a frame attached to the document", and runs with no unmount error: 3 passed, 0 errors in the verbose run. No source change was needed.
- Background layers for the style panel (colour, image and gradient): a webpage style capability. An email's background is its `background-color` and `background-url` attributes, which the style fields already draw, so this is not an email task and is owed to the webpage's style panel.
- Done at `2160b3827a`: an image's `src` gets an upload through `useUploadResourceFile`, the path Survey, Note and Webpage use, and the asset url it returns is set as the source. Tested by `ImageUploadField.test.ts` (fails first, before the component existed) and the style panel's upload test.
- Performance budget scenario tests (performance-and-proof): owed to that change, which names the budgets.
