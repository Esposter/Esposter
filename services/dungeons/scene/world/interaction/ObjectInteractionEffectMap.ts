import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { chestInteractionEffect } from "@/services/dungeons/scene/world/interaction/chestInteractionEffect";
import { doorInteractionEffect } from "@/services/dungeons/scene/world/interaction/doorInteractionEffect";
import { signInteractionEffect } from "@/services/dungeons/scene/world/interaction/signInteractionEffect";

export const ObjectInteractionEffectMap: Partial<Record<ObjectgroupName, Effect>> = {
  [ObjectgroupName.Chest]: chestInteractionEffect,
  [ObjectgroupName.Door]: doorInteractionEffect,
  [ObjectgroupName.Sign]: signInteractionEffect,
};
