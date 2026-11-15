// The weapon screen's tabs, each the action its panel takes: Enhance levels the weapon, Ascend raises its phase
// And Refine raises its refinement rank
export const WeaponMenuTab = { Ascend: "Ascend", Enhance: "Enhance", Refine: "Refine" } as const;
export type WeaponMenuTab = (typeof WeaponMenuTab)[keyof typeof WeaponMenuTab];
