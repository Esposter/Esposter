import type { Aura } from "#src/models/combat/Aura";

import { AuraType } from "#src/models/combat/AuraType";

// A Burning goes out, in place, once neither Dendro nor Quicken is left under it to burn
export const extinguishBurning = (auras: Map<AuraType, Aura>): void => {
  if (!auras.has(AuraType.Dendro) && !auras.has(AuraType.Quicken)) auras.delete(AuraType.Burning);
};
