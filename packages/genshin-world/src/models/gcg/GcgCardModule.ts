import type { Element } from "#src/models/Element";
import type { GcgCostReduction } from "#src/models/gcg/GcgCostReduction";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// A card's behaviour, every hook optional. Each hook that acts on a card on the field receives that card's zone entry, which
// It reads and changes: a usage or round spent, a counter kept. A card with a usage limit or a duration is taken off the
// Field once its usages or rounds run out, so its hooks set those, and do not remove it. The damage a skill deals passes
// The additive hooks, then the multiplying ones, so a doubling is taken after every bonus
export interface GcgCardModule {
  canPlay?: (context: GcgEffectContext, targetIndex: number | undefined) => boolean;
  // The Piercing DMG a card deals to each opposing character on standby at the end phase, before its onEndPhase damage
  endPhaseStandbyPiercing?: number;
  immuneElement?: Element;
  initialCounter?: number;
  initialRounds?: number;
  initialUsages?: number;
  // Whether playing the card is a combat action, which passes the turn once it resolves, rather than a fast action, which does not
  isCombatAction?: boolean;
  isSwitchFast?: (context: GcgEffectContext) => boolean;
  modifyDamageDealt?: (context: GcgEffectContext, damage: GcgDamage, zoneCard: GcgZoneCard) => GcgDamage;
  modifyDamageReceived?: (context: GcgEffectContext, value: number, zoneCard: GcgZoneCard) => number;
  multiplyDamageDealt?: (context: GcgEffectContext, damage: GcgDamage, zoneCard: GcgZoneCard) => GcgDamage;
  onActionPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => void;
  // The hits a skill of either side landed, for a card on either side's field: the context's side is the card's own, and the
  // Skill's user is named by the hits it dealt, not by the context
  onAnySkillUsed?: (context: GcgEffectContext, skill: GcgSkill, zoneCard: GcgZoneCard, dealt: GcgDealtDamage[]) => void;
  onCostPaid?: (context: GcgEffectContext, subject: GcgCostSubject, zoneCard: GcgZoneCard) => void;
  onEndPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => GcgDamage | undefined;
  // A character of the opposing side is defeated, for a card on this side's field: the context names the character the card is
  // Attached to, for the hooks that act on it
  onOpposingDefeated?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => void;
  onRollPhase?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => void;
  // The hits the skill landed, its own damage and its standby piercing alike, with the reactions they triggered
  onSkillUsed?: (
    context: GcgEffectContext,
    skill: GcgSkill,
    zoneCard: GcgZoneCard,
    dealt: GcgDealtDamage[],
  ) => GcgDamage | void;
  onSwirl?: (context: GcgEffectContext, zoneCard: GcgZoneCard, element: Element) => void;
  onSwitch?: (context: GcgEffectContext, zoneCard: GcgZoneCard) => GcgDamage | void;
  permanentAura?: Element;
  // The choice the duel screen gives the card as it is played, for a card that takes one (Toss-Up's dice to reroll)
  play?: (context: GcgEffectContext, targetIndex: number | undefined, choice?: GcgPlayChoice) => void;
  reduceCost?: (
    context: GcgEffectContext,
    subject: GcgCostSubject,
    zoneCard: GcgZoneCard,
  ) => GcgCostReduction | undefined;
  skillOnPlay?: (context: GcgEffectContext, targetIndex: number | undefined) => GcgSkill | undefined;
  // The index of the character a card switches in when it is played, through the switch path (no die, no turn, the field's
  // Switch hooks), which the duel does after play and before the card's skill; undefined for no switch
  switchOnPlay?: (context: GcgEffectContext) => number | undefined;
}
