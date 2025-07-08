import type { Item } from "#shared/models/dungeons/item/Item";
import type { Except } from "type-fest";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

export const ItemMap = {
  [ItemId.DamagedBall]: {
    description: "A damaged ball that can be used for capturing monsters.",
    effect: {
      type: ItemEffectType.Capture,
      value: 1,
    },
  },
  [ItemId.Potion]: {
    description: "A basic healing item that will heal 30 HP from a single monster.",
    effect: {
      type: ItemEffectType.Heal,
      value: 30,
    },
  },
} as const satisfies Record<ItemId, Except<Item, "id" | "quantity">>;

export const items: Except<Item, "quantity">[] = parseDictionaryToArray(ItemMap);
