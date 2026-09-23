// @unocss-include
import { EmojiGroup } from "@/models/message/emoji/EmojiGroup";

// The category rail's icons, following Discord's choice of subject for each group
export const EmojiGroupIconMap: Record<EmojiGroup, string> = {
  [EmojiGroup.Activities]: "i-mdi:basketball",
  [EmojiGroup.AnimalsAndNature]: "i-mdi:leaf",
  [EmojiGroup.Flags]: "i-mdi:flag-outline",
  [EmojiGroup.FoodAndDrink]: "i-mdi:food-apple-outline",
  [EmojiGroup.Objects]: "i-mdi:lightbulb-outline",
  [EmojiGroup.PeopleAndBody]: "i-mdi:hand-wave-outline",
  [EmojiGroup.SmileysAndEmotion]: "i-mdi:emoticon-outline",
  [EmojiGroup.Symbols]: "i-mdi:shape-outline",
  [EmojiGroup.TravelAndPlaces]: "i-mdi:airplane",
};
