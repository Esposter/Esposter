import { Flipped } from "@/lib/tmxParser/models/Flipped";
import type { TMXFlips } from "@/lib/tmxParser/models/tmx/TMXFlips";

export const getFlips = (gid: number): TMXFlips => ({
  H: Boolean(gid & Flipped.Horizontally),
  V: Boolean(gid & Flipped.Vertically),
  D: Boolean(gid & Flipped.Diagonally),
});
