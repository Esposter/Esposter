import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { chestInteractionEffect } from "@/services/dungeons/scene/world/interaction/chestInteractionEffect";
import { signInteractionEffect } from "@/services/dungeons/scene/world/interaction/signInteractionEffect";

export const ObjectInteractionEffectMap = {
  [ObjectgroupName.Chest]: chestInteractionEffect,
  [ObjectgroupName.SceneTransition]: () => false,
  [ObjectgroupName.Sign]: signInteractionEffect,
} as const satisfies Record<ObjectgroupName, Effect>;
