---
title: Email preview text
description: Proposal — a Preview text field in the email's Editor blade, written into the MJML as its mj-preview so the compiled HTML, the exported files and the published web view all carry the line an inbox shows under the subject.
model: claude-opus-5-5
---

# Email Preview Text

An email's preview text — the preheader — is the line an inbox shows next to the subject before the email is opened. Mailchimp asks for it beside the subject, and says what happens without it: "email clients will pull in the first part of your message by default", which can be a "View in browser" link or stray code. Every email here compiles to HTML with none, so the inbox line of any email sent from an [exported file](/docs/resource/email-personalization) is the first words of the body — in the default template, "My Company".

MJML already has the element: `mj-preview` inside `mj-head` compiles to the hidden preheader block at the top of the body. The `grapesjs-mjml` plugin registers both, but neither can be dragged onto the canvas, so today it is reachable only by importing hand-written MJML.

## What it adds

- **A Preview text field** in the Editor blade's bar, beside the dataset picker. It reads the `mj-preview` of the email's `mj-head`, and a change writes it there through the GrapesJS component API — creating the `mj-head` and the `mj-preview` when the email has none, and removing the `mj-preview` when the field is cleared. The edit is an ordinary change to the project, so the editor's own storage tick saves it, undo takes it back, and the save-time HTML capture ([email web view](/docs/resource/email-web-view)) compiles it in.
- **Merge fields work in it.** A `{{column}}` typed into the field is substituted per row on export like any token in the body, since substitution runs over the whole compiled HTML.
- **A hint of the length inboxes show**: the field counts characters and says, past a named limit, that most inboxes cut the line there — advice, not a cap, as Mailchimp's is.

The first check of the build is that `mjml-code-to-html` compiles the `mj-head` the component tree holds; if the plugin drops it, the preheader is written into the compiled HTML by `getEmailHtml` instead, which every consumer already goes through.

## What is deliberately not in it

- **No subject line.** A subject belongs to a send, and nothing sends ([email sending](/docs/resource/deferred/email-sending)); the preheader is part of the HTML itself, which is why it is useful before sending exists.
- **No `mj-title`.** The published web view is titled by the resource's name already.

## Key files

| File                                                | Role after the change                                              |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/web/app/components/Resource/Email/Editor.vue` | the Preview text field in the blade's bar                          |
| `apps/web/app/services/emailEditor/getEmailHtml.ts` | the fallback write of the preheader, if the plugin drops `mj-head` |

## Sources

- [Mailchimp — About preview text](https://mailchimp.com/help/about-preview-text/) — what the preview text is, and what an inbox shows without it.
- [Mailchimp — Edit your email's subject line, preview text…](https://mailchimp.com/help/edit-your-emails-subject-preview-text-from-name-or-from-email-address/) — the field asked for beside the subject.
- [MJML — mj-preview](https://documentation.mjml.io/#mj-preview) — the element, inside `mj-head`, that compiles to the hidden preheader.
