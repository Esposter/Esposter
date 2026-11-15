export const IsoTriangleSetter = { IsReversed: "isReversed" } as const;
export type IsoTriangleSetter = (typeof IsoTriangleSetter)[keyof typeof IsoTriangleSetter];
