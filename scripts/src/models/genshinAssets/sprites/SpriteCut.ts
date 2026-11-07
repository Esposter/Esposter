import type { SpriteRectangle } from "#src/models/genshinAssets/sprites/SpriteRectangle";

// A sprite cut from its atlas: the file the cut is written to, and the rectangle it fills inside the atlas
export interface SpriteCut {
  outputPath: string;
  rectangle: SpriteRectangle;
}
