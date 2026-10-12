import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";

export interface DumpedMeshRenderer {
  // The renderer's own switch, zero where it is off. A dump that omits it leaves the renderer on, as Unity's default does
  m_Enabled?: number;
  m_GameObject: { m_PathID: string };
  m_Materials: DumpedPointer[];
}
