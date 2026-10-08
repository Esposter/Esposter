import type { Aura } from "#src/models/combat/Aura";
import type { AuraType } from "#src/models/combat/AuraType";

// A gauge taken in place from each of a target's auras of the given types, an aura gone once it has none left
export const consumeAuras = (auras: Map<AuraType, Aura>, auraTypes: AuraType[], gauge: number): void => {
  for (const auraType of auraTypes) {
    const aura = auras.get(auraType);
    if (!aura) continue;
    aura.gauge -= gauge;
    if (aura.gauge <= 0) auras.delete(auraType);
  }
};
