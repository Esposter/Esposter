import type { ExcelMonsterDescribeRow } from "#src/models/genshinAssets/enemies/ExcelMonsterDescribeRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import { MONSTER_DESCRIBE_TABLE_NAME, MONSTER_TABLE_NAME } from "#src/services/genshinAssets/enemies/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";

// Every monster in the dump with its English name, which a monster's description files under the hash that names it
export const readMonsterNames = (): { id: number; name: string }[] => {
  const englishTextMap = readTextMap(GameLanguage.English);
  const describeNameMap = new Map(
    readExcelTable<ExcelMonsterDescribeRow>(MONSTER_DESCRIBE_TABLE_NAME).map(({ id, nameTextMapHash }) => [
      id,
      englishTextMap.get(String(nameTextMapHash)) ?? "",
    ]),
  );
  return readExcelTable<MonsterRow>(MONSTER_TABLE_NAME).map(({ describeId, id }) => ({
    id,
    name: describeNameMap.get(describeId) ?? "",
  }));
};
