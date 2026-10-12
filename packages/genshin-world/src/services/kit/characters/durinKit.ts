import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { KIT_FRAMES_PER_SECOND } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

export const DURIN_CHARACTER_ID = 10_000_123;

// Measured: gcsim (MIT) durin/skill.go, the recasts' Denial and Confirmation both last 30 seconds, and the black one sets the
// Burst to As the Stars Smolder until a white recast ends it. A recast also gives the skill's energy, once every six seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const BLACK_STATUS_SECONDS = 30;
const BLACK_STATUS_ID = "denial-of-darkness";
const SKILL_ENERGY_ICD_SECONDS = 6;
const SKILL_ENERGY_ICD_STATUS_ID = "durin-skill-energy-icd";

// Measured: gcsim (MIT) durin/burst.go, the white burst's Dragon ticks 20 times on the primary target and the black's 16, each
// Tick 1U of Pyro with no poise
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const WHITE_DRAGON_TICKS = 20;
const BLACK_DRAGON_TICKS = 16;
const DRAGON_SUMMON_ID = "durin-dragon";

// The recasts end the window's stance, as gcsim deletes the window when either is cast
const endWindow = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  for (const effect of kitEffectState.effects)
    if (effect.kind === "stance" && effect.characterId === combatant.characterId) effect.secondsRemaining = 0;
};

// Durin's behaviour: Tap E opens the window's stance, whose normal attack is Denial of Darkness, the black recast, and whose
// Skill press is the chain's Confirmation of Purity, the white recast, each recast ending the window and giving the skill's
// Energy. Denial of Darkness sets the burst to its black variant, As the Stars Smolder, until Confirmation of Purity ends
// It, and each burst casts its Dragon on its target. Not built yet: his passives and constellations, which read the burst's
// State and the Burning and Pyro reactions the framework does not price for a passive yet, and the Pyro particles of his
// Recasts, which need a particle a hit drops with its own delay and internal cooldown, which no hook gives a kit yet
export const createDurinKitBehaviour = ({
  kit,
  readAreas,
  readParameter,
  readParameters,
  readSecondsList,
  readStance,
}: KitRecordReader): KitBehaviour => {
  // The window's stance lasts the chain's window
  const windowSeconds = kit.elementalSkillChain?.windowSeconds ?? 0;
  const recastEnergy = readParameter("recastEnergy");
  // The Dragons' lists hold the white burst's at 0 and the black's at 1
  const dragonAreas = readAreas("dragonAreas");
  const dragonMultipliers = readParameters("dragonMultipliers");
  const dragonFirstTickSecondsList = readSecondsList("dragonFirstTick");
  const dragonIntervalSecondsList = readSecondsList("dragonInterval");
  const dragonTravelSecondsList = readSecondsList("dragonTravel");
  // Each recast gives the skill's energy once every six seconds, as gcsim's energy ICD does
  const gainRecastEnergy = ({ activeCombatant: combatant, kitEffectState, party }: KitContext): void => {
    if (!startKitCooldown(kitEffectState, combatant.characterId, SKILL_ENERGY_ICD_STATUS_ID, SKILL_ENERGY_ICD_SECONDS))
      return;
    gainPartyMemberEnergy(party, combatant, recastEnergy);
  };
  // A burst's Dragon, cast on its target, ends the one of the same character, and its DoT ticks on its schedule, each tick
  // Rounded up to a whole frame, and lands its travel after it. The schedule is counted in frames, as gcsim counts it
  const createDragonOnStart = (dragonIndex: number, tickCount: number): KitAction["onStart"] => {
    const hitArea = takeOne(dragonAreas, dragonIndex);
    const talentMultiplier = takeOne(dragonMultipliers, dragonIndex);
    const firstTickFrames = takeOne(dragonFirstTickSecondsList, dragonIndex) * KIT_FRAMES_PER_SECOND;
    const intervalFrames = takeOne(dragonIntervalSecondsList, dragonIndex) * KIT_FRAMES_PER_SECOND;
    const travelFrames = takeOne(dragonTravelSecondsList, dragonIndex) * KIT_FRAMES_PER_SECOND;
    const hitmarkSecondsList = Array.from(
      { length: tickCount },
      (_value, tick) => (Math.ceil(firstTickFrames + intervalFrames * tick) + travelFrames) / KIT_FRAMES_PER_SECOND,
    );
    return ({ activeCombatant: combatant, body, kitEffectState }, target) => {
      for (const effect of kitEffectState.effects)
        if (
          effect.kind === "summon" &&
          effect.id === DRAGON_SUMMON_ID &&
          effect.combatant.characterId === combatant.characterId
        )
          effect.secondsRemaining = 0;
      const hits = hitmarkSecondsList.map((hitmarkSeconds): KitHit => ({
        element: Element.Pyro,
        gauge: 1,
        hitArea,
        hitmarkSeconds,
        poiseDamage: 0,
        talentMultiplier,
      }));
      castKitSummon(
        kitEffectState,
        target ? { facing: 0, height: 0, position: target.position } : body,
        combatant,
        hits,
        { id: DRAGON_SUMMON_ID },
      );
    };
  };
  // Denial of Darkness is the window's normal attack, a stance's one string of three hits, so it is the stance's normal
  // Attacks, though its hits are Elemental Art DMG, gcsim's AttackTagElementalArt in durin/skill.go
  const recastWindow = readStance("recastWindow", {
    normalAttacks: [
      {
        onStart: (start) => {
          endWindow(start);
          gainRecastEnergy(start);
          addKitStatus(start.kitEffectState, start.activeCombatant.characterId, {
            id: BLACK_STATUS_ID,
            secondsRemaining: BLACK_STATUS_SECONDS,
          });
        },
      },
    ],
  });
  return {
    burst: { onStart: createDragonOnStart(0, WHITE_DRAGON_TICKS) },
    burstVariant: {
      checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
        checkHasKitStatus(kitEffectState.effects, combatant.characterId, BLACK_STATUS_ID),
      onStart: createDragonOnStart(1, BLACK_DRAGON_TICKS),
    },
    // Tap E starts the window's stance, and the chain plays the white recast whatever the cooldown Tap E set
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, recastWindow, windowSeconds),
    },
    // Confirmation of Purity ends Denial of Darkness's black status
    skillChain: [
      {
        onStart: (start) => {
          endWindow(start);
          gainRecastEnergy(start);
          for (const effect of start.kitEffectState.effects)
            if (
              effect.kind === "status" &&
              effect.id === BLACK_STATUS_ID &&
              effect.characterId === start.activeCombatant.characterId
            )
              effect.secondsRemaining = 0;
        },
      },
    ],
  };
};
