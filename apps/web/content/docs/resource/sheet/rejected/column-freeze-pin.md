---
title: Column freeze / pin
description: Freeze or pin arbitrary columns so they stay visible while scrolling.
---

# Column freeze / pin

Freezing/pinning arbitrary columns so they stay visible while scrolling.

**Why not:** each pinned column needs a sticky offset computed from the widths of every pinned column before it, kept right as columns resize, reorder and hide — not worth the complexity for a casual platform. The one column a reader needs held while scrolling sideways, the row's first, is the [data table columns](/docs/proposals/refactors/ui-library/data-table-columns) proposal's, which needs no offsets.
