import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";

// The one truncation check every consumer shares, so a warning can never disagree with the rows on screen.
// A provider that omits totalRows, or one whose read fit under the cap, reports nothing to warn about.
export const getDatasetTruncation = ({ rows, totalRows }: Dataset): DatasetTruncation | undefined =>
  totalRows === undefined || totalRows <= rows.length
    ? undefined
    : {
        hiddenRows: totalRows - rows.length,
        isCountCapped: totalRows >= DATASET_MAX_COUNTED_ROWS,
        shownRows: rows.length,
        totalRows,
      };
