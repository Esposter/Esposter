// The two marks a drop indicator draws: a line where a block lands among its siblings, or an outline of the slot's owner
export const DropIndicatorKind = { Line: "Line", Outline: "Outline" } as const;
export type DropIndicatorKind = (typeof DropIndicatorKind)[keyof typeof DropIndicatorKind];
