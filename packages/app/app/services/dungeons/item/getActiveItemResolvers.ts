import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";

import { CaptureItemResolver } from "@/models/resolvers/dungeons/item/CaptureItemResolver";
import { HealItemResolver } from "@/models/resolvers/dungeons/item/HealItemResolver";

export const getActiveItemResolvers = (item: Ref<Item>, monster: Ref<Monster>): AItemResolver[] =>
  [new CaptureItemResolver(), new HealItemResolver()].filter((r) => r.validate(item) && r.isActive(item, monster));
