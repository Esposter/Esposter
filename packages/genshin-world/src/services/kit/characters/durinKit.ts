import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

export const DURIN_CHARACTER_ID = 10_000_123;

// Measured: gcsim (MIT) durin/skill.go, the recasts' Denial and Confirmation both last 30 seconds, and the black one sets the
// Burst to As the Stars Smolder until a white recast ends it. A recast also gives the skill's energy, once every six seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const BLACK_STATUS_SECONDS = 30;
const BLACK_STATUS_ID = "denial-of-darkness";
const SKILL_ENERGY_ICD_SECONDS = 6;
const SKILL_ENERGY_ICD_STATUS_ID = "durin-skill-energy-icd";

const DRAGON_SUMMON_ID = "durin-dragon";

// A burst's Dragon, cast on its target, ends the one of the same character, and its DoT ticks on its schedule. The record
// Holds gcsim's (MIT) durin/burst.go ticks: the white burst's 20 on the primary target and the black's 16, each 1U of Pyro
// With no poise, each rounded up to a whole frame with its travel after it
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const createDragonOnStart =
  (hits: KitHit[]): KitAction["onStart"] =>
  ({ activeCombatant: combatant, body, kitEffectState }, target) => {
    for (const effect of kitEffectState.effects)
      if (
        effect.kind === "summon" &&
        effect.id === DRAGON_SUMMON_ID &&
        effect.combatant.characterId === combatant.characterId
      )
        effect.secondsRemaining = 0;
    castKitSummon(
      kitEffectState,
      target ? { facing: 0, height: 0, position: target.position } : body,
      combatant,
      hits,
      { id: DRAGON_SUMMON_ID },
    );
  };

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
// Constellation 1 needs the burst's Principle of Purity and As the Stars Smolder states to change what the burst does
// Constellation 2 needs the Vaporize, Melt, Burning and Pyro reactions of nearby members, which the kit does not price
// Constellation 4 needs the Cycle of Enlightenment's consuming effects and the burst's 40% DMG, neither built
// Constellation 6 needs the burst's 30% DEF ignore and its two states' effects, neither built
export const createDurinKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readStance,
}: KitRecordReader): KitBehaviour => {
  // The window's stance lasts the chain's window
  const windowSeconds = kit.elementalSkillChain?.windowSeconds ?? 0;
  const recastEnergy = readParameter("recastEnergy");
  // Each recast gives the skill's energy once every six seconds, as gcsim's energy ICD does
  const gainRecastEnergy = ({ activeCombatant: combatant, kitEffectState, party }: KitContext): void => {
    if (!startKitCooldown(kitEffectState, combatant.characterId, SKILL_ENERGY_ICD_STATUS_ID, SKILL_ENERGY_ICD_SECONDS))
      return;
    gainPartyMemberEnergy(party, combatant, recastEnergy);
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
    burst: { onStart: createDragonOnStart(readHits("whiteDragonTicks")) },
    burstVariant: {
      checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
        checkHasKitStatus(kitEffectState.effects, combatant.characterId, BLACK_STATUS_ID),
      onStart: createDragonOnStart(readHits("blackDragonTicks")),
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
