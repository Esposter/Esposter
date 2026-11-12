## Why

A right-click on the whiteboard canvas opens the browser's own menu, which offers Save image and Inspect and nothing the board can do. The commands a selection takes live on keys and in the properties panel, so an owner who reaches for the right button, as in every drawing board, finds nothing to act on.

## What Changes

- A right-click on an element selects it, unless it is already part of the selection, and opens a menu of the commands the selection takes: cut, copy, paste, duplicate, the four stacking steps for one element, edit text where the element has text, and delete.
- A right-click on the empty canvas clears the selection and opens a menu of the board's commands: paste, select all, zoom to fit and reset zoom.
- Each item runs the command its shortcut runs, so the menu, the keys and the panel never disagree.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): the canvas has a context menu of the selection's and the board's commands.

## Impact

One new service builds the menu's items from the commands the keyboard already registers, and the editor opens the shared context menu at the pointer. The browser's own menu stays on a Shift right-click, as everywhere else. No stored data changes.
