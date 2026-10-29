import type { MaterialRow } from "#src/models/genshinAssets/shared/MaterialRow";
import type { DishUse } from "genshin-world";

import { REVIVE_BUFF_DESCRIPTION_REGEX } from "#src/services/genshinAssets/cooking/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The HP a revive description restores, which every revive writes in the one form
export const toRevive = (materialRow: MaterialRow, description: string): DishUse["revive"] => {
  const match = REVIVE_BUFF_DESCRIPTION_REGEX.exec(description);
  if (match?.groups === undefined)
    throw new InvalidOperationError(Operation.Read, String(materialRow.id), "names a revive this build does not read");
  return { flat: Number(match.groups.flat) };
};
