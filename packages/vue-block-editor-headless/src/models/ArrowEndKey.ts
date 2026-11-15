// The two ends of an arrow, each the property of the arrow that holds it
export const ArrowEndKey = { End: "end", Start: "start" } as const;
export type ArrowEndKey = (typeof ArrowEndKey)[keyof typeof ArrowEndKey];
