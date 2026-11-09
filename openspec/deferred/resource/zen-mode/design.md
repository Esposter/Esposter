# Zen mode

A control that hides the toolbar, the view and the properties panel, so that only the canvas is shown.

## Why deferred

The toolbar and the view already float over the canvas and clear it, and the properties panel opens only with a selection ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)). A hide control would add a layout state of its own. The editor shell resolves each editor's regions from data ([editor shell](../../../specs/resource/editor-shell/design.md)), so a hide-everything state would be a layout that every editor declares, not a switch on the whiteboard. The shell-wide control is what this case needs, and it is not designed.

**Revisit when:** a hide-chrome control is designed in the editor shell for every editor.
