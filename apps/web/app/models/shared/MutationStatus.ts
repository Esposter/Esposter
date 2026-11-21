export const MutationStatus = { Dropped: "Dropped", Failed: "Failed", Succeeded: "Succeeded" } as const;
export type MutationStatus = (typeof MutationStatus)[keyof typeof MutationStatus];
