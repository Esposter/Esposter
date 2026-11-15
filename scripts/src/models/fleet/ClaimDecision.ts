// What a worker does with an entry's claim as read: adopts its own, leaves a live one held by another worker, or takes
// The entry, which is free or stale
export const ClaimDecision = { Adopt: "Adopt", Held: "Held", Take: "Take" } as const;
export type ClaimDecision = (typeof ClaimDecision)[keyof typeof ClaimDecision];
