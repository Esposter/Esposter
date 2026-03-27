import { Flippeds } from "@/models/Flipped";

export const parseTileId = (gid: number): number =>
  (gid &= ~[...Flippeds].reduce((acc, curr) => acc | (curr as number), 0));
