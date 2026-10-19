import type { AuraType } from "#src/models/combat/AuraType";
import type { ElementalState } from "#src/models/combat/ElementalState";

// A source's application written into an aura's sources in place, once the aura holds it: an aura that was not there
// Before starts its sources afresh. The gauge the aura rose by is no other source's, so each other source stands that much
// Further below it, and the applying source's share becomes the larger of what it held and what it applied, as gcsim
// (MIT) pkg/reactable/reactable.go's attachOverlap adds to one source's durability
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/pkg/reactable/reactable.go
export const addAuraSource = (
  state: ElementalState,
  auraType: AuraType,
  sourceId: number,
  appliedGauge: number,
  gaugeBefore: number,
): void => {
  const gauge = state.auras.get(auraType)?.gauge ?? 0;
  const deficitMap = (gaugeBefore > 0 && state.auraSourceDeficitMap.get(auraType)) || new Map<number, number>();
  const share = Math.max(gaugeBefore - (deficitMap.get(sourceId) ?? gaugeBefore), appliedGauge);
  const rise = Math.max(0, gauge - gaugeBefore);
  for (const [id, deficit] of deficitMap) deficitMap.set(id, deficit + rise);
  deficitMap.set(sourceId, gauge - Math.min(gauge, share));
  state.auraSourceDeficitMap.set(auraType, deficitMap);
};
