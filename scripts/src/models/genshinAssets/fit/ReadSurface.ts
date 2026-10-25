import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";

// A placed mesh or a terrain tile read apart: its part, its samples, and the detail of the textures its covered faces drew
export interface ReadSurface {
  detail?: SurfaceDetail;
  part: string;
  samples: SurfaceSample[];
}
