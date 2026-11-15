// What an `unlock` line unlocks: a region's Statue of The Seven, or a Teleport Waypoint, each named as the game names it
export const DevUnlockKind = { Region: "region", Waypoint: "waypoint" } as const;
export type DevUnlockKind = (typeof DevUnlockKind)[keyof typeof DevUnlockKind];
