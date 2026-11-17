// The three qualities a dish is cooked at, which its result and the zone the indicator stops in decide. Spelt as the
// Game's own words, and written in alphabetical order, since lint sorts an enum's members
export const CookingQuality = { Delicious: "Delicious", Regular: "Regular", Suspicious: "Suspicious" } as const;
export type CookingQuality = (typeof CookingQuality)[keyof typeof CookingQuality];
