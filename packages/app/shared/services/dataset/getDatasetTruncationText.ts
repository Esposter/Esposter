import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";

import { formatTruncationCount } from "#shared/services/dataset/formatTruncationCount";
import { pluralize } from "#shared/util/text/pluralize";

// One phrasing for every truncation surface, so a chart footnote and a table banner can never quote
// Different numbers for the same read
export const getDatasetTruncationText = ({ isCountCapped, shownRows, totalRows }: DatasetTruncation) =>
  `Showing ${shownRows} of ${formatTruncationCount(totalRows, isCountCapped)} ${pluralize("row", totalRows)}`;
