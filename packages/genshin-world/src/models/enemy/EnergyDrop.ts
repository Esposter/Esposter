import type { EnergyDropKind } from "#src/models/enemy/EnergyDropKind";

// Energy an enemy drops once its health falls to a percentage of its most, or at none once it is defeated
export interface EnergyDrop {
  count: number;
  energyDropKind: EnergyDropKind;
  healthPercent: number;
}
