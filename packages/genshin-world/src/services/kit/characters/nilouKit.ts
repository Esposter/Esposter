import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
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

const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
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

// Nilou's behaviour: Dance of Haftkarsvar enters Pirouette, whose normal attacks are the sword dance and whose skill is
// The first Whirling Steps, and the sword dance's third step sets off Lunar Prayer, which plays the sword dance again with
// The dance as its skill. Constellations 1 and 6 are built. Ascension 1 and 4, Constellations 2 and 4 and the Pirouette's
// Later steps are not, nor is Dance of Abzendegi's Lingering Aeon, as it lands on the enemy the first hit struck and no hook
// Gives that enemy to a later hit, and Constellations 3 and 5 raise talent levels, which no kit reads yet
// Constellation 2 needs the Golden Chalice's Bounty state for the Hydro RES cut, which the kit does not build
// Constellation 4 needs the third dance step's hit as an event, which the kit does not emit, for its buffs
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
        ({ kitEffectState: tickEffectState }) => enterLunarPrayer(tickEffectState, activeCombatant),
        { id: PIROUETTE_END_TASK_ID },
      ),
  });

  return {
    getPassiveBonuses,
    // Constellation 1 raises Luminous Illusion's DMG, the one hit of the sword dance it is set on
    getStrikeDamageBonus: (strike: KitStrike) =>
      strike.combatant.constellationCount >= CONSTELLATION_1 && strike.hit === luminousIllusionHit
        ? CONSTELLATION_1_ILLUSION_DAMAGE_BONUS
        : 0,
    // Leaving the field ends, with Pirouette or Lunar Prayer, the field that would have handed the team Lunar Prayer
    onKitEvent: (event, { kitEffectState }, combatant) => {
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
