# Column Freeze / Pin

Freeze/pin arbitrary columns so they stay visible while scrolling.

## Why not

- Vuetify 4's data table supports sticky header/footer rows (`fixedHeader` / `fixedFooter`) but not native per-column pinning.
- Per-column freeze would require hand-rolled `position: sticky` CSS (no such styling exists in the editor today) — not worth the complexity for a casual platform.
