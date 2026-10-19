import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";

import { ANIMAL_CODEX_TYPE } from "#src/services/genshinAssets/archive/constants";
import { MONSTER_CODEX_TYPE } from "#src/services/genshinAssets/enemies/constants";

// The monster's archive row under a describe, or undefined where the archive files no monster under it
export const findMonsterCodexRow = <Row extends Pick<AnimalCodexRow, "describeId" | "type">>(
  animalCodexRows: readonly Row[],
  describeId: number,
): Row | undefined =>
  animalCodexRows.find(
    ({ describeId: codexDescribeId, type = ANIMAL_CODEX_TYPE }) =>
      type === MONSTER_CODEX_TYPE && codexDescribeId === describeId,
  );
