# Note text colours and highlight

A text colour and a highlight on a run of text or a block, from the editor's menu, as Notion's colour options give.

## Why deferred

Each is a custom mark or attribute drawn twice, in the editor and in the sanitized published render, and a colour that reads on one theme can vanish on the other, so the choices would be theme tokens rather than hex values and the sanitizer would need an allowance for each. The note's writing kit already sets text apart by weight, emphasis, code, quotes and headings, which read the same on any theme.

## Revisit when

A note is asked for a colour or a highlight by name, and the app's theme tokens give a set that reads on both themes, so the choices can be tokens and the sanitizer allowance is one attribute.
