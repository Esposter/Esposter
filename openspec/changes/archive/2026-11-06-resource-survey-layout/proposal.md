# Survey layout

## Why

The survey creator draws three panes with tabs between them: Layers and Palette on the left, Properties, Logic and Theme on the right, and a toolbar of controls over the canvas. Every tab exists for every selection, so the Theme tab, which edits the survey's own identity, is offered with a question selected, and a narrow window turns the three panes into one tab per pane. A survey is a structured document, and the screen should say what the reader is editing and offer only what applies to it.

## What Changes

- The right pane becomes one inspector whose tabs follow the selection: the survey's texts, calculated values and theme with nothing selected, and a node's properties and conditions with a page or an element selected.
- Design and Preview are modes. Preview removes the structure and the inspector and draws the runner.
- The left pane is one structure region with an Outline tab and an Add tab.
- The bar holds undo, redo, Add page, the mode switch and the problems surface, and Import, Export and Clear fold into its overflow menu.
- A compact window keeps the canvas and opens the structure and the inspector as sheets from two buttons.

## Capabilities

- **resource/survey-layout** (new)

## Impact

The creator's shell component is replaced by a layout and a registry on the [editor shell](../2026-11-06-resource-editor-shell/design.md). The survey's store, document, commands, check and logic builder do not change, and its tab components are the registry's content.
