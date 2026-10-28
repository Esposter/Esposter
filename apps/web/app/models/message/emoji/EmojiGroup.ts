// The values are verbatim the `group` every `unicode-emoji-json` record carries, so the dataset joins on them
// With no mapping table; a group that stops existing upstream stops having a tab by failing that lookup
export enum EmojiGroup {
  Activities = "Activities",
  AnimalsAndNature = "Animals & Nature",
  Flags = "Flags",
  FoodAndDrink = "Food & Drink",
  Objects = "Objects",
  PeopleAndBody = "People & Body",
  SmileysAndEmotion = "Smileys & Emotion",
  Symbols = "Symbols",
  TravelAndPlaces = "Travel & Places",
}

// The category rail and the grid render in CLDR's order, Smileys first and Flags last
// So the order is declared here, not read off the enum's own declaration order
export const EmojiGroups = [
  EmojiGroup.SmileysAndEmotion,
  EmojiGroup.PeopleAndBody,
  EmojiGroup.AnimalsAndNature,
  EmojiGroup.FoodAndDrink,
  EmojiGroup.TravelAndPlaces,
  EmojiGroup.Activities,
  EmojiGroup.Objects,
  EmojiGroup.Symbols,
  EmojiGroup.Flags,
];
