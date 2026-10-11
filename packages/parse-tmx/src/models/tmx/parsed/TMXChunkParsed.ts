import type { TMXFlipsParsed } from "#src/models/tmx/parsed/TMXFlipsParsed";

export interface TMXChunkParsed {
  data?: number[];
  flips?: TMXFlipsParsed[];
  height: number;
  width: number;
  x: number;
  y: number;
}
