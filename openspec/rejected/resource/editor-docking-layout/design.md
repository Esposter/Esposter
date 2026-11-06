# Editor docking layout

A reader moves an editor's panels: drags a panel to another edge, groups it into a tab set with another, or floats it as a window, as Dockview, FlexLayout, golden-layout and Lumino let a reader do.

## Why not

- **No editor asked for it.** The whiteboard needs a toolbar and a panel for a selection, the guided editors need a structure region, an inspector and a canvas, and each has one arrangement that serves it. The docking engines are modelled on an IDE, where the reader's own working set of tools is the point.
- **It needs a way back.** A layout the reader can rearrange needs a reset to the default and a saved arrangement per editor, and a layout the reader has broken is a support request. The program's layouts are data a check reads, so every state a reader can reach is one the check has seen.
- **It is the part of the libraries that costs the most.** Floating windows, popouts and drag-to-dock are most of what Dockview and golden-layout hold, and none of it is a behaviour any surveyed freeform or structured editor offers its reader. Excalidraw, tldraw, SurveyJS Creator, Typeform and the email builders surveyed all have fixed arrangements.
- **A reader's resize is enough.** The layout engine keeps what the libraries settled that an editor uses: panels named by id, the reader's sizes kept apart from the layout, limits and collapsing, and a splitter operated from the keyboard.

Adopting Dockview's Vue binding is rejected for the same reason: it brings the docking and popout surface along for a layout of four regions. See the [editor layout program](../../../specs/resource/editor-shell/design.md).
