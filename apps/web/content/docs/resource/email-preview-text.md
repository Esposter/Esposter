---
title: Email preview text
description: A Preview text field in the email's Editor blade writes the line an inbox shows under the subject into the MJML as its mj-preview, so the compiled HTML, the exported files and the published web view all carry it.
---

# Email Preview Text

An email's preview text — the preheader — is the line an inbox shows beside the subject before the email is opened. Without one, "email clients will pull in the first part of your message by default", as Mailchimp puts it: in the default template, "My Company". MJML already has the element, `mj-preview` inside `mj-head`, which compiles to a hidden block at the top of the body, but the `grapesjs-mjml` plugin offers no way to add it from the canvas.

## How it works

- **The field sits in the Editor blade's bar**, beside the dataset picker, labelled _Preview text_.
- **It writes markup.** The plugin registers `mj-head` as a component type but not `mj-preview`, and a component added by type serialises as a `<div>` the compiler ignores, so `writeEmailPreviewText` removes the preview it finds by tag and appends `<mj-preview>…</mj-preview>` to the head, the text escaped. The head keeps its other children, an email with no head gains one as the `mjml` root's first child, and emptying the field removes the preview. The edit is an ordinary change to the project, so the editor's own storage saves it, undo takes it back, and the save-time HTML capture ([email web view](/docs/resource/email-web-view)) compiles it in.
- **It reads back after every change.** `readEmailPreviewText` reads the preview's text node on each editor `update`, so an undo shows in the field too.
- **Merge fields work in it.** A `{{column}}` in the preview text is substituted per row on export like any token in the body, since substitution runs over the whole compiled HTML ([email personalization](/docs/resource/email-personalization)).
- **The length is advice, not a cap.** The field counts characters against `EMAIL_PREVIEW_TEXT_INBOX_LENGTH`, and past it says that most inboxes cut the line there.

Both services are tested against a headless GrapesJS editor with the installed plugin: the text reaches MJML's hidden preheader escaped, a second write replaces the first, and the head's other children stay.

## What is deliberately not in it

- **No subject line.** A subject belongs to a send, and nothing sends ([email sending](/docs/resource/deferred/email-sending)); the preheader is part of the HTML itself, which is why it is useful before sending exists.
- **No `mj-title`.** The published web view is titled by the resource's name already.

## Key files

| File                                                         | Role                                              |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `apps/web/app/components/Resource/Email/Editor.vue`          | The Preview text field in the blade's bar         |
| `apps/web/app/services/emailEditor/writeEmailPreviewText.ts` | The preview written into the head as markup       |
| `apps/web/app/services/emailEditor/readEmailPreviewText.ts`  | The preview read back as text                     |
| `apps/web/app/services/emailEditor/getEmailPreview.ts`       | The `mj-preview` found by its tag inside the head |

## Sources

- [Mailchimp — About preview text](https://mailchimp.com/help/about-preview-text/) — what the preview text is, and what an inbox shows without it.
- [Mailchimp — Edit your email's subject line, preview text…](https://mailchimp.com/help/edit-your-emails-subject-preview-text-from-name-or-from-email-address/) — the field asked for beside the subject.
- [MJML — mj-preview](https://documentation.mjml.io/#mj-preview) — the element, inside `mj-head`, that compiles to the hidden preheader.
