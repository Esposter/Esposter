import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "vue-phaserjs";

import { consumeItem } from "@/services/dungeons/item/consumeItem";
import { getActiveItemResolvers } from "@/services/dungeons/item/getActiveItemResolvers";

export const useItem = async (scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) => {
  // The resolvers are ordered by precedence, so the first active one owns the item
  const [itemResolver] = getActiveItemResolvers(item, monster);
  if (!itemResolver) return;

  await itemResolver.handleItem(scene, item, monster);
  consumeItem(item);
};
