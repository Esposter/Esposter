// The damage that is no element. Physical applies no element and reacts to none, and Piercing is blocked by no shield
// And raised by no effect
export const GcgDamageKind = { Physical: "Physical", Piercing: "Piercing" } as const;
export type GcgDamageKind = (typeof GcgDamageKind)[keyof typeof GcgDamageKind];
