import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Conqueror of Evil: Tamer of Demons, from Ascension 1, raises all of Xiao's DMG by 5% while Bane of All Evil stands, and
// By 5% more every 3 seconds it stands, up to 25% at 12, as the wiki's passive page and gcsim v2.47.2 (MIT) xiao/asc.go
// Give it. All his damage is Anemo under the burst, so the bonus is to his Anemo DMG Bonus
// https://genshin-impact.fandom.com/wiki/Conqueror_of_Evil:_Tamer_of_Demons
const TAMER_OF_DEMONS_ASCENSION = 1;
const TAMER_OF_DEMONS_DAMAGE_BONUS = 0.05;
const TAMER_OF_DEMONS_INTERVAL_SECONDS = 3;
const TAMER_OF_DEMONS_MAX_STACKS = 5;
const TAMER_OF_DEMONS_SOURCE = "Conqueror of Evil: Tamer of Demons";
// Dissolution Eon: Heaven Fall, from Ascension 4, raises each dash's DMG for each dash within the seconds before it, up
// To 3, a new one restarting them, as the wiki's passive page gives it
// https://genshin-impact.fandom.com/wiki/Dissolution_Eon:_Heaven_Fall
const HEAVEN_FALL_ASCENSION = 4;
const HEAVEN_FALL_MAX_STACKS = 3;

export const XIAO_CHARACTER_ID = 10_000_026;

const CONSTELLATION_1 = 1;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DEFENSE_BONUS = 1;
const CONSTELLATION_4_HEALTH_SHARE = 0.5;

// Xiao's behaviour: Lemniscatic Wind Cycling's dash lands from a summon cast where he stands, carrying from Ascension 4
// Heaven Fall's stacks of the dashes before it. Bane of All Evil is an Anemo infusion converting his attacks with its
// DMG Bonus, ended as he leaves the field, which drains his HP each second and from Ascension 1 gives Tamer of Demons'
// Anemo DMG Bonus while it stands
// Constellation 6 needs a Plunging Attack hit on two opponents as an event, which the kit does not emit
// Constellation 2 needs an Energy Recharge buff while he is off the field, which a swap must start and end
export const createXiaoKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const baneOfAllEvilDamageBonus = readParameter("baneOfAllEvilDamageBonus");
  const drainShare = readParameter("drainShare");
  const baneOfAllEvilSeconds = readSeconds("baneOfAllEvil");
  const drainFirstTickSeconds = readSeconds("drainFirstTick");
  const drainIntervalSeconds = readSeconds("drainInterval");
  const lastDrainSeconds = readSeconds("lastDrain");
  const heavenFallSeconds = readSeconds("heavenFall");
  // The dash at each count of Heaven Fall's stacks before it, from none up
  const dashHits = readHits("dash");
  const dashHit = takeOne(dashHits);
  // Whether an effect is the summon one of Xiao's dashes lands from
  const checkIsDash = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" &&
    effect.combatant.characterId === characterId &&
    effect.hits.some((hit) => dashHits.includes(hit));
  // The dash lands from a summon cast where Xiao stands, so its start can choose its bonus. From Ascension 4 that summon
  // Stands as long as its Heaven Fall stack, so a dash reads its stacks off those standing and restarts them
  const castDash = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
    if (combatant.ascension < HEAVEN_FALL_ASCENSION) {
      castKitSummon(kitEffectState, body, combatant, [dashHit]);
      return;
    }
    const dashes = kitEffectState.effects.filter((effect) => checkIsDash(effect, combatant.characterId));
    for (const dash of dashes) dash.secondsRemaining = heavenFallSeconds;
    const hit = takeOne(dashHits, Math.min(dashes.length, HEAVEN_FALL_MAX_STACKS));
    castKitSummon(kitEffectState, body, combatant, [hit], { secondsRemaining: heavenFallSeconds });
  };
  // Bane of All Evil: an Anemo infusion converting Xiao's attacks, each carrying the table's DMG Bonus, until the burst
  // Ends or he leaves the field, which the infusion ends as a swap does. Fields drain his current HP each second and give
  // Tamer of Demons' bonus from Ascension 1, which each run only while the infusion stands
  const castBaneOfAllEvil = ({ activeCombatant: combatant, body: { position }, kitEffectState }: KitContext): void => {
    const { characterId } = combatant;
    const centre = { x: position.x, z: position.z };
    const infusion: KitInfusion = {
      characterId,
      damageBonus: baneOfAllEvilDamageBonus,
      element: Element.Anemo,
      isConverted: true,
      isEndedOnSwap: true,
      kind: "infusion",
      secondsRemaining: baneOfAllEvilSeconds,
    };
    addKitEffect(kitEffectState, infusion);
    castKitField(kitEffectState, characterId, centre, {
      nextTickSeconds: drainFirstTickSeconds,
      onTick: ({ kitEffectState: tickKitEffectState, party }) => {
        if (!tickKitEffectState.effects.includes(infusion)) return;
        damagePartyMember(party, characterId, getPartyMember(party, characterId).healthShare * drainShare, characterId);
      },
      // The field lives a tenth of a second past its last drain, so the step that runs it still has it
      secondsRemaining: lastDrainSeconds + 0.1,
      tickIntervalSeconds: drainIntervalSeconds,
    });
    if (combatant.ascension >= TAMER_OF_DEMONS_ASCENSION)
      castKitField(kitEffectState, characterId, centre, {
        nextTickSeconds: 0,
        onTick: ({ kitEffectState: tickKitEffectState }, tickIndex) => {
          if (!tickKitEffectState.effects.includes(infusion)) return;
          buffKitMember(tickKitEffectState, characterId, {
            amount: TAMER_OF_DEMONS_DAMAGE_BONUS * (tickIndex + 1),
            attribute: Attribute.AnemoDamageBonus,
            isEndedOnSwap: true,
            secondsRemaining: infusion.secondsRemaining,
            source: TAMER_OF_DEMONS_SOURCE,
          });
        },
        // The field lives a tenth of a second past its last tick, so the step that runs it still has it
        secondsRemaining: TAMER_OF_DEMONS_INTERVAL_SECONDS * (TAMER_OF_DEMONS_MAX_STACKS - 1) + 0.1,
        tickIntervalSeconds: TAMER_OF_DEMONS_INTERVAL_SECONDS,
      });
  };
  return {
    burst: { onStart: castBaneOfAllEvil },
    // Dissolution Eon: Destroyer of Worlds, from Constellation 1: Lemniscatic Wind Cycling gains one more charge
    // Transcension: Extinction of Suffering, from Constellation 4: while his HP is under half, he gains a 100% DEF Bonus
    getPassiveBonuses: (combatant, healthShare) =>
      combatant.constellationCount >= CONSTELLATION_4 && healthShare < CONSTELLATION_4_HEALTH_SHARE
        ? [{ amount: CONSTELLATION_4_DEFENSE_BONUS, attribute: Attribute.DefensePercent }]
        : [],
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
    skill: { onStart: castDash },
  };
};
