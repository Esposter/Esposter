import type { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";

// One object of a sound bank's hierarchy, its fields still as their bytes, which are read once every object's id is
// Known, since a container's children and a node's parent are found by the ids they name
export interface SoundBankObject {
  data: Buffer;
  id: number;
  type: SoundBankObjectType;
}
