// The stand-in visuals the world draws over its scene: a spark where a hit struck, the number of the damage it dealt, and a
// Flash at a cast's caster or a reaction's enemy
export const WorldEffectKind = { Damage: "damage", Flash: "flash", Spark: "spark" } as const;
export type WorldEffectKind = (typeof WorldEffectKind)[keyof typeof WorldEffectKind];
