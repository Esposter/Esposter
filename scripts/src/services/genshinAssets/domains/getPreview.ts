import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";

import { REWARD_PREVIEW_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getPreview = (
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
  { passRewardPreviewID }: ExcelDungeonRow,
): ExcelRewardPreviewRow => {
  const preview = previewMap.get(passRewardPreviewID);
  if (preview === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      REWARD_PREVIEW_TABLE_NAME,
      `has no reward preview ${passRewardPreviewID}`,
    );
  return preview;
};
