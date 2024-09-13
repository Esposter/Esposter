import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { SceneKey } from "vue-phaser";

export const PreviousSceneUsableItemEffectTypesMap: {
  [P in SceneKey]?: ItemEffectType[];
} = {
  [SceneKey.Battle]: [ItemEffectType.Capture, ItemEffectType.Heal],
};
