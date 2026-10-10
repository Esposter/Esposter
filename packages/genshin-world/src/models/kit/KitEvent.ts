import type { KitCharacterSwappedEvent } from "#src/models/kit/KitCharacterSwappedEvent";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectExpiredEvent } from "#src/models/kit/KitEffectExpiredEvent";
import type { KitNormalAttackLandedEvent } from "#src/models/kit/KitNormalAttackLandedEvent";
import type { KitReactionTriggeredEvent } from "#src/models/kit/KitReactionTriggeredEvent";
import type { KitStatusTickedEvent } from "#src/models/kit/KitStatusTickedEvent";

// What happens in combat that a kit's passives and constellations answer, sent to every kit of the deployed team
export type KitEvent =
  | KitCharacterSwappedEvent
  | KitDamageTakenEvent
  | KitEffectExpiredEvent
  | KitNormalAttackLandedEvent
  | KitReactionTriggeredEvent
  | KitStatusTickedEvent;
