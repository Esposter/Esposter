import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";

export interface DumpedMeshRenderer {
  m_GameObject: { m_PathID: string };
  m_Materials: DumpedPointer[];
}
