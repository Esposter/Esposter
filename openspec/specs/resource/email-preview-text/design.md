# Email Preview Text

An email's preview text — the preheader — is the line an inbox shows beside the subject before the email is opened. Without one, "email clients will pull in the first part of your message by default", as Mailchimp puts it: in the default template, "My Company". MJML already has the element, `mj-preview` inside `mj-head`, which compiles to a hidden block at the top of the body. The [page builder](../page-builder/README.md) writes it as one prop of the email's root, so the line is set in the root's form and never placed on the canvas.

## How it works

- **The field is the root's form.** The email's root form holds one field, `preview`, and nothing else of the head. It is edited through the page builder's history like any other root edit, so an undo takes the line back.
- **It compiles to markup.** The [MJML blocks](../../mjml-blocks/README.md) package writes the root's `preview` as an `mj-preview` in the head, its text escaped, and reads the element back into the same prop on import. A preview left unset writes no element.
- **A new email starts with a placeholder.** The starter document carries a short line that shows under the subject in most inboxes, which the author replaces.
- **Merge fields work in it.** A `{{column}}` in the preview text is substituted per row on export like any token in the body, since substitution runs over the whole compiled HTML ([email personalization](../email-personalization/design.md)).

## What is deliberately not in it

- **No subject line.** A subject belongs to a send, and nothing sends ([email sending](../../../deferred/resource/email-sending/design.md)); the preheader is part of the HTML itself, which is why it is useful without sending.
- **No `mj-title`.** The published web view is titled by the resource's name already.

## Key files

| File                                                                | Role                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/email/emailRootFormSchema.ts` | the root form's `preview` field, the only head field it edits |
| `apps/web/shared/services/pageBuilder/email/starterEmailSource.ts`  | the starter email's placeholder preview                       |
| `packages/mjml-blocks/src/services/renderMjmlHead.ts`               | the preview written into the head as `mj-preview`             |
| `packages/mjml-blocks/src/services/readMjmlHead.ts`                 | the preview read back from `mj-preview` on import             |

## Sources

- [Mailchimp — About preview text](https://mailchimp.com/help/about-preview-text/) — what the preview text is, and what an inbox shows without it.
- [Mailchimp — Edit your email's subject line, preview text…](https://mailchimp.com/help/edit-your-emails-subject-preview-text-from-name-or-from-email-address/) — the field asked for beside the subject.
- [MJML — mj-preview](https://documentation.mjml.io/#mj-preview) — the element, inside `mj-head`, that compiles to the hidden preheader.
