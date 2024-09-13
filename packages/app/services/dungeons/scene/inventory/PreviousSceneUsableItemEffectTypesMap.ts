import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const PreviousSceneUsableItemEffectTypesMap: {
  [P in SceneKey]?: ItemEffectType[];
} = {
  [SceneKey.Battle]: [ItemEffectType.Capture, ItemEffectType.Heal],
};
