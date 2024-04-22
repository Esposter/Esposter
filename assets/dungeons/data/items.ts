import type { Item } from "@/models/dungeons/item/Item";
import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { ItemId } from "@/models/dungeons/item/ItemId";
import type { Except } from "type-fest";

export const items: Except<Item, "quantity">[] = [
  {
    id: ItemId.Potion,
    description: "A basic healing item that will heal 30 HP from a single monster.",
    effect: {
      type: ItemEffectType.Heal,
      value: 30,
    },
  },
];
