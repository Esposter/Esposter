import { padDepth } from "#src/services/dungeons/gridEngine/padDepth";

// A character draws over the top tile layer, whose depth is the layer count less one, and in front of that layer by the
// Share its bottom edge's whole pixels make, so a character lower on the map draws in front of one higher up
export const getCharacterDepth = (tileLayerCount: number, bottom: number): number =>
  tileLayerCount - 1 + padDepth(Math.floor(bottom));
