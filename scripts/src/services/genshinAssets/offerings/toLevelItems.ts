import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingItemCount } from "#src/models/genshinAssets/offerings/OfferingLevelRow";

import { getConsumedItems } from "#src/services/genshinAssets/offerings/getConsumedItems";

// Every item a level takes, in the slots the dump names them, each as its item and how many of it
export const toLevelItems = (levelRow: ExcelOfferingLevelupRow): OfferingItemCount[] =>
  getConsumedItems(levelRow).map(({ count, id }) => ({ itemCount: count ?? 0, itemId: id ?? 0 }));
