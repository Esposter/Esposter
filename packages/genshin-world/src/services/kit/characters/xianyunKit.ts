import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitVariantBehaviour } from "#src/models/kit/KitVariantBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { createConstellationSkillChargeBonus } from "#src/services/kit/createConstellationSkillChargeBonus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { consumeKitResource } from "#src/services/kit/effects/consumeKitResource";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

export const XIANYUN_CHARACTER_ID = 10_000_093;
// The Cloud Transmogrification state her Skyladder presses set, holding the presses made in it as its stacks
export const XIANYUN_SKYLADDER_STATE_ID = "xianyun-cloud-transmogrification";
// The status a Driftcloud Wave leaves for its hit, holding the presses it was made after as its stacks
export const XIANYUN_DRIFTCLOUD_ID = "xianyun-driftcloud";
export const XIANYUN_CONSTELLATION_4_ICD_ID = "xianyun-constellation-4-icd";
// Constellation 6's presses that cost no cooldown, held as its stacks
export const XIANYUN_CONSTELLATION_6_ID = "xianyun-constellation-6";

const CONSTELLATION_1 = 1;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_SHARE = 0.2;
const CONSTELLATION_2_SECONDS = 15;
const CONSTELLATION_2_SOURCE = "xianyun-constellation-2";
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ICD_SECONDS = 5;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_PRESSES = 8;
const CONSTELLATION_6_SECONDS = 16;
// The Cloud Transmogrification state each press sets, in frames, by the press that sets it: the first, second and third
const SKYLADDER_STATE_FRAMES = [220, 238, 179];
// The frames the Driftcloud Wave's status holds for, the longest of its three leaps, which covers every hit of them
const DRIFTCLOUD_FRAMES = 76;
// Constellation 4's heal as a share of Xianyun's ATK, by the presses made in the state, from one press to three
const CONSTELLATION_4_HEAL_SHARES = [0.5, 0.8, 1.5];
// Constellation 6's CRIT DMG by the presses made in the state, from one press to three
const CONSTELLATION_6_CRIT_DAMAGE = [0.15, 0.35, 0.7];

const countSkyladderPresses = (kitEffectState: KitEffectState, characterId: number): number =>
  countKitResource(kitEffectState.effects, characterId, XIANYUN_SKYLADDER_STATE_ID);

// A press of Skyladder sets the state for its own length, holding the presses made in it, one at a time
const startSkyladderPress = (kitEffectState: KitEffectState, characterId: number, press: number): void => {
  addKitStatus(kitEffectState, characterId, {
    id: XIANYUN_SKYLADDER_STATE_ID,
    secondsRemaining: toKitSeconds(takeOne(SKYLADDER_STATE_FRAMES, press - 1)),
    stacks: press,
  });
};

// Constellation 4: a Driftcloud Wave's hit heals the active character by a share of Xianyun's ATK for the presses it was
// Made after, once every five seconds
const healFromDriftcloud = (context: KitContext, strike: KitStrike): void => {
  const { kitEffectState } = context;
  const { attributes, characterId, constellationCount } = strike.combatant;
  if (constellationCount < CONSTELLATION_4) return;
  if (checkIsKitStatusActive(kitEffectState.effects, characterId, XIANYUN_CONSTELLATION_4_ICD_ID)) return;

  const presses = countKitResource(kitEffectState.effects, characterId, XIANYUN_DRIFTCLOUD_ID);
  changeKitMemberHealth(
    context,
    strike.combatant,
    characterId,
    takeOne(CONSTELLATION_4_HEAL_SHARES, presses - 1) * attributes.attack,
  );
  addKitStatus(kitEffectState, characterId, {
    id: XIANYUN_CONSTELLATION_4_ICD_ID,
    secondsRemaining: CONSTELLATION_4_ICD_SECONDS,
  });
};

// Driftcloud Wave: a plunge made in the state plays the leap for the presses made in it, one leap for each of the three
const createDriftcloudVariant = (presses: number): KitVariantBehaviour => ({
  checkIsActive: ({ activeCombatant, kitEffectState }) =>
    countSkyladderPresses(kitEffectState, activeCombatant.characterId) === presses,
  hits: [{ onStrike: healFromDriftcloud }],
  onStart: ({ activeCombatant, kitEffectState }) => {
    const { characterId } = activeCombatant;
    const spentPresses = spendKitResource(kitEffectState, characterId, XIANYUN_SKYLADDER_STATE_ID);
    addKitStatus(kitEffectState, characterId, {
      id: XIANYUN_DRIFTCLOUD_ID,
      secondsRemaining: toKitSeconds(DRIFTCLOUD_FRAMES),
      stacks: spentPresses,
    });
  },
});

// Constellation 6: whether the presses that cost no cooldown last, so a press starts whatever the cooldown is
const checkIsCooldownFreePressActive = (context: KitContext): boolean =>
  countKitResource(context.kitEffectState.effects, context.activeCombatant.characterId, XIANYUN_CONSTELLATION_6_ID) > 0;

// Xianyun's behaviour covers her Skyladder presses and their state, the Driftcloud Wave with its heal and CRIT DMG, and
// Constellations 1, 2, 4 and 6. Starwicker, the Burst's heals, her airborne buff and her passives are not built
// Her four strikes, charged attack, plunges and Stars Gather at Dusk's hit are her record's alone
export const createXianyunKitBehaviour = (): KitBehaviour => ({
  // Constellation 6: the Burst gives eight presses that cost no cooldown for 16 seconds
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      if (activeCombatant.constellationCount < CONSTELLATION_6) return;

      addKitStatus(kitEffectState, activeCombatant.characterId, {
        id: XIANYUN_CONSTELLATION_6_ID,
        secondsRemaining: CONSTELLATION_6_SECONDS,
        stacks: CONSTELLATION_6_PRESSES,
      });
    },
  },
  checkIsSkillCooldownWaived: checkIsCooldownFreePressActive,
  // Purifying Wind, from Constellation 1: White Clouds at Dawn gains one more charge
  getSkillChargeBonus: createConstellationSkillChargeBonus(CONSTELLATION_1),
  getSkillCooldownMultiplier: (context) => (checkIsCooldownFreePressActive(context) ? 0 : 1),
  // Constellation 6: a Driftcloud Wave's hit gains CRIT DMG for the presses made in its state
  getStrikeCriticalDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects) => {
    if (combatant.constellationCount < CONSTELLATION_6 || attackTag !== AttackTag.PlungingAttack) return 0;

    const presses = countKitResource(effects, combatant.characterId, XIANYUN_DRIFTCLOUD_ID);
    return presses > 0 ? takeOne(CONSTELLATION_6_CRIT_DAMAGE, presses - 1) : 0;
  },
  plungeVariants: [1, 2, 3].map((presses) => createDriftcloudVariant(presses)),
  skill: {
    // A press spends one of Constellation 6's presses that cost no cooldown, if it holds any, and starts the state
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      consumeKitResource(kitEffectState, characterId, XIANYUN_CONSTELLATION_6_ID, 1);
      startSkyladderPress(kitEffectState, characterId, 1);
      // Constellation 2: each White Clouds at Dawn gives Xianyun 20% ATK for 15 seconds, and a press restarts that buff
      if (activeCombatant.constellationCount < CONSTELLATION_2) return;

      buffKitMember(kitEffectState, characterId, {
        amount: CONSTELLATION_2_ATTACK_SHARE,
        attribute: Attribute.AttackPercent,
        secondsRemaining: CONSTELLATION_2_SECONDS,
        source: CONSTELLATION_2_SOURCE,
      });
    },
  },
  // Skyladder's second and third presses, each in the state the press before it set, counting up to three
  skillChain: [
    {
      onStart: ({ activeCombatant, kitEffectState }) => {
        startSkyladderPress(kitEffectState, activeCombatant.characterId, 2);
      },
    },
    {
      onStart: ({ activeCombatant, kitEffectState }) => {
        startSkyladderPress(kitEffectState, activeCombatant.characterId, 3);
      },
    },
  ],
});
