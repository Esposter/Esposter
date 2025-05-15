import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { chestInteractionEffect } from "@/services/dungeons/scene/world/interaction/effect/chestInteractionEffect";
import { doorInteractionEffect } from "@/services/dungeons/scene/world/interaction/effect/doorInteractionEffect";
import { signInteractionEffect } from "@/services/dungeons/scene/world/interaction/effect/signInteractionEffect";

export const ObjectInteractionEffectMap: Partial<Record<ObjectgroupName, Effect>> = {
  [ObjectgroupName.Chest]: chestInteractionEffect,
  [ObjectgroupName.Door]: doorInteractionEffect,
  [ObjectgroupName.Sign]: signInteractionEffect,
} as const;
