## Why

An email's head and body settings are stored and drawn: its title, its font list, its body width and background, its language and its direction all reach the compiled email. Nothing in the editor edits them. With nothing selected the inspector only asks for a block, so the only way to change these is to rewrite the email's MJML source. The webpage's Page tab edits its own language with nothing selected, so the email is the one editor where the document has no settings at all.

## What Changes

- With nothing selected, the inspector keeps its prompt to select a block and offers the email's settings beside it.
- The settings edit the email's language, direction, title, font list, body width and body background.
- A setting is one undoable change, and clearing a field removes its value from the email.
- A font address or a body width the email cannot take is refused in its field.

## Capabilities

### Modified Capabilities

- `resource/email-layout`: with nothing selected the inspector offers the email's settings beside its prompt, and a node selection still offers Content and Style only.
- `resource/page-builder/email`: the email's settings edit its head and body.

## Impact

The root form gains its fields, and the inspector's nothing-selected state offers the settings beside the prompt. The MJML attributes that set defaults for every component, the breakpoint and the stylesheet block are not edited here, and the email still has no theme. The inspector is drawn in both states, so the canvas does not move when a block is selected.
