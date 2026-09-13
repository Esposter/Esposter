import type { TMXFlipsParsed } from "#src/models/tmx/parsed/TMXFlipsParsed";

import { Flipped } from "#src/models/Flipped";

export const parseFlips = (gid: number): TMXFlipsParsed => ({
  Diagonal: Boolean(gid & Flipped.Diagonally),
  Horizontal: Boolean(gid & Flipped.Horizontally),
  Vertical: Boolean(gid & Flipped.Vertically),
});
