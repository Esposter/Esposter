# Style panel

## Why

The webpage editor keeps styles in shared classes and a free stylesheet, which forces the selector model, the class bookkeeping and the rule-matching the old engine needed. A style belongs to the node it styles, so each node can carry its own styles per breakpoint and state, and reuse comes from theme tokens and copy and paste rather than from shared classes.

## What Changes

Each node carries its own styles, edited in a panel of library controls, with three breakpoints and two states.

- Each node holds its own styles for each breakpoint and each state. No class is shared between nodes, and there is no free stylesheet.
- There are three breakpoints: base for desktop, tablet at 991 pixels and below, and mobile at 478 pixels and below. Editing at tablet writes the tablet override, and the narrowest desktop width is decided beside those two.
- The two states are default and hover, and a hover style also applies when a reader focuses the element with the keyboard.
- A colour can be picked as a theme token, so editing the token recolours every node that uses it.
- A value the browser does not support, or one holding braces, angle brackets or exceeding the length limit, is kept in its field with an error and is not saved.
- Each field shows the value in effect at the active breakpoint and state, and names where an inherited value comes from. Reset removes an override.
- Copy style and Paste style carry a node's styles to another node.
- A slider previews live and records one undoable change when it settles.
- An email node has no breakpoints or states, and its style fields are its email attributes.
- **Capabilities:** `resource/page-builder/style-panel` (new).

## Capabilities

- **resource/page-builder/style-panel** (new)

## Waiting on

None.

## Impact

- The webpage editor's style panel, which replaces the old style manager and its sectors.
- The renderer's style output, which emits each node's rules desktop first, with the tablet and mobile rules overriding the base.
- The theme's tokens, which the panel offers as swatches.
- The shared UI library, which gains a colour field with token swatches.
- The email editor, whose style fields reuse the same field components.
