## 1. Decide

- [ ] 1.1 Decide the narrowest width the desktop canvas frame keeps, set beside the tablet breakpoint at 991 pixels and the mobile breakpoint at 478 pixels, before the canvas ships. The design names no candidate values, so the decision picks one value and states it here. Verify: the chosen value is recorded in this change and the canvas scenario 'A narrow pane scales the desktop canvas down' is written against it.

## 2. Storage and output

- [ ] 2.1 Store each node's styles per breakpoint and state, with no shared class and no free stylesheet. Verify: a test named after the scenario 'A style applies only to the node it was set on'.
- [ ] 2.2 Emit the breakpoint rules desktop first, with each override applying at its width and below, and the hover rule also on keyboard focus. Verify: tests named after the scenarios 'A tablet override applies at 991 pixels and below', 'A mobile override wins over a tablet override' and 'A hover style also applies when a reader tabs to a button'.

## 3. Values and tokens

- [ ] 3.1 Check each value the browser accepts as it is typed, refusing braces, angle brackets and over-long values. Verify: tests named after the scenarios 'An unsupported style value stays in its field unsaved' and 'A style value with a brace is refused'.
- [ ] 3.2 Store a colour picked from the theme as a reference to the theme colour. Verify: a test named after the scenario 'Changing a theme colour recolours every node that uses it'.

## 4. Panel

- [ ] 4.1 Draw the style sectors with the shared UI library's controls, showing the inherited value and offering reset. Verify: tests named after the scenarios 'A field shows the inherited value and where it comes from' and 'Reset removes an override'.
- [ ] 4.2 Add Copy style and Paste style as commands. Verify: a test named after the scenario 'Paste style applies copied styles to another node'.
- [ ] 4.3 Preview slider drags on the canvas and record one undoable change on release. Verify: a test named after the scenario 'Dragging an opacity slider records one undoable change'.
- [ ] 4.4 Give email nodes their email attribute fields, with no breakpoints or states. Verify: a test named after the scenario 'An email text has no breakpoint or state choice'.
