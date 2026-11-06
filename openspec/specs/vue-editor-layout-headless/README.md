# vue-editor-layout-headless

`packages/vue-editor-layout-headless` (npm `vue-editor-layout-headless`) is an editor's arrangement held as data, with no styling and no DOM: the regions of the screen, the panels each holds, and the conditions under which a panel is shown. A consumer hands it a layout and the state of the editor (its mode, its tool, its selection, the window's size class) and gets back the regions to draw, each with its panels and how it is presented.

The package's capabilities, each with its own design page and requirements:

- [Layout engine](layout-engine/design.md) resolves a layout against the editor's state and the window's size class, checks a layout for the mistakes a typecheck cannot see, and keeps the reader's sizes and open regions apart from the layout.

The app's own use of the package is the [editor shell](../resource/editor-shell/design.md): it draws the resolved regions, and each editor supplies the layout and the content of its panels.
