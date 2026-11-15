// A family of Windrise's parts, which a witness render can draw in place of ours from the game's exports: its ground,
// Its grass, its oak, the paving round its statue, and its statue
export const WindrisePartFamily = {
  Grass: "Grass",
  Ground: "Ground",
  Oak: "Oak",
  Paving: "Paving",
  Statue: "Statue",
} as const;
export type WindrisePartFamily = (typeof WindrisePartFamily)[keyof typeof WindrisePartFamily];
