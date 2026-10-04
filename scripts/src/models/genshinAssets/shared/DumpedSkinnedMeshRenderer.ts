import type { DumpedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedMeshRenderer";
import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";

// A skinned renderer draws its mesh itself, with no filter beside it: a part whose pieces a clip moves, such as a door
export interface DumpedSkinnedMeshRenderer extends DumpedMeshRenderer {
  m_Mesh: DumpedPointer;
}
