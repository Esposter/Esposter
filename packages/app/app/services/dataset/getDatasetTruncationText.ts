import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";

// One phrasing for every truncation surface, so a chart footnote and a table banner can never quote
// Different numbers for the same read. A read can fall short in both ways at once, so both clauses are
// Independent — and a partial column with no hidden rows still has something to say, because every row
// Being present is exactly what makes that shortfall invisible
export const getDatasetTruncationText = ({
  hiddenRows,
  isCountCapped,
  partialColumns,
  shownRows,
  totalRows,
}: DatasetTruncation) =>
  [
    hiddenRows > 0
      ? `Showing ${shownRows} of ${formatTruncationCount(totalRows, isCountCapped)} ${pluralize("row", totalRows)}`
      : "",
    partialColumns.length > 0
      ? `${pluralize("Column", partialColumns.length)} ${partialColumns.join(", ")} may under-report`
      : "",
  ]
    .filter(Boolean)
    .join("; ");
