import { REPAIRS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";

// The trailer the repair commits with: the head it answered, and the collector's own source it was made against.
// The streak counts a repair that landed red as an attempt (`readStackedRepairs`), so the commit records its
// Basis as every marker does — a repairer fixed since reads a head past the cap as one nothing of its own
// Answered, where a count over every repair the head carries would leave the fix waiting on a person
export const getRepairTrailer = (mainSha: string, collectorSha: string): string =>
  `${REPAIRS_TRAILER}: ${mainSha}${getBasisText([collectorSha])}`;
