import { Flipped } from "parse-tmx/models/Flipped";
import type { TMXFlipsParsed } from "parse-tmx/models/tmx/parsed/TMXFlipsParsed";

export const parseFlips = (gid: number): TMXFlipsParsed => ({
  H: Boolean(gid & Flipped.Horizontally),
  V: Boolean(gid & Flipped.Vertically),
  D: Boolean(gid & Flipped.Diagonally),
});
