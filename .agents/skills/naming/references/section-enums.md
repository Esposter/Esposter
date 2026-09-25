# Section Enums

Read when naming the groups of a panel's scrollable subsections, or any list whose labels are also its stable ids or anchors.

**One enum per group, its values doubling as title and id.** When a panel has scrollable subsections (or any list whose labels also serve as stable ids/anchors), model each group as its own enum whose values are the human title (e.g. `FooSection { Bar = "Bar Baz", ... }`). The value is reused as the display title and the DOM/scroll id, so don't derive a separate slug. One enum per subsection group, never a shared catch-all.
