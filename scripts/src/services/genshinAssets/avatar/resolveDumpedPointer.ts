import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";

// A dumped pointer resolved as the object it names, from the file its renderer lies in
export const resolveDumpedPointer = (
  cabMap: ReadonlyMap<string, CabEntry>,
  file: string,
  { m_FileID, m_PathID }: DumpedPointer,
): ResolvedObject | undefined => resolveObjectPointer(cabMap, file, { fileIndex: m_FileID, pathId: m_PathID });
