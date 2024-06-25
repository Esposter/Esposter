import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { HealItemResolver } from "@/models/resolvers/dungeons/item/HealItemResolver";

export const getActiveItemResolvers = (item: Ref<Item>, target: Ref<Monster>): AItemResolver[] =>
  [new HealItemResolver()].filter((r) => r.validate(item) && r.isActive(item, target));
