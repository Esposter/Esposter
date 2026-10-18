# Email

The email editor, built over the node types and the renderer contract the [document model](../resource-page-builder-document-model/design.md) defines, inside the frame and shell the [canvas](../resource-page-builder-canvas/design.md) draws, with the field components the [style panel](../resource-page-builder-style-panel/design.md) builds.

## Email

MJML stays the engine, and the email's node types are its components from the [MJML blocks](../resource-page-builder-mjml-blocks/design.md) package: their attributes, MJML's defaults, their nesting and the head as the root's props. That package owns what an email may hold. This page is what the editor draws over it, plus the one type the app adds, the survey invite, an `mj-button` whose survey link prop indexes the invite as the webpage's does.

The preview text is a root prop, so the bar's field binds it through a patch like any other edit, and `readEmailPreviewText`, `writeEmailPreviewText` and `getEmailPreview` go with the read-back after every change. A merge field is an inline node in the text, inserted by typing `{{` — the mention suggestion the composer already uses, offering the bound dataset's columns — or by dragging a column from the Merge fields category; it renders as the `{{column}}` token `toMergeField` writes today.

**The design canvas** draws each email type with its `canvas` component:

- a section as a full-width band around a centred body-width container;
- its columns side by side, as MJML lays them on a desktop client, and stacked below MJML's 480-pixel breakpoint in the mobile width;
- each leaf with what the MJML blocks' cascade resolves for it. The cascade is the node's own attributes, then the root's `mj-attributes`, then MJML's defaults, which the package holds equal to the installed release. A new text therefore shows in Ubuntu, Helvetica, Arial at 13 pixels with 10 by 25 of padding, and a button in #414141 with a 3-pixel radius, until the author or the root says otherwise.

**Style fields.** An email node has no breakpoints and no states: email clients honour media queries unevenly, so MJML's own column stacking is the responsive model. Its style fields are its MJML attributes, such as padding, colours, font, alignment, border and background image. Each control is chosen from the package's field descriptor for the attribute, drawn by the style panel's field components, and stored as a prop. A field the author has not set shows the cascade's value as its inherited placeholder, and clearing it removes the prop, so the root's `mj-attributes` apply again. The Style tab shows no breakpoint or state choice for an email.

**Import MJML** is the one import the editor offers. Because the types are MJML's own components, MJML source from another tool reads back faithfully through the package's `parseMjmlDocument`, unlike the HTML import the [program](../resource-page-builder-program/design.md) leaves out. The command opens a code field. An accepted import replaces the document as one history entry. A refused one leaves the document as it was and names the tag or attribute that did not fit.

**Preview** is the truth: a toggle beside the device widths shows the open document compiled by the server, through a query that passes the document to the document model's compile service, debounced like the autosave so Preview shows an edit before it is saved and reads nothing GrapesJS still writes. It draws in the sandboxed frame the published view uses, at desktop and mobile width, with MJML's validation messages above it as an alert. The design canvas is where an email is edited and Preview is what a client receives, because email-client HTML — nested tables and conditional comments — is output to inspect, not a surface to edit in place.

The compile runs in the app server, on MJML's Node package in place of the browser build bundled inside `grapesjs-mjml`. Its weight — a CSS minifier, an HTML minifier, an inliner and a DOM parser — lands in the server, where no reader downloads it.

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

## Sources

- [MJML documentation](https://documentation.mjml.io/) — `mj-column`'s stacking below the body breakpoint and the default attributes the canvas draws with until a node sets its own.
- [MJML 5.0.0 release](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) — the major the server moves to, its new minifiers, and the browser build's size.
