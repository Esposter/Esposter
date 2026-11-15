export const QualityTypeRarity = {
  QualityOrange: "QUALITY_ORANGE",
  QualityOrangeSp: "QUALITY_ORANGE_SP",
  QualityPurple: "QUALITY_PURPLE",
} as const;
export type QualityTypeRarity = (typeof QualityTypeRarity)[keyof typeof QualityTypeRarity];
