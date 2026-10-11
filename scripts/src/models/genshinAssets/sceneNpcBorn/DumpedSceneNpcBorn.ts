import type { DumpedNpcBorn } from "#src/models/genshinAssets/residents/DumpedNpcBorn";

// A birth record of the scene's NPC births file: the NPC birth's place and turn, with the group it is born in and the
// Suites of that group it is placed in, which a record names only when it has any
export interface DumpedSceneNpcBorn extends DumpedNpcBorn {
  _groupId: number;
  suiteIdList?: number[];
}
