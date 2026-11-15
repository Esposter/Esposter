// How far apart two versions are, ordered so the difference of two levels sorts the more urgent bump first — a
// Sort subtracts them, so the members carry the numbers rather than a set of labels with an ordering beside it.
export const VersionChangeLevel = { Patch: 0, Minor: 1, Major: 2 } as const;
export type VersionChangeLevel = (typeof VersionChangeLevel)[keyof typeof VersionChangeLevel];
