import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { Element } from "#src/models/Element";
import { IMPETUOUS_WINDS_SKILL_COOLDOWN_MULTIPLIER } from "#src/services/party/constants";

// The factor the deployed team's resonances multiply a skill's cooldown by: Impetuous Winds' while it holds, else none
export const getImpetuousWindsSkillCooldownMultiplier = (elementalResonances: readonly ElementalResonance[]): number =>
  elementalResonances.includes(Element.Anemo) ? IMPETUOUS_WINDS_SKILL_COOLDOWN_MULTIPLIER : 1;
