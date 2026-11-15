// The seals a chest may be sealed in, as the wiki names them: Dendro vines and ice, which Pyro breaks, and rock, which
// A blunt or poise-damaging attack breaks. The map's sealed label does not say which one a place holds
export const ChestSeal = { Ice: "Ice", Rock: "Rock", Vines: "Vines" } as const;
export type ChestSeal = (typeof ChestSeal)[keyof typeof ChestSeal];
