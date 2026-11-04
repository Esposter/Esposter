# Full screen menu item

A Full screen item in the PDF viewer's More menu, which makes the viewer's root full screen through the browser's full screen API.

## Why not

The viewer is hosted only by a dialog that expands over the screen, and the expand keeps the toolbar and the sidebar in view. A menu item would reach the same state through a second route, which the viewer does not need. The dialog's expand is the one full-screen control, so the menu does not repeat it.
