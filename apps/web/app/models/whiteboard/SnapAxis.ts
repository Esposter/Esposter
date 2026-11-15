// The axis a snap guide is drawn on: an X guide is a vertical line at an x position, and a Y guide a horizontal line at a y position
export const SnapAxis = { X: "x", Y: "y" } as const;
export type SnapAxis = (typeof SnapAxis)[keyof typeof SnapAxis];
