// A family of Nasha Town's parts, which a witness render can draw in place of ours from the game's exports: its ground
// And its buildings
export const NodKraiPartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type NodKraiPartFamily = (typeof NodKraiPartFamily)[keyof typeof NodKraiPartFamily];
