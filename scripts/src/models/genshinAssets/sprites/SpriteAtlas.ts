import type { SpriteRectangle } from "#src/models/genshinAssets/sprites/SpriteRectangle";

// The atlas a sprite is cut from, by its name, and the rectangle the sprite's pixels fill inside that atlas
export interface SpriteAtlas {
  atlas: string;
  rectangle: SpriteRectangle;
}
