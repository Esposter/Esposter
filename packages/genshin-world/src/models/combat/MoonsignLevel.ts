// How far a party's Moonsign has risen: Nascent Gleam with one Moonsign character in the deployed team, and Ascendant
// Gleam with two or more
export const MoonsignLevel = { AscendantGleam: "AscendantGleam", NascentGleam: "NascentGleam" } as const;
export type MoonsignLevel = (typeof MoonsignLevel)[keyof typeof MoonsignLevel];
