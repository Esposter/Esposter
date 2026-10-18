import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { AbyssChamber } from "genshin-world";

import { ANIMAL_CODEX_TYPE } from "#src/services/genshinAssets/archive/constants";
import { MONSTER_CODEX_TYPE } from "#src/services/genshinAssets/enemies/constants";

// The monster describes the Spiral Abyss's chambers list, in each half of each chamber, repeats included, kept to the
// Ones the Archive lists: a describe with no archive entry has no kind to publish with, as the Moon Spire lists some
// Of these
export const readAbyssDescribeIds = (
  floors: readonly { chambers: readonly Pick<AbyssChamber, "halfMonsterDescribeIds">[] }[],
  animalCodexRows: readonly Pick<AnimalCodexRow, "describeId" | "type">[],
): number[] =>
  floors
    .flatMap(({ chambers }) => chambers.flatMap(({ halfMonsterDescribeIds }) => halfMonsterDescribeIds.flat()))
    .filter((describeId) =>
      animalCodexRows.some(
        ({ describeId: codexDescribeId, type = ANIMAL_CODEX_TYPE }) =>
          type === MONSTER_CODEX_TYPE && codexDescribeId === describeId,
      ),
    );
