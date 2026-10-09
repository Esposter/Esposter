import type { ExcelForgeRandomRow } from "#src/models/genshinAssets/forging/ExcelForgeRandomRow";
import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";
import type { ForgeResult } from "genshin-world";

import { DropIdForgeRandomIdMap } from "#src/services/genshinAssets/forging/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The results one unit of a forge row yields: its fixed result, or for a row with none, the items of the random table its
// Drop id names, each with its count and weight. A drop id naming no table the dump holds is an error, not a result left out
export const toForgeResults = (row: ExcelForgeRow, randomRows: ExcelForgeRandomRow[]): ForgeResult[] => {
  if (row.resultItemId !== 0) return [{ count: row.resultItemCount, itemId: row.resultItemId, weight: 1 }];
  const forgeRandomId = DropIdForgeRandomIdMap[row.mainRandomDropId];
  const randomRow = randomRows.find((candidate) => candidate.forgeRandomId === forgeRandomId);
  if (randomRow === undefined)
    throw new InvalidOperationError(Operation.Read, String(row.id), "draws from a drop id with no random table");
  return randomRow.mainRandomItems.flatMap(({ count, itemId, weight }) =>
    count === undefined || itemId === undefined || weight === undefined ? [] : [{ count, itemId, weight }],
  );
};
