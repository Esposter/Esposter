import type { SurfaceDetail } from "genshin-engine";

import { surfaceDetailSchema } from "#src/models/windrise/surfaceDetailSchema";
import { z } from "zod";

// A part family's surface as its export's textures paint it: its colour and detail, the palette its patches turn
// Across, and each of its parts' own colour, with its detail where the part has its own
export interface WindriseSurface {
  color: string;
  detail: SurfaceDetail;
  palette: WindriseSurfaceTone[];
  parts: Record<string, WindriseSurfacePart>;
}
// A part of a surface, its colour and its detail where it has its own
interface WindriseSurfacePart {
  color: string;
  detail?: SurfaceDetail;
}
// A tone of a surface's palette and the share of the surface it covers
interface WindriseSurfaceTone {
  color: string;
  share: number;
}

const windriseSurfaceToneSchema = z.object({
  color: z.string(),
  share: z.number().min(0).max(1),
}) satisfies z.ZodType<WindriseSurfaceTone>;
const windriseSurfacePartSchema = z.object({
  color: z.string(),
  detail: surfaceDetailSchema.optional(),
}) satisfies z.ZodType<WindriseSurfacePart>;

export const windriseSurfaceSchema = z.object({
  color: z.string(),
  detail: surfaceDetailSchema,
  palette: z.array(windriseSurfaceToneSchema),
  parts: z.record(z.string(), windriseSurfacePartSchema),
}) satisfies z.ZodType<WindriseSurface>;
