import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/shared/MaterialRow";

import { ADD_SERVER_BUFF_USE_OP } from "#src/services/genshinAssets/cooking/constants";

// The buffs of one ability a dish's item adds when used, in the order its uses name them
export const getBuffs = (materialRow: MaterialRow, buffRows: BuffRow[], abilityName: string): BuffRow[] =>
  materialRow.itemUse
    .filter(({ useOp }) => useOp === ADD_SERVER_BUFF_USE_OP)
    .flatMap(({ useParam }) =>
      buffRows.filter((buff) => buff.abilityName === abilityName && String(buff.serverBuffId) === useParam[0]),
    );
