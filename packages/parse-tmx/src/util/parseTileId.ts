import { Flippeds } from "@/models/Flipped";

const FLIPPED_MASK = ~[...Flippeds].reduce((acc, curr) => acc | (curr as number), 0);

export const parseTileId = (gid: number): number => gid & FLIPPED_MASK;
