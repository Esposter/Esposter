import { Flipped } from "@/src/models/Flipped";
import type { TMXFlipsParsed } from "@/src/models/tmx/parsed/TMXFlipsParsed";

export const parseFlips = (gid: number): TMXFlipsParsed => ({
  H: Boolean(gid & Flipped.Horizontally),
  V: Boolean(gid & Flipped.Vertically),
  D: Boolean(gid & Flipped.Diagonally),
});
