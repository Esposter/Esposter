## Why

A read of every component in the app, one reader per batch of folders, found the structure the dialog change fixes repeated well beyond dialogs. Containers that frame other content leave their regions to the call site, so the same padded, scrolling body and the same header and footer are rebuilt by hand in dozens of places. The same read found the loading, error and empty states of a list written out by hand in about 25 places, and a handful of layout defects of the kind that make a body overflow its frame.

## What Changes

- The frame, the blade outlet, the editor shell's regions, the settings content, the right sidebar's panes and the page layout's slot each own their padded, scrolling body, and a call site writes content only.
- The frame gains a pinned footer slot beside its title bar and body.
- A shared async body draws a list's loading, error and empty states and its content, so a list supplies the four contents and not the branching.
- A dialog takes a named size in place of a width literal.
- The layout defects the read found are fixed where they stand.
- **BREAKING** A blade, pane or region that wrote its own padding or scroll wrapper loses it to the container.

## Capabilities

### Modified Capabilities

- `ui-library`: the frame, the async body and the dialog's size are added to the library's contract.

## Impact

About 60 call sites lose a hand-written wrapper. No behaviour changes except the defects fixed.
