import type { WindriseSurface } from "#src/models/windrise/WindriseSurface";
import type { SurfaceDetail } from "genshin-engine";

// A part's detail as its export's textures carry it, and its family's where the part has none of its own
export const getWindrisePartDetail = (family: WindriseSurface, part: string): SurfaceDetail =>
  family.parts[part]?.detail ?? family.detail;
