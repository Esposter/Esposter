/* eslint-disable perfectionist/sort-enums */
// Declaration order is the CLDR order the category rail and the grid render in — Smileys first, Flags last.
// The values are verbatim the `group` every `unicode-emoji-json` record carries, so the dataset joins on them
// With no mapping table; a group that stops existing upstream stops having a tab by failing that lookup
export enum EmojiGroup {
  SmileysAndEmotion = "Smileys & Emotion",
  PeopleAndBody = "People & Body",
  AnimalsAndNature = "Animals & Nature",
  FoodAndDrink = "Food & Drink",
  TravelAndPlaces = "Travel & Places",
  Activities = "Activities",
  Objects = "Objects",
  Symbols = "Symbols",
  Flags = "Flags",
}

export const EmojiGroups = Object.values(EmojiGroup);
