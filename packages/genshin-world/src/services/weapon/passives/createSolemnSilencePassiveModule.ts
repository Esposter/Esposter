import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";

// Solemn Silence, Serenity's Call's passive at its rank: after its wielder causes a reaction, its Max HP rises by the rank's
// Percentage, and by the rank's Moonsign percentage more under Ascendant Gleam
export const createSolemnSilencePassiveModule = (params: number[]): PassiveModule =>
  createReactionBuffPassiveModule(params, { attribute: Attribute.HealthPercent, source: "solemnSilence" });
