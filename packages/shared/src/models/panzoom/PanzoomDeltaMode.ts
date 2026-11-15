// The unit a wheel event's deltas are reported in
export const PanzoomDeltaMode = { Pixel: 0, Line: 1, Page: 2 } as const;
export type PanzoomDeltaMode = (typeof PanzoomDeltaMode)[keyof typeof PanzoomDeltaMode];
