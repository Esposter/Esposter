import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";

import { pluralize } from "#shared/util/text/pluralize";

// One phrasing for every truncation surface, so a chart footnote and a table banner can never quote
// Different numbers for the same read
export const getDatasetTruncationText = ({ shownRows, totalRows }: DatasetTruncation) =>
  `Showing ${shownRows} of ${totalRows} ${pluralize("row", totalRows)}`;
