// The action a picked expedition place's button takes: send a character there, claim the reward of one come back, or
// Recall one already away
export const ExpeditionActionKind = { Claim: "claim", Recall: "recall", Send: "send" } as const;
export type ExpeditionActionKind = (typeof ExpeditionActionKind)[keyof typeof ExpeditionActionKind];
