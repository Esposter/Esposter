import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getAllItemResolvers } from "@/services/dungeons/item/getAllItemResolvers";

export const useItem = (item: Ref<Item>, target: Ref<Monster>, sceneKey: SceneKey) => {
  const itemResolvers = getAllItemResolvers();
  let handled = false;

  for (const itemResolver of itemResolvers) {
    if (!(itemResolver.preValidate(item) && itemResolver.validate(item, target))) continue;
    itemResolver.handleItem(item, target, sceneKey);
    handled = true;
    break;
  }

  if (handled) AItemResolver.postHandleItem(item);
};
