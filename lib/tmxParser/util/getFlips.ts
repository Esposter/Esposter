import { Flipped } from "@/lib/tmxParser/models/Flipped";
import type { TMXFlips } from "@/lib/tmxParser/models/tmx/TMXFlips";

export const getFlips = (gid: number): TMXFlips => ({
  H: !!(gid & Flipped.Horizontally),
  V: !!(gid & Flipped.Vertically),
  D: !!(gid & Flipped.Diagonally),
});
