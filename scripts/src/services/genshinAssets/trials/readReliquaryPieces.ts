import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";

import { RELIQUARY_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { ArtifactSlot } from "genshin-world";
import { z } from "zod";

// Every reliquary of the game's reliquary table by its id, each with its set and the slot its equip type names. The 7.1
// Dump keeps setId and equipType under their plain keys, so both are read by name rather than searched for by value
export const readReliquaryPieces = (): Map<number, TrialReliquaryPiece> =>
  new Map(
    readExcelTable<ExcelReliquaryRow>(RELIQUARY_TABLE_NAME).map(({ equipType, id, rankLevel, setId }) => [
      id,
      { rarity: rankLevel, setId, slot: z.enum(ArtifactSlot).parse(equipType) },
    ]),
  );
