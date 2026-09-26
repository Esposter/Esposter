// A frozen object rather than an `enum`, for the reason `GenshinVerb` gives
export const SpinnerVerbsMode = { Append: "append", Replace: "replace" } as const;

export type SpinnerVerbsMode = (typeof SpinnerVerbsMode)[keyof typeof SpinnerVerbsMode];
