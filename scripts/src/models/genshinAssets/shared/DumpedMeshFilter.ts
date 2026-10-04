import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";

export interface DumpedMeshFilter {
  m_GameObject: { m_PathID: string };
  m_Mesh: DumpedPointer;
}
