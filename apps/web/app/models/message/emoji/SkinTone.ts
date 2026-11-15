/* eslint-disable perfectionist/sort-objects -- lightest to darkest, the swatch order */
// Declaration order is the swatch order, lightest to darkest after the untoned default. The values are the
// Unicode modifiers themselves, which is what makes synthesis a concatenation and `Default` the empty string
export const SkinTone = {
  Default: "",
  Light: "🏻",
  MediumLight: "🏼",
  Medium: "🏽",
  MediumDark: "🏾",
  Dark: "🏿",
} as const;
export type SkinTone = (typeof SkinTone)[keyof typeof SkinTone];

export const SkinTones = Object.values(SkinTone);
