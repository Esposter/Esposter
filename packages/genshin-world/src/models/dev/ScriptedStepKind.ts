// The four steps a scripted session takes itself, each the `kind` a step is written with. A registry line is a string
// And has no kind
export const ScriptedStepKind = { Expect: "expect", Load: "load", Save: "save", Wait: "wait" } as const;
export type ScriptedStepKind = (typeof ScriptedStepKind)[keyof typeof ScriptedStepKind];
