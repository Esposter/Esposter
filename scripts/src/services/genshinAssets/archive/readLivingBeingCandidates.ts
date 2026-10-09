import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelAnimalCodexRow } from "#src/models/genshinAssets/archive/ExcelAnimalCodexRow";
import type { ExcelAnimalDescribeRow } from "#src/models/genshinAssets/archive/ExcelAnimalDescribeRow";

import {
  ANIMAL_CODEX_TABLE_NAME,
  ANIMAL_CODEX_TYPE,
  ANIMAL_DESCRIBE_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The animals the Living Beings section lists, each in the codex's order and named by the description its row is filed
// Under. The monsters are left out, since the dump holds no name for them
export const readLivingBeingCandidates = (): ArchiveCandidate[] => {
  const nameTextMapHashMap = new Map(
    readExcelTable<ExcelAnimalDescribeRow>(ANIMAL_DESCRIBE_TABLE_NAME).map(({ id, nameTextMapHash }) => [
      id,
      nameTextMapHash,
    ]),
  );
  return readExcelTable<ExcelAnimalCodexRow>(ANIMAL_CODEX_TABLE_NAME)
    .filter(({ isDisuse, type }) => !isDisuse && type === ANIMAL_CODEX_TYPE)
    .flatMap(({ describeId, id, sortOrder }) => {
      const nameTextMapHash = nameTextMapHashMap.get(describeId);
      return nameTextMapHash === undefined ? [] : [{ id, nameTextMapHash, sortOrder }];
    });
};
