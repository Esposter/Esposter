// The bounty the keeper offers ahead of her request: one to take, or the claim of a taken one once its target is defeated
export const ReputationBountyOffer = { Claim: "claim", Offer: "offer" } as const;
export type ReputationBountyOffer = (typeof ReputationBountyOffer)[keyof typeof ReputationBountyOffer];
