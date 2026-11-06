import { worldFeatureSchema } from "#src/models/globeLandMask/WorldFeature";
import { z } from "zod";

// The world GeoJSON's countries, the one part of the file the mask reads: the parse strips its other fields
export const worldFeatureCollectionSchema: z.ZodObject<{ features: z.ZodArray<typeof worldFeatureSchema> }> = z.object({
  features: z.array(worldFeatureSchema),
});
