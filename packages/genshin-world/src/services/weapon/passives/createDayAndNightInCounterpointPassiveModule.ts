import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { checkIsStellarGlimmerReaction } from "#src/services/kit/checkIsStellarGlimmerReaction";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const HARMONIC_CLOCK_COOLDOWN_ID = "harmonicMovementCooldown";
const HARMONIC_PLAYS_ID = "harmonicMovementPlays";
const CONTRAPUNTAL_COOLDOWN_ID = "harmonicContrapuntalCooldown";
const HARMONIC_MOVEMENT_SOURCE = "harmonicMovement";
const CONTRAPUNTAL_SOURCE = "harmonicContrapuntal";

// Day and Night in Counterpoint (Forged by the Golden Melody) at its rank: every ten seconds its wielder plays a Harmonic Movement
// Of the next type in turn, the rank's ATK, Elemental Mastery and Stellar Glimmer DMG, each lasting the rank's seconds, and the clock
// Runs whether or not the wielder is on the field. A Stellar Glimmer reaction the wielder triggers copies the Harmonic Movement live
// As a Contrapuntal of its own for the rank's seconds, once every cooldown the rank gives
export const createDayAndNightInCounterpointPassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  const stellarGlimmerDamage = takeOne(params, 2);
  const movementSeconds = takeOne(params, 3);
  const contrapuntalSeconds = takeOne(params, 4);
  const contrapuntalCooldownSeconds = takeOne(params, 5);
  // The three movements in the order the text plays them
  const movements = [
    { amount: attackPercent, attribute: Attribute.AttackPercent },
    { amount: elementalMastery, attribute: Attribute.ElementalMastery },
    { amount: stellarGlimmerDamage, attribute: Attribute.StellarGlimmerReactionDamageBonus },
  ];
  return {
    onKitEvent: (event, context, combatant) => {
      if (!checkIsOwnReactionTriggered(event, combatant) || !event.reactions.some(checkIsStellarGlimmerReaction))
        return;
      const liveMovements = context.kitEffectState.effects.flatMap((effect) =>
        effect.kind === "buff" &&
        effect.characterId === combatant.characterId &&
        effect.source === HARMONIC_MOVEMENT_SOURCE
          ? [effect]
          : [],
      );
      if (
        liveMovements.length === 0 ||
        !startKitCooldown(
          context.kitEffectState,
          combatant.characterId,
          CONTRAPUNTAL_COOLDOWN_ID,
          contrapuntalCooldownSeconds,
        )
      )
        return;
      for (const { amount, attribute } of liveMovements)
        buffKitMember(context.kitEffectState, combatant.characterId, {
          amount,
          attribute,
          secondsRemaining: contrapuntalSeconds,
          source: CONTRAPUNTAL_SOURCE,
        });
    },
    onStep: (context, combatant) => {
      if (!startKitCooldown(context.kitEffectState, combatant.characterId, HARMONIC_CLOCK_COOLDOWN_ID, movementSeconds))
        return;
      const plays = gainKitResource(
        context.kitEffectState,
        combatant.characterId,
        HARMONIC_PLAYS_ID,
        1,
        Number.POSITIVE_INFINITY,
      );
      const { amount, attribute } = takeOne(movements, (plays - 1) % movements.length);
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount,
        attribute,
        secondsRemaining: movementSeconds,
        source: HARMONIC_MOVEMENT_SOURCE,
      });
    },
  };
};
