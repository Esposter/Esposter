# Email layout

## Why

The email editor is a page builder with a palette and layers on the left and Content and Style on the right, a Design and Preview switch beside a dataset picker, and its compile messages in an alert above the preview. An email is a structured document built on rules a mail client imposes: sections hold columns, columns hold content, and the compiled markup is what a recipient's client reads. The screen should say what it is editing, offer only what MJML accepts, and show the compile's messages where the reader can act on them.

## What Changes

- Design and Preview are modes. Preview removes the blocks region and the inspector and draws the compiled message at the device width.
- The bar holds the mode switch, the dataset picker, the preview text field, the device toggle and the problems surface.
- The inspector's tabs follow the selection: the email's own settings with nothing selected, and Content and Style with a node.
- The compile's validation messages are listed in the problems surface, in place of the alert above the preview.
- A compact window opens the blocks region and the inspector as sheets.

## Capabilities

- **resource/email-layout** (new)

## Impact

The email editor's arrangement is replaced by a layout and a registry on the [editor shell](../resource-editor-shell/design.md), beside the webpage's. The document, the compile, the personalization and the preview text do not change.
