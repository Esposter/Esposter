import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";

// The Crowfeather Cover lasts 18 seconds, as gcsim v2.47.2 (MIT) sara/skill.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/skill.go
const COVER_SECONDS = 18;
const COVER_ID = "sara-crowfeather-cover";
// Stormcluster's bout of ticks goes out in four directions, six from Constellation 4, as gcsim v2.47.2 (MIT)
// Sara/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/burst.go
const STORMCLUSTER_DIRECTIONS = 4;
const STORMCLUSTER_DIRECTIONS_WITH_C4 = 6;
const TENGU_SOURCE = "sara-tengu-stormcall";
const C2_CONSTELLATION = 2;
const C4_CONSTELLATION = 4;

export const KUJOU_SARA_CHARACTER_ID = 10_000_056;

// Kujou Sara's behaviour: Tengu Stormcall's Cover, under which a fully charged shot from Ascension 1 drops the
// Crowfeather the Ambush strikes, and from Constellation 2 a weaker crowfeather where she stands. Subjugation: Koukou
// Sendou's Stormclusters, four bouts or six from Constellation 4. Her fully charged shot, Titanbreaker, the Ambushes and
// The Stormclusters give the character on the field Tengu Stormcall's ATK Bonus, a share of her base ATK, as each lands.
// Ascension 1's shorter charge is not built, as a charged attack has one duration. Ascension 4's energy is not built
// Constellation 1 needs the hits and ATK grants of Tengu Juurai as events, which the kit does not emit
// Constellation 6 needs a strike hook that raises CRIT DMG on the Electro DMG of her ATK-buffed members, not built
export const createKujouSaraKitBehaviour = ({ readHit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const atkBonusRatio = readParameter("atkBonusRatio");
  const atkBonusSeconds = readParameter("atkBonusSeconds");
  // The ATK Bonus Tengu Stormcall gives the character on the field as a hit lands, a share of Sara's base ATK
  const addAtkBonus = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void =>
    buffKitMember(kitEffectState, getActiveCharacterId(party), {
      amount: atkBonusRatio * combatant.attributes.attributeTotalMap[Attribute.BaseAttack],
      attribute: Attribute.Attack,
      secondsRemaining: atkBonusSeconds,
      source: TENGU_SOURCE,
    });
  const ambushHit = readHit("ambush", { onStrike: addAtkBonus });
  const constellationAmbushHit = readHit("darkWingsAmbush", { onStrike: addAtkBonus });
  const stormclusterTicks = readHits("stormclusterTicks", { onStrike: addAtkBonus });
  // Subjugation's Stormclusters, each tick in every direction, set out at the cast from the body
  const castStormclusters = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
    const directions =
      combatant.constellationCount >= C4_CONSTELLATION ? STORMCLUSTER_DIRECTIONS_WITH_C4 : STORMCLUSTER_DIRECTIONS;
    castKitSummon(
      kitEffectState,
      body,
      combatant,
      stormclusterTicks.flatMap((tick) => Array.from({ length: directions }, () => tick)),
    );
  };
  return {
    burst: {
      hits: [{ onStrike: addAtkBonus }],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castStormclusters(kitEffectState, body, combatant),
    },
    chargedAttack: {
      hits: [{ onStrike: addAtkBonus }],
      // A fully charged shot under the Cover from Ascension 1 drops the crowfeather the Ambush strikes from its target,
      // And spends the Cover
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.ascension < 1) return;
        const cover = findKitStatus(kitEffectState.effects, combatant.characterId, COVER_ID);
        if (cover === undefined || cover.secondsRemaining <= 0) return;
        cover.secondsRemaining = 0;
        castKitSummon(kitEffectState, body, combatant, [ambushHit]);
      },
    },
    skill: {
      // The Cover lasts its seconds, and from Constellation 2 a weaker crowfeather is set out where Sara stands
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const cover: KitStatus = {
          characterId: combatant.characterId,
          id: COVER_ID,
          kind: "status",
          secondsRemaining: COVER_SECONDS,
        };
        addKitEffect(kitEffectState, cover);
        if (combatant.constellationCount >= C2_CONSTELLATION)
          castKitSummon(kitEffectState, body, combatant, [constellationAmbushHit]);
      },
    },
  };
};
