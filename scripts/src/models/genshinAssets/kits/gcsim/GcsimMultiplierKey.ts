// The record key a talent leaf's multiplier is written under: a hit's own multiplier, or the factor a stance's skill table
// Multiplies into its normal attack's
export const GcsimMultiplierKey = { Factor: "multiplierFactor", Multiplier: "multiplier" } as const;
export type GcsimMultiplierKey = (typeof GcsimMultiplierKey)[keyof typeof GcsimMultiplierKey];
