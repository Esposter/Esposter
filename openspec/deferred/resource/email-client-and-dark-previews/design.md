# Email client and dark-mode previews

A preview of the open email as particular mail clients draw it, and as a dark mode draws it, beside the device-width preview the editor already has.

## Why deferred

Both halves have a cost no surveyed builder pays alone. A client preview is a rendering service: Litmus documents previews across a large set of clients, and no builder surveyed draws them itself. A dark-mode preview is an approximation, which Stripo describes as approximate, since each client inverts colours its own way, and the editor's Preview already shows the compiled markup the client receives. An approximation shown as a preview would tell a reader their email is fine when a client disagrees. The email's [layout](../../../changes/resource-email-layout/design.md) lists the validator's messages in the problems surface, and checks the document itself can answer, such as contrast, links and alternative text, are the cheaper interim for a later change: they are computations over the document and need no service.

The survey of email builders found no tool that documented a plain-text version, a subject line or a preheader in its builder, so those are not designed here either. The preview text is already a root prop of the email, and sending is the [deferred email sending](../email-sending/design.md) idea.

## Revisit when

Email sending ships, so that a real recipient's client is where the question matters, or when a rendering service is admitted for another reason. A dark-mode approximation is revisited only with a source that documents how clients invert, so the preview can be labelled by what it is.
