export const KeepDuplicateMode = { First: "First", Last: "Last" } as const;
export type KeepDuplicateMode = (typeof KeepDuplicateMode)[keyof typeof KeepDuplicateMode];

export const KeepDuplicateModes = Object.values(KeepDuplicateMode);
