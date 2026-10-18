# Email

## Why

Email clients render HTML that is a decade of table and conditional-comment workarounds, which the email markup engine already encodes. The email editor therefore writes the markup and lets the engine produce the HTML, which the owner can only check by previewing it. The node types are MJML's own components, from the MJML blocks package; the editor needs a design canvas that approximates an email closely enough to edit by, and a preview that shows what a client receives.

## What Changes

An email is edited on a design canvas over the MJML blocks' types and checked in a preview of the compiled email.

- The survey invite is the one type the app adds to MJML's components.
- The design canvas draws each section as a full-width band around a centred body, columns side by side on desktop and stacked below 480 pixels, and each leaf with what its attributes resolve to through the email's defaults and the engine's own.
- Preview shows the compiled email as a client receives it, at desktop and mobile width, with the validator's messages above it.
- The preview text is a field on the email's root, so editing it updates the compiled email.
- An email node has no breakpoints or states, and its style fields are its email attributes; clearing one restores the email's default for it.
- MJML source from another tool imports as the email, as one undoable edit, or is refused naming what did not fit.
- A merge field is inserted by typing two braces, offering the bound dataset's columns, or by dragging a column into a text. It shows as its token.
- **Capabilities:** `resource/page-builder/email` (new).

## Capabilities

- **resource/page-builder/email** (new)

## Waiting on

- `openspec/changes/resource-page-builder-mjml-blocks/`, which holds the components, the cascade, the import's parser and the field descriptors this editor draws.
- `openspec/changes/resource-page-builder-document-model/`, which holds the email registry and the renderer contract this editor uses.
- `openspec/changes/resource-page-builder-canvas/`, whose frame and shell the design canvas draws in.
- `openspec/changes/resource-page-builder-style-panel/`, whose field components draw an email node's attributes.

## Impact

- The email editor's shell, its dataset picker and its preview text field.
- The design canvas's email components, drawn with the MJML blocks' cascade.
- The server, which compiles the open email for Preview and returns the validator's messages with the compiled email.
