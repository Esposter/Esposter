import { z } from "zod";

// How far an outline is hand-drawn: architect draws it straight, artist with the sketch every outline drew before a level could be chosen, and
// Cartoonist with a larger sketch
export enum SketchLevel {
  Architect = "architect",
  Artist = "artist",
  Cartoonist = "cartoonist",
}

export const sketchLevelSchema: z.ZodEnum<typeof SketchLevel> = z.enum(SketchLevel) satisfies z.ZodType<SketchLevel>;
