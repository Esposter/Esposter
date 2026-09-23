---
title: Icons
description: Proposal — the second half of the icons stage. The library's icons move to a pixel set behind a map from meaning to icon, with Material Design Icons kept as the fallback for anything it lacks.
model: claude-opus-5-5
---

# Icons

Icons are already CSS generated per use, the Material Design Icons set read at build time rather than shipped as a font ([UI library](/docs/architecture/ui-library#icons)). What remains of this stage is the look.

## The pixel set

Once the library draws its own components, its icons move to a pixel icon set — Pixelarticons, a few hundred icons drawn on a pixel grid under the MIT licence, available as an Iconify set like the first. A pixel icon on a voxel surface is the look; a smooth Material glyph beside a pixel face is the seam this proposal is removing.

- **One map from meaning to icon.** The library's icon element takes a name for what the icon means — close, add, delete, more — and a map resolves it to a class. So swapping sets is one map edit, and a feature never names a set.
- **Material Design Icons stays as the fallback.** The pixel set is small, and the app draws things it has no glyph for — a game controller, a spreadsheet column type, a brand. The map resolves those to the Material set, whose icons draw at the same size in the same colour. A fallback is a row in the map rather than a decision at the call site.
- **Pixel icons render at whole multiples of their grid**, so a sixteen-cell icon is drawn at one of a few sizes that keep each cell a whole number of device pixels. Anything else blurs the grid.

## Key files

```text
apps/web/app/components/Ui/Icon.vue          the icon element, by meaning
apps/web/app/services/ui/UiIconMap.ts        meaning to class, pixel set first, Material set as fallback
```

## Sources

- [Pixelarticons](https://pixelarticons.com/): the pixel icon set and its licence.
- [Iconify](https://icon-sets.iconify.design/): the JSON sets both icon families are read from.
