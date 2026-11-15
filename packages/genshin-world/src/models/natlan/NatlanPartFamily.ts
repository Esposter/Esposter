// A family of the People of the Springs' parts, which a witness render can draw in place of ours from the game's
// Exports: its ground, and the tribe's buildings the kit's tribe building stands in for
export const NatlanPartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type NatlanPartFamily = (typeof NatlanPartFamily)[keyof typeof NatlanPartFamily];
