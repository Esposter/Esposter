// The layers a ground is painted in, as the game's terrain blends its own: grass on what is flat, bare earth on the
// Banks, sand at the shore, snow above the snow line, paved or trodden path along a way, and rock on what is steep
export const GroundLayer = {
  Earth: "Earth",
  Grass: "Grass",
  Path: "Path",
  Rock: "Rock",
  Sand: "Sand",
  Snow: "Snow",
} as const;
export type GroundLayer = (typeof GroundLayer)[keyof typeof GroundLayer];

export const GroundLayers: readonly GroundLayer[] = Object.values(GroundLayer);
