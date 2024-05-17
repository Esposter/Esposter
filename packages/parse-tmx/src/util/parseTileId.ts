import { Flipped } from "@/models/Flipped";

export const parseTileId = (gid: number): number =>
  (gid &= ~Object.values(Flipped).reduce((acc, curr) => acc | (curr as Flipped), 0));
