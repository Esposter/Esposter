export const FunnelType = { Pyramid: "Pyramid" } as const;
export type FunnelType = (typeof FunnelType)[keyof typeof FunnelType];
