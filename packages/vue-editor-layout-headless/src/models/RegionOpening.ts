// How a region comes open: with its content, open whenever it holds a panel, or on demand, open or closed by the reader
export const RegionOpening = { OnDemand: "onDemand", WithContent: "withContent" } as const;
export type RegionOpening = (typeof RegionOpening)[keyof typeof RegionOpening];
