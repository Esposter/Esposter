import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { scheduleKitHitStrike } from "#src/services/kit/scheduleKitHitStrike";

export const KAVEH_CHARACTER_ID = 10_000_081;

// Constellation 4 raises each Bloom its character triggers by 60%, as gcsim (MIT) kaveh/cons.go's c4 does on AttackTagBloom
const CONSTELLATION_4 = 4;
const BLOOM_DAMAGE_BONUS = 0.6;
// Constellation 1: after Artistic Ingenuity, Kaveh gains 50% Dendro RES and 25% Incoming Healing Bonus for three seconds,
// As the wiki gives it. gcsim (MIT) models only the healing, so the RES is the wiki's alone
const CONSTELLATION_1 = 1;
const ARTISTIC_INGENUITY_DENDRO_RESISTANCE = 0.5;
const ARTISTIC_INGENUITY_INCOMING_HEALING_BONUS = 0.25;
const ARTISTIC_INGENUITY_BUFF_SECONDS = 3;
// Constellation 6, Pairidaeza's Light: a Normal, Charged or Plunging Attack of his that hits during Painted Dome lands an
// AoE Dendro hit on the enemy it struck, once every three seconds, as the wiki gives it
const CONSTELLATION_6 = 6;
const PAIRIDAZA_COOLDOWN_SECONDS = 3;
const PAIRIDAZA_COOLDOWN_STATUS_ID = "kaveh-c6-pairidaeza";
const PAIRIDAZA_ATTACK_TAGS = new Set([AttackTag.NormalAttack, AttackTag.ChargedAttack, AttackTag.PlungingAttack]);

// Kaveh's behaviour: Painted Dome's stance widens his strikes for its twelve seconds, which the kit starts with the
// Animation rather than at the hit, and plays the rest of his kit as it stands. The Dendro Cores his skill and burst
// Rupture, Painted Dome's Bloom DMG Bonus and his passives are not built yet
// Constellation 6's Pairidaeza's Light strikes the enemy it struck, but the Dendro Cores it bursts are not built yet
export const createKavehKitBehaviour = ({ readHit, readSeconds, readStance }: KitRecordReader): KitBehaviour => {
  // The widened strikes stay Normal Attack DMG, gcsim's AttackTagNormal in kaveh/attack.go's Attack
  const paintedDome = readStance("paintedDome");
  const paintedDomeSeconds = readSeconds("paintedDome");
  return {
    // Constellation 1's buff is on Kaveh himself
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        if (combatant.constellationCount < CONSTELLATION_1) return;
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: ARTISTIC_INGENUITY_DENDRO_RESISTANCE,
          attribute: Attribute.DendroResistance,
          secondsRemaining: ARTISTIC_INGENUITY_BUFF_SECONDS,
        });
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: ARTISTIC_INGENUITY_INCOMING_HEALING_BONUS,
          attribute: Attribute.IncomingHealingBonus,
          secondsRemaining: ARTISTIC_INGENUITY_BUFF_SECONDS,
        });
      },
    },
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, paintedDome, paintedDomeSeconds, { isEndedOnSwap: true }),
    },
    // Constellation 2, Grace of Royal Roads: his Normal Attack SPD is raised while Painted Dome holds him
    getNormalAttackSpeedBonus: ({ activeCombatant, kitEffectState }) =>
      activeCombatant.constellationCount >= 2 && findKitStance(kitEffectState.effects, activeCombatant.characterId)
        ? 0.15
        : 0,
    // Constellation 6: a Normal, Charged or Plunging Attack that hits during Painted Dome schedules Pairidaeza's Light on the
    // Enemy it struck, once its three-second cooldown is off. The hit is read when it fires, as its record is a publish's
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyHit ||
        combatant.constellationCount < CONSTELLATION_6 ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag === undefined ||
        !PAIRIDAZA_ATTACK_TAGS.has(event.attackTag) ||
        !findKitStance(kitEffectState.effects, combatant.characterId) ||
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          PAIRIDAZA_COOLDOWN_STATUS_ID,
          PAIRIDAZA_COOLDOWN_SECONDS,
        )
      )
        return;
      scheduleKitHitStrike(kitEffectState, combatant, readHit("pairidazaDreams"), event.enemy);
    },
    // Constellation 4: the Bloom reactions Kaveh makes deal 60% more DMG, as the reaction is his own
    getPartyReactionBonus: (member, { combatant, reactionType }) =>
      member.characterId === combatant.characterId &&
      member.constellationCount >= CONSTELLATION_4 &&
      reactionType === TransformativeReactionType.Bloom
        ? { damageBonus: BLOOM_DAMAGE_BONUS }
        : {},
  };
};
