---
title: Parity tracing
description: How a glyph or a game mark is traced from its reference into the SVG path the component draws, at the source's full resolution.
---

# Parity tracing

Marks and logos are traced rather than copied, so a screen ships only shapes derived from the game's marks.

- **A vector is used as it is, and only a mark with none is traced.** Wikimedia Commons holds some of the game's logos as SVG, the publisher's among them, and its paths are drawn directly, so no edge can chip.

- **A glyph is traced from the game's own mark.** The tracer starts from the wiki's standalone render of a mark where one exists, since a mark on a screenshot is small and, when pale, too faint to split cleanly. It traces at the source's full resolution, never reduced, and prints the region beside the trace to check. Ink is told from paper by how far each pixel strays from the colour at the region's corners, so a mark dark on white, lit on black or coloured on either traces alike, and a run of ink or a hole in it smaller than a sliver of the region, a sparkle printed on a logo, a speck of compression or a pale sparkle punching through a letter, is cleared from the split before it is traced; every path the trace finds is then kept, so no small part of the mark is lost. The path it writes is the one the component draws. Nothing from the game ships except shapes derived this way, a choice made so the screens match exactly.

## Key files

| File                                                      | Role                                           |
| :-------------------------------------------------------- | :--------------------------------------------- |
| `scripts/src/services/genshinParity/shared/traceImage.ts` | A mark traced into one path at full resolution |

## Sources

- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs): the public-domain tracer behind `trace`.
