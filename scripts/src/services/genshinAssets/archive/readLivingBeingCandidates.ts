import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelAnimalCodexRow } from "#src/models/genshinAssets/archive/ExcelAnimalCodexRow";
import type { ExcelAnimalDescribeRow } from "#src/models/genshinAssets/archive/ExcelAnimalDescribeRow";
import type { ExcelMonsterDescribeRow } from "#src/models/genshinAssets/enemies/ExcelMonsterDescribeRow";

import {
  ANIMAL_CODEX_TABLE_NAME,
  ANIMAL_CODEX_TYPE,
  ANIMAL_DESCRIBE_TABLE_NAME,
  MONSTER_DESCRIBE_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { MONSTER_CODEX_TYPE } from "#src/services/genshinAssets/enemies/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The animals and the monsters the Living Beings section lists, each in the codex's order and named by the description its
// Row is filed under, whose name the description table gives
export const readLivingBeingCandidates = (): ArchiveCandidate[] => {
  const codexTypeNameTextMapHashMap = new Map<string, Map<number, number>>([
    [
      ANIMAL_CODEX_TYPE,
      new Map(
        readExcelTable<ExcelAnimalDescribeRow>(ANIMAL_DESCRIBE_TABLE_NAME).map(({ id, nameTextMapHash }) => [
          id,
          nameTextMapHash,
        ]),
      ),
    ],
    [
      MONSTER_CODEX_TYPE,
      new Map(
        readExcelTable<ExcelMonsterDescribeRow>(MONSTER_DESCRIBE_TABLE_NAME).map(({ id, nameTextMapHash }) => [
          id,
          nameTextMapHash,
        ]),
      ),
    ],
  ]);
  return readExcelTable<ExcelAnimalCodexRow>(ANIMAL_CODEX_TABLE_NAME).flatMap(
    ({ describeId, id, isDisuse, sortOrder, type }) => {
      const nameTextMapHash = codexTypeNameTextMapHashMap.get(type)?.get(describeId);
      return isDisuse || nameTextMapHash === undefined ? [] : [{ id, nameTextMapHash, sortOrder }];
    },
  );
};
