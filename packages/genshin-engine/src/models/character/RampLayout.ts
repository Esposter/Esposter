// How a ramp texture lays its shades out: the game's ramp and the world's shared toon are one row read across its columns,
// And a pack's own MMD toon is one column read up from its shadow end
export const RampLayout = { Horizontal: 0, Vertical: 1 } as const;
export type RampLayout = (typeof RampLayout)[keyof typeof RampLayout];
