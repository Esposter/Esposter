# Parity tracing

Marks and logos are traced rather than copied, so a screen ships only shapes derived from the game's marks.

- **A vector is used as it is, and only a mark with none is traced.** Wikimedia Commons holds some of the game's logos as SVG, the publisher's among them (`~/Esposter.noindex/genshin-parity/references/commons-Genshin_Impact_wordmark.svg`, `~/Esposter.noindex/genshin-parity/references/commons-HoYoverse_Logo.svg`), and its paths are drawn directly, so no edge can chip (see Open).

- **A glyph is traced from the game's own mark.** The tracer starts from the wiki's standalone render of a mark where one exists, since a mark on a screenshot is small and, when pale, too faint to split cleanly (see Open). It traces at the source's full resolution, never reduced, and prints the region beside the trace to check (`scripts/src/services/genshinParity/shared/traceImage.ts`). Ink is told from paper by how far each pixel strays from the colour at the region's corners (`scripts/src/services/genshinParity/shared/traceImage.ts`), so a mark dark on white, lit on black or coloured on either traces alike, and a run of ink or a hole in it smaller than a sliver of the region, a sparkle printed on a logo, a speck of compression or a pale sparkle punching through a letter, is cleared from the split before it is traced (`scripts/src/services/genshinParity/shared/traceMask.ts`, `scripts/src/services/genshinParity/shared/removeMaskSpecks.ts`); every path the trace finds is then kept, so no small part of the mark is lost (`scripts/src/services/genshinParity/shared/traceMask.ts`). The path it writes is the one the component draws. Nothing from the game ships except shapes derived this way, a choice made so the screens match exactly (see Open).

- **A traced path is written in its shortest form.** `traceMask` returns each path through `compactSvgPath` (`scripts/src/services/genshinParity/shared/traceMask.ts`, `scripts/src/services/genshinParity/shared/compactSvgPath.ts`), which reads the path's absolute or relative commands at their own precision and writes the same geometry relative, with implicit letters, a line along an axis as one operand and no space before a minus sign. Its opening moveto alone stays absolute, so the paths of one trace joined into one `d` keep their places, where a relative one would start from wherever the path before it closed. The points are unchanged, the bytes a trace adds to the bundle are about a third to a half of the absolute form's (see Open).

## Key files

| File                                                          | Role                                                                   |
| :------------------------------------------------------------ | :--------------------------------------------------------------------- |
| `scripts/src/services/genshinParity/shared/traceImage.ts`     | A mark traced into one path at full resolution                         |
| `scripts/src/services/genshinParity/shared/traceMask.ts`      | A mask traced into its paths, each returned in its shortest form       |
| `scripts/src/services/genshinParity/shared/compactSvgPath.ts` | An SVG path written in its shortest form, the same points              |
| `scripts/src/services/genshinParity/shared/parseSvgPath.ts`   | An SVG path read into exact absolute points for the codec and its test |

## Sources

- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs): the public-domain tracer behind `trace`.

## Open

- [ ] **The Commons logos are drawn directly from their published paths** — no source yet: the screens' use of the SVG files in `~/Esposter.noindex/genshin-parity/references/` was not traced to a component.
- [ ] **The tracer starts from the wiki's standalone render where one exists** — no source yet: no standalone render for a traced mark is cited in the repository or the wiki cache.
- [ ] **Nothing from the game ships except traced shapes** — no source yet: the shipped assets were not checked for files derived from the game.
- [ ] **A trace adds a third to a half of the absolute form's bytes** — no source yet: no size comparison of a trace in both forms is recorded.
