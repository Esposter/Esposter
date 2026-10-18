import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DumpedVector } from "#src/models/genshinAssets/world/DumpedVector";

// A scene point's field as a vector. The dump writes a vector as an object with its zero components left out, so a field
// that is a number, a string, an array or nothing is no vector, and reads as the zero one
export const toDumpedVector = (field: DumpedScenePoint[string] | undefined): DumpedVector =>
  typeof field === "object" && !Array.isArray(field) ? field : {};
