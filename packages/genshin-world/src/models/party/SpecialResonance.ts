// The elemental resonances that are not an element's: the Protective Canopy of a team of four unique elements
export const SpecialResonance = { ProtectiveCanopy: "Protective Canopy" } as const;
export type SpecialResonance = (typeof SpecialResonance)[keyof typeof SpecialResonance];
