import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";

// The item slots of a level that name an item. The dump writes back an empty slot as zero, so a slot naming none is
// Dropped wherever it sits, not only past the first
export const getConsumedItems = ({
  consumeItemConfigVec,
}: ExcelOfferingLevelupRow): ExcelOfferingLevelupRow["consumeItemConfigVec"] =>
  consumeItemConfigVec.filter(({ id }) => id !== undefined && id !== 0);
