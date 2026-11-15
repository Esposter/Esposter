// The kinds of unit the report counts beside a compute area's kind: a change, counted by its open tasks, a roadmap item,
// And a roadmap item that names a quest, counted as that quest
export const GenshinProgressKind = { Change: "Change", Item: "Item", Quest: "Quest" } as const;
export type GenshinProgressKind = (typeof GenshinProgressKind)[keyof typeof GenshinProgressKind];

export const GenshinProgressKinds: readonly GenshinProgressKind[] = Object.values(GenshinProgressKind);
