// The way a zoom step moves the scale
export const PanzoomZoomDirection = { In: "in", Out: "out" } as const;
export type PanzoomZoomDirection = (typeof PanzoomZoomDirection)[keyof typeof PanzoomZoomDirection];
