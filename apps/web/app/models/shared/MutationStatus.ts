export const MutationStatus = { Dropped: "Dropped", Failed: "Failed", Stale: "Stale", Succeeded: "Succeeded" } as const;
export type MutationStatus = (typeof MutationStatus)[keyof typeof MutationStatus];
