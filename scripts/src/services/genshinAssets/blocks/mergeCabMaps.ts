import type { CabMapRecord } from "#src/models/genshinAssets/shared/CabMapRecord";

import { readCabMap } from "#src/services/genshinAssets/shared/readCabMap";
import { writeCabMap } from "#src/services/genshinAssets/shared/writeCabMap";

// The CAB maps of several runs over the blocks, merged into one over the base folder they all are relative to. As
// AnimeStudio keeps the first file it finds of a name, a CAB two runs both hold keeps the record of the earlier map,
// And the records are written in name order, as AnimeStudio writes its own
export const mergeCabMaps = (maps: Buffer[], baseFolder: string): Buffer => {
  const firstRecords = new Map<string, CabMapRecord>();
  for (const bytes of maps)
    for (const record of readCabMap(bytes).records) {
      const key = record.name.toLowerCase();
      if (!firstRecords.has(key)) firstRecords.set(key, record);
    }
  const records = [...firstRecords.entries()]
    .toSorted(([left], [right]) => (left < right ? -1 : Number(left > right)))
    .map(([, record]) => record);
  return writeCabMap({ baseFolder, records });
};
