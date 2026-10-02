import type { MusicObjectType } from "#src/models/genshinAssets/MusicObjectType";

// One music object of a sound bank's hierarchy, its fields still as their bytes, which are read once every object's id
// Is known, since a container's children are found by the ids they name
export interface MusicObject {
  data: Buffer;
  id: number;
  type: MusicObjectType;
}
