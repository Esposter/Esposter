import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { Except } from "type-fest";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

export const addKitStatus = (
  kitEffectState: KitEffectState,
  characterId: number,
  status: Except<KitStatus, "characterId" | "kind">,
): void => {
  addKitEffect(kitEffectState, { characterId, kind: "status", ...status });
};
