import { EmojiGroup } from "@/models/message/emoji/EmojiGroup";

// The category rail's icons, following Discord's choice of subject for each group
export const EmojiGroupIconMap: Record<EmojiGroup, string> = {
  [EmojiGroup.Activities]: "mdi-basketball",
  [EmojiGroup.AnimalsAndNature]: "mdi-leaf",
  [EmojiGroup.Flags]: "mdi-flag-outline",
  [EmojiGroup.FoodAndDrink]: "mdi-food-apple-outline",
  [EmojiGroup.Objects]: "mdi-lightbulb-outline",
  [EmojiGroup.PeopleAndBody]: "mdi-hand-wave-outline",
  [EmojiGroup.SmileysAndEmotion]: "mdi-emoticon-outline",
  [EmojiGroup.Symbols]: "mdi-shape-outline",
  [EmojiGroup.TravelAndPlaces]: "mdi-airplane",
};
