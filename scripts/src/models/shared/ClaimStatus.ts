// What a claim's last renewal says of it: held and renewed in time, stale and open to takeover, or missed and kept
export const ClaimStatus = { Held: "Held", Missed: "Missed", Stale: "Stale" } as const;
export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];
