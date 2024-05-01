import { Flipped } from "@/lib/tmxParser/models/Flipped";

export const getTileId = (gid: number): number =>
  (gid &= ~Object.values(Flipped).reduce((acc, curr) => acc | (curr as Flipped), 0));
