import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";

export interface Building {
  basePrice: number;
  baseValue: number;
  flavorDescription: string;
  id: BuildingId;
}
