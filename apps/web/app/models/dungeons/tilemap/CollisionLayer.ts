// A tile layer as the collision read sees it: whether the layer was drawn, and each row's collision by column. A true
// Cell blocks, a false one is an open tile, and an undefined one is no tile
export interface CollisionLayer {
  hasTilemapLayer: boolean;
  name: string;
  tiles: readonly (readonly (boolean | undefined)[])[];
}
