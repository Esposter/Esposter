## Why

A visual is a chart drawn on a canvas, and a reader who cannot see it gets nothing from a published dashboard: the tile carries no accessible name outside the editor. The reference gives each visual alternative text, written by its author, for screen-reader users.

## What Changes

- A visual takes optional alternative text, entered in its inspector.
- The published tile is named by it, and by the visual's label while it has none.
- The editor's tile keeps the name it has, the visual's label.
- The text is held to a length, and a stored one over it is refused.

## Capabilities

### Modified Capabilities

- dashboard-grid (resource/dashboard-grid): a published tile has an accessible name, set by the visual's alternative text.

## Impact

The visual model gains one optional string and the inspector one field. A stored visual without it reads the label, so no stored dashboard changes and every published tile gains a name.
