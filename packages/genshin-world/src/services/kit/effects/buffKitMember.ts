import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Except } from "type-fest";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

export const buffKitMember = (
  kitEffectState: KitEffectState,
  characterId: number,
  buff: Except<KitBuff, "characterId" | "kind">,
): void => {
  addKitEffect(kitEffectState, { characterId, kind: "buff", ...buff });
};
