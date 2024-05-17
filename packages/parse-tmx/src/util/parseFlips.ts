import { Flipped } from "@/models/Flipped";
import type { TMXFlipsParsed } from "@/models/tmx/parsed/TMXFlipsParsed";

export const parseFlips = (gid: number): TMXFlipsParsed => ({
  H: Boolean(gid & Flipped.Horizontally),
  V: Boolean(gid & Flipped.Vertically),
  D: Boolean(gid & Flipped.Diagonally),
});
