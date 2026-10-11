import type { AuraType } from "#src/models/combat/AuraType";
import type { ElementalState } from "#src/models/combat/ElementalState";

// The ids of the sources whose share of an aura is not yet spent, none while the aura is gone
export const getAuraSourceIds = ({ auras, auraSourceDeficitMap }: ElementalState, auraType: AuraType): number[] => {
  const gauge = auras.get(auraType)?.gauge ?? 0;
  return [...(auraSourceDeficitMap.get(auraType) ?? [])].filter(([, deficit]) => gauge - deficit > 0).map(([id]) => id);
};
