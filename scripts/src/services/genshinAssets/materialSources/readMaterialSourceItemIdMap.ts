import type { ExcelAnimalDescribeRow } from "#src/models/genshinAssets/archive/ExcelAnimalDescribeRow";
import type { EnvAnimalGatherRow } from "#src/models/genshinAssets/materialSources/EnvAnimalGatherRow";
import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { ANIMAL_DESCRIBE_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import {
  ENV_ANIMAL_GATHER_TABLE_NAME,
  MATERIAL_SOURCE_LABEL_IDS,
} from "#src/services/genshinAssets/materialSources/constants";
import { flattenLabelTree } from "#src/services/genshinAssets/points/flattenLabelTree";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage } from "genshin-text";

// Each material source label's item id, read off the gather row of the animal the label's name is the English name of. A
// Label with no such row gives no item, so it is refused rather than placed as nothing
export const readMaterialSourceItemIdMap = (labels: readonly InteractiveMapLabel[]): Map<number, number> => {
  const envAnimalGatherRows = readExcelTable<EnvAnimalGatherRow>(ENV_ANIMAL_GATHER_TABLE_NAME);
  const englishText = readTextMap(GameLanguage.English);
  const animalNameMap = new Map(
    readExcelTable<ExcelAnimalDescribeRow>(ANIMAL_DESCRIBE_TABLE_NAME).map(({ id, nameTextMapHash }) => [
      id,
      englishText.get(String(nameTextMapHash)),
    ]),
  );
  const labelItemIdMap = new Map<number, number>();
  for (const { id, name } of flattenLabelTree(labels)) {
    if (!MATERIAL_SOURCE_LABEL_IDS.includes(id)) continue;
    const itemId = envAnimalGatherRows
      .filter(({ animalId }) => animalNameMap.get(animalId) === name)
      .flatMap(({ gatherItemList }) => gatherItemList)
      .find((entry) => entry.id !== undefined && entry.id > 0)?.id;
    if (itemId === undefined) throw new InvalidOperationError(Operation.Read, name, "has no gather row giving an item");
    labelItemIdMap.set(id, itemId);
  }
  return labelItemIdMap;
};
