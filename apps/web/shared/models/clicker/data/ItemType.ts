export const ItemType = { Building: "Building", Mouse: "Mouse", Upgrade: "Upgrade" } as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];
