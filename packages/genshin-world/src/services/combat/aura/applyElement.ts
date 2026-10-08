import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { applyAura } from "#src/services/combat/aura/applyAura";
import { applyReactionAura } from "#src/services/combat/aura/applyReactionAura";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";
import {
  CRYSTALLIZE_COOLDOWN_SECONDS,
  SWIRL_BASE_GAUGE,
  SWIRL_GAUGE_OFFSET,
  SWIRL_GAUGE_SCALE,
} from "#src/services/combat/aura/constants";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";
import { ElementReactionStepsMap } from "#src/services/combat/aura/ElementReactionStepsMap";
import { extinguishBurning } from "#src/services/combat/aura/extinguishBurning";
import { tickElectroCharged } from "#src/services/combat/aura/tickElectroCharged";

// An element's attack on a target at a gauge, written into its auras in place, and the reactions it triggers. It tries
// Its reactions in the game's order, each consuming its auras by its coefficient times what is left of the trigger,
// And each recorded once however many auras it meets. A Burning already lit is refreshed, not triggered again, and
// Pyro and Electro meet only the Freeze over a hidden Hydro. What is left, meeting nothing more it consumes, stays as an
// Aura, and Electro coming to lie beside Hydro starts Electro-Charged, which ticks at once. Crystallize triggers once
// A second, however many auras it could meet
export const applyElement = (state: ElementalState, element: Element, gauge: number): Reaction[] => {
  const { auras, seconds } = state;
  const steps = ElementReactionStepsMap[element];
  const wasElectroCharged = checkIsElectroCharged(auras);
  const isHydroHidden = auras.has(AuraType.Freeze) && [Element.Electro, Element.Pyro].includes(element);
  const reactions: Reaction[] = [];
  let remainingGauge = gauge;
  for (const { auraTypes, coefficient, ...reaction } of steps) {
    // A Geo attack shatters a Freeze even at no gauge, as its internal cooldown leaves it
    if (remainingGauge <= 0 && reaction.reactionType !== ReactionType.Shattered) break;
    const auraGauge = Math.max(...auraTypes.map((auraType) => auras.get(auraType)?.gauge ?? 0));
    if (
      auraGauge === 0 ||
      (isHydroHidden && auraTypes.includes(AuraType.Hydro)) ||
      (reaction.reactionType === ReactionType.Crystallize &&
        seconds - state.crystallizeSeconds < CRYSTALLIZE_COOLDOWN_SECONDS) ||
      (reaction.reactionType === ReactionType.Burning && auras.has(AuraType.Burning))
    )
      continue;
    const triggerGauge = coefficient * remainingGauge;
    const consumedGauge = Math.min(auraGauge, triggerGauge);
    const isRecorded = reactions.some(
      ({ element: recordedElement, reactionType }) =>
        reactionType === reaction.reactionType && recordedElement === reaction.element,
    );
    if (!isRecorded && reaction.reactionType === ReactionType.Swirl) {
      const swirledGauge = triggerGauge <= auraGauge ? remainingGauge : auraGauge;
      reactions.push({
        ...reaction,
        spreadGauge: (swirledGauge - SWIRL_GAUGE_OFFSET) * SWIRL_GAUGE_SCALE + SWIRL_BASE_GAUGE,
      });
    } else if (!isRecorded) reactions.push(reaction);

    consumeAuras(auras, auraTypes, consumedGauge);
    applyReactionAura(state, reaction.reactionType, consumedGauge);
    if (coefficient > 0) remainingGauge = triggerGauge <= auraGauge ? 0 : remainingGauge - auraGauge / coefficient;
  }

  const auraType = ElementAuraTypeMap[element];
  const isAuraLeft =
    remainingGauge > 0 &&
    !isHydroHidden &&
    steps.every(
      ({ auraTypes, coefficient }) => coefficient === 0 || !auraTypes.some((stepAuraType) => auras.has(stepAuraType)),
    );
  if (auraType && isAuraLeft) applyAura(auras, auraType, remainingGauge);
  extinguishBurning(auras);
  if (!wasElectroCharged && checkIsElectroCharged(auras)) {
    state.electroChargedSeconds = seconds;
    reactions.push(tickElectroCharged(auras));
  }
  return reactions;
};
