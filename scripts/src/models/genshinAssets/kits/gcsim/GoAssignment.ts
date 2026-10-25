// Whether a name's latest assignment before a position is one that always runs before it, one a branch may skip, or
// None at all in the function
export type GoAssignment = { kind: "conditional" } | { kind: "dominating"; valueStart: number } | { kind: "none" };
