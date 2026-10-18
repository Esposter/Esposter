import type { KitBurstUsedEvent } from "#src/models/kit/KitBurstUsedEvent";
import type { KitCharacterSwappedEvent } from "#src/models/kit/KitCharacterSwappedEvent";
import type { KitChargedAttackLandedEvent } from "#src/models/kit/KitChargedAttackLandedEvent";
import type { KitChestOpenedEvent } from "#src/models/kit/KitChestOpenedEvent";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectExpiredEvent } from "#src/models/kit/KitEffectExpiredEvent";
import type { KitElementAppliedEvent } from "#src/models/kit/KitElementAppliedEvent";
import type { KitElementalHitEvent } from "#src/models/kit/KitElementalHitEvent";
import type { KitEnemyDefeatedEvent } from "#src/models/kit/KitEnemyDefeatedEvent";
import type { KitEnergyParticleCollectedEvent } from "#src/models/kit/KitEnergyParticleCollectedEvent";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitMoraPickedUpEvent } from "#src/models/kit/KitMoraPickedUpEvent";
import type { KitNormalAttackLandedEvent } from "#src/models/kit/KitNormalAttackLandedEvent";
import type { KitReactionTriggeredEvent } from "#src/models/kit/KitReactionTriggeredEvent";
import type { KitShieldAbsorbedEvent } from "#src/models/kit/KitShieldAbsorbedEvent";
import type { KitSkillUsedEvent } from "#src/models/kit/KitSkillUsedEvent";
import type { KitStatusTickedEvent } from "#src/models/kit/KitStatusTickedEvent";
import type { KitTauntDamagedEvent } from "#src/models/kit/KitTauntDamagedEvent";
import type { KitWeakPointHitEvent } from "#src/models/kit/KitWeakPointHitEvent";
import type { KitWildlifeStruckEvent } from "#src/models/kit/KitWildlifeStruckEvent";

// What happens in combat that a kit's passives and constellations answer, sent to every kit of the deployed team
export type KitEvent =
  | KitBurstUsedEvent
  | KitCharacterSwappedEvent
  | KitChargedAttackLandedEvent
  | KitChestOpenedEvent
  | KitDamageTakenEvent
  | KitEffectExpiredEvent
  | KitElementAppliedEvent
  | KitElementalHitEvent
  | KitEnemyDefeatedEvent
  | KitEnergyParticleCollectedEvent
  | KitHealthChangedEvent
  | KitMoraPickedUpEvent
  | KitNormalAttackLandedEvent
  | KitReactionTriggeredEvent
  | KitShieldAbsorbedEvent
  | KitSkillUsedEvent
  | KitStatusTickedEvent
  | KitTauntDamagedEvent
  | KitWeakPointHitEvent
  | KitWildlifeStruckEvent;
