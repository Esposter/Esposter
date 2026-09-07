import { Flippeds } from "#src/models/Flipped";

const FLIPPED_MASK = ~Flippeds.reduce((accumulator, flipped) => accumulator | flipped, 0);

export const parseTileId = (gid: number): number => gid & FLIPPED_MASK;
