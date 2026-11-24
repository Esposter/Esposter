// What one forge queue holds: nothing, an order still forging, or an order done and waiting to be collected.
// A queue the Player's Adventure Rank has not opened yet is locked.
export const ForgeQueueState = { Complete: "Complete", Forging: "Forging", Idle: "Idle", Locked: "Locked" } as const;
export type ForgeQueueState = (typeof ForgeQueueState)[keyof typeof ForgeQueueState];
