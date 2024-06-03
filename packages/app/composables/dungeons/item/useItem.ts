import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getAllItemResolvers } from "@/services/dungeons/item/getAllItemResolvers";

export const useItem = (scene: SceneWithPlugins, item: Ref<Item>, target: Ref<Monster>) => {
  const itemResolvers = getAllItemResolvers();
  let handled = false;

  for (const { validate, isActive, handleItem } of itemResolvers) {
    if (!(validate(item) && isActive(item, target))) continue;
    handleItem(scene, item, target);
    handled = true;
    break;
  }

  if (handled) AItemResolver.postHandleItem(item);
};
