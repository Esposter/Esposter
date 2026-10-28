import type { CabMapRecord } from "#src/models/recreation/animeStudio/CabMapRecord";

import { readCabMap } from "#src/services/recreation/animeStudio/readCabMap";
import { writeCabMap } from "#src/services/recreation/animeStudio/writeCabMap";

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
    .toSorted(([firstKey], [secondKey]) => (firstKey < secondKey ? -1 : Number(firstKey > secondKey)))
    .map(([, record]) => record);
  return writeCabMap({ baseFolder, records });
};
