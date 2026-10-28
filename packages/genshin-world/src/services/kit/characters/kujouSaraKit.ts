import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

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
// Decorum, Sara's Ascension 4 passive: when Tengu Juurai: Ambush hits opponents, she restores 1.2 Energy to every party
// Member for each point of Energy Recharge she has, once every 3 seconds, as gcsim v2.47.2 (MIT) sara/asc.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/asc.go
const ASCENSION_4 = 4;
const DECORUM_ENERGY_PER_ENERGY_RECHARGE = 1.2;
const DECORUM_ID = "sara-decorum";
const DECORUM_SECONDS = 3;
const C2_CONSTELLATION = 2;
const C4_CONSTELLATION = 4;
const C6_CONSTELLATION = 6;
// Constellation 6 marks the character the ATK Bonus reaches for six seconds, and gives its Electro DMG and its Lunar-Charged
// Reactions 60% CRIT DMG, as gcsim v2.47.2 (MIT) sara/cons.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/cons.go
const C6_CRITICAL_DAMAGE = 0.6;
const C6_MARK_SECONDS = 6;
export const KUJOU_SARA_C6_MARK_ID = "sara-c6-mark";
// Constellation 1 cuts a second off Sara's skill cooldown as a Tengu Juurai hit lands on an enemy, once every three seconds,
// As gcsim v2.47.2 (MIT) sara/cons.go gives it, with the burst's and the Ambush's hits calling it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/cons.go
const C1_CONSTELLATION = 1;
const C1_COOLDOWN_ID = "sara-constellation-1-cooldown";
const C1_COOLDOWN_SECONDS = 3;
const C1_SKILL_COOLDOWN_CUT_SECONDS = 1;

export const KUJOU_SARA_CHARACTER_ID = 10_000_056;

// Kujou Sara's behaviour: Tengu Stormcall's Cover, under which a fully charged shot from Ascension 1 drops the
// Crowfeather the Ambush strikes, and from Constellation 2 a weaker crowfeather where she stands. Subjugation: Koukou
// Sendou's Stormclusters, four bouts or six from Constellation 4. Her fully charged shot, Titanbreaker, the Ambushes and
// The Stormclusters give the character on the field Tengu Stormcall's ATK Bonus, a share of her base ATK, as each lands.
// Ascension 1's shorter charge is not built, as a charged attack has one duration. Ascension 4's Decorum restores Energy
// As the Ambush lands. Constellation 1's cut to her skill's cooldown is built, from each Tengu Juurai hit that strikes an
// Enemy, the burst's first hit and the Ambush. Constellation 6's mark gives the character it reaches 60% CRIT DMG on its
// Electro DMG and on its Lunar-Charged reactions, for six seconds
// Restores the party's Energy as the Ambush's hits land, once every three seconds, from the Energy Recharge its striker has
const restoreDecorumEnergy = (
  { characterIdCombatantMap, kitEffectState, party }: KitContext,
  { combatant }: KitStrike,
): void => {
  if (
    combatant.ascension < ASCENSION_4 ||
    checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, DECORUM_ID)
  )
    return;
  addKitStatus(kitEffectState, combatant.characterId, { id: DECORUM_ID, secondsRemaining: DECORUM_SECONDS });
  const energy = DECORUM_ENERGY_PER_ENERGY_RECHARGE * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge];
  for (const characterId of getDeployedCharacterIds(party)) {
    const member = characterIdCombatantMap.get(characterId);
    if (member) gainPartyMemberEnergy(party, member, energy);
  }
};

// Constellation 1's cut to Sara's skill cooldown from a Tengu Juurai hit on an enemy, under the cooldown it starts
const cutSkillCooldown = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < C1_CONSTELLATION) return;
  if (!startKitCooldown(kitEffectState, combatant.characterId, C1_COOLDOWN_ID, C1_COOLDOWN_SECONDS)) return;
  changeKitSkillCooldown(party, combatant.characterId, -C1_SKILL_COOLDOWN_CUT_SECONDS);
};

// The CRIT DMG Constellation 6 adds to an Electro strike of a character holding its mark, whichever kit reads it
const getMarkedElectroCriticalDamage = ({ combatant, hit }: KitStrike, effects: readonly KitEffect[]): number =>
  getKitHitElement(hit, combatant) === Element.Electro &&
  checkIsKitStatusActive(effects, combatant.characterId, KUJOU_SARA_C6_MARK_ID)
    ? C6_CRITICAL_DAMAGE
    : 0;

export const createKujouSaraKitBehaviour = ({ readHit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const atkBonusRatio = readParameter("atkBonusRatio");
  const atkBonusSeconds = readParameter("atkBonusSeconds");
  // The ATK Bonus Tengu Stormcall gives the character on the field as a hit lands, a share of Sara's base ATK, and from
  // Constellation 6 the same character is marked
  const addAtkBonus = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
    const characterId = getActiveCharacterId(party);
    buffKitMember(kitEffectState, characterId, {
      amount: atkBonusRatio * combatant.attributes.attributeTotalMap[Attribute.BaseAttack],
      attribute: Attribute.Attack,
      secondsRemaining: atkBonusSeconds,
      source: TENGU_SOURCE,
    });
    if (combatant.constellationCount >= C6_CONSTELLATION)
      addKitStatus(kitEffectState, characterId, { id: KUJOU_SARA_C6_MARK_ID, secondsRemaining: C6_MARK_SECONDS });
  };
  const ambushHit = readHit("ambush", {
    onStrike: (context, strike) => {
      addAtkBonus(context, strike);
      restoreDecorumEnergy(context, strike);
      cutSkillCooldown(context, strike);
    },
  });
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
      { attackTag: AttackTag.ElementalBurst },
    );
  };
  return {
    burst: {
      hits: [
        {
          onStrike: (context, strike) => {
            addAtkBonus(context, strike);
            cutSkillCooldown(context, strike);
          },
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castStormclusters(kitEffectState, body, combatant);
      },
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
        castKitSummon(kitEffectState, body, combatant, [ambushHit], { attackTag: AttackTag.ElementalSkill });
      },
    },
    getPartyReactionBonus: (_member, { combatant, reactionType }, { kitEffectState }) => ({
      criticalDamageBonus:
        reactionType === LunarReactionType.LunarCharged &&
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, KUJOU_SARA_C6_MARK_ID)
          ? C6_CRITICAL_DAMAGE
          : 0,
    }),
    getPartyStrikeBonus: (_member, strike, _enemy, _party, effects) => ({
      criticalDamageBonus: getMarkedElectroCriticalDamage(strike, effects),
    }),
    // Constellation 6's mark gives Sara's own Electro strikes CRIT DMG while she holds it, and gives the party's Electro strikes
    // And Lunar-Charged reactions by a marked character the same
    getStrikeCriticalDamageBonus: (strike, _enemy, _party, effects) => getMarkedElectroCriticalDamage(strike, effects),
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
          castKitSummon(kitEffectState, body, combatant, [constellationAmbushHit], {
            attackTag: AttackTag.ElementalSkill,
          });
      },
    },
  };
};
