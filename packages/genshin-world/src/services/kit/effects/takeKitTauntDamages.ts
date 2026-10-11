import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitTauntDamagedEvent } from "#src/models/kit/KitTauntDamagedEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";

// The damage the team's taunts took from the enemies' strikes since the last step, each strike's an event its kit
// Answers, emptied from each taunt so a strike is heard once
export const takeKitTauntDamages = (effects: readonly KitEffect[]): KitTauntDamagedEvent[] =>
  effects.flatMap((effect) =>
    effect.kind === "taunt"
      ? effect.damagesTaken
          .splice(0)
          .map((damage): KitTauntDamagedEvent => ({ damage, kind: KitEventKind.TauntDamaged, taunt: effect }))
      : [],
  );
