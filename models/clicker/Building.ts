import type { BuildingName } from "@/models/clicker/BuildingName";

export interface Building {
  name: BuildingName;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
}
