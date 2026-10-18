# Email

## Why

Email clients render HTML that is a decade of table and conditional-comment workarounds, which the email markup engine already encodes. The email editor therefore writes the markup and lets the engine produce the HTML, which the owner can only check by previewing it. The editor needs its own email node types, a design canvas that approximates an email closely enough to edit by, and a preview that shows what a client receives.

## What Changes

An email is built from email node types, edited on a design canvas, and checked in a preview of the compiled email.

- An email is built from its root, sections, columns, and leaves for text, button, image, divider, spacer, social links, navigation, custom HTML and survey invites. A section holds only columns, and an image requires its alternative text.
- The design canvas draws each section as a full-width band around a centred body, columns side by side on desktop and stacked below 480 pixels, and each leaf with the email engine's own default look.
- Preview shows the compiled email as a client receives it, at desktop and mobile width, with the validator's messages above it.
- The preview text is a field on the email's root, so editing it updates the compiled email.
- A merge field is inserted by typing two braces, offering the bound dataset's columns, or by dragging a column into a text. It shows as its token.
- A personalised export compiles from the saved email, so it works with the editor closed. It downloads one HTML file per dataset row in a zip.
- **Capabilities:** `resource/page-builder/email` (new).

## Capabilities

- **resource/page-builder/email** (new)

## Waiting on

- `openspec/changes/resource-page-builder-document-model/`, which defines the email node types and the renderer contract this editor uses.

## Impact

- The email editor's shell, its dataset picker and its preview text field.
- The email node types and their default looks, which a server test holds equal to the installed email engine's defaults.
- The server, which compiles the email on publish and for preview, and refuses invalid markup.
- The personalised export, which reads the compiled email instead of a live editor, and the merge field substitution it runs.

Size kept as the source page's own: splitting it is a later decision.
