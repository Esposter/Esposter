import type { Item } from "@/models/dungeons/item/Item";

import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { PreviousSceneUsableItemEffectTypesMap } from "@/services/dungeons/scene/inventory/PreviousSceneUsableItemEffectTypesMap";
import { useSceneStore } from "@/store/dungeons/scene";

export const useIsUsableItem = (item: MaybeRefOrGetter<Item>) => {
  const sceneStore = useSceneStore();
  const { previousSceneKey } = storeToRefs(sceneStore);
  return computed(() =>
    // By default (usually in the world scene), player should only be able to use heal items
    (PreviousSceneUsableItemEffectTypesMap[previousSceneKey.value] ?? [ItemEffectType.Heal]).includes(
      toValue(item).effect.type,
    ),
  );
};
