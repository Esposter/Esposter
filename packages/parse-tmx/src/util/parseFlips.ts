import type { TMXFlipsParsed } from "@/models/tmx/parsed/TMXFlipsParsed";

import { Flipped } from "@/models/Flipped";

export const parseFlips = (gid: number): TMXFlipsParsed => ({
  D: Boolean(gid & Flipped.Diagonally),
  H: Boolean(gid & Flipped.Horizontally),
  V: Boolean(gid & Flipped.Vertically),
});
