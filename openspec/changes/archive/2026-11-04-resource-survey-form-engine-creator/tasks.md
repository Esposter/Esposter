# Tasks

Build order. The store and commands come first; the panes read them and are independent of each other.

## 1. State

- [x] 1.1 Write the creator store and `useSurveyCreatorCommands`: apply an edit through the core's document schema, the bounded history, selection, and every command in the design. The survey check runs before a save, in `Editor.vue`, not in each edit. Test-first, one case per scenario in the spec delta.
      Verify: each scenario is a test, a refused move records nothing, and an undo after a move restores the previous tree.
- [x] 1.2 Write the autosave and the toolbar actions: autosave through the store, import, export and clear. The toolbar is `Toolbar.vue`, and the autosave is `useSurveyCreatorAutosave` with the save in `Editor.vue`.
      Verify: an imported document exports to the same document, and a failing import leaves the survey unchanged with the fault's path.

## 2. Panes

- [x] 2.1 Build the layers tree with drag and Alt+arrow moves, and the palette.
      Verify: a keyboard-only reorder test moves a question and leaves the document valid, and choosing a kind inserts it after the selection.
- [x] 2.2 Build the canvas in design mode and the Design and Preview switch.
      Verify: clicking an element selects it, and the preview starts fresh and saves no response.
- [x] 2.3 Build the shell that lays the panes out for every width. The [respondent](../../../specs/resource/survey-respondent/design.md) part mounts it in `Editor.vue` in the swap.
      Verify: a component test mounts the shell with a fixture document and the panes follow one selection.
