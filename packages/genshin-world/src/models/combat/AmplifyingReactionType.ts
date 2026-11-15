// The reactions that multiply the damage of the hit that triggers them
export const AmplifyingReactionType = { Melt: "Melt", Vaporize: "Vaporize" } as const;
export type AmplifyingReactionType = (typeof AmplifyingReactionType)[keyof typeof AmplifyingReactionType];
