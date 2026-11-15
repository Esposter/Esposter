import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { AItemResolver } from "#src/models/resolvers/dungeons/AItemResolver";

import { CaptureItemResolver } from "#src/models/resolvers/dungeons/item/CaptureItemResolver";
import { HealItemResolver } from "#src/models/resolvers/dungeons/item/HealItemResolver";

export const getActiveItemResolvers = (item: Ref<Item>, monster: Ref<Monster>): AItemResolver[] =>
  [new CaptureItemResolver(), new HealItemResolver()].filter(
    (itemResolver) => itemResolver.checkIsValid(item) && itemResolver.checkIsActive(item, monster),
  );
