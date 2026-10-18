import type { ElementalState } from "#src/models/combat/ElementalState";
import type { ElementApplication } from "#src/models/combat/ElementApplication";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { addAuraSource } from "#src/services/combat/aura/addAuraSource";
import { applyAura } from "#src/services/combat/aura/applyAura";
import { applyReactionAura } from "#src/services/combat/aura/applyReactionAura";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";
import {
  AURA_BASE_SECONDS,
  AURA_SECONDS_PER_GAUGE,
  AURA_TAX,
  CRYSTALLIZE_COOLDOWN_SECONDS,
  SWIRL_BASE_GAUGE,
  SWIRL_GAUGE_OFFSET,
  SWIRL_GAUGE_SCALE,
} from "#src/services/combat/aura/constants";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";
import { ElementReactionStepsMap } from "#src/services/combat/aura/ElementReactionStepsMap";
import { extinguishBurning } from "#src/services/combat/aura/extinguishBurning";
import { getAuraSourceIds } from "#src/services/combat/aura/getAuraSourceIds";
import { getLunarReactionType } from "#src/services/combat/aura/getLunarReactionType";
import { getStellarReactionType } from "#src/services/combat/aura/getStellarReactionType";
import { tickElectroCharged } from "#src/services/combat/aura/tickElectroCharged";

// An element's attack on a target at a gauge, written into its auras in place, and the reactions it triggers. It tries
// Its reactions in the game's order, each consuming its auras by its coefficient times what is left of the trigger, and
// Each recorded once however many auras it meets. An immutable aura takes its share of the trigger but is never
// Consumed, so what is left goes on to the auras beside it. A Burning already lit is refreshed, not triggered again,
// And Pyro and Electro meet only the Freeze over a hidden Hydro. What is left, meeting nothing more it consumes, stays
// As an aura: an attack's taxed and decaying by its gauge, and a self aura, an element put on with no attack, whole and
// Lasting its source's seconds at its source's rate, never decaying where those are Infinity. Electro coming to lie
// Beside Hydro starts Electro-Charged, which ticks at once. Crystallize triggers once a second, however many auras it
// Could meet. A reaction the attacking party's Moonsign turns Lunar is recorded as its Lunar form, consuming as the
// Reaction it replaces does, and a Lunar-Crystallize, under no cooldown, keeps the sources of the Hydro it consumed.
// A reaction the party's Stellar Jubilee passives enable is recorded as its Stellar form, a Stellar Swirl spreading no
// Cryo beside it, and consumes as the reaction it replaces does.
// Where the Moonsign turns Electro-Charged Lunar, each Electro or Hydro that leaves the two lying together, with no
// Freeze over them, triggers Lunar-Charged instead, which ticks nothing of its own, as gcsim (MIT)
// `pkg/reactable/lunarcharged.go` has each application trigger it. The aura an application leaves keeps its source's
// Share
export const applyElement = (
  state: ElementalState,
  element: Element,
  gauge: number,
  {
    auraDecayRateScale = 1,
    lunarReactionTypes = [],
    selfAuraSeconds,
    sourceId,
    stellarReactionTypes = [],
  }: ElementApplication = {},
): Reaction[] => {
  const { auras, seconds } = state;
  const steps = ElementReactionStepsMap[element];
  const wasElectroCharged = checkIsElectroCharged(auras);
  const isHydroHidden = auras.has(AuraType.Freeze) && [Element.Electro, Element.Pyro].includes(element);
  const reactions: Reaction[] = [];
  let remainingGauge = gauge;
  for (const { auraTypes, coefficient, ...stepReaction } of steps) {
    const reaction: Reaction = {
      ...stepReaction,
      reactionType:
        getLunarReactionType(stepReaction, lunarReactionTypes) ??
        getStellarReactionType(stepReaction, stellarReactionTypes) ??
        stepReaction.reactionType,
    };
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
    } else if (!isRecorded && reaction.reactionType === ReactionType.LunarCrystallize)
      reactions.push({ ...reaction, sourceIds: getAuraSourceIds(state, AuraType.Hydro) });
    else if (!isRecorded) reactions.push(reaction);

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
  if (auraType && isAuraLeft) {
    const gaugeBefore = auras.get(auraType)?.gauge ?? 0;
    const taxedGauge = AURA_TAX * remainingGauge;
    applyAura(
      auras,
      auraType,
      selfAuraSeconds === undefined
        ? {
            decayRate:
              (taxedGauge / (AURA_SECONDS_PER_GAUGE * remainingGauge + AURA_BASE_SECONDS)) * auraDecayRateScale,
            gauge: taxedGauge,
            isImmutable: false,
          }
        : { decayRate: gauge / selfAuraSeconds, gauge: remainingGauge, isImmutable: false },
    );
    if (sourceId !== undefined)
      addAuraSource(
        state,
        auraType,
        sourceId,
        selfAuraSeconds === undefined ? taxedGauge : remainingGauge,
        gaugeBefore,
      );
  }
  extinguishBurning(auras);
  const isElectroCharged = checkIsElectroCharged(auras);
  if (
    isElectroCharged &&
    remainingGauge > 0 &&
    (element === Element.Electro || element === Element.Hydro) &&
    !auras.has(AuraType.Freeze) &&
    lunarReactionTypes.includes(LunarReactionType.LunarCharged)
  ) {
    state.isLunarCharged = true;
    reactions.push({ element: Element.Electro, reactionType: ReactionType.LunarCharged });
  } else if (!wasElectroCharged && isElectroCharged && !state.isLunarCharged) {
    state.electroChargedSeconds = seconds;
    reactions.push(tickElectroCharged(auras));
  }
  if (!isElectroCharged) state.isLunarCharged = false;
  return reactions;
};
