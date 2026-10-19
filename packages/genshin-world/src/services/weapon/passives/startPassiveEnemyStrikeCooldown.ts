import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Whether an enemy's strike takes the combatant's health while the passive's cooldown is not running. If so, that
// Cooldown starts for the seconds given. A health change that names a source character, as a kit's does, is not counted
export const startPassiveEnemyStrikeCooldown = (
  event: KitEvent,
  kitEffectState: KitEffectState,
  combatant: Combatant,
  cooldownId: string,
  cooldownSeconds: number,
): boolean =>
  event.kind === KitEventKind.HealthChanged &&
  event.characterId === combatant.characterId &&
  event.healthShare < 0 &&
  event.sourceCharacterId === undefined &&
  startKitCooldown(kitEffectState, combatant.characterId, cooldownId, cooldownSeconds);
