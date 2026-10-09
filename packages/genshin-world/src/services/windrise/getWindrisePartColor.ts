import type { WindriseSurface } from "#src/models/windrise/WindriseSurface";

// A part's colour as its family's export's textures paint the mesh it is drawn with, and its family's where the export
// Gave the part no weight
export const getWindrisePartColor = (family: WindriseSurface, part: string): string =>
  family.parts[part]?.color ?? family.color;
