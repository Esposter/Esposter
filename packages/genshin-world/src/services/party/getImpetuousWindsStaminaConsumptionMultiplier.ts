import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { Element } from "#src/models/Element";
import { IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER } from "#src/services/party/constants";

// The factor the deployed team's resonances multiply a stamina spend by: Impetuous Winds' while it holds, else none
export const getImpetuousWindsStaminaConsumptionMultiplier = (
  elementalResonances: readonly ElementalResonance[],
): number => (elementalResonances.includes(Element.Anemo) ? IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER : 1);
