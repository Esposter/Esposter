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
// So the order is declared here, not read off the enum's own declaration order, and keyed by group so a new group
// Fails the typecheck until it names its place rather than being left out of the rail
const EmojiGroupOrder: Record<EmojiGroup, number> = {
  [EmojiGroup.Activities]: 5,
  [EmojiGroup.AnimalsAndNature]: 2,
  [EmojiGroup.Flags]: 8,
  [EmojiGroup.FoodAndDrink]: 3,
  [EmojiGroup.Objects]: 6,
  [EmojiGroup.PeopleAndBody]: 1,
  [EmojiGroup.SmileysAndEmotion]: 0,
  [EmojiGroup.Symbols]: 7,
  [EmojiGroup.TravelAndPlaces]: 4,
};
export const EmojiGroups = Object.values(EmojiGroup).toSorted(
  (firstGroup, secondGroup) => EmojiGroupOrder[firstGroup] - EmojiGroupOrder[secondGroup],
);
