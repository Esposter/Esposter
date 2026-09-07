/* eslint-disable perfectionist/sort-enums */
// Declaration order is the swatch order, lightest to darkest after the untoned default. The values are the
// Unicode modifiers themselves, which is what makes synthesis a concatenation and `Default` the empty string
export enum SkinTone {
  Default = "",
  Light = "🏻",
  MediumLight = "🏼",
  Medium = "🏽",
  MediumDark = "🏾",
  Dark = "🏿",
}

export const SkinTones = Object.values(SkinTone);
