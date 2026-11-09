# Multi-Node Selection

Selecting several blocks or nodes at once, so a command or an edit reaches all of them. It covers the email row "Select several blocks at once" and the webpage row "Select several nodes at once". GrapesJS selects every component through its editor's selected-all call, and our canvas holds one selected node per open resource.

## Why deferred

The canvas store holds one selected node id per open resource, and the toolbar, the Content and Style panels, the Alt-arrow moves and Move to each read that one id ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). The history is not what holds this back, since the undo design already merges the edits of one interaction into one entry ([undo as patches](../../../specs/resource/page-builder/undo-as-patches/design.md)). The blocker is the selection itself. No panel or command is written to take more than one node, so each would need a set-valued form, and a style write would land on every node in the set.

**Revisit when:** a set-valued selection design says how the style panel, the content form and a move write to several nodes as one history entry.
