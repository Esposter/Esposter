// The three qualities a dish is cooked at, which its result and the zone the indicator stops in decide. Spelt as the
// Game's own words, and written in alphabetical order, since lint sorts an enum's members
export enum CookingQuality {
  Delicious = "Delicious",
  Regular = "Regular",
  Suspicious = "Suspicious",
}

// In the order the game lays a dish's results out, from the lowest quality to the highest
export const CookingQualities: readonly CookingQuality[] = [
  CookingQuality.Suspicious,
  CookingQuality.Regular,
  CookingQuality.Delicious,
];
