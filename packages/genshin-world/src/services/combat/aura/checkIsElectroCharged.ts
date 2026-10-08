import type { Aura } from "#src/models/combat/Aura";

import { AuraType } from "#src/models/combat/AuraType";

// Electro-Charged holds while Electro and Hydro lie on a target together
export const checkIsElectroCharged = (auras: Map<AuraType, Aura>): boolean =>
  auras.has(AuraType.Electro) && auras.has(AuraType.Hydro);
