import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

// A skinned renderer as its dump holds it, with the file (its CAB) it lies in. Each pointer it holds is resolved through
// That file's externals, so a pointer with a file index other than zero names its object in another CAB; a pointer that
// Names none, or one whose file the CAB map does not know, is undefined
export interface SkinnedRenderer {
  bones: (ResolvedObject | undefined)[];
  file: string;
  materials: (ResolvedObject | undefined)[];
  mesh?: ResolvedObject;
  renderer: DumpedSkinnedMeshRenderer;
  rootBone?: ResolvedObject;
}
