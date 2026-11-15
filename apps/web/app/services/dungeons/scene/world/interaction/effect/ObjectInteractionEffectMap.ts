import type { Effect } from "#src/models/dungeons/scene/world/interaction/Effect";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { chestInteractionEffect } from "#src/services/dungeons/scene/world/interaction/effect/chestInteractionEffect";
import { doorInteractionEffect } from "#src/services/dungeons/scene/world/interaction/effect/doorInteractionEffect";
import { signInteractionEffect } from "#src/services/dungeons/scene/world/interaction/effect/signInteractionEffect";

export const ObjectInteractionEffectMap: Partial<Record<ObjectgroupName, Effect>> = {
  [ObjectgroupName.Chest]: chestInteractionEffect,
  [ObjectgroupName.Door]: doorInteractionEffect,
  [ObjectgroupName.Sign]: signInteractionEffect,
} as const;
