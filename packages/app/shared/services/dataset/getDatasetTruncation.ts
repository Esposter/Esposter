import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";

// The one truncation check every consumer shares, so a warning can never disagree with the rows on screen.
// A provider that omits totalRows, or one whose read fit under the cap, reports nothing to warn about.
export const getDatasetTruncation = ({ rows, totalRows }: Dataset): DatasetTruncation | undefined =>
  totalRows === undefined || totalRows <= rows.length
    ? undefined
    : { hiddenRows: totalRows - rows.length, shownRows: rows.length, totalRows };
