import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";

// One family's surface as its export paints it: its colour as hex, the area-weighted mean of what its textures show, and
// The palette of the tones they carry, each as hex with the share of the family's area it covers, darkest first. Its
// Detail is the texture statistics the export's detail is matched by, when its textures carry any
export interface FittedSurface {
  color: string;
  detail?: SurfaceDetail;
  palette: { color: string; share: number }[];
}
