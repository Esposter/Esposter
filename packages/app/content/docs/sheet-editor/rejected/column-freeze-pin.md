---
title: Column freeze / pin
description: Freeze or pin arbitrary columns so they stay visible while scrolling.
---

# Column freeze / pin

Freezing/pinning arbitrary columns so they stay visible while scrolling.

**Why not:** Vuetify's data table supports sticky header/footer rows (`fixedHeader`/`fixedFooter`) but not native per-column pinning; per-column freeze would require hand-rolled `position: sticky` CSS that does not exist in the editor today — not worth the complexity for a casual platform.
