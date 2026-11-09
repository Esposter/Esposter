# Durable Asset URLs

Images in a personalised HTML file that still show when the file is opened off disk, outside the owner's signed-in session. It covers the email row "Images in a personalised HTML file opened off disk". The reference product names no equivalent.

## Why deferred

An exported file keeps the owner's own asset addresses, and the personalization spec requires an exported image to be blank outside the owner's signed-in session ([email personalization](../../../specs/resource/email-personalization/spec.md)). Showing the image from disk would need an address any reader's browser can load, which makes the owner's assets reachable from the link alone. The resource file assets design names durable public asset urls as the follow-on to email sending, since a recipient's mail client is the reader that needs them ([resource file assets](../../../specs/resource/resource-file-assets/design.md)). Until mail sending is reopened, the file's images stay owner-only.

**Revisit when:** email sending is reopened ([email sending](../email-sending/design.md)) and needs images a recipient's client can load without the owner's session.
