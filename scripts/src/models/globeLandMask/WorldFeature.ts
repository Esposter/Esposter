import { GeometryType } from "#src/models/globeLandMask/GeometryType";
import { z } from "zod";

// One country of the world GeoJSON, by its shape
// A Polygon's coordinates are rings of positions, and a MultiPolygon's add one level for its polygons
export const worldFeatureSchema: z.ZodObject<{
  geometry: z.ZodObject<{
    coordinates: z.ZodUnion<
      readonly [
        z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber>>>,
        z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber>>>>,
      ]
    >;
    type: z.ZodEnum<typeof GeometryType>;
  }>;
}> = z.object({
  geometry: z.object({
    coordinates: z.union([z.array(z.array(z.array(z.number()))), z.array(z.array(z.array(z.array(z.number()))))]),
    type: z.enum(GeometryType),
  }),
});

// Derived from the schema, since a written interface would nest an enum the lint rule cannot match
export type WorldFeature = z.infer<typeof worldFeatureSchema>;
