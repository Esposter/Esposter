import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createSpeedBuffPassiveModule } from "#src/services/weapon/passives/createSpeedBuffPassiveModule";

// Guerilla Tactics at its rank: defeating an opponent raises its wielder's ATK and Movement SPD by the rank's
// Percentage for the rank's seconds
export const createGuerillaTacticsPassiveModule = (params: number[]): PassiveModule =>
  createSpeedBuffPassiveModule(
    params,
    "guerillaTactics",
    (event, combatant) =>
      event.kind === KitEventKind.EnemyDefeated && event.striker?.characterId === combatant.characterId,
  );
