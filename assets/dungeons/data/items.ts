import type { Item } from "@/models/dungeons/item/Item";
import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { ItemId } from "@/models/dungeons/item/ItemId";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseItems: Except<Item, "name" | "quantity">[] = [
  {
    id: ItemId.Potion,
    description: "A basic healing item that will heal 30 HP from a single monster.",
    effect: {
      type: ItemEffectType.Heal,
      value: 30,
    },
  },
];

export const items: Except<Item, "quantity">[] = baseItems.map((bi) => ({
  ...bi,
  name: prettifyName(bi.id),
}));
