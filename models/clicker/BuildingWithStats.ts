import type { Building } from "@/models/clicker/Building";

export interface BuildingWithStats extends Building {
  amount: number;
  producedValue: number;
}
