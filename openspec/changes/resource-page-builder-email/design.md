# Email

The email editor, built over the node types and the renderer contract the [document model](../resource-page-builder-document-model/design.md) defines.

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

**Preview** is the truth: a toggle beside the device widths shows `generateEmailHtml`'s output in the sandboxed frame the published view uses, at desktop and mobile width, with MJML's validation messages above it as an alert. The design canvas is where an email is edited and Preview is what a client receives, because email-client HTML — nested tables and conditional comments — is output to inspect, not a surface to edit in place.

The compile runs in the app server, which takes MJML's Node package in place of the browser build bundled inside `grapesjs-mjml`. Its weight — a CSS minifier, an HTML minifier, an inliner and a DOM parser — lands in the server, where no reader downloads it.

## Key files

| File                                                                | Role after the change                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/web/app/components/Resource/Email/ExportTruncationDialog.vue` | exports from compiled HTML, with no live editor                     |
| `apps/web/app/composables/emailEditor/useExportPersonalizedHtml.ts` | reads the compiled email instead of a live editor                   |
| `apps/web/app/services/emailEditor/exportPersonalizedHtml.ts`       | zips per-row HTML from the compiled email                           |
| `apps/web/app/services/emailEditor/substituteMergeFields.ts`        | matches the single escaped token form                               |
| `apps/web/server/trpc/routers/email.ts`                             | `generateEmailHtml`; publish compiles                               |
| `apps/web/server/services/emailEditor/transformPublishedEmail.ts`   | compiles the snapshot's MJML on the server and refuses invalid MJML |

## Sources

- [MJML documentation](https://documentation.mjml.io/) — the component set, `mj-preview`, `lang` on the root, `css-class`, and the default attributes the canvas reproduces.
- [MJML 5.0.0 release](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) — the major the server moves to, its new minifiers, and the browser build's size.
