import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const CHORD_HARMONIC_ID = "harmonic";
const CHORD_HARMONIC_MAXIMUM = 5;
const CHORD_HARMONIC_SECONDS = 30;
const CHORD_HARMONIC_COOLDOWN_SECONDS = 0.5;

// The Flute's Chord at its rank: a normal or charged attack hit gains a harmonic, a maximum of one every half second, and
// Five harmonics, which last thirty seconds from the last gained, deal the rank's multiplier of ATK to the surrounding
// Enemies and clear the count. The area is provisional, the text naming only the surrounding opponents
export const createChordPassiveModule = (params: number[]): WeaponPassiveModule => {
  const talentMultiplier = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag)
      )
        return;
      addPassiveStack(context.kitEffectState, combatant.characterId, {
        cooldownSeconds: CHORD_HARMONIC_COOLDOWN_SECONDS,
        id: CHORD_HARMONIC_ID,
        maximumStacks: CHORD_HARMONIC_MAXIMUM,
        perStackBonuses: [],
        seconds: CHORD_HARMONIC_SECONDS,
      });
      const harmonics = findKitStatus(context.kitEffectState.effects, combatant.characterId, CHORD_HARMONIC_ID)?.stacks;
      if (harmonics !== CHORD_HARMONIC_MAXIMUM) return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: CHORD_HARMONIC_ID,
        secondsRemaining: 0,
        stacks: 0,
      });
      queueKitPassiveHit(context, combatant, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
