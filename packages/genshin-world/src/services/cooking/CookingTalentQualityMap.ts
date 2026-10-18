import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { CookingTalentEffect } from "#src/models/cooking/CookingTalentEffect";

// The quality of the dish a cooking talent's draw is made on: a perfect cook doubles a Delicious dish, and a talent that
// Adds a Suspicious dish is drawn on one
export const CookingTalentQualityMap: Record<CookingTalentEffect, CookingQuality> = {
  [CookingTalentEffect.DoubleProduct]: CookingQuality.Delicious,
  [CookingTalentEffect.SuspiciousDish]: CookingQuality.Suspicious,
};
