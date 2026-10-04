import type { FacadeLayer } from "#src/models/genshinAssets/fit/FacadeLayer";
import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";
import type { Vector } from "#src/models/shared/Vector";

export interface TowerFacade {
  // The tone of each run of the tower's height, from its foot, as a share of the tower's own mean stone
  bands: { from: number; shade: Vector; to: number }[];
  // Where the tower is open, so the sky shows through between its columns
  holes: [number, number][][];
  // The paint on its face darker and lighter than its band, what stands out from its wall, its recesses shallow and
  // Then deep, and its gilding, each
  // As loops in its own shade over the band under it, drawn in that order
  layers: FacadeLayer[];
  // The lathe the scene builds it as: its walls' radius band by band, a band merged into the one below while its radius
  // Holds within the tolerance, so its facade lies on the face it was read off rather than out on its columns' and
  // Its cornices' tips
  sections: LatheProfile["sections"];
  // Its surface's breadth round at its widest and its height, the loops' frame, in its mesh's own units
  size: [number, number];
}
