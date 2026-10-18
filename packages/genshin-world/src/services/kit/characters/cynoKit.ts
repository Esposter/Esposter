import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ELECTRO_REACTION_TYPES } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Sacred Rite: Wolf's Swiftness, as gcsim (MIT) cyno/burst.go and cyno/skill.go give it: each Mortuary Rite extends it by
// The table's seconds, up to two times. From Ascension 4, Pactsworn's normal attacks and the Duststalker Bolts take 150%
// And 250% of his Elemental Mastery as flat DMG
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const BURST_EXTENSIONS_MAX = 2;
const BURST_EXTENSIONS_STATUS_ID = "cyno-burst-extensions";
const BURST_BUFF_SOURCE = "cyno-burst";
const ELEMENTAL_MASTERY_SHARE_ASCENSION_4_NORMAL_ATTACK = 1.5;
const ELEMENTAL_MASTERY_SHARE_ASCENSION_4_BOLT = 2.5;
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
// Judication, as gcsim (MIT) cyno/asc.go gives it: once Pactsworn Pathclearer has run a while, Endseer recurs while the
// Burst holds. A Mortuary Rite under Endseer raises its DMG 35%, which the kit cannot price (see the page), and fires
// Three Duststalker Bolts
const JUDICATION_FIELD_ID = "cyno-judication";
const ENDSEER_STATUS_ID = "cyno-endseer";
// As gcsim (MIT) cyno/cons.go gives them, Constellation 2 raises his Electro DMG 10% for four seconds per normal attack
// That hits, up to five stacks, once every 0.1 seconds. Constellation 4 restores 3 energy to each other member for up to
// Five reactions a burst. Constellation 6 gives four stacks of Day of the Jackal, up to eight, which last eight seconds,
// And each normal attack consumes one to fire a Duststalker Bolt, once every 0.4 seconds
const CONSTELLATION_2 = 2;
const CONSTELLATION_4 = 4;
const CONSTELLATION_6 = 6;
const C2_STATUS_ID = "cyno-c2";
const C2_ICD_STATUS_ID = "cyno-c2-icd";
const C2_SECONDS = 4;
const C2_ICD_SECONDS = 0.1;
const C2_STACKS_MAX = 5;
const C2_ELECTRO_DAMAGE_BONUS_PER_STACK = 0.1;
const C4_STATUS_ID = "cyno-c4";
const C4_STACKS_MAX = 5;
const C4_ENERGY = 3;
const C6_STATUS_ID = "cyno-c6";
const C6_ICD_STATUS_ID = "cyno-c6-icd";
const C6_SECONDS = 8;
const C6_ICD_SECONDS = 0.4;
const C6_STACKS_PER_TRIGGER = 4;
const C6_STACKS_MAX = 8;

// A share of his Elemental Mastery taken as flat DMG from Ascension 4
const createElementalMasteryShareBonus =
  (share: number) =>
  (combatant: Combatant): number =>
    combatant.ascension >= ASCENSION_4 ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * share : 0;

// Pactsworn's normal attacks take 150% of his Elemental Mastery as flat DMG from Ascension 4
const getPactswornNormalAttackBonus = createElementalMasteryShareBonus(
  ELEMENTAL_MASTERY_SHARE_ASCENSION_4_NORMAL_ATTACK,
);

// A Duststalker Bolt takes 250% of his Elemental Mastery as flat DMG from Ascension 4
const getDuststalkerBoltBonus = createElementalMasteryShareBonus(ELEMENTAL_MASTERY_SHARE_ASCENSION_4_BOLT);

// Day of the Jackal's stacks are set to four at the burst and raised by four at each Judication, to eight at most
const addDayOfTheJackal = (kitEffectState: KitEffectState, characterId: number, stacks: number): void =>
  addKitStatus(kitEffectState, characterId, { id: C6_STATUS_ID, secondsRemaining: C6_SECONDS, stacks });

// The Judication field a character holds
const findJudicationField = (effects: readonly KitEffect[], characterId: number): KitField | undefined =>
  effects.find(
    (effect): effect is KitField =>
      effect.kind === "field" && effect.characterId === characterId && effect.id === JUDICATION_FIELD_ID,
  );
const checkIsC4Reaction = ({ element, reactionType }: Reaction): boolean =>
  ELECTRO_REACTION_TYPES.has(reactionType) || (reactionType === ReactionType.Swirl && element === Element.Electro);

export const CYNO_CHARACTER_ID = 10_000_071;

// Constellation 1, Ordinance: Unceasing Vigil: for 10 seconds after Sacred Rite: Wolf's Swiftness, his normal attack speed rises
// By 20%, as the wiki's constellation page gives it. The Judication refresh waits on Ascension 1's Judication event
const CONSTELLATION_1 = 1;
const WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_BONUS = 0.2;
const WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_SECONDS = 10;
const WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_STATUS_ID = "cyno-wolf-swiftness-attack-speed";

// Cyno's behaviour: each normal attack's strike stacks Constellation 2's Electro DMG and, in Pactsworn, spends
// Constellation 6's Day of the Jackal on a Duststalker Bolt. Sacred Rite: Wolf's Swiftness sets Pactsworn Pathclearer on
// Him as a stance for the burst's seconds, its strikes taking Ascension 4's share of his Elemental Mastery and its skill
// Mortuary Rite, which extends the stance and, under Endseer, fires Duststalker Bolts; the burst adds its Elemental
// Mastery, and from Ascension 1 casts Judication, a field giving Endseer. Leaving the field ends the Elemental Mastery
// And Judication. Mortuary Rite's cooldown is priced as the factor of Secret Rite's while the stance holds, and
// Constellation 4's reactions in the stance restore the other members' energy. Constellation 1's attack speed is built,
// Its Judication refresh in Chasmic Soulfarer is not built, and neither are the plunges of Pactsworn Pathclearer
// The kit has no hook for the refresh or the plunges
export const createCynoKitBehaviour = ({
  kit,
  readHit,
  readHits,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const extensionSeconds = readParameter("extensionSeconds");
  const burstSeconds = readParameter("burstSeconds") + readSeconds("burstDurationCast");
  const burstElementalMastery = readParameter("pactswornPathclearerElementalMastery");
  const mortuaryRiteCooldownMultiplier = readParameter("mortuaryRiteCooldownSeconds") / kit.skillCooldownSeconds;
  const judicationFirstSeconds = readSeconds("judicationFirst");
  const judicationIntervalSeconds = readSeconds("judicationInterval");
  const endseerSeconds = readSeconds("endseer");
  const duststalkerBoltBehaviour = { additiveBaseDamageBonus: getDuststalkerBoltBonus };
  const duststalkerBolt = readHit("duststalkerBolt", duststalkerBoltBehaviour);
  const mortuaryRiteDuststalkerBolts = readHits("mortuaryRiteDuststalkerBolts", duststalkerBoltBehaviour);
  // Constellation 2's Electro DMG bonus and Constellation 6's bolts are struck by each normal attack that hits an enemy,
  // The Constellation 2 stacks rising once every 0.1 seconds and Constellation 6's bolt once every 0.4, both only in
  // Pactsworn
  const onNormalAttackStrike = ({ kitEffectState }: KitContext, { body, combatant }: KitStrike): void => {
    const { characterId, constellationCount } = combatant;
    if (
      constellationCount >= CONSTELLATION_2 &&
      startKitCooldown(kitEffectState, characterId, C2_ICD_STATUS_ID, C2_ICD_SECONDS)
    ) {
      const stacks = Math.min(
        C2_STACKS_MAX,
        (findKitStatus(kitEffectState.effects, characterId, C2_STATUS_ID)?.stacks ?? 0) + 1,
      );
      addKitStatus(kitEffectState, characterId, { id: C2_STATUS_ID, secondsRemaining: C2_SECONDS, stacks });
      buffKitMember(kitEffectState, characterId, {
        amount: C2_ELECTRO_DAMAGE_BONUS_PER_STACK * stacks,
        attribute: Attribute.ElectroDamageBonus,
        secondsRemaining: C2_SECONDS,
        source: C2_STATUS_ID,
      });
    }
    if (constellationCount >= CONSTELLATION_6 && findKitStance(kitEffectState.effects, characterId)) {
      const day = findKitStatus(kitEffectState.effects, characterId, C6_STATUS_ID);
      if (
        day &&
        (day.stacks ?? 0) > 0 &&
        startKitCooldown(kitEffectState, characterId, C6_ICD_STATUS_ID, C6_ICD_SECONDS)
      ) {
        day.stacks = (day.stacks ?? 0) - 1;
        castKitSummon(kitEffectState, body, combatant, [duststalkerBolt]);
      }
    }
  };
  const invokerStrikeHit: KitHitBehaviour = { onStrike: onNormalAttackStrike };
  const pactswornStrikeHit: KitHitBehaviour = {
    additiveBaseDamageBonus: getPactswornNormalAttackBonus,
    onStrike: onNormalAttackStrike,
  };
  // Judication is a field round the body, which the burst's stance lets run for its seconds, each tick giving Endseer
  // While the stance holds
  const castJudication = (kitEffectState: KitEffectState, { position }: KitBody, characterId: number): void => {
    castKitField(kitEffectState, characterId, position, {
      id: JUDICATION_FIELD_ID,
      nextTickSeconds: judicationFirstSeconds,
      onTick: ({ kitEffectState: tickKitEffectState }) => {
        if (!findKitStance(tickKitEffectState.effects, characterId)) return;
        addKitStatus(tickKitEffectState, characterId, { id: ENDSEER_STATUS_ID, secondsRemaining: endseerSeconds });
      },
      secondsRemaining: burstSeconds,
      tickIntervalSeconds: judicationIntervalSeconds,
    });
  };
  // The Pactsworn Pathclearer strikes stay Normal Attack DMG though they deal Electro, gcsim's AttackTagNormal in
  // Cyno/attack.go's attackB, beside AttackTagExtra in cyno/charge.go's chargeB and AttackTagElementalArt in
  // Cyno/skill.go's skillB. Mortuary Rite's cooldown is priced as the factor of Secret Rite's while Pactsworn Pathclearer
  // Holds, which is the press that the stance's skill plays; the skill's cooldown the press then sets is the one left
  // After the stance
  const pactswornPathclearer = readStance("pactswornPathclearer", {
    normalAttacks: [
      { hits: [pactswornStrikeHit] },
      { hits: [pactswornStrikeHit] },
      { hits: [pactswornStrikeHit] },
      { hits: [pactswornStrikeHit, pactswornStrikeHit] },
      { hits: [pactswornStrikeHit] },
    ],
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        const stance = findKitStance(kitEffectState.effects, characterId);
        if (!stance) return;
        const extensions = findKitStatus(kitEffectState.effects, characterId, BURST_EXTENSIONS_STATUS_ID)?.stacks ?? 0;
        if (extensions < BURST_EXTENSIONS_MAX) {
          stance.secondsRemaining += extensionSeconds;
          const judication = findJudicationField(kitEffectState.effects, characterId);
          if (judication) judication.secondsRemaining += extensionSeconds;
          addKitStatus(kitEffectState, characterId, {
            id: BURST_EXTENSIONS_STATUS_ID,
            secondsRemaining: stance.secondsRemaining,
            stacks: extensions + 1,
          });
        }
        if (!checkHasKitStatus(kitEffectState.effects, characterId, ENDSEER_STATUS_ID)) return;
        if (combatant.constellationCount >= CONSTELLATION_6)
          addDayOfTheJackal(
            kitEffectState,
            characterId,
            Math.min(
              C6_STACKS_MAX,
              (findKitStatus(kitEffectState.effects, characterId, C6_STATUS_ID)?.stacks ?? 0) + C6_STACKS_PER_TRIGGER,
            ),
          );
        castKitSummon(kitEffectState, body, combatant, mortuaryRiteDuststalkerBolts);
      },
    },
  });

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { ascension, characterId, constellationCount } = combatant;
        enterKitStance(kitEffectState, combatant, pactswornPathclearer, burstSeconds, { isEndedOnSwap: true });
        if (constellationCount >= CONSTELLATION_1)
          addKitStatus(kitEffectState, characterId, {
            id: WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_STATUS_ID,
            secondsRemaining: WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_SECONDS,
          });
        buffKitMember(kitEffectState, characterId, {
          amount: burstElementalMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: burstSeconds,
          source: BURST_BUFF_SOURCE,
        });
        addKitStatus(kitEffectState, characterId, {
          id: BURST_EXTENSIONS_STATUS_ID,
          secondsRemaining: burstSeconds,
          stacks: 0,
        });
        if (constellationCount >= CONSTELLATION_4)
          addKitStatus(kitEffectState, characterId, { id: C4_STATUS_ID, secondsRemaining: burstSeconds, stacks: 0 });
        if (constellationCount >= CONSTELLATION_6)
          addDayOfTheJackal(kitEffectState, characterId, C6_STACKS_PER_TRIGGER);
        if (ascension >= ASCENSION_1) castJudication(kitEffectState, body, characterId);
      },
    },
    // Mortuary Rite's cooldown is the factor of Secret Rite's while Pactsworn Pathclearer holds, so the stance's skill
    // Press waits out three seconds rather than seven and a half
    getNormalAttackSpeedBonus: ({ activeCombatant, kitEffectState }) =>
      checkHasKitStatus(
        kitEffectState.effects,
        activeCombatant.characterId,
        WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_STATUS_ID,
      )
        ? WOLF_SWIFTNESS_NORMAL_ATTACK_SPEED_BONUS
        : 0,
    getSkillCooldownMultiplier: ({ activeCombatant: combatant, kitEffectState }) =>
      findKitStance(kitEffectState.effects, combatant.characterId) ? mortuaryRiteCooldownMultiplier : 1,
    normalAttacks: [
      { hits: [invokerStrikeHit] },
      { hits: [invokerStrikeHit] },
      { hits: [invokerStrikeHit, invokerStrikeHit] },
      { hits: [invokerStrikeHit] },
    ],
    // Leaving the field ends Pactsworn Pathclearer's Elemental Mastery and Judication with it, as gcsim's exit deletes the
    // Burst
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId !== characterId) return;
        const buff = kitEffectState.effects.find(
          (effect) =>
            effect.kind === "buff" && effect.characterId === characterId && effect.source === BURST_BUFF_SOURCE,
        );
        if (buff?.kind === "buff") buff.secondsRemaining = 0;
        const judication = findJudicationField(kitEffectState.effects, characterId);
        if (judication) judication.secondsRemaining = 0;
        return;
      }
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      // Constellation 4's energy: a reaction a normal attack or any Pactsworn hit of Cyno's sets off restores 3 energy to
      // Each other member of the deployed team, up to five times a burst
      const counter = findKitStatus(kitEffectState.effects, characterId, C4_STATUS_ID);
      if (
        combatant.constellationCount < CONSTELLATION_4 ||
        event.striker.characterId !== characterId ||
        !counter ||
        (counter.stacks ?? 0) >= C4_STACKS_MAX ||
        !findKitStance(kitEffectState.effects, characterId) ||
        !event.reactions.some(checkIsC4Reaction)
      )
        return;
      counter.stacks = (counter.stacks ?? 0) + 1;
      for (const memberId of getDeployedCharacterIds(party)) {
        if (memberId === characterId) continue;
        const member = characterIdCombatantMap.get(memberId);
        if (member) gainPartyMemberEnergy(party, member, C4_ENERGY);
      }
    },
  };
};
