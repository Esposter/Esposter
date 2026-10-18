import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Soukai Kanka lasts six seconds from the cast, and a second cast restarts it, as gcsim (MIT) ayato/skill.go gives it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const SOUKAI_KANKA_SECONDS = 6;
// Constellation 6's two extra Shunsuiken strikes each deal 450% of his ATK, as gcsim (MIT) ayato/cons.go gives them
const CONSTELLATION_6_HIT_MULTIPLIER = 4.5;

// Ascension 1 sets the Namisen stacks to two as Kyouka is cast and to the most once its water illusion explodes, the
// Most being four, or five from Constellation 2. Constellation 1 raises his normal attacks by 40% against an enemy at
// Half its HP or less, and Constellation 6 arms one extra pair of strikes, as gcsim (MIT) ayato/asc.go and cons.go give
// Them
const ASCENSION_1 = 1;
const ASCENSION_1_CAST_STACKS = 2;
const NAMISEN_STACKS_MAX = 4;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_DAMAGE_BONUS = 0.4;
const CONSTELLATION_1_HEALTH_SHARE = 0.5;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_NAMISEN_STACKS_MAX = 5;
const CONSTELLATION_6 = 6;
// A stack or a mark a kit holds until the swap ends it, as gcsim's Namisen stacks last while he stays on the field
const HELD_UNTIL_SWAP_SECONDS = Number.POSITIVE_INFINITY;
const NAMISEN_STATUS_ID = "ayato-namisen";
// Kamisato Art: Michiyuku Hagetsu, from Ascension 4, gives Ayato 2 Energy each second he is off the field while his Energy is
// Under 40, as gcsim v2.47.2 (MIT) ayato/asc.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayato/asc.go
const ASCENSION_4 = 4;
const MICHIYUKU_HAGETSU_ENERGY = 2;
const MICHIYUKU_HAGETSU_ENERGY_CEILING = 40;
const MICHIYUKU_HAGETSU_ID = "ayato-michiyuku-hagetsu";
const CONSTELLATION_6_STATUS_ID = "ayato-constellation-6";

// The Namisen stacks a character carries, and the most it can
const countNamisenStacks = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, NAMISEN_STATUS_ID)?.stacks ?? 0;
const getNamisenStacksMax = (combatant: Combatant): number =>
  combatant.constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_NAMISEN_STACKS_MAX : NAMISEN_STACKS_MAX;

export const AYATO_CHARACTER_ID = 10_000_066;

// Michiyuku Hagetsu's field follows the whole world, as the energy is given to Ayato wherever he stands off the field
const castMichiyukuHagetsu = (kitEffectState: KitEffectState, combatant: Combatant): void => {
  castKitField(
    kitEffectState,
    combatant.characterId,
    { x: 0, z: 0 },
    {
      id: MICHIYUKU_HAGETSU_ID,
      nextTickSeconds: 1,
      onTick: ({ party }) => {
        if (getPartyMember(party, combatant.characterId).energy < MICHIYUKU_HAGETSU_ENERGY_CEILING)
          gainPartyMemberEnergy(party, combatant, MICHIYUKU_HAGETSU_ENERGY);
      },
      secondsRemaining: Number.POSITIVE_INFINITY,
      tickIntervalSeconds: 1,
    },
  );
};

// Ayato's behaviour: Kamisato Art: Kyouka enters Soukai Kanka, whose three Shunsuiken strikes take the Namisen stacks,
// And Kamisato Art: Suiyuu casts its garden, which follows the body and rains its blades on its ticks. Ascension 1, Ascension 4's
// Energy off the field and Constellations 1, 2 and 6 are built. Constellation 4's team attack Speed and the Max HP that
// Constellation 2 gives at three stacks are not, as the kit has no attack speed to price them, and a passive reads the combatant alone; the normal attack DMG bonus of Suiyuu is not either, as no kit step
// Reads a normal attack's DMG Bonus from the team's effects
export const createAyatoKitBehaviour = ({
  kit,
  readHit,
  readHitFields,
  readParameter,
  readParameters,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const namisenShare = readParameter("namisenShare");
  const gardenOfPuritySeconds = readParameter("gardenOfPuritySeconds");
  const bloomwaterBladeFirstTickSeconds = readSeconds("bloomwaterBladeFirstTick");
  const bloomwaterBladeIntervalSeconds = readSeconds("bloomwaterBladeInterval");
  const bloomwaterBlade = readHit("bloomwaterBlade");
  // The water illusion explodes as its hit lands
  const illusionSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const shunsuikenSeconds = readSeconds("shunsuikenStrike");
  // The Shunsuiken strikes target as the string's strikes do
  const shunsuikenTargetingArea = takeOne(kit.normalAttacks).targetingArea;
  // The record holds every field of a Shunsuiken strike but its multiplier, which its place in the string picks
  const shunsuiken = readHitFields("shunsuiken", ["talentMultiplier"]);
  const shunsuikenMultipliers = readParameters("shunsuikenMultipliers");
  // Constellation 6's strikes land their hitmarks from the attack's start, so from the strike that sets them off they land
  // Its hitmark sooner
  const constellation6Hits = Array.from(readSecondsList("boundlessOriginHitmarks"), (hitmarkSeconds): KitHit => ({
    ...shunsuiken,
    hitmarkSeconds: hitmarkSeconds - shunsuiken.hitmarkSeconds,
    talentMultiplier: CONSTELLATION_6_HIT_MULTIPLIER,
  }));
  // Each Shunsuiken strike's DMG takes the Namisen stacks as it prices, from the team's effects through the owner the
  // Stance holds, as additiveBaseDamageBonus gets the striker alone. Each enemy it strikes adds a stack, and
  // Constellation 6's extra pair is set off by the first enemy struck while it is armed
  const createShunsuikenHit = (
    talentMultiplier: number,
    combatant: Combatant,
    kitEffectState: KitEffectState,
  ): KitHit => ({
    ...shunsuiken,
    additiveBaseDamageBonus: (striker) =>
      striker.attributes.maxHealth * namisenShare * countNamisenStacks(kitEffectState.effects, striker.characterId),
    onStrike: ({ kitEffectState: effectState }, { body }) => {
      const { characterId } = combatant;
      const stacks = countNamisenStacks(effectState.effects, characterId);
      if (stacks < getNamisenStacksMax(combatant))
        addKitStatus(effectState, characterId, {
          id: NAMISEN_STATUS_ID,
          secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
          stacks: stacks + 1,
        });
      const constellation6 = findKitStatus(effectState.effects, characterId, CONSTELLATION_6_STATUS_ID);
      if (!constellation6) return;
      constellation6.secondsRemaining = 0;
      castKitSummon(effectState, body, combatant, constellation6Hits);
    },
    talentMultiplier,
  });
  // Suiyuu's garden follows the body, and on each tick rains a blade from the body's circle
  const castGardenOfPurity = (
    kitEffectState: KitEffectState,
    { facing, height, position }: KitBody,
    combatant: Combatant,
  ): void => {
    const gardenOfPurity = castKitField(kitEffectState, combatant.characterId, position, {
      isFollowing: true,
      nextTickSeconds: bloomwaterBladeFirstTickSeconds,
      onTick: ({ kitEffectState: tickKitEffectState }) =>
        castKitSummon(tickKitEffectState, { facing, height, position: gardenOfPurity.centre }, combatant, [
          bloomwaterBlade,
        ]),
      secondsRemaining: bloomwaterBladeFirstTickSeconds + gardenOfPuritySeconds,
      tickIntervalSeconds: bloomwaterBladeIntervalSeconds,
    });
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castGardenOfPurity(kitEffectState, body, combatant),
    },
    // Constellation 1 raises each of his normal attacks against an enemy at half its HP or less, Shunsuiken's included
    getStrikeDamageBonus: ({ attackTag, combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_1 &&
      attackTag === AttackTag.NormalAttack &&
      enemy.health / enemy.maxHealth <= CONSTELLATION_1_HEALTH_SHARE
        ? CONSTELLATION_1_DAMAGE_BONUS
        : 0,
    // Leaving the field clears the Namisen stacks as it ends Soukai Kanka, as gcsim's swap does, and from Ascension 4 starts
    // Michiyuku Hagetsu's energy, which coming back on the field ends
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped) return;
      if (event.characterId === combatant.characterId)
        for (const effect of kitEffectState.effects)
          if (effect.kind === "field" && effect.id === MICHIYUKU_HAGETSU_ID) effect.secondsRemaining = 0;
      if (event.previousCharacterId !== combatant.characterId) return;
      const namisen = findKitStatus(kitEffectState.effects, combatant.characterId, NAMISEN_STATUS_ID);
      if (namisen) namisen.secondsRemaining = 0;
      if (combatant.ascension >= ASCENSION_4) castMichiyukuHagetsu(kitEffectState, combatant);
    },
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const { characterId } = combatant;
        if (combatant.ascension >= ASCENSION_1) {
          addKitStatus(kitEffectState, characterId, {
            id: NAMISEN_STATUS_ID,
            secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
            stacks: ASCENSION_1_CAST_STACKS,
          });
          // The water illusion's explosion sets the stacks to the most
          scheduleKitTask(kitEffectState, characterId, illusionSeconds, ({ kitEffectState: effectState }) =>
            addKitStatus(effectState, characterId, {
              id: NAMISEN_STATUS_ID,
              secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
              stacks: getNamisenStacksMax(combatant),
            }),
          );
        }
        if (combatant.constellationCount >= CONSTELLATION_6)
          addKitStatus(kitEffectState, characterId, {
            id: CONSTELLATION_6_STATUS_ID,
            secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
          });
        // Soukai Kanka replaces the string with three Shunsuiken strikes, and keeps the kit's charged attack, plunges,
        // Skill and burst: a stance cannot take out the charged attack or the plunges, which gcsim refuses in the skill
        // State, so those stand as the kit's own. The Shunsuiken strikes are Normal Attack DMG, gcsim's AttackTagNormal
        // In ayato/attack.go's SoukaiKanka
        enterKitStance(
          kitEffectState,
          combatant,
          {
            chargedAttack: kit.chargedAttack,
            chargedAttackStamina: kit.chargedAttackStamina,
            elementalBurst: kit.elementalBurst,
            elementalSkill: kit.elementalSkill,
            normalAttacks: shunsuikenMultipliers.map((talentMultiplier) => ({
              hits: [createShunsuikenHit(talentMultiplier, combatant, kitEffectState)],
              seconds: shunsuikenSeconds,
              targetingArea: shunsuikenTargetingArea,
            })),
          },
          SOUKAI_KANKA_SECONDS,
          { isEndedOnSwap: true },
        );
      },
    },
  };
};
