import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getAllItemResolvers } from "@/services/dungeons/item/getAllItemResolvers";

export const useItem = (item: Ref<Item>, target: Ref<Monster>) => {
  if (!AItemResolver.preValidate(item)) return;

  const itemResolvers = getAllItemResolvers();
  let handled = false;

  for (const itemResolver of itemResolvers) {
    if (!itemResolver.validate(item, target)) continue;
    itemResolver.handleItem(item, target);
    handled = true;
    break;
  }

  if (handled) AItemResolver.postHandleItem(item);
};
