import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { AbyssChamber } from "genshin-world";

import { findMonsterCodexRow } from "#src/services/genshinAssets/enemies/findMonsterCodexRow";

// The monster describes the Spiral Abyss's chambers list, in each half of each chamber, repeats included, kept to the
// Ones the Archive lists as a monster: a describe with no monster entry has no kind to publish with, as the Moon Spire
// Lists some of these
export const readAbyssDescribeIds = (
  floors: readonly { chambers: readonly Pick<AbyssChamber, "halfMonsterDescribeIds">[] }[],
  animalCodexRows: readonly Pick<AnimalCodexRow, "describeId" | "type">[],
): number[] =>
  floors
    .flatMap(({ chambers }) => chambers.flatMap(({ halfMonsterDescribeIds }) => halfMonsterDescribeIds.flat()))
    .filter((describeId) => findMonsterCodexRow(animalCodexRows, describeId) !== undefined);
