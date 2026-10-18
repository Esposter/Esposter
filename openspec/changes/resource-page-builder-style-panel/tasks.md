## 1. Storage and output

- [ ] 1.1 Store each node's styles per breakpoint and state, with no shared class and no free stylesheet. Verify: a test named after the scenario 'A style applies only to the node it was set on'.
- [ ] 1.2 Emit the breakpoint rules desktop first, with each override applying at its width and below, and the hover rule also on keyboard focus. Verify: tests named after the scenarios 'A tablet override applies at 991 pixels and below', 'A mobile override wins over a tablet override' and 'A hover style also applies when a reader tabs to a button'.

## 2. Values and tokens

- [ ] 2.1 Check each value the browser accepts as it is typed, refusing braces, angle brackets and over-long values. Verify: tests named after the scenarios 'An unsupported style value stays in its field unsaved' and 'A style value with a brace is refused'.
- [ ] 2.2 Grow `UiColorField` its token swatches in a commit of its own, then draw the Theme panel and store a colour picked from the theme as a reference to it. Verify: a test named after the scenario 'Changing a theme colour recolours every node that uses it'.

## 3. Panel

- [ ] 3.1 Draw the style sectors with the shared UI library's controls, showing the inherited value and offering reset. Verify: tests named after the scenarios 'A field shows the inherited value and where it comes from' and 'Reset removes an override'.
- [ ] 3.2 Add Copy style and Paste style as commands. Verify: a test named after the scenario 'Paste style applies copied styles to another node'.
- [ ] 3.3 Preview slider drags on the canvas and record one undoable change on release. Verify: a test named after the scenario 'Dragging an opacity slider records one undoable change'.

## 4. The record

- [ ] 4.1 Describe the style storage, the emitted rules and the two panels as built, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
