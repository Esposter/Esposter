import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { Element } from "#src/models/Element";
import {
  AMPLIFYING_ELEMENTAL_MASTERY_CURVE,
  FORWARD_AMPLIFYING_MULTIPLIER,
  REVERSE_AMPLIFYING_MULTIPLIER,
} from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";

// What an amplifying reaction multiplies its hit by: 2 for Hydro's Vaporize and Pyro's Melt, 1.5 for Pyro's Vaporize and
// Cryo's Melt, raised by the triggering character's elemental mastery and reaction bonus
export const getAmplifyingMultiplier = (
  amplifyingReactionType: AmplifyingReactionType,
  triggerElement: Element,
  elementalMastery: number,
  reactionBonus = 0,
): number => {
  const forwardElement = amplifyingReactionType === AmplifyingReactionType.Vaporize ? Element.Hydro : Element.Pyro;
  const multiplier = triggerElement === forwardElement ? FORWARD_AMPLIFYING_MULTIPLIER : REVERSE_AMPLIFYING_MULTIPLIER;
  return (
    multiplier * (1 + getElementalMasteryBonus(elementalMastery, AMPLIFYING_ELEMENTAL_MASTERY_CURVE) + reactionBonus)
  );
};
