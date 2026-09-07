import type { Item } from "#shared/models/dungeons/item/Item";

import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { PreviousSceneUsableItemEffectTypesMap } from "@/services/dungeons/scene/inventory/PreviousSceneUsableItemEffectTypesMap";
import { useSceneStore } from "@/store/dungeons/scene";

export const useIsUsableItem = (item: MaybeRefOrGetter<Item>) => {
  const sceneStore = useSceneStore();
  const { previousSceneKey } = storeToRefs(sceneStore);
  return computed(() =>
    // Outside a scene that lists its own usable effects — the world scene — only heal items may be used
    (PreviousSceneUsableItemEffectTypesMap[previousSceneKey.value] ?? [ItemEffectType.Heal]).includes(
      toValue(item).effect.type,
    ),
  );
};
