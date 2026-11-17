import type { Item } from "#shared/models/dungeons/item/Item";
import type { SceneKey } from "#src/models/dungeons/keys/SceneKey";

import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { PreviousSceneUsableItemEffectTypesMap } from "#src/services/dungeons/scene/inventory/PreviousSceneUsableItemEffectTypesMap";

// Outside a scene that lists its own usable effects — the world scene — only heal items may be used
export const checkIsUsableItem = (item: Item, previousSceneKey: SceneKey | undefined) => {
  const usableEffectTypes =
    previousSceneKey === undefined ? undefined : PreviousSceneUsableItemEffectTypesMap[previousSceneKey];
  return (usableEffectTypes ?? [ItemEffectType.Heal]).includes(item.effect.type);
};
