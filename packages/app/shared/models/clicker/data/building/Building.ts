import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { Type } from "arktype";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { type } from "arktype";

export interface Building {
  basePrice: number;
  baseValue: number;
  flavorDescription: string;
  id: BuildingId;
}

export const buildingSchema = type({
  basePrice: "number",
  baseValue: "number",
  flavorDescription: "string > 0",
  id: buildingIdSchema,
}) satisfies Type<Building>;
