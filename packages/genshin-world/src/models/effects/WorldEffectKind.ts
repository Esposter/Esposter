// The stand-in visuals the world draws over its scene: a spark where a hit struck, the number of the damage it dealt, a
// Flash at a cast's caster or a reaction's enemy, and an energy drop flying from where a defeated enemy fell to the member
// On the field
export const WorldEffectKind = { Damage: "damage", EnergyDrop: "energyDrop", Flash: "flash", Spark: "spark" } as const;
export type WorldEffectKind = (typeof WorldEffectKind)[keyof typeof WorldEffectKind];
