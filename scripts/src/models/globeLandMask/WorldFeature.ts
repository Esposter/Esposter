import { GeometryType } from "#src/models/globeLandMask/GeometryType";
import { z } from "zod";

// A position is a longitude and a latitude, and nothing else
const positionSchema: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null> = z.tuple([z.number(), z.number()]);
// A Polygon's coordinates are rings of positions
const polygonCoordinatesSchema: z.ZodArray<z.ZodArray<typeof positionSchema>> = z.array(z.array(positionSchema));

const polygonGeometrySchema: z.ZodObject<{
  coordinates: typeof polygonCoordinatesSchema;
  type: z.ZodLiteral<GeometryType.Polygon>;
}> = z.object({ coordinates: polygonCoordinatesSchema, type: z.literal(GeometryType.Polygon) });
// A MultiPolygon's coordinates add one level for its polygons
const multiPolygonGeometrySchema: z.ZodObject<{
  coordinates: z.ZodArray<typeof polygonCoordinatesSchema>;
  type: z.ZodLiteral<GeometryType.MultiPolygon>;
}> = z.object({ coordinates: z.array(polygonCoordinatesSchema), type: z.literal(GeometryType.MultiPolygon) });

// One country of the world GeoJSON, by its shape
export const worldFeatureSchema: z.ZodObject<{
  geometry: z.ZodDiscriminatedUnion<[typeof polygonGeometrySchema, typeof multiPolygonGeometrySchema], "type">;
}> = z.object({ geometry: z.discriminatedUnion("type", [polygonGeometrySchema, multiPolygonGeometrySchema]) });

// Derived from the schema, since a written interface would nest an enum the lint rule cannot match
export type WorldFeature = z.infer<typeof worldFeatureSchema>;
