import type { KitBurstUsedEvent } from "#src/models/kit/KitBurstUsedEvent";
import type { KitCharacterSwappedEvent } from "#src/models/kit/KitCharacterSwappedEvent";
import type { KitChargedAttackLandedEvent } from "#src/models/kit/KitChargedAttackLandedEvent";
import type { KitChestOpenedEvent } from "#src/models/kit/KitChestOpenedEvent";
import type { KitCrystallizeShardPickedUpEvent } from "#src/models/kit/KitCrystallizeShardPickedUpEvent";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectExpiredEvent } from "#src/models/kit/KitEffectExpiredEvent";
import type { KitElementAppliedEvent } from "#src/models/kit/KitElementAppliedEvent";
import type { KitEnemyDefeatedEvent } from "#src/models/kit/KitEnemyDefeatedEvent";
import type { KitEnemyHitEvent } from "#src/models/kit/KitEnemyHitEvent";
import type { KitEnergyParticleCollectedEvent } from "#src/models/kit/KitEnergyParticleCollectedEvent";
import type { KitFallRefusedEvent } from "#src/models/kit/KitFallRefusedEvent";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitMoraPickedUpEvent } from "#src/models/kit/KitMoraPickedUpEvent";
import type { KitNightsoulPointsConsumedEvent } from "#src/models/kit/KitNightsoulPointsConsumedEvent";
import type { KitNightsoulPointsGainedEvent } from "#src/models/kit/KitNightsoulPointsGainedEvent";
import type { KitNormalAttackLandedEvent } from "#src/models/kit/KitNormalAttackLandedEvent";
import type { KitNormalAttackStartedEvent } from "#src/models/kit/KitNormalAttackStartedEvent";
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
  | KitCrystallizeShardPickedUpEvent
  | KitDamageTakenEvent
  | KitEffectExpiredEvent
  | KitElementAppliedEvent
  | KitEnemyHitEvent
  | KitEnemyDefeatedEvent
  | KitEnergyParticleCollectedEvent
  | KitFallRefusedEvent
  | KitHealthChangedEvent
  | KitMoraPickedUpEvent
  | KitNightsoulPointsConsumedEvent
  | KitNightsoulPointsGainedEvent
  | KitNormalAttackLandedEvent
  | KitNormalAttackStartedEvent
  | KitReactionTriggeredEvent
  | KitShieldAbsorbedEvent
  | KitSkillUsedEvent
  | KitStatusTickedEvent
  | KitTauntDamagedEvent
  | KitWeakPointHitEvent
  | KitWildlifeStruckEvent;
