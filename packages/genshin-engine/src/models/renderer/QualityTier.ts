export const QualityTier = { High: "High", Low: "Low", Medium: "Medium" } as const;
export type QualityTier = (typeof QualityTier)[keyof typeof QualityTier];
