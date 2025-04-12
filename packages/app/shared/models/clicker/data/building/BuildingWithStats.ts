import type { Building } from "#shared/models/clicker/data/building/Building";
import type { Type } from "arktype";

import { buildingSchema } from "#shared/models/clicker/data/building/Building";

export interface BuildingWithStats extends Building {
  amount: number;
  producedValue: number;
}

export const buildingWithStatsSchema = buildingSchema.merge({
  amount: "number",
  producedValue: "number",
}) satisfies Type<BuildingWithStats>;
