export const PlayerOption = { Fight: "Fight", Flee: "Flee", Item: "Item", Switch: "Switch" } as const;
export type PlayerOption = (typeof PlayerOption)[keyof typeof PlayerOption];
