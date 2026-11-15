export const TreemapType = { Distributed: "Distributed" } as const;
export type TreemapType = (typeof TreemapType)[keyof typeof TreemapType];
