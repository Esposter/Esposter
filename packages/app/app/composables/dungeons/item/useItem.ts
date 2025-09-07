import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getActiveItemResolvers } from "@/services/dungeons/item/getActiveItemResolvers";

export const useItem = async (scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) => {
  const itemResolvers = getActiveItemResolvers(item, monster);
  let handled = false;

  for (const itemResolver of itemResolvers) {
    await itemResolver.handleItem(scene, item, monster);
    handled = true;
    break;
  }

  if (handled) AItemResolver.postHandleItem(item);
};
