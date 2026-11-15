export const ComputedSizeSetter = { Height: "height", Width: "width" } as const;
export type ComputedSizeSetter = (typeof ComputedSizeSetter)[keyof typeof ComputedSizeSetter];
