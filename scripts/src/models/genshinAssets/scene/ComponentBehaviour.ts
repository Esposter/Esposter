import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

// One MonoBehaviour or built-in component of a component's layout blocks: its block, file and script, the game object
// It sits on, the fields its raw bytes scan as, and a describer of a pointer by what its file's references resolve it to
export interface ComponentBehaviour {
  block: string;
  describePointer: (pointer: ObjectPointer) => string;
  fields: SerializedField[];
  file: string;
  owner: string;
  script: string;
}
