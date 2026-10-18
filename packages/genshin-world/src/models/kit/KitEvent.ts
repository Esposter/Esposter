import type { KitBurstUsedEvent } from "#src/models/kit/KitBurstUsedEvent";
import type { KitCharacterSwappedEvent } from "#src/models/kit/KitCharacterSwappedEvent";
import type { KitChestOpenedEvent } from "#src/models/kit/KitChestOpenedEvent";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectExpiredEvent } from "#src/models/kit/KitEffectExpiredEvent";
import type { KitEnergyParticleCollectedEvent } from "#src/models/kit/KitEnergyParticleCollectedEvent";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitMoraPickedUpEvent } from "#src/models/kit/KitMoraPickedUpEvent";
import type { KitNormalAttackLandedEvent } from "#src/models/kit/KitNormalAttackLandedEvent";
import type { KitReactionTriggeredEvent } from "#src/models/kit/KitReactionTriggeredEvent";
import type { KitStatusTickedEvent } from "#src/models/kit/KitStatusTickedEvent";
import type { KitTauntDamagedEvent } from "#src/models/kit/KitTauntDamagedEvent";

// What happens in combat that a kit's passives and constellations answer, sent to every kit of the deployed team
export type KitEvent =
  | KitBurstUsedEvent
  | KitCharacterSwappedEvent
  | KitChestOpenedEvent
  | KitDamageTakenEvent
  | KitEffectExpiredEvent
  | KitEnergyParticleCollectedEvent
  | KitHealthChangedEvent
  | KitMoraPickedUpEvent
  | KitNormalAttackLandedEvent
  | KitReactionTriggeredEvent
  | KitStatusTickedEvent
  | KitTauntDamagedEvent;
