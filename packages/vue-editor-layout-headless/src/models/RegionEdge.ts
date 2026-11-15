// The edge of the window a region sits at. Start and end, not left and right, so a layout is correct in a right-to-left language
export const RegionEdge = { Bottom: "bottom", End: "end", Start: "start", Top: "top" } as const;
export type RegionEdge = (typeof RegionEdge)[keyof typeof RegionEdge];
