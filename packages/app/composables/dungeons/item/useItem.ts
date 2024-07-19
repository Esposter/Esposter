import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getActiveItemResolvers } from "@/services/dungeons/item/getActiveItemResolvers";

export const useItem = (scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) => {
  const itemResolvers = getActiveItemResolvers(item, monster);
  let handled = false;

  for (const itemResolver of itemResolvers) {
    itemResolver.handleItem(scene, item, monster);
    handled = true;
    break;
  }

  if (handled) AItemResolver.postHandleItem(item);
};
