# Column freeze / pin

Freezing/pinning arbitrary columns so they stay visible while scrolling.

**Why not:** each pinned column needs a sticky offset computed from the widths of every pinned column before it, kept right as columns resize, reorder and hide — not worth the complexity for a casual platform. The one column a reader needs held while scrolling sideways, the row's number, is the data table's sticky first column ([UI library](../../../../specs/architecture/ui-library/design.md)), whose only offset is the selection column beside it.
