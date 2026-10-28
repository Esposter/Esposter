import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitReaction } from "#src/models/kit/KitReaction";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsKitSecretRite } from "#src/services/kit/checkIsKitSecretRite";
import { checkIsKitHexerei } from "#src/services/kit/countKitHexereiMembers";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

// The Omen Stellaris Phantasm's bubble leaves on the enemy it held as it bursts, as the wiki's Stellaris Phantasm page
// Gives it
// https://genshin-impact.fandom.com/wiki/Stellaris_Phantasm
const OMEN_STATUS_ID = "mona-omen";
// The phases her phantom and her Hydro DMG Bonus begin at, as gcsim v2.47.2 (MIT) mona/asc.go gives them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/asc.go
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 1's phantom for every 2 seconds of sprint, lasting 2 seconds and
// Exploding at its end for half of Mirror Reflection's explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/asc.go
const A1_PHANTOM_SECONDS = 2;
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 4 adds 20% of Mona's Energy Recharge to her Hydro DMG Bonus
const A4_HYDRO_BONUS_OF_ENERGY_RECHARGE = 0.2;
// Constellation 1: a party member's hit on an enemy under the Omen gives it the Hydro-related reactions' DMG bonus for 8 seconds,
// Which is 160% of 15% when Mona is Hexerei with a second Hexerei member and the member is off the field, as gcsim v2.47.2 (MIT)
// Mona/cons.go gives them. A Swirl counts only for the Hydro it absorbs, as a reaction carries that element
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_DAMAGE_BONUS = 0.15;
const CONSTELLATION_1_HEXEREI_MULTIPLIER = 1.6;
const CONSTELLATION_1_SECONDS = 8;
const CONSTELLATION_1_STATUS_ID = "mona-constellation-1";
const CONSTELLATION_1_REACTION_TYPES = new Set<ReactionType>([
  AmplifyingReactionType.Vaporize,
  LunarReactionType.LunarCharged,
  LunarReactionType.LunarCrystallize,
  TransformativeReactionType.ElectroCharged,
]);
// Whether a reaction is one Constellation 1 enhances: the Hydro-related reactions, and a Swirl that absorbed Hydro
const checkIsConstellation1Reaction = ({ element, reactionType }: KitReaction): boolean =>
  CONSTELLATION_1_REACTION_TYPES.has(reactionType) ||
  (reactionType === TransformativeReactionType.Swirl && element === Element.Hydro);
// Constellation 4: each party member's strike on an enemy under the Omen or her bubble gains 15% CRIT Rate, and a Hexerei
// Member's gains 15% CRIT DMG while Mona is Hexerei with a second Hexerei member, as gcsim v2.47.2 (MIT) mona/cons.go gives them
// Its Lunar-Charged and Lunar-Crystallize reactions on such an enemy gain the same, which the reaction hook carries
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_CRITICAL_DAMAGE = 0.15;
const CONSTELLATION_4_CRITICAL_RATE = 0.15;
const CONSTELLATION_4_REACTION_TYPES = new Set<ReactionType>([
  LunarReactionType.LunarCharged,
  LunarReactionType.LunarCrystallize,
]);
// Constellation 2: the last hit of a normal attack has a 20% chance to be followed by her Charged Attack's hit, which can
// Happen once every 5 seconds, as gcsim v2.47.2 (MIT) mona/cons.go gives it. The follow-up lands with that hit, as an
// Extra hit of a normal attack does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_2 = 2;
const FOLLOW_UP_CHANCE = 0.2;
const FOLLOW_UP_COOLDOWN_SECONDS = 5;
const FOLLOW_UP_STATUS_ID = "mona-constellation-2";
// Constellation 6, Illusory Torrent: each second of sprint gives her next Charged Attack 60% more DMG, up to three seconds, for
// Eight seconds from the last stack, and the Charged Attack that strikes resets them, as gcsim v2.47.2 (MIT) mona/cons.go
// Gives them. The sprint's second is kept on a clock status a sprint's first step starts, and the sprint on a status that
// Runs out a moment after the sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_BONUS_PER_STACK = 0.6;
const CONSTELLATION_6_MAX_STACKS = 3;
const CONSTELLATION_6_CLOCK_SECONDS = 1;
const CONSTELLATION_6_BUFF_SECONDS = 8;
const CONSTELLATION_6_SPRINT_GRACE_SECONDS = 0.1;
const CONSTELLATION_6_CLOCK_STATUS_ID = "mona-constellation-6-clock";
const CONSTELLATION_6_SPRINT_STATUS_ID = "mona-constellation-6-sprinting";
const CONSTELLATION_6_BUFF_STATUS_ID = "mona-constellation-6-buff";

// Constellation 6's stacks, which the buff holds while it runs
const getConstellation6Stacks = (effects: readonly KitEffect[], characterId: number): number =>
  checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_BUFF_STATUS_ID)
    ? (findKitStatus(effects, characterId, CONSTELLATION_6_BUFF_STATUS_ID)?.stacks ?? 0)
    : 0;

// Constellation 6, run each step she sprints on the field: a sprint's first step starts the clock, and each second the clock
// Runs out while she still sprints adds a stack, which refreshes the buff's eight seconds
const stepConstellation6Sprint = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  const { characterId } = combatant;
  const { effects } = kitEffectState;
  const isSprinting = checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_SPRINT_STATUS_ID);
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_SPRINT_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_SPRINT_GRACE_SECONDS,
  });
  if (!isSprinting) {
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_6_CLOCK_STATUS_ID,
      secondsRemaining: CONSTELLATION_6_CLOCK_SECONDS,
    });
    return;
  }
  if (checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_CLOCK_STATUS_ID)) return;
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_BUFF_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_BUFF_SECONDS,
    stacks: Math.min(CONSTELLATION_6_MAX_STACKS, getConstellation6Stacks(effects, characterId) + 1),
  });
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_6_CLOCK_STATUS_ID,
    secondsRemaining: CONSTELLATION_6_CLOCK_SECONDS,
  });
};

// Ascension 4's Hydro DMG Bonus, which a hit reads as it is priced, from 20% of Mona's Energy Recharge
const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4
    ? []
    : [
        {
          amount: A4_HYDRO_BONUS_OF_ENERGY_RECHARGE * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
          attribute: Attribute.HydroDamageBonus,
        },
      ];

// Whether an enemy is under the Omen, or under the bubble that will leave it
const checkIsOmened = (enemy: Enemy, effects: readonly KitEffect[]): boolean =>
  enemy.statuses.some(({ id }) => id === OMEN_STATUS_ID) ||
  effects.some((effect) => effect.kind === "bubble" && effect.enemy === enemy && !effect.isBurst);

// Constellation 4's CRIT on a strike or a Lunar reaction of the team's, given the member whose kit it is, the striker,
// The enemy it lands on, the team and the effects on it. A Hexerei striker's CRIT DMG needs Mona to be Hexerei too, with
// A second Hexerei member on the team
const getConstellation4Bonus = (
  member: Combatant,
  striker: Combatant,
  enemy: Enemy,
  party: Party,
  effects: readonly KitEffect[],
): { criticalDamageBonus?: number; criticalRateBonus?: number } => {
  if (member.constellationCount < CONSTELLATION_4 || !checkIsOmened(enemy, effects)) return {};
  const isHexereiTeam = checkIsKitSecretRite(getDeployedCharacterIds(party));
  return {
    criticalDamageBonus:
      checkIsKitHexerei(member.characterId) && isHexereiTeam && checkIsKitHexerei(striker.characterId)
        ? CONSTELLATION_4_CRITICAL_DAMAGE
        : 0,
    criticalRateBonus: CONSTELLATION_4_CRITICAL_RATE,
  };
};

// Constellation 1's DMG bonus on a Hydro-related reaction a struck member makes, while the striker's bonus holds
const getConstellation1ReactionBonus = (
  member: Combatant,
  reaction: KitReaction,
  context: KitContext,
): { damageBonus?: number } => {
  const { combatant } = reaction;
  if (member.constellationCount < CONSTELLATION_1 || !checkIsConstellation1Reaction(reaction)) return {};
  if (!checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, CONSTELLATION_1_STATUS_ID))
    return {};
  const isEnhanced =
    checkIsKitHexerei(member.characterId) &&
    checkIsKitSecretRite(getDeployedCharacterIds(context.party)) &&
    context.activeCombatant.characterId !== combatant.characterId;
  return { damageBonus: CONSTELLATION_1_DAMAGE_BONUS * (isEnhanced ? CONSTELLATION_1_HEXEREI_MULTIPLIER : 1) };
};

// Constellation 4's CRIT on a Lunar reaction a member makes on an enemy under the Omen, which no strike hook reaches
const getConstellation4ReactionBonus = (
  member: Combatant,
  { combatant, enemy, reactionType }: KitReaction,
  context: KitContext,
): { criticalDamageBonus?: number; criticalRateBonus?: number } =>
  CONSTELLATION_4_REACTION_TYPES.has(reactionType)
    ? getConstellation4Bonus(member, combatant, enemy, context.party, context.kitEffectState.effects)
    : {};

export const MONA_CHARACTER_ID = 10_000_041;

// Mona's behaviour: Mirror Reflection of Doom casts its phantom where she stands, ticking and then exploding, and
// Stellaris Phantasm holds each enemy its cast strikes in its bubble, whose burst leaves the Omen. From Ascension 1 every
// 2 seconds of sprint casts a phantom that explodes as it ends, and from Ascension 4 her Energy Recharge raises her Hydro
// DMG Bonus
// Constellation 1 is built but for the Frozen duration, which no reaction or status carries, and Constellation 4 is
// Built in full, its Lunar reactions included
export const createMonaKitBehaviour = ({ kit, readHits }: KitRecordReader): KitBehaviour => {
  const mirrorReflectionHits = readHits("mirrorReflectionPhantom");
  const sprintPhantomHits = readHits("sprintPhantom");
  return {
    burst: { hits: [{ bubbleOmenId: OMEN_STATUS_ID }] },
    // Constellation 6: her Charged Attack's damage grows with her sprint's stacks, and the attack that strikes resets them
    chargedAttack: {
      hits: kit.chargedAttack.hits.map((_hit, index, hits) =>
        index === hits.length - 1
          ? {
              onStrike: ({ activeCombatant: combatant, kitEffectState }) => {
                if (combatant.constellationCount < CONSTELLATION_6) return;
                addKitStatus(kitEffectState, combatant.characterId, {
                  id: CONSTELLATION_6_BUFF_STATUS_ID,
                  secondsRemaining: 0,
                  stacks: 0,
                });
              },
            }
          : {},
      ),
    },
    // Constellation 2: the last hit of a normal attack may be followed by her Charged Attack's hit, once every 5 seconds
    getNormalAttackExtraHit: ({ activeCombatant, kitEffectState, random }, hit, chainIndex) => {
      const { characterId, constellationCount } = activeCombatant;
      if (
        constellationCount < CONSTELLATION_2 ||
        hit !== kit.normalAttacks[chainIndex]?.hits.at(-1) ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, FOLLOW_UP_STATUS_ID) ||
        random() >= FOLLOW_UP_CHANCE
      )
        return undefined;
      addKitStatus(kitEffectState, characterId, {
        id: FOLLOW_UP_STATUS_ID,
        secondsRemaining: FOLLOW_UP_COOLDOWN_SECONDS,
      });
      return { ...takeOne(kit.chargedAttack.hits), hitmarkSeconds: hit.hitmarkSeconds };
    },
    // Constellation 1: a struck member's Hydro-related reactions gain 15% DMG while its bonus holds, 160% of that for an off-field
    // Member when Mona is Hexerei with a second Hexerei member
    // Constellation 4: a Lunar reaction a member makes on an enemy under the Omen gains CRIT
    getPartyReactionBonus: (member, reaction, context) => ({
      ...getConstellation1ReactionBonus(member, reaction, context),
      ...getConstellation4ReactionBonus(member, reaction, context),
    }),
    // Constellation 4: a party member's strike on an enemy under the Omen or her bubble, Mona's own strikes read here
    getPartyStrikeBonus: (member, strike, enemy, party, effects) =>
      getConstellation4Bonus(member, strike.combatant, enemy, party, effects),
    getPassiveBonuses,
    getStrikeCriticalDamageBonus: (strike, enemy, party, effects) =>
      getConstellation4Bonus(strike.combatant, strike.combatant, enemy, party, effects).criticalDamageBonus ?? 0,
    getStrikeCriticalRateBonus: (strike, enemy, party, effects) =>
      getConstellation4Bonus(strike.combatant, strike.combatant, enemy, party, effects).criticalRateBonus ?? 0,
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects = []) =>
      combatant.constellationCount >= CONSTELLATION_6 && attackTag === AttackTag.ChargedAttack
        ? CONSTELLATION_6_BONUS_PER_STACK * getConstellation6Stacks(effects, combatant.characterId)
        : 0,
    // Constellation 1: a hit on an enemy under the Omen gives its striker the Hydro-related reactions' bonus for 8 seconds
    onKitEvent: (event, context, combatant) => {
      if (combatant.constellationCount < CONSTELLATION_1 || event.kind !== KitEventKind.EnemyHit) return;
      if (!event.enemy.statuses.some(({ id }) => id === OMEN_STATUS_ID)) return;
      addKitStatus(context.kitEffectState, event.striker.characterId, {
        id: CONSTELLATION_1_STATUS_ID,
        secondsRemaining: CONSTELLATION_1_SECONDS,
      });
    },
    // Ascension 1: a phantom for every 2 seconds of sprint, which the kit spends from the sprint's seconds as it goes,
    // Lasting until its explosion
    onSprint: (context, kitState) => {
      const { activeCombatant: combatant, body, kitEffectState } = context;
      if (combatant.constellationCount >= CONSTELLATION_6) stepConstellation6Sprint(context);
      if (combatant.ascension < ASCENSION_1 || kitState.sprintSeconds < A1_PHANTOM_SECONDS) return;
      kitState.sprintSeconds -= A1_PHANTOM_SECONDS;
      castKitSummon(kitEffectState, body, combatant, sprintPhantomHits, { attackTag: AttackTag.ElementalSkill });
    },
    // The phantom is cast where Mona stands, its hits the summon's, and lasts until its explosion
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, mirrorReflectionHits, { attackTag: AttackTag.ElementalSkill });
      },
    },
  };
};
