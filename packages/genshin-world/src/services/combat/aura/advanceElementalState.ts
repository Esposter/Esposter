import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";
import {
  BURNING_PYRO_GAUGE,
  BURNING_TICK_SECONDS,
  ELECTRO_CHARGED_FINAL_TICK_SECONDS,
  ELECTRO_CHARGED_TICK_SECONDS,
} from "#src/services/combat/aura/constants";
import { decayAuras } from "#src/services/combat/aura/decayAuras";
import { tickElectroCharged } from "#src/services/combat/aura/tickElectroCharged";
import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";
import { BURNING_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";

// A target's elements some seconds on, written in place, and the reactions those seconds bring pushed onto
// `reactions`, so a quiet step allocates nothing. The auras decay from one tick to the next: Electro-Charged ticks each
// Second, and once an aura decays out from under it, a last time if half a second has passed since the one before;
// Burning ticks each quarter second, its Pyro applied to the target itself under Burning's internal cooldown
export const advanceElementalState = (state: ElementalState, deltaSeconds: number, reactions: Reaction[]): void => {
  const { auras } = state;
  const endSeconds = state.seconds + deltaSeconds;
  while (state.seconds < endSeconds) {
    const wasElectroCharged = checkIsElectroCharged(auras);
    const electroChargedTickSeconds = wasElectroCharged
      ? state.electroChargedSeconds + ELECTRO_CHARGED_TICK_SECONDS
      : Infinity;
    const burningTickSeconds = auras.has(AuraType.Burning) ? state.burningSeconds + BURNING_TICK_SECONDS : Infinity;
    const seconds = Math.min(endSeconds, electroChargedTickSeconds, burningTickSeconds);
    decayAuras(auras, seconds - state.seconds);
    state.seconds = seconds;
    const isElectroCharged = checkIsElectroCharged(auras);
    if (isElectroCharged && seconds === electroChargedTickSeconds) {
      state.electroChargedSeconds = seconds;
      reactions.push(tickElectroCharged(auras));
    } else if (
      wasElectroCharged &&
      !isElectroCharged &&
      seconds - state.electroChargedSeconds >= ELECTRO_CHARGED_FINAL_TICK_SECONDS
    )
      reactions.push(tickElectroCharged(auras));

    if (!auras.has(AuraType.Burning) || seconds !== burningTickSeconds) continue;
    state.burningSeconds = seconds;
    const pyroGauge =
      BURNING_PYRO_GAUGE *
      applyInternalCooldown(state.burningInternalCooldown, BURNING_INTERNAL_COOLDOWN_GROUP, seconds);
    reactions.push(
      { element: Element.Pyro, reactionType: ReactionType.Burning, spreadGauge: pyroGauge },
      ...applyElement(state, Element.Pyro, pyroGauge),
    );
  }
};
