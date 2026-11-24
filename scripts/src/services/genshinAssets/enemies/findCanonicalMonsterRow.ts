import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import { findMonsterCodexRow } from "#src/services/genshinAssets/enemies/findMonsterCodexRow";

// The monster a describe entry's codex row names: the monster whose id the codex row carries, filed under that
// Same entry. undefined where the codex names no monster row, or names one filed under another entry, so the entry is
// Never guessed at
export const findCanonicalMonsterRow = <Row extends Pick<MonsterRow, "describeId" | "id">>(
  animalCodexRows: readonly Pick<AnimalCodexRow, "describeId" | "id" | "type">[],
  monsterRows: readonly Row[],
  describeId: number,
): Row | undefined => {
  const codexRow = findMonsterCodexRow(animalCodexRows, describeId);
  if (!codexRow) return undefined;
  return monsterRows.find((monsterRow) => monsterRow.id === codexRow.id && monsterRow.describeId === describeId);
};
