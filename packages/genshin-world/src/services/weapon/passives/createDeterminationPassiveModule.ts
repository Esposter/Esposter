import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createSpeedBuffPassiveModule } from "#src/services/weapon/passives/createSpeedBuffPassiveModule";

// Determination at its rank: a burst its wielder uses raises its ATK and Movement SPD by the rank's percentage for the
// Rank's seconds
export const createDeterminationPassiveModule = (params: number[]): PassiveModule =>
  createSpeedBuffPassiveModule(
    params,
    "determination",
    (event, combatant) => event.kind === KitEventKind.BurstUsed && event.characterId === combatant.characterId,
  );
