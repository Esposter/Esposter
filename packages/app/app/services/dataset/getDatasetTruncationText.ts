import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";

// One phrasing for every truncation surface, so a chart footnote and a table banner can never quote
// Different numbers for the same read
export const getDatasetTruncationText = ({ isCountCapped, shownRows, totalRows }: DatasetTruncation) =>
  `Showing ${shownRows} of ${formatTruncationCount(totalRows, isCountCapped)} ${pluralize("row", totalRows)}`;
