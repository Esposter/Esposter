import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

// A drawable material read as its values from the folder of the CAB it lies in, its texture slots resolved to the textures
// Their pointers name through that same file
export interface DrawableMaterial {
  colors: MaterialValues["colors"];
  floats: MaterialValues["floats"];
  keywords: string[];
  textures: Record<string, ResolvedObject>;
}
