export const NullStrategy = { DropRow: "Drop Row", ReplaceWithNA: "Replace with N/A" } as const;
export type NullStrategy = (typeof NullStrategy)[keyof typeof NullStrategy];

export const NullStrategies = Object.values(NullStrategy);
