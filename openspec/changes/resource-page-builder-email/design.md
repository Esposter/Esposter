# Email

The email editor, built over the node types and the renderer contract the [document model](../resource-page-builder-document-model/design.md) defines, inside the frame and shell the [canvas](../resource-page-builder-canvas/design.md) draws, with the field components the [style panel](../resource-page-builder-style-panel/design.md) builds.

## Email

MJML stays the engine, behind an email node-type set and compiled on the server.

| Type                                          | MJML                                    | Notes                                                            |
| --------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| Email root props                              | `mjml`, `mj-head`, `mj-body`            | `lang`, preview text, body width and background                  |
| Wrapper, Section, Column                      | `mj-wrapper`, `mj-section`, `mj-column` | a section's slot allows columns only                             |
| Hero                                          | `mj-hero`                               | a background with a slot of content                              |
| Text, Button, Image, Divider, Spacer          | the same `mj-` element                  | Text holds ProseMirror JSON; an Image requires its `alt`         |
| Social and its elements, Navbar and its links | `mj-social`, `mj-navbar`                | the networks MJML names, its icons from Mailjet as today         |
| Custom HTML                                   | `mj-raw`                                | sanitised as the webpage's is                                    |
| Survey invite                                 | `mj-button`                             | a survey link prop, so the invite is indexed as the webpage's is |

The preview text is a root prop, so the bar's field binds it through a patch like any other edit, and `readEmailPreviewText`, `writeEmailPreviewText` and `getEmailPreview` go with the read-back after every change. A merge field is an inline node in the text, inserted by typing `{{` — the mention suggestion the composer already uses, offering the bound dataset's columns — or by dragging a column from the Merge fields category; it renders as the `{{column}}` token `toMergeField` writes today.

**The design canvas** draws each email type with its `canvas` component: a section as a full-width band around a centred body-width container, its columns side by side as MJML lays them on a desktop client and stacked below MJML's 480-pixel breakpoint in the mobile width, and each leaf with MJML's own defaults — a text in Ubuntu, Helvetica, Arial at 13 pixels with 10 by 25 of padding, a button in #414141 with a 3-pixel radius. Each type's schema carries those defaults as Zod defaults, and a server test holds them equal to the default attributes of the MJML components installed, so an MJML release that changes one fails a test rather than drifting the canvas.

**Style fields.** An email node has no breakpoints and no states: email clients honour media queries unevenly, so MJML's own column stacking is the responsive model. Its style fields are its MJML attributes — padding, colours, font, alignment, border, background image — drawn by the style panel's field components and stored as props, and the Style tab shows no breakpoint or state choice for an email.

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
apps/web/shared/services/pageBuilder/email/     the email node types, their schemas and their MJML
apps/web/app/components/PageBuilder/Email/      the design canvas's email types, Preview and the merge field node
```

## Sources

- [MJML documentation](https://documentation.mjml.io/) — the component set, `mj-preview`, `lang` on the root, `css-class`, and the default attributes the canvas reproduces.
- [MJML 5.0.0 release](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) — the major the server moves to, its new minifiers, and the browser build's size.
