// A family of the Court of Fontaine's parts, which a witness render can draw in place of ours from the game's exports:
// Its ground and its buildings
export const FontainePartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type FontainePartFamily = (typeof FontainePartFamily)[keyof typeof FontainePartFamily];
