import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const PreviousSceneUsableItemEffectTypesMap: Partial<Record<SceneKey, ItemEffectType[]>> = {
  [SceneKey.Battle]: [ItemEffectType.Capture, ItemEffectType.Heal],
};
