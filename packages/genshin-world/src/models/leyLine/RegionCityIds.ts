import { z } from "zod";

// Each region's city in the game's city table, by the region's id: the city its ley line kinds are read through and its
// Statue's unlock names. A region holds one city, and the city table names each by its areas
export type RegionCityIds = Readonly<Record<string, number>>;

export const regionCityIdsSchema = z.record(z.string().min(1), z.int().positive()) satisfies z.ZodType<RegionCityIds>;
