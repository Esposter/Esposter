import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

export const toPointers = (pointers: readonly DumpedPointer[]): ObjectPointer[] =>
  pointers
    .filter(({ IsNull, m_PathID }) => !IsNull && m_PathID !== "0")
    .map(({ m_FileID, m_PathID }) => ({ fileIndex: m_FileID, pathId: m_PathID }));
