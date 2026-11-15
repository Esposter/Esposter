// The kinds of Dendro Core, by what leaves it: a Bloom, or Nilou's Golden Chalice's Bounty as a Bountiful
export const DendroCoreKind = { Bloom: "Bloom", Bountiful: "Bountiful" } as const;
export type DendroCoreKind = (typeof DendroCoreKind)[keyof typeof DendroCoreKind];
