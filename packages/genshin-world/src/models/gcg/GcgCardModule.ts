import type { GcgCostReduction } from "#src/models/gcg/GcgCostReduction";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// A card's behaviour, every hook optional. Each hook that acts on a card on the field receives that card's zone entry, which
// It reads and changes: a usage or round spent, a counter kept. A card with a usage limit or a duration is taken off the
// Field once its usages or rounds run out, so its hooks set those, and do not remove it. The damage a skill deals passes
// The additive hooks, then the multiplying ones, so a doubling is taken after every bonus
export interface GcgCardModule {
  canPlay?: (context: GcgEffectContext, targetIndex: number | undefined) => boolean;
  initialRounds?: number;
  initialUsages?: number;
  isSwitchFast?: (context: GcgEffectContext) => boolean;
  modifyDamageDealt?: (context: GcgEffectContext, damage: GcgDamage, zoneCard: GcgZoneCard) => GcgDamage;
  modifyDamageReceived?: (context: GcgEffectContext, value: number, zoneCard: GcgZoneCard) => number;
  multiplyDamageDealt?: (context: GcgEffectContext, damage: GcgDamage, zoneCard: GcgZoneCard) => GcgDamage;
  onActionPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => void;
  onCostPaid?: (context: GcgEffectContext, subject: GcgCostSubject, zoneCard: GcgZoneCard) => void;
  onEndPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => GcgDamage | undefined;
  onRollPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => void;
  onSkillUsed?: (context: GcgEffectContext, skill: GcgSkill, zoneCard: GcgZoneCard) => GcgDamage | void;
  play?: (context: GcgEffectContext, targetIndex: number | undefined) => void;
  reduceCost?: (
    context: GcgEffectContext,
    subject: GcgCostSubject,
    zoneCard: GcgZoneCard,
  ) => GcgCostReduction | undefined;
  skillOnPlay?: (context: GcgEffectContext, targetIndex: number | undefined) => GcgSkill | undefined;
}
