// A sprite's rectangle inside its atlas in the atlas's own pixels, its `y` measured up from the atlas's bottom edge
// As Unity measures it
export interface SpriteRectangle {
  height: number;
  width: number;
  x: number;
  y: number;
}
