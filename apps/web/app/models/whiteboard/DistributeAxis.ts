// The axis a selection of boxes is distributed along, so the gaps between neighbouring boxes on it are equal
export const DistributeAxis = { Horizontal: "horizontal", Vertical: "vertical" } as const;
export type DistributeAxis = (typeof DistributeAxis)[keyof typeof DistributeAxis];
