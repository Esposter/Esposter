// What an enemy drops for the party's energy: a particle, or an orb worth three
export const EnergyDropKind = { Orb: "Orb", Particle: "Particle" } as const;
export type EnergyDropKind = (typeof EnergyDropKind)[keyof typeof EnergyDropKind];
