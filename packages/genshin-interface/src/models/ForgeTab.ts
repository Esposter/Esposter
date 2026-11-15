// The two tabs of the forge screen: the recipes the player can forge, and the queues their orders run in
export const ForgeTab = { Materials: "Materials", Queues: "Queues" } as const;
export type ForgeTab = (typeof ForgeTab)[keyof typeof ForgeTab];
