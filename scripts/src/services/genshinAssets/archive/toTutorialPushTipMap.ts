import type { ExcelPushTipsRow } from "#src/models/genshinAssets/shared/ExcelPushTipsRow";

import { PUSH_TIPS_TUTORIAL_TYPE } from "#src/services/genshinAssets/archive/constants";

// The tutorial push tips of the table by their id, in the table's order. A push tip of another kind, such as a
// Monster's, is not a tutorial, and the Archive's Tutorials section and the tips dataset both read tutorials
// Through this
export const toTutorialPushTipMap = (pushTipRows: readonly ExcelPushTipsRow[]): Map<number, ExcelPushTipsRow> =>
  new Map(
    pushTipRows
      .filter(({ pushTipsType }) => pushTipsType === PUSH_TIPS_TUTORIAL_TYPE)
      .map((pushTipRow) => [pushTipRow.pushTipsId, pushTipRow]),
  );
