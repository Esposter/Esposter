## Why

The base dialog draws a title bar and then a bare slot. Whether a body scrolls, how it is padded and where the actions row sits is decided at every call site, so each of the 41 dialogs rebuilds the same body and footer by hand, and each rebuild can get it wrong. A read of every call site found 28 with a footer written inside the default slot, 20 with a scroll somewhere in the body of which only 16 sit on the right element, a form body that scrolls with its footer inside it, and two bodies with a fixed height. A body that outgrows the dialog, such as a long column list, then overflows the frame instead of scrolling inside it.

## What Changes

- The base dialog draws its body as a region of its own: padded, in a column, and scrolling when it outgrows the frame, with the title bar and the footer held in place.
- The base dialog gains a footer slot drawn under the body, outside its scroll, with the actions row's layout.
- A body that wants no padding or scroll of its own opts out with one prop, which the command palette and the settings wrapper use.
- A form dialog's submit button is associated with its form by the form id, so the form sits in the body and the submit sits in the footer.
- The popover's panel takes the same body region, so a long list inside a popover scrolls the same way.
- **BREAKING** The default slot is body content only. A call site that wrote its own padding, scroll wrapper or footer inside it moves those to the regions.

## Capabilities

### Modified Capabilities

- `dialog-shell`: the base dialog owns the body and footer regions, and the shell fills them.

## Impact

All 41 dialog call sites change shape, with no change to what they show. The styled shells keep their props and fill the footer slot instead of drawing their own row. A scan test fails a dialog that draws its own scroll wrapper or footer inside the default slot.
