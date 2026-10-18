import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { GOLDEN_CHALICE_BOUNTY_STATUS_ID } from "#src/services/party/constants";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { takeOne } from "@esposter/shared";

export const NILOU_CHARACTER_ID = 10_000_070;

// Measured: gcsim (MIT) nilou/skill.go, Dance of Haftkarsvar's Pirouette lasts ten seconds from the cast, and Lunar
// Prayer, which its third sword dance sets off, lasts eight seconds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const PIROUETTE_SECONDS = 10;
const LUNAR_PRAYER_SECONDS = 8;
const PIROUETTE_END_TASK_ID = "nilou-pirouette-end";
// The sword dance's third step, the Luminous Illusion
const LUMINOUS_ILLUSION_STEP = 2;

// Measured: gcsim (MIT) nilou/cons.go, Constellation 1 raises Luminous Illusion's DMG by 65%, and Constellation 6 gives 0.6%
// CRIT Rate and 1.2% CRIT DMG for each 1,000 Max HP, capped at 30% and 60%
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ILLUSION_DAMAGE_BONUS = 0.65;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_CRIT_RATE_PER_MAX_HEALTH = 0.006 / 1000;
const CONSTELLATION_6_CRIT_RATE_MAX = 0.3;
const CONSTELLATION_6_CRIT_DAMAGE_PER_MAX_HEALTH = 0.012 / 1000;
const CONSTELLATION_6_CRIT_DAMAGE_MAX = 0.6;

// Constellation 6 is a stat converted from her Max HP, read from the buffed Max HP in the conversion phase
const getConversionBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.constellationCount < CONSTELLATION_6
    ? []
    : [
        {
          amount: Math.min(
            CONSTELLATION_6_CRIT_RATE_MAX,
            combatant.attributes.maxHealth * CONSTELLATION_6_CRIT_RATE_PER_MAX_HEALTH,
          ),
          attribute: Attribute.CriticalRate,
        },
        {
          amount: Math.min(
            CONSTELLATION_6_CRIT_DAMAGE_MAX,
            combatant.attributes.maxHealth * CONSTELLATION_6_CRIT_DAMAGE_PER_MAX_HEALTH,
          ),
          attribute: Attribute.CriticalDamage,
        },
      ];

// Measured: gcsim (MIT) nilou/asc.go, Ascension 1 gives each member of a Dendro and Hydro team Golden Chalice's Bounty
// For 30 seconds, and a Dendro hit on a member under it gives the team 100 Elemental Mastery for 10 seconds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const ASCENSION_1 = 1;
const GOLDEN_CHALICE_BOUNTY_SECONDS = 30;
const GOLDEN_CHALICE_ELEMENTAL_MASTERY = 100;

// Measured: gcsim (MIT) nilou/cons.go, Constellation 2 lowers the Hydro RES of an enemy that a member under Golden Chalice's
// Bounty hits with Hydro, and the Dendro RES of an enemy that a Bloom or Lunar-Bloom reaction triggers on, by 35% for 10 seconds.
// In gcsim the Dendro half is also gated on the Bounty, which the talent's text does not do, so the text stands
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_RES_REDUCTION = 0.35;
const CONSTELLATION_2_SECONDS = 10;
const CONSTELLATION_2_HYDRO_STATUS_ID = "nilou-c2-hydro";
const CONSTELLATION_2_DENDRO_STATUS_ID = "nilou-c2-dendro";
const CONSTELLATION_2_BLOOM_REACTION_TYPES = new Set<ReactionType>([ReactionType.Bloom, ReactionType.LunarBloom]);

// The RES Constellation 2 takes off an enemy, for its seconds
const createConstellation2Status = (id: string, element: Element): EnemyStatus => ({
  damageTakenBonus: 0,
  id,
  resistanceReduction: { [element]: CONSTELLATION_2_RES_REDUCTION },
  secondsRemaining: CONSTELLATION_2_SECONDS,
});
const GOLDEN_CHALICE_ELEMENTAL_MASTERY_SECONDS = 10;

// Measured: gcsim (MIT) nilou/asc.go, Ascension 4 raises a Bountiful Core's DMG by 9% for each 1,000 Max HP above
// 30,000, Capped at 400%
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const ASCENSION_4 = 4;
const ASCENSION_4_HEALTH_THRESHOLD = 30_000;
const ASCENSION_4_DAMAGE_BONUS_PER_MAX_HEALTH = 0.09 / 1000;
const ASCENSION_4_DAMAGE_BONUS_MAX = 4;

// A team with a Dendro member among it and no member that is neither Dendro nor Hydro, the team gcsim's asc.go sets the
// Bounty on
const checkIsDendroHydroTeam = (members: DeployedCombatant[]): boolean =>
  members.some(({ element }) => element === Element.Dendro) &&
  members.every(({ element }) => element === Element.Dendro || element === Element.Hydro);

// Nilou's behaviour: Dance of Haftkarsvar enters Pirouette, whose normal attacks are the sword dance and whose skill is
// The first Whirling Steps, and the sword dance's third step sets off Lunar Prayer, which plays the sword dance again with
// The dance as its skill. Constellations 1, 2 and 6 and Ascensions 1 and 4 are built, and Golden Chalice's Bounty is set
// As the third step lands. Constellation 4 and the Pirouette's later steps are not built, nor is Dance of
// Abzendegi's Lingering Aeon, as it lands on the enemy the first hit struck, and no hook hands that enemy on.
// Constellations 3 and 5 raise talent levels, which no kit reads yet. Constellation 4 needs the third dance step's hit as an event, which the kit does not emit, for its buffs
export const createNilouKitBehaviour = ({
  kit,
  readAction,
  readActions,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const lunarPrayerDelaySeconds = readSeconds("lunarPrayerDelay");
  // The Pirouette's skill. Its later steps are not built, as a stance holds neither a skill chain nor the shared step
  // Count gcsim keeps across its dance and its steps
  const whirlingSteps = readAction("whirlingSteps");
  // The sword dance's three steps, whose hits both stances share so Constellation 1 finds the Luminous Illusion among the
  // Strikes. They play as a stance's normal attacks but are Elemental Skill DMG, as the Whirling Steps the stance's skill
  // Plays are, gcsim's AttackTagElementalArt in nilou/skill.go's SwordDance and WhirlingSteps
  const swordDance = readActions("swordDance");
  const luminousIllusion = takeOne(swordDance, LUMINOUS_ILLUSION_STEP);
  const luminousIllusionHit = takeOne(luminousIllusion.hits);

  const enterNilouStance = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    normalAttacks: KitAction[],
    elementalSkill: KitAction,
    secondsRemaining: number,
  ): void =>
    enterKitStance(
      kitEffectState,
      combatant,
      {
        chargedAttack: kit.chargedAttack,
        chargedAttackStamina: kit.chargedAttackStamina,
        elementalBurst: kit.elementalBurst,
        elementalSkill,
        normalAttacks,
      },
      secondsRemaining,
      { isEndedOnSwap: true },
    );

  // Lunar Prayer replaces the sword dance's normal attacks for its seconds, and the dance is cast again as the skill
  const enterLunarPrayer = (kitEffectState: KitEffectState, combatant: Combatant): void =>
    enterNilouStance(kitEffectState, combatant, swordDance, kit.elementalSkill, LUNAR_PRAYER_SECONDS);

  // The Pirouette's sword dance, whose third step ends Pirouette as it lands, handing the team Lunar Prayer
  const pirouetteSwordDance = swordDance.with(LUMINOUS_ILLUSION_STEP, {
    ...luminousIllusion,
    onStart: ({ activeCombatant, kitEffectState }) =>
      scheduleKitTask(
        kitEffectState,
        activeCombatant.characterId,
        lunarPrayerDelaySeconds,
        ({ characterIdCombatantMap, kitEffectState: tickEffectState, party }) => {
          enterLunarPrayer(tickEffectState, activeCombatant);
          if (activeCombatant.ascension < ASCENSION_1) return;
          const members = getDeployedCombatants(party, characterIdCombatantMap);
          if (!checkIsDendroHydroTeam(members)) return;
          for (const { characterId } of members)
            addKitStatus(tickEffectState, characterId, {
              id: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
              secondsRemaining: GOLDEN_CHALICE_BOUNTY_SECONDS,
            });
        },
        { id: PIROUETTE_END_TASK_ID },
      ),
  });

  return {
    getConversionBonuses,
    // Ascension 4 raises the DMG of each Bountiful Core reaction a deployed member makes by Nilou's Max HP above
    // 30,000, and leaves a Bloom's alone
    getPartyReactionBonus: (member, reaction, { characterIdCombatantMap, kitEffectState, party }) => {
      if (reaction.coreKind !== DendroCoreKind.Bountiful || member.ascension < ASCENSION_4) return {};
      const maxHealthAboveThreshold =
        getKitMaxHealth(member, kitEffectState.effects, party, characterIdCombatantMap) - ASCENSION_4_HEALTH_THRESHOLD;
      return {
        damageBonus: Math.min(
          ASCENSION_4_DAMAGE_BONUS_MAX,
          Math.max(0, maxHealthAboveThreshold * ASCENSION_4_DAMAGE_BONUS_PER_MAX_HEALTH),
        ),
      };
    },
    // Constellation 1 raises Luminous Illusion's DMG, the one hit of the sword dance it is set on
    getStrikeDamageBonus: (strike: KitStrike) =>
      strike.combatant.constellationCount >= CONSTELLATION_1 && strike.hit === luminousIllusionHit
        ? CONSTELLATION_1_ILLUSION_DAMAGE_BONUS
        : 0,
    // A Dendro hit on a member under Golden Chalice's Bounty gives the team Elemental Mastery, and leaving the field
    // Ends, with Pirouette or Lunar Prayer, the field that would have handed the team Lunar Prayer
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      if (event.kind === KitEventKind.HealthChanged) {
        if (
          combatant.ascension >= ASCENSION_1 &&
          event.element === Element.Dendro &&
          checkIsKitStatusActive(kitEffectState.effects, event.characterId, GOLDEN_CHALICE_BOUNTY_STATUS_ID)
        )
          for (const { characterId } of getDeployedCombatants(party, characterIdCombatantMap))
            buffKitMember(kitEffectState, characterId, {
              amount: GOLDEN_CHALICE_ELEMENTAL_MASTERY,
              attribute: Attribute.ElementalMastery,
              secondsRemaining: GOLDEN_CHALICE_ELEMENTAL_MASTERY_SECONDS,
              source: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
            });
        return;
      }
      // Constellation 2 is read from the team's events: a Hydro hit from a member under the Bounty, and a Bloom reaction
      if (combatant.ascension >= ASCENSION_1 && combatant.constellationCount >= CONSTELLATION_2) {
        if (
          event.kind === KitEventKind.EnemyHit &&
          event.element === Element.Hydro &&
          checkIsKitStatusActive(kitEffectState.effects, event.striker.characterId, GOLDEN_CHALICE_BOUNTY_STATUS_ID)
        )
          addEnemyStatus(event.enemy, createConstellation2Status(CONSTELLATION_2_HYDRO_STATUS_ID, Element.Hydro));
        if (
          event.kind === KitEventKind.ReactionTriggered &&
          event.reactions.some(({ reactionType }) => CONSTELLATION_2_BLOOM_REACTION_TYPES.has(reactionType))
        )
          addEnemyStatus(event.enemy, createConstellation2Status(CONSTELLATION_2_DENDRO_STATUS_ID, Element.Dendro));
      }
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      for (const effect of kitEffectState.effects)
        if (effect.kind === "field" && effect.id === PIROUETTE_END_TASK_ID) effect.secondsRemaining = 0;
    },
    // Pirouette replaces the string with the sword dance and the skill with the first Whirling Steps. A press of the skill
    // Within it is blocked by the cooldown the cast set, as a stance's skill press is not exempted from one, so the
    // Whirling Steps are reachable only once it has run out
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterNilouStance(kitEffectState, combatant, pirouetteSwordDance, whirlingSteps, PIROUETTE_SECONDS),
    },
  };
};
