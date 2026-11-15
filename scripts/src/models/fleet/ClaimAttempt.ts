// The result of asking for a claim: won by this machine, or held by another machine's live claim, which is named
export const ClaimAttempt = { Held: "Held", Won: "Won" } as const;
export type ClaimAttempt = (typeof ClaimAttempt)[keyof typeof ClaimAttempt];
