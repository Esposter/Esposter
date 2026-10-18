import type { ExcelHomeWorldEventRow } from "#src/models/genshinAssets/home/ExcelHomeWorldEventRow";

import { HOME_AVATAR_REWARD_EVENT_TYPE, HOME_EVENT_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The reward events of the home event table, each a companion's favoured furnishing suite with its one-time reward, read
// From the dump: the rows the home dataset and the favour talks are both built from
export const readHomeFavourRows = (): ExcelHomeWorldEventRow[] =>
  readExcelTable<ExcelHomeWorldEventRow>(HOME_EVENT_TABLE_NAME).filter(
    ({ eventType }) => eventType === HOME_AVATAR_REWARD_EVENT_TYPE,
  );
