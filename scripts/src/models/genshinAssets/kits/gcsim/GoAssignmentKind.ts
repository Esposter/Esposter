// Whether an assignment to a name sets the value it names, with `:=` or `=`, or updates the value it reads
// Such as `+=`, `<<=` or `++`
export const GoAssignmentKind = { Update: "update", Value: "value" } as const;
export type GoAssignmentKind = (typeof GoAssignmentKind)[keyof typeof GoAssignmentKind];
